#!/bin/bash

inputFile="ODEPhrasesInIndexC.txt";

thisPage="";

pageNumber=1;

while IFS= read -r thisWord; do 
		
	newPage=`printf "$thisPage\n$thisWord"`;
	
	pageLength=${#newPage};
	
	if (( $pageLength > 5000 )); then
		outputFile="ODEPhrasesInIndexC$pageNumber.txt";
	
	   	printf "$thisPage" > "$outputFile";
	   
	    thisPage="$thisWord";
	    
	    pageNumber=$((pageNumber+1))
	    
	else
	   
	   thisPage="$newPage";
	   
	fi

done < "$inputFile"