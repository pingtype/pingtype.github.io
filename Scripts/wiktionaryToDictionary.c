/*

cc -lm wiktionaryToDictionary.c -o wiktionaryToDictionary

cat "/Volumes/WesternDigital4/Documents/Wiktionary/enwiktionary-20170401-pages-meta-current.xml" | ./wiktionaryToDictionary > "/Volumes/WesternDigital4/Documents/Wiktionary/en-wiktionary.txt"

grep "<name>[㐀-龎]" en-wiktionary.txt > en-wiktionaryChinese.txt

cat "/Volumes/WesternDigital4/Documents/Wiktionary/zhwiktionary-latest-pages-articles.xml" | ./wiktionaryToDictionary > "/Users/peter/Documents/Homes/Taiwan/Kaohsiung/Social/Traditional Characters/WiktionaryDictionaryInput.txt"

head -n 1000 "/Volumes/WesternDigital4/Documents/zhwiktionary-latest-pages-articles.xml" | tail -n 20 | ./wiktionaryToDictionary

*/

#include <stdio.h>	 /* Standard input/output definitions */
#include <string.h>  /* String function definitions */
#include <stdlib.h>	 /* Standard library */

#define XML_LINE 10000	  /* Number of characters in one XML line */


char* textBetween(char* thisText, char* startText, char* endText, char* returnText)
{
    char* startPointer = NULL;
    int stringLength = 0;
    int afterEndLength = 0;
    char* checkPointer = NULL;
    char* endPointer = NULL;
    int startLength = 0;

	if (strlen(thisText) == 0)
    {
    	returnText = "\0";
        startPointer = returnText;
        return startPointer;
    }
        
    checkPointer = strstr(startText, "start");
        
    if (checkPointer != NULL)
    {
    	startPointer = thisText;
    	startLength = 0;
    } else {
    	startPointer = strstr(thisText, startText);
    	startLength = strlen(startText);
    }

    checkPointer = strstr(endText, "end");
    
    if (checkPointer != NULL)
    {
    	afterEndLength = 0;
    } else {
    
    	endPointer = strstr(thisText,endText);
    
        if (endPointer == NULL)
        {
        	afterEndLength = 0;
        } else {
        	afterEndLength = (int)strlen(endPointer);
        }
    
    }
    
    if (startPointer != NULL)
    {
        startPointer = startPointer + startLength;
        
        stringLength = strlen(startPointer) - afterEndLength;
        
        if (stringLength == 0)
        {
        	returnText = "\0";
        	startPointer = returnText;
        } else {
	        // Copy characters between the start and end delimiters
    	    strncpy(returnText,startPointer, stringLength);
	        returnText[stringLength++] = '\0';
        }
        
    }
    
    return startPointer;
}

int main(int argc, char** argv) 
{

	char thisLineArray[XML_LINE]; /* Line buffer for reading OSM file */	
    char* thisLine = thisLineArray;

	char thisFieldArray[XML_LINE]; /* Name */	
    char* thisField = thisFieldArray;

	char temporaryFieldArray[XML_LINE]; /* Name */	
    char* temporaryField = temporaryFieldArray;


    char* startPointer = NULL;

    // Read a line from stdin.
    while (fgets(thisLine, XML_LINE, stdin) != NULL)
    {
    	thisField = thisFieldArray;
    	temporaryField = temporaryFieldArray;
    
        //fprintf( stdout, "Line: %s", thisLine); fflush(stdout);
        
        // Print characters
        startPointer = strstr(thisLine, "<title>");
        
        if (startPointer != NULL)
        {
        	startPointer = textBetween(thisLine, "<title>", "</title>", thisField);
			
            fprintf( stdout, "<name>%s</name>	", thisField); fflush(stdout);
        } // end if the line contains the key

        // Print pinyin
        startPointer = strstr(thisLine, "pinyin=");
        
        if (startPointer != NULL)
        {
        	startPointer = textBetween(thisLine, "pinyin=", "\n", temporaryField);
        	startPointer = textBetween(temporaryField, "start", "|", thisField);
			
            fprintf( stdout, "<pinyin>%s</pinyin>	", thisField); fflush(stdout);
        } // end if the line contains the key

        // Print pinyin
        startPointer = strstr(thisLine, "|m=");
        
        if (startPointer != NULL)
        {
        	startPointer = textBetween(thisLine, "|m=", "\n", temporaryField);
        	startPointer = textBetween(temporaryField, "start", "|", thisField);
			
            fprintf( stdout, "<pinyin>%s</pinyin>	", thisField); fflush(stdout);
        } // end if the line contains the key


        // Print zhuyin
        startPointer = strstr(thisLine, "zhuyin=");
        
        if (startPointer != NULL)
        {
        	startPointer = textBetween(thisLine, "zhuyin=", "\n", temporaryField);
        	startPointer = textBetween(temporaryField, "start", "|", thisField);
			
            fprintf( stdout, "<zhuyin>%s</zhuyin>	", thisField); fflush(stdout);
        } // end if the line contains the key

        // Print definition
        startPointer = strstr(thisLine, "{{en}}: ");
        
        if (startPointer != NULL)
        {
        	startPointer = textBetween(thisLine, "{{en}}: ", "\n", thisField);

            fprintf( stdout, "<english>%s</english>	", thisField); fflush(stdout);
        } // end if the line contains the key

        // Print definition
        startPointer = strstr(thisLine, "[[");
        
        if (startPointer != NULL)
        {
        	startPointer = textBetween(thisLine, "[[", "\n", temporaryField);
        	startPointer = textBetween(temporaryField, "start", "]]", thisField);

            fprintf( stdout, "<english>%s</english>	", thisField); fflush(stdout);
        } // end if the line contains the key


        // Print definition
        startPointer = strstr(thisLine, "[[英语]]: ");
        
        if (startPointer != NULL)
        {
        	startPointer = textBetween(thisLine, "[[英语]]: ", "\n", thisField);

            fprintf( stdout, "<english>%s</english>	", thisField); fflush(stdout);
        } // end if the line contains the key

        // Print classifiers
        startPointer = strstr(thisLine, "zh-mw|");
        
        if (startPointer != NULL)
        {
        	startPointer = textBetween(thisLine, "zh-mw|", "\n", temporaryField);
        	startPointer = textBetween(temporaryField, "start", "}", thisField);

            fprintf( stdout, "<classifier>%s</classifier>	", thisField); fflush(stdout);
        } // end if the line contains the key


        // Make a new line
        startPointer = strstr(thisLine, "</page>");
        
        if (startPointer != NULL)
        {
        	fprintf( stdout, "\n"); fflush(stdout);
        } // end if the line contains the key
        
    } // end while reading lines from stdin
    
    
} // end main method
