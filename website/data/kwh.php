<?php
 
 header('Access-Control-Allow-Origin: *');
 header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
 header('Pragma: no-cache'); // HTTP 1.0.
 header('Expires: 0'); // Proxies.

 Class Kwh implements JsonSerializable {
   public $year;
   public $month;
   public $day;
   public $kwh;
   public $used;
   public $avgkwh;
   public $total;

   function lower() {
	if ($this->day != null) {
		return 0;
	} else if ($this->month != null){
		return 1;
	} else if ($this->year != null){
		return 1;
	} else {
		return 2013;
	}
   }

   function upper() {
	if ($this->day != null) {
		return 23;											// hours in a day
	} else if ($this->month != null){
		return cal_days_in_month(CAL_GREGORIAN, intval($this->month), intval($this->year)); ;		// days in a month
	} else if ($this->year != null){
		return 12;											// months in a year;
	} else {
		return 2043;											// max number of years we'll support
	}
   }

   function pulsesToKwh($p)
   {
	return $p/1600.0;
   }

   function __construct($yr,$mnth,$dy) {
	$this->year = $yr;
	$this->month = $mnth;
	$this->day = $dy;

	// Initialize arrays
	$this->kwh = array();
	$this->avgkwh = array();
	$this->used = array();
	for ($i = $this->lower(); $i <= $this->upper()+1; $i++) {
		array_push($this->kwh, array($i, 0));
		array_push($this->avgkwh, array($i, 0));
		array_push($this->used, array($i, 0));
	}
	// initialize total
	$this->total = 0.0;
   }

   public function jsonSerialize() {
	return [
   		'year' => $this->year,
   		'month' => $this->month,
		'day' => $this->day,
		'kwh' => $this->kwh,
		'used'=> $this->used,
		'avgkwh' => $this->avgkwh,
		'total' => $this->total
	];
   }
 }

 function getSelectColumns($yr,$mnth,$dy) {
	$result = " year(tijdstip) as yr";
 	if ($yr != null) {
		$result = " month(tijdstip) as mnth";
 		if ($yr != null and $mnth != null) {
 			$result = " day(tijdstip) as dy";
 			if ($yr != null and $mnth != null and $dy != null) {
 				$result = " hour(tijdstip) as hr";
			}
		}
 	}
	$result = $result . ",SUM(nrpulses) as cnt";
	return $result;
 }

 function getWhereClause($yr,$mnth,$dy) {
	$result="";

	if ($yr != null) {
 		$result = " WHERE year(tijdstip)=" . $yr;
 		if ($mnth != null) {
 			$result = $result . " AND month(tijdstip)=" . $mnth;
 			if ($dy != null) {
 				$result = $result . " AND ((day(tijdstip)=" . $dy . " AND hour(tijdstip) > 0) OR (day(tijdstip)=" . $dy . "+1 AND hour(tijdstip)=0))";
			}
		}
 	}
 	return $result;
 }

 function getGroupbyClause($yr,$mnth,$dy) {
	$result = " GROUP BY year(tijdstip)";
	if ($yr != null) {
 		$result = $result . ",month(tijdstip)";
 		if ($mnth != null) {
 			$result = $result . ",day(tijdstip)";
 			if ($dy != null) {
 				$result = $result . ",hour(tijdstip)";
			}
		}
 	}
 	return $result;
 }

 $req_year = null ;
 $req_month = null;
 $req_day = null;

 if (isset($_GET['year'])) {
 	$req_year = $_GET['year'] ;
 }
 if (isset($_GET['month'])) {
 	$req_month = $_GET['month'];
 }
 if (isset($_GET['day'])) {
 	$req_day = $_GET['day'];
 }

 $con=mysqli_connect("localhost","odg","curve","pulsesdb");
 // Check connection
 if (mysqli_connect_errno()) {
   echo "Failed to connect to MySQL: " . mysqli_connect_error();
   http_response_code(500);
 } else {

	$kwh = new Kwh($req_year,$req_month,$req_day);

	$query = sprintf("SELECT %s  FROM measurement %s %s ORDER BY 1", getSelectColumns($req_year,$req_month,$req_day), getWhereClause($req_year,$req_month,$req_day), getGroupbyClause($req_year,$req_month,$req_day));

 	$result = mysqli_query($con,$query);
 	if ($result == FALSE) {
   		echo "Query " . $query . " failed: " . mysqli_error($con);
   		http_response_code(500);
 	} else {


  		while($row = mysqli_fetch_array($result)) {
			$idx = intval($row[0]);
			$val = $kwh->pulsesToKwh(intval($row[1]));

			if ($req_day != null) {
				if ($idx == 0) {
					$idx = 24;
				} else {
					$idx = $idx - 1;
				}
				$kwh->kwh[$idx] = array(intval($row[0])-1, $val);
			} else {
				$idx = $idx - $kwh->lower();
				$kwh->kwh[$idx] = array(intval($row[0]), $val);
			}
			$kwh->total = $kwh->total + $val;
   		}
	}

	if ($req_month != null) {
		if ($req_day != null) {
			$query = "SELECT hr, avgPulses from HourlyAveragePerMonth WHERE mnth=" . $req_month;
		 	$result = mysqli_query($con,$query);
		 	if ($result == FALSE) {
		   		echo "Query " . $query . " failed: " . mysqli_error($con);
		   		http_response_code(500);
		 	} else {


		  		while($row = mysqli_fetch_array($result)) {
					$idx = intval($row[0]);
					$val = $kwh->pulsesToKwh(intval($row[1]));

					if ($idx == 0) {
						$idx = 24;
					} else {
						$idx = $idx - 1;
					}
					$kwh->avgkwh[$idx] = array(intval($row[0])-1, $val);
		   		}
			}
		} else {
			$query = "SELECT avgPulses from DayAveragePerMonth WHERE mnth=" . $req_month;
		 	$result = mysqli_query($con,$query);
		 	if ($result == FALSE) {
		   		echo "Query " . $query . " failed: " . mysqli_error($con);
		   		http_response_code(500);
		 	} else {


		  		if ($row = mysqli_fetch_array($result)) {
					$idx = intval($row[0]);
					$val = $kwh->pulsesToKwh(intval($row[0]));

					foreach($kwh->avgkwh as &$ar) {
						$ar[1] = $val;
					}
		   		}
			}
		}
	} else if ($req_year != null) {
			$query = "SELECT mnth, avgPulses from DayAveragePerMonth";
		 	$result = mysqli_query($con,$query);
		 	if ($result == FALSE) {
		   		echo "Query " . $query . " failed: " . mysqli_error($con);
		   		http_response_code(500);
		 	} else {


		  		while($row = mysqli_fetch_array($result)) {
					$idx = intval($row[0])-1;
					$val = $kwh->pulsesToKwh(intval($row[1]));

					$kwh->avgkwh[$idx] = array(intval($row[0]), $val);
		   		}
			}
	} else {
		for ($i=0; $i<count($kwh->kwh); $i++) {
			$kwh->avgkwh[$i][1] = $kwh->kwh[$i][1] / 2.29;
		}
	}

 	mysqli_close($con);

	if ($req_month != null and $req_day == null) {
		$filenamepattern = sprintf("kwh-%d%02d*.log", $req_year,$req_month); 
		chdir("/var/log");
		$filenames = glob($filenamepattern);

		foreach($filenames as $filename) {
			$cursor = -2;
			sscanf($filename,"kwh-%4d%02d%02d.log",$year,$month,$day);
			$handle = fopen($filename, "r");
			if (fseek($handle, $cursor, SEEK_END) == 0) {
				while(fgetc($handle) != "\n" && $cursor >= -50){
					fseek($handle, $cursor--, SEEK_END);
				}
				fscanf($handle,"%f,%[^\n]s", $watts, $timestamp);
			}
			fclose($handle);
			$kwh->used[$day-1] = array($day,round($watts/1000,2));
		}
	}

	echo json_encode( $kwh );

 }

 ?> 
