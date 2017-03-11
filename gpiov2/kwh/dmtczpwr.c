#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <netdb.h>
#include <string.h>
#include <math.h>
#include <time.h>
#include <pthread.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <arpa/inet.h>
#include "cJSON.h"
#include "log.h"
#include "pidfile.h"

int              sock;
int              create_tcp_socket();
struct sockaddr* getSockAddr( const char* ip, int port );
char*            get_ip(const char *host);
char*            build_get_query(char *host, char *page);
void             usage();
double           getWatts(char *htmlPage);

// shared memory key
key_t key = 5679;
// size of shared memory buffer
const int shm_size = 256;

// to start as a Daemon
void daemon(const char* procesname);

// global counter of watthours
double wh = 0;

// tracker to detect day changes
int dayofmonth=-1;
int dayHasChanged();
struct tm* now();

// function to store current wh into shared memory
void* storewh(void * data);

// function to determine number of seconds to start of next period
long getPollTimeout(long period);
 
#define HOST "127.0.0.1"
#define PORT 80
#define PAGE "/"
#define USERAGENT "HTMLGET 1.0"
#define BUFFERSIZE 4096

const char *requesttemplate = "GET %s HTTP/1.0\r\nHost: %s\r\nUser-Agent: %s\r\n\r\n";
const char *pagetemplate = "/json.html?type=devices&rid=%d";

int main(int argc, char **argv)
{
  char *host = HOST;
  char *ip;
  int  port = PORT;
  struct sockaddr *remote;
  char page[1024] = "";
  char *request;
  char buf[BUFFERSIZE+1];
  int shmid;
  char* shm;
  pthread_t storeWattsThread;


  if(argc == 1){
    usage();
    exit(2);
  }
  host = argv[1];
  if(argc > 2){
    port = atoi(argv[2]);
  }
  sprintf(page, pagetemplate, 15);

  daemon(strrchr(argv[0], '/'));

  if ((shmid = shmget (key, shm_size, (IPC_CREAT | 0644))) == -1) {
	logError("shmget: unable to create shared memory %s\n", strerror(errno));
	exit(1);
  }
  if ((shm = (char*)shmat(shmid, NULL, 0)) == (char*)-1) {
	logError("shmat: unable to attach shared memory %s\n", strerror(errno));
	shmctl(shmid, IPC_RMID, NULL);
	exit(1);
  }

  if (pthread_create(&storeWattsThread, NULL, &storewh, (void*) shm) != 0)
  {
	logError("creating thread to store watts failed: %s\n", strerror(errno));
	shmdt((void*)shm);
	shmctl(shmid, IPC_RMID, NULL);
	exit(1);
  }

  request = build_get_query(host,page);

  ip = get_ip(host);

  remote = getSockAddr(ip, port);

  wh = 0;
  while(1) {

  	memset(buf, 0, BUFFERSIZE);

  	sock = create_tcp_socket();

  	if(connect(sock, remote, sizeof(struct sockaddr)) < 0){
    		logError("Could not connect: %s\n", strerror(errno));
		sleep(1);
    		continue;
  	}

  	if (getHtmlPage(sock, request, buf) >= 0) {
    		double wattsecond = getWatts(strstr(buf, "\r\n\r\n"));
		wh += wattsecond/3600;
		sleep(1);
  	} else {
    		logError("Error receiving data\n");
  	}

       close(sock);
  }

  free(request);
  free(remote);
  free(ip);

  shmdt((void*)shm);
  shmctl(shmid, IPC_RMID, NULL);
  return 0;
}

struct sockaddr* getSockAddr( const char* ip, int port )
{
  struct sockaddr_in *remote;
  int tmpres;

  remote = (struct sockaddr_in *)malloc(sizeof(struct sockaddr_in *));
  remote->sin_family = AF_INET;
  tmpres = inet_pton(AF_INET, ip, (void *)(&(remote->sin_addr.s_addr)));
  if(tmpres < 0)
  {
    logError("Can't set remote->sin_addr.s_addr");
    exit(1);
  }else if(tmpres == 0)
  {
    logError("%s is not a valid IP address\n", ip);
    exit(1);
  }
  remote->sin_port = htons(port);

  return (struct sockaddr*) remote;
}

int getHtmlPage(int sock, const char* request, char* buffer)
{
  int nrbytes;

  //Send the query to the server
  int sent = 0;
  while(sent < strlen(request))
  {
    nrbytes = send(sock, request+sent, strlen(request)-sent, 0);
    if(nrbytes == -1){
      logError("Can't send query\n");
      return -1;
    }
    sent += nrbytes;
  }
  //now it is time to receive the page
  int index = 0;
  while( (index < BUFFERSIZE-1) && (nrbytes = recv(sock, buffer+index, BUFFERSIZE-1-index, 0)) > 0)
  {
 	index += nrbytes;
  }

  return nrbytes;
}

void usage()
{
  logError("USAGE: htmlget host [port] [page]\n\thost: the website hostname. ex: coding.debuntu.org\n\tport: the port to connect to. ex: 8083, default: 80\n\tpage: the page to retrieve. ex: index.html, default: /\n");
}

int create_tcp_socket()
{
  int result;
  if((result = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP)) < 0){
    logError("Can't create TCP socket\n");
    exit(1);
  }
  return result;
}

char *get_ip(const char *host)
{
  struct hostent *hent;
  int iplen = 15; //XXX.XXX.XXX.XXX
  char *ip = (char *)malloc(iplen+1);
  memset(ip, 0, iplen+1);
  if((hent = gethostbyname(host)) == NULL)
  {
    logError("Can't get IP\n");
    exit(1);
  }
  if(inet_ntop(AF_INET, (void *)hent->h_addr_list[0], ip, iplen) == NULL)
  {
    logError("Can't resolve host\n");
    exit(1);
  }
  return ip;
}
 
char *build_get_query(char *host, char *page)
{
  char *query;

  // -5 is to consider the %s %s %s in tpl and the ending \0
  query = (char *)malloc(strlen(host)+strlen(page)+strlen(USERAGENT)+strlen(requesttemplate)-5);
  sprintf(query, requesttemplate, page, host, USERAGENT);
  return query;
}

double getWatts(char *htmlPage)
{
	char *out;cJSON *json;
	
	json=cJSON_Parse(htmlPage);
	if (!json) {
		logError("Error before: [%s]\n",cJSON_GetErrorPtr());
		return 0;
        }
	else
	{
		cJSON *wattsObject = cJSON_GetObjectItem(json,"result[0]");
		double watts = cJSON_GetObjectItem(wattsObject, "Data")->valuedouble; 
		cJSON_Delete(json);
		return watts;
	}
}

void daemon(const char* procesname)
{
	pid_t process_id = 0;
	pid_t sid = 0;

	// Create child process
	process_id = fork();

	// Indication of fork() failure
	if (process_id < 0) {
		logError("fork failed!\n");
		// Return failure in exit status
		exit(1);
	}

	// PARENT PROCESS. Need to kill it.
	if (process_id > 0) {
		logInfo("process_id of child process %d \n", process_id);
		// return success in exit status
		exit(0);
	}

	if (!createPidFile(procesname)) {
		exit(1);
	}

	//unmask the file mode
	umask(0);
	
	//set new session
	sid = setsid();
	if(sid < 0)
	{	
		// Return failure
		exit(1);
	}

	// Close stdin. stdout and stderr
	close(stdin);
	close(stdout);
	close(stderr);
}

void* storewh(void * data)
{
	char* shm = (char*) data;
	while(1) {
		if (dayHasChanged()) {
			wh = 0;
		}
		sprintf(shm, "%d", lround(wh));
		logData("%f,%s", wh, asctime(now()));
		sleep(getPollTimeout(60));
	}
}

// Based on period, calculates the number of seconds to wait untill the next multiple of RESOLUTION occurs
long getPollTimeout(long period)
{
	struct timespec t;
	long result = 0L;

	clock_getres(CLOCK_REALTIME, &t);
	clock_gettime(CLOCK_REALTIME, &t);

	result = period - ((t.tv_sec) + (t.tv_nsec / 1000000000)) % period; 

	return result;
}

int dayHasChanged()
{
	struct tm *t = now();

	if (t->tm_mday == dayofmonth) {
		return 0;
	} else {
		dayofmonth = t->tm_mday;
		return 1;
	}
}

struct tm* now()
{
	time_t t = time(NULL);
	return localtime(&t);
}
