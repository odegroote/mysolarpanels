#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>

#define INFOLOG "/var/log/pulses.log"
#define ERRORLOG "/var/log/pulses.err"

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

