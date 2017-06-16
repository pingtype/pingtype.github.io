#!/bin/bash

INPUT="/Users/peter/Documents/Homes/Taiwan/Kaohsiung/Social/Traditional Characters/Chinese Menu from Weiyi/Chinese Menu from Weiyi.txt";

echo "<html><body bgcolor=\"#C0C0C0\">";

while read line
do

    echo "<p>";

	# while loop
	for (( currentCharacter=0; currentCharacter<${#line}; currentCharacter++ ));
	do
		thisCharacter=${line:$currentCharacter:1};

		if [[ "$thisCharacter" == "0" ]]
		then
			echo -n "<font color=\"#000000\">0</font>";
		else
			if [[ "$thisCharacter" == "1" ]]
			then
				echo -n "<font color=\"#964B00\">1</font>";
			else
				if [[ "$thisCharacter" == "2" ]]
				then
					echo -n "<font color=\"#FF0000\">2</font>";
				else
					if [[ "$thisCharacter" == "3" ]]
					then
						echo -n "<font color=\"#FFA500\">3</font>";
					else
						if [[ "$thisCharacter" == "4" ]]
						then
							echo -n "<font color=\"#FFFF00\">4</font>";
						else
							if [[ "$thisCharacter" == "5" ]]
							then
								echo -n "<font color=\"#9ACD32\">5</font>";
							else
								if [[ "$thisCharacter" == "6" ]]
								then
									echo -n "<font color=\"#6495ED\">6</font>";
								else
									if [[ "$thisCharacter" == "7" ]]
									then
										echo -n "<font color=\"#EE82EE\">7</font>";
									else
										if [[ "$thisCharacter" == "8" ]]
										then
											echo -n "<font color=\"#A0A0A0\">8</font>";
										else
											if [[ "$thisCharacter" == "9" ]]
											then
												echo -n "<font color=\"#FFFFFF\">9</font>";
											else
												echo -n "$thisCharacter";
											fi
										fi
									fi
								fi
							fi
						fi
					fi
				fi
			fi
		fi
	
	done
    
    echo "</p>";
    
done < "$INPUT"

echo "</body></html>";

