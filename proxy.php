<?php


function text_between($string, $start, $end)
{
    $string = " ".$string;
    $startIndex = strpos($string,$start);
    
    if ($start == "start")
    {
    	$startIndex = 0;
    } else {
    	if ($startIndex == 0)
    	{
    		return "Start text not found";
    	}
    }
    
    $startIndex += strlen($start);
    $resultLength = strpos($string,$end,$startIndex) - $startIndex;

    if ($end == "end")
    {
    	$endIndex=strlen($string);
    	$resultLength = $endIndex - $startIndex;
    }

    
    if ($resultLength <= 0)
    {
    	return "End text not found";
    }
    
    return substr($string,$startIndex,$resultLength);
}

$thisUrl = $_SERVER["REQUEST_URI"];

$thisUrl = text_between($thisUrl, "=", "end");

$command = "curl \"";
$command .= $thisUrl;
$command .= "\"";

//echo $command;

exec ($command, $out, $return_value);


//var_dump($out);
echo $out[0];

exit;
?>
