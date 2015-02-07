<?php

 header('Access-Control-Allow-Origin: *');
 header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
 header('Pragma: no-cache'); // HTTP 1.0.
 header('Expires: 0'); // Proxies.

 Class MeasurementsStats implements JsonSerializable {
   public $nrMeasurements = 0;
   public $firstMeasurement = "";
   public $lastMeasurement = "";
   public $maxPulses = 0;
   public $totalPulses = 0;
   public $avgPulses =0;
   public $totalEarned = 0;
   public $sunset = "";
   public $sunrise = "";

   public function jsonSerialize() {
	return [
   		'nrMeasurements' => $this->nrMeasurements,
   		'firstMeasurement' => $this->firstMeasurement, 
   		'lastMeasurement' => $this->lastMeasurement,
   		'maxPulses' => $this->maxPulses,
   		'totalPulses' => $this->totalPulses,
		'totalEarned' => $this->totalEarned,
		'avgPulses' => $this->avgPulses,
		'sunrise' => $this->sunrise,
		'sunset' => $this->sunset,
	];
   }
 }

 $con=mysqli_connect("localhost","odg","curve","pulsesdb");
 // Check connection
 if (mysqli_connect_errno())
   {
   echo "Failed to connect to MySQL: " . mysqli_connect_error();
   }

 $result = mysqli_query($con,"SELECT COUNT(m.tijdstip) as cnt, MIN(m.tijdstip) as mintime, MAX(m.tijdstip) as maxtime, MAX(m.nrpulses) as maxpulses, SUM(m.nrpulses) as totalpulses FROM measurement m");
 if ($result == FALSE) {
   echo "Query failed " . mysqli_error($con);
 } else {

   $ms = new MeasurementsStats();

   $row = $result->fetch_array();
   $ms->nrMeasurements = $row['cnt'];
   $ms->firstMeasurement = date_create($row['mintime'])->format('d M Y H:i:s');
   $ms->lastMeasurement = date_create($row['maxtime'])->format('d M Y H:i:s');
   $ms->maxPulses = $row['maxpulses'];
   $ms->totalPulses = $row['totalpulses'];
   $ms->totalEarned = ($ms->totalPulses / 1600) * 0.2349;

   $result = mysqli_query($con,"SELECT AVG(nrpulses) as avgpulses FROM totals");
   if ($result == FALSE) {
     echo "Query failed " . mysqli_error($con);
   } else {
     $row = $result->fetch_array();
     $ms->avgPulses = $row['avgpulses'];
   }

   $tm = localtime(date_sunrise(time(), SUNFUNCS_RET_TIMESTAMP, 51.45156, 5.525125, 90, 1));
   $ms->sunrise = "" . $tm[2] . ":" . $tm[1];
   $tm = localtime(date_sunset(time(), SUNFUNCS_RET_TIMESTAMP, 51.45156, 5.525125, 90, 1));
   $ms->sunset = "" . $tm[2] . ":" . $tm[1];
   echo json_encode( $ms );
 }

 mysqli_close($con);
 ?> 
