# how to make the exceutable pulses

htmlclient: htmlclient.o cJSON.o pidfile.o log.o
	gcc $^ -lm -lrt -o $@
	
htmlclient.o: htmlclient.c cJSON.h
	gcc -c $< -o $@

cJSON.o: cJSON.c cJSON.h
	gcc -c $< -o $@

pidfile.o: pidfile.c pidfile.h
	gcc -c $< -o $@

log.o: log.c log.h
	gcc -c $< -o $@

