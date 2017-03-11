#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <stdarg.h>

#define DATALOG "/data/log/kwh/kwh-%s.log"
#define INFOLOG "/var/log/kwh.log"
#define ERRORLOG "/var/log/kwh.err"

char gLogFileName[100];
const char* getLogFilename();

void logData(const char* fmt, ...)
{
  va_list args;
  FILE * pFile;

  pFile = fopen (getLogFilename(),"a+");
  va_start (args, fmt);
  vfprintf (pFile, fmt, args);
  va_end (args);
  fclose(pFile);
}

void logInfo(const char* fmt, ...)
{
  va_list args;
  FILE * pFile;

  pFile = fopen (INFOLOG,"a+");
  va_start (args, fmt);
  vfprintf (pFile, fmt, args);
  va_end (args);
  fclose(pFile);
}

void logError(const char* fmt, ...)
{
  va_list args;
  FILE * pFile;

  pFile = fopen (ERRORLOG,"a+");
  va_start (args, fmt);
  vfprintf (pFile, fmt, args);
  va_end (args);
  fclose(pFile);
}

const char* getLogFilename()
{
  char buffer[11];
  time_t t = time(NULL);

  strftime(buffer, 10, "%Y%m%d", localtime(&t));

  sprintf(gLogFileName, DATALOG, buffer);

  return gLogFileName; 
}
