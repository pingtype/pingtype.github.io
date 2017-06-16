#!/bin/bash

IFS="";

thisFolder="KHOPManual";

theseFiles="$thisFolder/*";

for thisFile in $theseFiles
do
	fileText=`cat "$thisFile" | tr -d '\n' | tr -d '\r' | tr '	' ' '`;
	
	echo "$thisFile	$fileText" >> "index.txt";
	
done

