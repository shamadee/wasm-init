// wasm.config.js
module.exports = {
  emscripten_path: './../emsdk',
  inputfiles: [
    './cpp/lib.cpp',
  ],
  outputfiles: [
    './wasm/lib.js',
  ],
  exported_functions: [
    '_myFunc',
  ],
  flags: [
    '-s WASM=1',
    '-s ASSERTIONS=1',
    '-s ALLOW_MEMORY_GROWTH=1',
    '-O3',
  ],
};

