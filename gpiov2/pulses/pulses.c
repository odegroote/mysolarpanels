#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <time.h>
#include <math.h>
#include <signal.h>
#include <pthread.h>
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <wiringPi.h>
#include <mysql/mysql.h>
#include "log.h"
#include "dbstore.h"
#include "pidfile.h"

// nr of pulses per KwH
#define PULSES_KWH 1600
// period during which pulses are counted
#define RESOLUTION  3600 	// in seconds

// global defining which gpio pin is to be used
int gpiopin;

// global counter for pulses
long pulsecounter = 0;

// global containing timestamp last pulse
struct timespec prev_timestamp;

// global containing current output
double watts = 0.0;

// interrupthandler for handling incoming pulse
void updatePulseCounter();

// write pulse counter in store
void storePulseCounter();

// determines number seconds untill the next timeout based on value of RESOLUTION
long getPollTimeout();

// function to store current watts into store
void* storeWatts(void * data);

// termination handler
void catchTermination(int sig);

// shared memory key
key_t key = 5678;

const int shm_size = 256;

// to start as a Daemon
void daemon(const char* procesname);

// global defining period corresponding to 1 Watt output
const double watt_period = (1000.0 * 3600) / PULSES_KWH;

int main(int argc, char **argv) {

	int shmid;
	char* shm;
	pthread_t storeWattsThread;

	tzset();
	clock_gettime(CLOCK_MONOTONIC, &prev_timestamp);

	if(argc!=2) {
		logError("Usage: %s.", argv[0]);
		return 1;
	}

	if (sscanf(argv[1], "%d", &gpiopin) != 1 || gpiopin < 1 || gpiopin > 24) {
		logError("first argument (%s) must be a number between 1 and 24\n", argv[1]);
		return 1;
	}

	logInfo("using gpio pin number %d\n", gpiopin);

	daemon(strrchr(argv[0], '/'));

	if (wiringPiSetupGpio() < 0) {
		logError("wiringPiSetupGpio failed: %s\n", strerror (errno));
		return 1;
	}

	pinMode(gpiopin, INPUT);
	pullUpDnControl (gpiopin, PUD_UP) ;

	if (wiringPiISR (gpiopin, INT_EDGE_FALLING,  &updatePulseCounter) < 0) {
		logError("installing ISR failed: %s\n", strerror(errno));
		exit(1);
	}

	if (signal(SIGHUP, catchTermination) == SIG_ERR) {
		logError("installing signalhandler failed: %s\n", strerror(errno));
		exit(1);
	}

	logInfo("MySQL client version: %s\n", mysql_get_client_info());

	if ((shmid = shmget (key, shm_size, (IPC_CREAT | 0644))) == -1) {
		logError("shmget: unable to create shared memory %s\n", strerror(errno));
		exit(1);
	}
	if ((shm = (char*)shmat(shmid, NULL, 0)) == (char*)-1) {
		logError("shmat: unable to attach shared memory %s\n", strerror(errno));
		shmctl(shmid, IPC_RMID, NULL);
		exit(1);
	}

	if (pthread_create(&storeWattsThread, NULL, &storeWatts, (void*) shm) != 0)
	{
		logError("creating thread to store watts failed: %s\n", strerror(errno));
		shmdt((void*)shm);
		shmctl(shmid, IPC_RMID, NULL);
		exit(1);
	}

	while(1)
	{
		sleep(getPollTimeout());
		storePulseCounter();
	}

	shmdt((void*)shm);
	shmctl(shmid, IPC_RMID, NULL);
	return 0;
}

void updatePulseCounter()
{
	struct timespec timestamp;

	piLock(1);

	clock_gettime(CLOCK_MONOTONIC, &timestamp);

	int val = digitalRead(gpiopin);

	if (val == 0) {

//		time_t logtime;
		double period = ((double)timestamp.tv_sec + 1.0e-9*timestamp.tv_nsec) - 
           				((double)prev_timestamp.tv_sec + 1.0e-9*prev_timestamp.tv_nsec);
		watts = (period <= 0 ? 0 : watt_period / period);

//		time(&logtime);
//		logInfo("%s updateCounter: pulse on gpiopin %d,  current power is %.2f watts, period = %.3f seconds\n", 
//					ctime(&logtime), gpiopin, watts, period);

		pulsecounter++;

		prev_timestamp = timestamp;
	}

	piUnlock(1);
}

void storePulseCounter()
{
	time_t t_current;

	piLock(1);
	time(&t_current);
	storeCounterDB(pulsecounter, t_current);
	pulsecounter = 0;
	piUnlock(1);
}

void* storeWatts(void * data)
{
	char* shm = (char*) data;
	while(1) {
		sleep(5);
		sprintf(shm, "%d", lround(watts));
	}
}

// Based on RESOLUTION, calculates the number of seconds to wait untill the next multiple of RESOLUTION occurs
long getPollTimeout()
{
	struct timespec t;
	long result = 0L;

	clock_getres(CLOCK_REALTIME, &t);
	clock_gettime(CLOCK_REALTIME, &t);

	result = RESOLUTION - ((t.tv_sec) + (t.tv_nsec / 1000000000)) % RESOLUTION; 

	return result;
}

void catchTermination(int sig)
{
	time_t timestamp;

	time(&timestamp);

	logInfo("%s catchTermination: pulsecounter = %d\n", ctime(&timestamp), pulsecounter);

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
