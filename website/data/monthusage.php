<?php

 header('Access-Control-Allow-Origin: *');
 header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
 header('Pragma: no-cache'); // HTTP 1.0.
 header('Expires: 0'); // Proxies.

 Class MonthUsage implements JsonSerializable {

   public $total;
   public $watts = array();

   function __construct() {
	$this->total = 0.0;	
   }


   public function jsonSerialize() {
	return [
   		'total' => round($this->total,2),
   		'watts' => $this->watts,
	];
   }
 }

 $req_year = null ;
 $req_month = null;

 if (isset($_GET['year'])) {
 	$req_year = $_GET['year'] ;
 }
 if (isset($_GET['month'])) {
 	$req_month = $_GET['month'];
 }

$filenamepattern = sprintf("kwh-%d%02d*.log", $req_year,$req_month); 
chdir("/var/log");
$filenames = glob($filenamepattern);

$monthUsage = new MonthUsage;

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
	$monthUsage->total += $watts;
	$monthUsage->watts[$day] = array($day,round($watts,2));
}

echo json_encode($monthUsage);
?>
