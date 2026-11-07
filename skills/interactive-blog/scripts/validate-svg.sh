#!/usr/bin/env bash
# CLAUDE.md SVG rules: no duplicate attributes, no unescaped &, valid XML.
f="$1"; [ -f "$f" ] || { echo "usage: validate-svg.sh file.svg"; exit 1; }
dup=$(grep -o '<[^>]*opacity[^>]*opacity[^>]*>' "$f" | grep -v 'fill-opacity\|stroke-opacity' | wc -l)
amp=$(grep -o '&[^a-z#]' "$f" | wc -l)
python3 -c "import xml.dom.minidom,sys; xml.dom.minidom.parse(sys.argv[1])" "$f" && xmlok=yes || xmlok=no
echo "duplicate opacity: $dup | unescaped &: $amp | valid XML: $xmlok"
[ "$dup" = 0 ] && [ "$amp" = 0 ] && [ "$xmlok" = yes ]
