#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include "log.h"

#define BUF_SIZE 100            /* Large enough to hold maximum PID as string */

int
createPidFile(const char *progName)
{
    int fd;
    int flags;
    char buf[BUF_SIZE];
    char pidFile[BUF_SIZE];

    sprintf(pidFile,"/var/run/%s.pid", progName);

    fd = open(pidFile, O_RDWR | O_CREAT | O_EXCL | O_TRUNC, S_IRUSR | S_IWUSR);
    if (fd == -1) {
	logError("createPidFile: Could not create PID file %s\n", pidFile);
	return 0;
    }

    snprintf(buf, BUF_SIZE, "%ld\n", (long) getpid());
    if (write(fd, buf, strlen(buf)) != strlen(buf)) {
        logError("createPidFile: Could not write pid to PID file '%s'\n", pidFile);
	close(fd);
	return 0;
    }

    close(fd);
    return 1;
}
