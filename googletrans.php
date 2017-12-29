<?php

// Python library from http://py-googletrans.readthedocs.io/en/latest/#api-guide

$from = $_GET['from'];
$to = $_GET['to'];
$text = $_GET['text'];

$appFolder = "/Users/peter/Sites/pingtype/";

$command = "";
//$command .= "echo \"";
//$command .= $text;
//$command .= "\" | python ";
$command .= "python ";
$command .= $appFolder;
$command .= "googletrans";
$command .= $from;
$command .= $to;
$command .= ".py";
$command .= " \"";
$command .= $text;
$command .= "\"";
//$command .= "\" ";
//$command .= " 2>&1";

//echo $command;

//$command = "python /path/to/python_script.py 2>&1";

//system($command);

exec ($command, $out, $return_value);

//var_dump($out);
echo $out[0];

exit;
?>
 
