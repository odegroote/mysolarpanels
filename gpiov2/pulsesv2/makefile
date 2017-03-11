# how to make the exceutable pulses

pulses: pulses.o pidfile.o dbstore.o updateagent.o log.o
	gcc $^ -o $@ -lrt -lm -lwiringPi
	
pulses.o: pulses.c
	gcc -c $< -o $@

pidfile.o: pidfile.c pidfile.h
	gcc -c $< -o $@

dbstore.o: dbstore.c dbstore.h
	gcc -c $< -o $@

updateagent.o: updateagent.c updateagent.h
	gcc -c $< -o $@

log.o: log.c log.h
	gcc -c $< -o $@
