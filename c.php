<?php

//$text = $_GET['text'];
$chineseFile = $_GET['chineseFile'];

$appFolder = "/var/mobile/Sites/pingtype/";


//$file = "filename.html";
//file_put_contents($file, "");

//$file = "script.sh";

//$chineseFile = urldecode($chineseFile);
//$chineseFile = str_replace(" ","\\ ",$chineseFile);


//$data = "#!/bin/bash\n";
//$data .= "echo \"";
//$data .= $text;
//$data .= "\" | ";
//$data .= "cat \"/Users/peter/Sites/pingtype/";
//$data .= $chineseFile;
//$data .= "\" ";
//$data .= "/Users/peter/Sites/pingtype/pingtype -i \"";
$command = "";
$command .= $appFolder;
$command .= "pingtype -i \"";
$command .= $appFolder;
$command .= $chineseFile;
$command .= "\" --html";


//echo "$command";

//exit;


//$command .= " > \"";
//$command .= $appFolder;
//$command .= "filename.html\"";

//file_put_contents($file, $command);

exec ($command, $out, $return_value);

//$out = file_get_contents("filename.html");

//sleep(2);

//var_dump($out);
//var_dump($return_value);

echo implode($out);

//echo $out;


exit;
?>
 
