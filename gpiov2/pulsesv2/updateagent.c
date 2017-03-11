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
#include <arpa/inet.h>
#include "log.h"

int              sock;
int              create_tcp_socket();
struct sockaddr* getSockAddr( const char* ip, int port );
char*            get_ip(const char *host);
char*            build_get_query(const char *host, const char *page);

#define HOST "localhost"
#define PORT 80
#define PAGE "/"
#define USERAGENT "HTMLGET 1.0"
#define BUFFERSIZE 4096

const char *requesttemplate = "GET %s HTTP/1.0\r\nHost: %s\r\nUser-Agent: %s\r\n\r\n";
const char *pagetemplate = "/json.htm?type=command&param=udevice&idx=%d&nvalue=0&svalue=%d;%f";

void updateAgent(const char* host, int port, int sensorIdx, long watts, long pulses)
{
  char *ip;
  struct sockaddr *remote;
  char page[1024] = "";
  char *request;
  char buf[BUFFERSIZE+1];

  //watt and watthour (1600 pulses per kWh  or 1.6 pulses per Wh)
  sprintf(page, pagetemplate, sensorIdx, watts, pulses/1.6);

  request = build_get_query(host,page);

  ip = get_ip(host);

  remote = getSockAddr(ip, port);

  memset(buf, 0, BUFFERSIZE);

  sock = create_tcp_socket();

  if(connect(sock, remote, sizeof(struct sockaddr)) >= 0){
  	if (getHtmlPage(sock, request, buf) < 0) {
		logError("Error receiving data\n");
  	}
  	close(sock);
  } else {
  	logError("Could not connect: %s\n", strerror(errno));
	return;
  }

  free(request);
  free(remote);
  free(ip);
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
 
char *build_get_query(const char *host, const char *page)
{
  char *query;

  // -5 is to consider the %s %s %s in tpl and the ending \0
  query = (char *)malloc(strlen(host)+strlen(page)+strlen(USERAGENT)+strlen(requesttemplate)-5);
  sprintf(query, requesttemplate, page, host, USERAGENT);
  return query;
}
