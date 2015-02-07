<?php

 header('Access-Control-Allow-Origin: *');
 header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
 header('Pragma: no-cache'); // HTTP 1.0.
 header('Expires: 0'); // Proxies.

 Class Hem implements JsonSerializable {

   private $server;
   private $device;
   private $instance;
   private $commandclass;

   function __construct($s,$d,$i,$cc) {
	$this->server = $s;
	$this->device = $d;
	$this->instance = $i;
	$this->commandclass = $cc;
   }

   function getUrl($data) {
	return $this->server . "/ZWaveAPI/Run/devices[" . $this->device . "].instances[" . $this->instance . "].commandClasses[" . $this->commandclass . "].data[" . $data . "]";
   }

   function getValue($data) {
	return json_decode(file_get_contents($this->getUrl($data)));
   }

   function getWatts() {
	return json_decode(file_get_contents($this->getUrl(2)));
   }

   function getVolt() {
	return json_decode(file_get_contents($this->getUrl(4)));
   }

   function getAmp() {
	return json_decode(file_get_contents($this->getUrl(5)));
   }

   function getKwH() {
	return json_decode(file_get_contents($this->getUrl(0)));
   }

   public function jsonSerialize() {
	return [
   		'watts' => $this->getWatts()->val->value,
   		'volt' => $this->getVolt()->val->value,
		'amps' => $this->getAmp()->val->value,
		'kwh' => $this->getKwH()->val->value
	];
   }
 }

$hemdata = new Hem("http://192.168.2.107:8083", 7, 0, 50);
echo json_encode($hemdata);
?>

