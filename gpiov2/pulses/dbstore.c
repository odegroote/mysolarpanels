#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <string.h>
#include <errno.h>
#include <time.h>
//#include <wiringPi.h>
#include <mysql/mysql.h>
#include "log.h"

const char *insertquery = "INSERT INTO measurement(tijdstip,nrpulses) VALUES(?,?)";
const char *insertwattsquery = "UPDATE output SET watts=? WHERE ID=1";
const char *dbserver = "localhost";
const char *database = "pulsesdb";
const char *username = "odg";
const char *password = "curve";

// global containing last stored value for watts
int g_prevwatts = -1;

// function to write pulsecounter to database

void storeCounterDB(const long counter, const time_t timestamp)
{
  struct tm *t = localtime(&timestamp);
  MYSQL_BIND bind[2];
  MYSQL_TIME ts;
  MYSQL_STMT *mstmt;
  MYSQL *con;

  logInfo("%s storeCounterDB: pulses=%d\n",  ctime(&timestamp), counter);

  con = mysql_init(NULL);
  if (con == NULL) 
  {
      logError("storeCounterDB (mysql_init): %s\n", mysql_error(con));
      return;
  }

  if (mysql_real_connect(con, dbserver, username, password, database, 0, NULL, 0) == NULL) 
  {
      logError("storeCounterDB (mysql_real_connection): %s\n", mysql_error(con));
      mysql_close(con);
      return;
  }

  if ((mstmt = mysql_stmt_init(con)) == 0)
  {
      logError("%s\n", mysql_error(con));
      mysql_close(con);
      return;
  }

  if (mysql_stmt_prepare(mstmt, insertquery, strlen(insertquery)) != 0)
  {
      logError("storeCounterDB (mysql_stmt_prepare): %s\n", mysql_error(con));
      mysql_stmt_close(mstmt);
      mysql_close(con);
      return;
  }

  memset(bind, 0, sizeof(bind));

  /* DATETIME PARAM */
  bind[0].buffer_type= MYSQL_TYPE_DATETIME;
  bind[0].buffer= (char *)&ts;
  bind[0].is_null= 0;
  bind[0].length= 0;

  ts.year= t->tm_year + 1900;
  ts.month= t->tm_mon + 1;
  ts.day= t->tm_mday;

  ts.hour= t->tm_hour;
  ts.minute= t->tm_min;
  ts.second= t->tm_sec;

  /* INTEGER PARAM */
  /* This is a number type, so there is no need
     to specify buffer_length */
  bind[1].buffer_type= MYSQL_TYPE_LONG;
  bind[1].buffer= (char *)&counter;
  bind[1].is_null= 0;
  bind[1].length= 0;

  /* Bind the buffers */
  if (mysql_stmt_bind_param(mstmt, bind))
  {
  	logError("storeCounterDB (mysql_stmt_bind_param): %s\n", mysql_stmt_error(mstmt));
	mysql_stmt_close(mstmt);
	mysql_close(con);
	return;
  }

  /* Execute the INSERT statement */
  if (mysql_stmt_execute(mstmt))
  {
  	logError("storeCounterDB (mysql_stmt_execute): %s\n", mysql_stmt_error(mstmt));
   	mysql_stmt_close(mstmt);
   	mysql_close(con);
  	return;
  }

  mysql_stmt_close(mstmt);
  mysql_close(con);

  logInfo("writeCounterDB: counter is %d, time is %s", counter, ctime(&timestamp));
}

void storeWattsDB(int watts, time_t timestamp)
{
  struct tm *t = localtime(&timestamp);
  MYSQL_BIND bind[1];
  MYSQL_STMT *mstmt;
  MYSQL *con;

  // prevent unnecessary storing of unchanged values   
  if (watts == g_prevwatts)
	return;

  con = mysql_init(NULL);
  if (con == NULL) 
  {
      logError("storeWattsDB (mysql_init): %s\n", mysql_error(con));
      return;
  }

  if (mysql_real_connect(con, dbserver, username, password, database, 0, NULL, 0) == NULL) 
  {
      logError("storeWattsDB (mysql_real_connect): %s\n", mysql_error(con));
      mysql_close(con);
      return;
  }

  if ((mstmt = mysql_stmt_init(con)) == 0)
  {
      logError("storeWattsDB (mysql_stmt_init): %s\n", mysql_error(con));
      mysql_close(con);
      return;
  }

  if (mysql_stmt_prepare(mstmt, insertwattsquery, strlen(insertwattsquery)) != 0)
  {
      logError("storeWattsDB (mysql_stmt_prepare): %s\n", mysql_error(con));
      mysql_stmt_close(mstmt);
      mysql_close(con);
      return;
  }

  memset(bind, 0, sizeof(bind));

  /* INTEGER PARAM */
  /* This is a number type, so there is no need
     to specify buffer_length */
  bind[0].buffer_type= MYSQL_TYPE_LONG;
  bind[0].buffer= (char *)&watts;
  bind[0].is_null= 0;
  bind[0].length= 0;

  /* Bind the buffers */
  if (mysql_stmt_bind_param(mstmt, bind))
  {
  	logError("storeWattsDB (mysql_stmt_bind_param): %s\n", mysql_stmt_error(mstmt));
	mysql_stmt_close(mstmt);
	mysql_close(con);
	return;
  }

  /* Execute the INSERT statement */
  if (mysql_stmt_execute(mstmt))
  {
  	logError("storeWattsDB (mysql_stmt_execute): %s\n", mysql_stmt_error(mstmt));
   	mysql_stmt_close(mstmt);
   	mysql_close(con);
  	return;
  }

  mysql_stmt_close(mstmt);
  mysql_close(con);

  g_prevwatts = watts;

}
