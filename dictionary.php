<?php

    header('Content-Type: text/plain');
		
    $charCode = $_GET['charCode'];
	
	$charCode = "<char cp=\\\"".$charCode."";
	
	$thisCommand = "grep \"".$charCode."\" ucd.unihan.grouped.xml";
		
	exec ($thisCommand, $out);
	
	echo $out[0];

?>