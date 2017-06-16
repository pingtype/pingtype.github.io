/*

cc -lm itunesToPinyinDefinitionsTones.c -o itunesToPinyinDefinitionsTones

cat "/Users/peter/Music/iTunes/Libraries/Traditional Characters/iTunes Library.xml" | ./itunesToPinyinDefinitionsTones > "/Users/peter/Sites/decompose/PinyinDefinitionsTones.txt"

head -n 20 "/Users/peter/Music/iTunes/Libraries/Traditional Characters/iTunes Library.xml" | tail -n 10 | ./itunesToPinyinDefinitionsTones

Runtime: 0m3.570s

*/

#include <stdio.h>	 /* Standard input/output definitions */
#include <string.h>  /* String function definitions */
#include <stdlib.h>	 /* Standard library */

#define XML_LINE 10000	  /* Number of characters in one OSM line */


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

    char* startPointer = NULL;

    // Read a line from stdin.
    while (fgets(thisLine, XML_LINE, stdin) != NULL)
    {
        //fprintf( stdout, "Line: %s", thisLine); fflush(stdout);
        
        // Print names
        startPointer = strstr(thisLine, "<key>Name</key>");
        
        if (startPointer != NULL)
        {
        	startPointer = textBetween(thisLine, "<string>", "</string>", thisField);

            fprintf( stdout, "%s	", thisField); fflush(stdout);
        } // end if the line contains the key

        // Print groupings
        startPointer = strstr(thisLine, "<key>Grouping</key>");
        
        if (startPointer != NULL)
        {
        	startPointer = textBetween(thisLine, "<string>", "</string>", thisField);

            fprintf( stdout, "%s	", thisField); fflush(stdout);
        } // end if the line contains the key

        // Print composer
        startPointer = strstr(thisLine, "<key>Composer</key>");
        
        if (startPointer != NULL)
        {
        	startPointer = textBetween(thisLine, "<string>", "</string>", thisField);

            fprintf( stdout, "%s	", thisField); fflush(stdout);
        } // end if the line contains the key

        // Print genre
        startPointer = strstr(thisLine, "<key>Genre</key>");
        
        if (startPointer != NULL)
        {
        	startPointer = textBetween(thisLine, "<string>", "</string>", thisField);

            fprintf( stdout, "%s	", thisField); fflush(stdout);
        } // end if the line contains the key

        // Print BPM
        startPointer = strstr(thisLine, "<key>BPM</key>");
        
        if (startPointer != NULL)
        {
        	startPointer = textBetween(thisLine, "<integer>", "</integer>", thisField);

            fprintf( stdout, "%s	", thisField); fflush(stdout);
        } // end if the line contains the key

        // Print Episode
        startPointer = strstr(thisLine, "<key>Episode</key>");
        
        if (startPointer != NULL)
        {
        	startPointer = textBetween(thisLine, "<string>", "</string>", thisField);

            fprintf( stdout, "%s	", thisField); fflush(stdout);
        } // end if the line contains the key

        // Make a new line for each new Track ID
        startPointer = strstr(thisLine, "<key>Track ID</key>");
        
        if (startPointer != NULL)
        {
        	fprintf( stdout, "\n"); fflush(stdout);
        } // end if the line contains the key
        
    } // end while reading lines from stdin
    
    
} // end main method
