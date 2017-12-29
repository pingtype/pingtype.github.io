import sys
from googletrans import Translator

translator = Translator()

for line in sys.stdin:
    translation = translator.translate(line, src="en", dest='zh-tw')
    chinese = translation.text
    print chinese
    