<?php

header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
header('Pragma: no-cache'); // HTTP 1.0.
header('Expires: 0'); // Proxies.

function str_from_mem(&$value) {
  $i = strpos($value, "\0");
  if ($i === false) {
    return $value;
  }
  $result =  substr($value, 0, $i);
  return $result;
}
@$shid = shmop_open(5678, "a", 0, 0);
if (!empty($shid)) {
	$watts  = shmop_read ( $shid , 0 , 256 );
	echo json_encode(str_from_mem($watts));
	shmop_close($shid);
} else {
	echo "shared memory doesn't exist";
}
?>

