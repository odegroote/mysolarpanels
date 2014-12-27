<?php

 header('Access-Control-Allow-Origin: *');
 header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
 header('Pragma: no-cache'); // HTTP 1.0.
 header('Expires: 0'); // Proxies.

$response = file_get_contents("http://192.168.2.107/dayusage.php?" . $_SERVER["QUERY_STRING"]);
echo ($response == FALSE  ? "" : $response);
?>
