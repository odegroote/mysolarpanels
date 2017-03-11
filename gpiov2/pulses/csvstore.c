#include <stdio.h>
#include <stdlib.h>
#incluse "log.h"

#define OUTPUTFILE  "pulses.csv"

void storeCounterCSV(const long counter, const time_t timestamp)
{
	struct tm *t = localtime(&timestamp);
	FILE *fd = fopen(OUTPUTFILE, "a");
	fprintf(fd, "%d/%d/%d %d:%d:%d;%d\n", t->tm_mday, t->tm_mon, t->tm_year + 1900, t->tm_hour,t->tm_min,t->tm_sec, counter);
	fclose(fd);
	logInfo("writeCounterCSV: counter is %d, time is %s", counter, ctime(&timestamp));
}
