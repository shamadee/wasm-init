
// C++ file template
const cppTxt = (args) => {
  return `// lib.cpp
#include <iostream>

extern "C" {

  void myFunc() {
    std::cout << "Hello WASM!" << std::endl;
  }

}
`;
};

//------------------------------------------------------------------------

// wrapper file template
const wrapperTxt = (args) => {
  return `// loadWASM.js

var Module = {};
function loadWASM() {
  return new Promise((resolve, reject) => {
    if (!('WebAssembly' in window)) {
      console.log('Could not load WASM');
      return reject(Module);
    } else {
      // TODO: use xmlhttprequest where fetch not supported
      fetch('./wasm/lib.wasm')
        .then(response => {
          return response.arrayBuffer();
        })
        .then(buffer => {
          Module.wasmBinary = buffer;

          function wasmLoaded() {
            console.log('Emscripten boilerplate loaded.');
            resolve(Module);
          }

          // GLOBAL -- create custom event for complete glue script execution
          script = document.createElement('script');
          doneEvent = new Event('done');
          script.addEventListener('done', wasmLoaded);
          // END GLOBAL

          // TODO: IN EMSCRIPTEN GLUE INSERT
          // else{doRun()} ...
          // script.dispatchEvent(doneEvent);
          // ... }Module["run"]

          script.src = './wasm/lib.js';
          document.body.appendChild(script);
        });
    }
  });
}

`;
};

//------------------------------------------------------------------------

// wasm config file template
const configTxt = (args) => {
  const emcc_path = args['emcc_path'] || './../emsdk';
  return `// wasm.config.js
module.exports = {
  emscripten_path: '${emcc_path}',
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

`;
};

//------------------------------------------------------------------------

// server file template
const serverTxt = (args) => {
  return `// server.js
const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, '/')));

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

`;
};

//------------------------------------------------------------------------

// html file template
const htmlTxt = (args) => {
  return `<!-- index.html -->
<html>
<head>
  <meta charset="UTF-8">
  <title>wasm app</title>
</head>
<body>
  <script src="wasm/loadWASM.js" type="text/javascript"></script>
  <script src="app.js" type="text/javascript"></script>
</body>
</html>
`;
};

//------------------------------------------------------------------------

// app.js file template
const appJsTxt = (args) => {
  return `// app.js
let m = {}
loadWASM().then(wasmModule => {
  m = wasmModule;
  m._myFunc();
});
`;
};

//------------------------------------------------------------------------

module.exports = {
  cppTxt,
  wrapperTxt,
  configTxt,
  serverTxt,
  htmlTxt,
  appJsTxt,
};


