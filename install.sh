#!/usr/bin/env bash
factorio_data_dir="$HOME/.factorio"
save_file="DS MP/2024-03-05_DEFAULT_MP_1-53_29-noPB.zip"
#save_file=$1

target_zip="$factorio_data_dir/saves/$save_file"
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
