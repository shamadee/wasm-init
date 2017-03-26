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
    '_myFunc2',
  ],
  flags: [
    '-s WASM=1',
  ],
};

