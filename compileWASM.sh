#!/bin/bash

# add environment variables and directories for emsdk, if needed
if [[ :$PATH: != *:"/emsdk":* ]]
then
  # use path to emsdk folder, relative to project directory
  BASEDIR="./../../emsdk"
  EMSDK_ENV=$(find "$BASEDIR" -type f -name "emsdk_env.sh")
  source "$EMSDK_ENV"
fi

echo "$@"
# add exported C/C++ functions here
CPP_FUNCS="[
 '"$@"',
]" 

echo "compiling C++ to WASM ..."
emcc -o ./../wasm/lib.js ./../cpp/lib.cpp -lm -s WASM=1 \
-s EXPORTED_FUNCTIONS="$CPP_FUNCS" \
-s ALLOW_MEMORY_GROWTH=1 \