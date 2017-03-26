// wasm.config.js
const wasmConfig = {
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
  ],
};

module.exports = {
  wasmConfig,
};

