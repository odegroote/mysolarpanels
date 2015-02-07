<?php
 $con=mysqli_connect("localhost","root","curve","pulsesdb");
 // Check connection
 if (mysqli_connect_errno())
   {
   echo "Failed to connect to MySQL: " . mysqli_connect_error();
   }

 $result = mysqli_query($con,"SELECT * FROM measurement");

 echo "<table border='1'>
 <tr>
 <th>tijdstip</th>
 <th>nrPulses</th>
 </tr>";

 while($row = mysqli_fetch_array($result))
   {
   echo "<tr>";
   echo "<td>" . $row['tijdstip'] . "</td>";
   echo "<td>" . $row['nrpulses'] . "</td>";
   echo "</tr>";
   }
 echo "</table>";

 mysqli_close($con);
 ?> 