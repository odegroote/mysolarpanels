mysolarpanels
=============

web application to measure and show Kwh produced by home solarpanel array.

This application runs on a raspberry PI model B. It comprises of:

	pulses: C-program running as a daemon counting pulses on one of the GPIO pins of the raspberry 
					and writing the results in to a mysql datbase
	
	dataservices: php-scripts for gathering measurement-data from the mysql database. Reulsts are retunned as 
							 JSON objects.
	
	apache:	webserver to host the webapplication. The webapplication is be based on Twitter Bootstrap
					using the Charisma theme as a start
