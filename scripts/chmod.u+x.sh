#!/bin/bash

missing_files=""

printf "\n\033[1;4;32m[+] starting chmod execution for executable files...\033[0m\n"

if [ -f "./bin/input.js" ]; then
  chmod u+x "./bin/input.js"
else
  missing_files="$missing_files ./bin/input.js"
fi

if [ -n "$missing_files" ]; then
  printf "\033[1;4;31m[+] error: Missing files: %s\033[0m\n" "$missing_files"
  exit 1
else
  printf "\033[1;4;32m[+] chmod execution completed successfully.\033[0m\n"
fi
