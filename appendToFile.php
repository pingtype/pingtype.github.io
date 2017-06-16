<?php
//echo var_dump($_POST);
//exit;


$file = $_POST["filename"];
$data = $_POST["data"];

//$file = $_POST['filename'];

//$data = "\n";
//$data .= $_POST['data'];
//$data = preg_replace('/\s\s+/', ' ', $data);
//$data = str_replace("</p>", "\n", $data);
//$data = stripslashes($data);
//$data = strip_tags($data, "");
//$data = str_replace("  ", "", $data);
//$data = str_replace("&nbsp;", " ", $data);
//$data = str_replace("&gt;", ">", $data);
//$data = str_replace("&lt;", "<", $data);
//$data = str_replace("&amp;", "&", $data);

 // Write the contents back to the file
file_put_contents($file, $data.PHP_EOL , FILE_APPEND | LOCK_EX);

/* Make sure that code below does not get executed when we redirect. */
exit;
?>
 
