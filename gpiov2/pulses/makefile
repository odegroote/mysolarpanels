# how to make the exceutable pulses

pulses: pulses.o pidfile.o dbstore.o log.o
	gcc $^ -o $@ -lrt `mysql_config --cflags --libs` -lwiringPi
	
pulses.o: pulses.c
	gcc -c $< -o $@

pidfile.o: pidfile.c pidfile.h
	gcc -c $< -o $@

dbstore.o: dbstore.c dbstore.h
	gcc -c $< -o $@

log.o: log.c log.h
	gcc -c $< -o $@
