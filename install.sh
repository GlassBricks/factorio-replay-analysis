#!/usr/bin/env bash

target_zip=$HOME/.factorio/saves/DS\ MP/dsmp_1_56_38.zip
echo "target_zip: $target_zip"

if [ ! -f "$target_zip" ]; then
  echo "File not found!"
  exit 1
fi

filename=$(basename "$target_zip" .zip)
mkdir tmp/"$filename" -p
cp ./out/control.lua tmp/"$filename"/control.lua
cd tmp || exit
zip -u "$target_zip" "$filename"/control.lua
cd ..
rm -r tmp
echo "Done!"
