/*

cc -lm unihanToDictionary.c -o unihanToDictionary

cat "/Users/peter/Documents/Homes/Taiwan/Kaohsiung/Social/Traditional Characters/ucd.unihan.grouped.xml" | ./unihanToDictionary > "/Users/peter/Sites/pingxing/UnihanDictionary.txt"

head -n 20 "/Users/peter/Documents/Homes/Taiwan/Kaohsiung/Social/Traditional Characters/ucd.unihan.grouped.xml" | tail -n 10 | ./unihanToDictionary

Not working! See below. 

*/

#include <stdio.h>	 /* Standard input/output definitions */
#include <string.h>  /* String function definitions */
#include <stdlib.h>	 /* Standard library */

#define XML_LINE 10000	  /* Number of characters in one XML line */


char* textBetween(char* thisText, char* startText, char* endText, char* returnText)
{
    char* startPointer = NULL;
    int stringLength = 0;

    startPointer = strstr(thisText, startText);
    
    if (startPointer != NULL)
    {
        startPointer = startPointer + strlen(startText);
        
        stringLength = strlen(startPointer) - (int)strlen(strstr(startPointer,endText));
        
        // Copy characters between the start and end delimiters
        strncpy(returnText,startPointer, stringLength);
        
        returnText[stringLength++] = '\0';
    }
    
    return startPointer;
}

int main(int argc, char** argv) 
{

	char thisLineArray[XML_LINE]; /* Line buffer for reading OSM file */	
    char* thisLine = thisLineArray;

	char thisFieldArray[XML_LINE]; /* Name */	
    char* thisField = thisFieldArray;

	char thisUpperArray[XML_LINE]; /* Character upper bytes */	
    char* thisUpper = thisUpperArray;

    char* startPointer = NULL;

    // Read a line from stdin.
    while (fgets(thisLine, XML_LINE, stdin) != NULL)
    {
        //fprintf( stdout, "Line: %s", thisLine); fflush(stdout);
        
        // Print characters
        startPointer = strstr(thisLine, "<char cp=\"");
        
        if (startPointer != NULL)
        {
        	startPointer = textBetween(thisLine, "<char cp=\"", "\"", thisField);
			
			/*
			
			
			*******************
			
			This code does not work because I can't figure out how to convert the hex string to a unicode character.
			
			I'm just going to use a shell script.	
			
			*******************
			
			
			 */
			
			sprintf(thisUpper, "0x%s", thisField);
			
            fprintf( stdout, "%lc	", (wchar_t)thisUpper); fflush(stdout);
        } // end if the line contains the key

        // Print pinyin
        startPointer = strstr(thisLine, "kMandarin=\"");
        
        if (startPointer != NULL)
        {
        	startPointer = textBetween(thisLine, "kMandarin=\"", "\"", thisField);

            fprintf( stdout, "%s	", thisField); fflush(stdout);
        } // end if the line contains the key

        // Print definition
        startPointer = strstr(thisLine, "kDefinition=\"");
        
        if (startPointer != NULL)
        {
        	startPointer = textBetween(thisLine, "kDefinition=\"", "\"", thisField);

            fprintf( stdout, "%s	", thisField); fflush(stdout);
        } // end if the line contains the key

        // Print frequency
        startPointer = strstr(thisLine, "kFrequency=\"");
        
        if (startPointer != NULL)
        {
        	startPointer = textBetween(thisLine, "kFrequency=\"", "\"", thisField);

            fprintf( stdout, "%s	", thisField); fflush(stdout);
        } // end if the line contains the key

        // Make a new line
        startPointer = strstr(thisLine, "/>");
        
        if (startPointer != NULL)
        {
        	fprintf( stdout, "\n"); fflush(stdout);
        } // end if the line contains the key
        
    } // end while reading lines from stdin
    
    
} // end main method
