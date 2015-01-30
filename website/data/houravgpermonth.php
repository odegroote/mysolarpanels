<?php
 
 header('Access-Control-Allow-Origin: *');
 header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
 header('Pragma: no-cache'); // HTTP 1.0.
 header('Expires: 0'); // Proxies.

 Class Kwh implements JsonSerializable {
   public $avgkwh;

   function pulsesToKwh($p)
   {
	return $p/1600.0;
   }

   function __construct() {
	// Initialize arrays
	$this->avgkwh = array(12);
	for ($j=0; $j < 12; $j++) {
		$this->avgkwh[$j] = array();
		for ($i = 5; $i <= 22; $i++) {
			array_push($this->avgkwh[$j], array($i, 0));
		}
	}
   }

   public function jsonSerialize() {
	return [
		'avgkwh' => $this->avgkwh,
	];
   }
 }

 $con=mysqli_connect("localhost","odg","curve","pulsesdb");
 // Check connection
 if (mysqli_connect_errno()) {
   echo "Failed to connect to MySQL: " . mysqli_connect_error();
   http_response_code(500);
 } else {
	$kwh = new Kwh();
	$query = "SELECT mnth, hr, avgPulses from HourlyAveragePerMonth where  hr >= 5 and hr <= 22";
 	$result = mysqli_query($con,$query);
 	if ($result == FALSE) {
   		echo "Query " . $query . " failed: " . mysqli_error($con);
   		http_response_code(500);
 	} else {
  		while($row = mysqli_fetch_array($result)) {
			$m = intval($row[0]);
			$h = intval($row[1]);
			$val = $kwh->pulsesToKwh(intval($row[2]));

			$m = $m - 1;
			if ($h == 0) {
				$h = 24;
			} 
			$kwh->avgkwh[$m][$h-5] = array(intval($h), $val);
		}
	} 
 	mysqli_close($con);

	echo json_encode( $kwh );
 }

 ?> 
