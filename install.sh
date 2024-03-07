#!/usr/bin/env bash
cp ./out/control.lua ~/.factorio/scenarios/analysis/control.lua

outzip="$HOME/.factorio/saves/DS MP/2024-03-05_DEFAULT_MP_1-53_29-noPB.zip"
filename=$(basename "$outzip" .zip)
mkdir tmp/"$filename" -p
cp ./out/control.lua tmp/"$filename"/control.lua
cd tmp || exit
zip -u "$outzip" "$filename"/control.lua
cd ..
rm -r tmp
