// app.js
let m = {}
loadWASM().then(wasmModule => {
  m = wasmModule;
  m._myFunc();
});
