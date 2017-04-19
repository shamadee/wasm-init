
/**
 * C++ file template
 * @param {Object} args 
 */
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

/**
 * wrapper file template
 * @param {Object} args 
 */
const wrapperTxt = (args) => {
  // get output file name and path
  const outFile = args.config.outputfile;
  const wasmFile = `${outFile.slice(0, outFile.lastIndexOf('.'))}.wasm`;
  return `// loadWASM.js

var Module = {};
function loadWASM() {
  return new Promise((resolve, reject) => {
    if (!('WebAssembly' in window)) {
      console.log('Could not load WASM');
      return reject(Module);
    } else {
      // TODO: use xmlhttprequest where fetch not supported
      fetch('${wasmFile}')
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

          script.src = '${outFile}';
          document.body.appendChild(script);
        });
    }
  });
}

`;
};

//------------------------------------------------------------------------

/**
 * wasm.config.js file template
 * @param {Object} args 
 */
const configTxt = (args) => {
  const emccPath = args['emcc_path'] || './../emsdk';
  return `// wasm.config.js
module.exports = {
  emscripten_path: '${emccPath}',
  inputfile: './cpp/lib.cpp',
  outputfile: './wasm/lib.js',
  exported_functions: [
    '_myFunc',
  ],
  flags: [
    '-s WASM=1',
    '-s ASSERTIONS=1',
    '-O3',
  ],
};

`;
};

//------------------------------------------------------------------------

/**
 * express server file template
 * @param {Object} args 
 */
const serverTxt = (args) => {
  const port = args.port || args.config.port || 3000;
  return `// server.js
const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, '/')));

app.listen(${port}, () => {
  console.log('Server listening on port ${port}');
});

`;
};

//------------------------------------------------------------------------

/**
 * index.html file template
 * @param {Object} args 
 */
const htmlTxt = (args) => {
  const outFile = args.config.outputfile;
  const outDir = outFile.slice(2, outFile.lastIndexOf('/'));
  const wrapperFile = `${outDir}/loadWasm.js`;

  return `<!-- index.html -->
<html>
<head>
  <meta charset="UTF-8">
  <title>wasm app</title>
</head>
<body>
  <script src="${wrapperFile}" type="text/javascript"></script>
  <script src="index.js" type="text/javascript"></script>
</body>
</html>
`;
};

//------------------------------------------------------------------------

/**
 * app.js file template
 * @param {Object} args 
 */
const indexJsTxt = (args) => {
  return `// index.js
let m = {}
loadWASM().then(wasmModule => {
  m = wasmModule;
  m._myFunc();
});

`;
};

//------------------------------------------------------------------------

/**
 * gulpfile.js file template
 * @param {Object} args 
 */
const gulpTxt = (args) => {
  const inputFile = args.config.inputfile;
  const inputDir = inputFile.slice(0, inputFile.lastIndexOf('/'));
  return `// gulpfile.js
const gulp = require('gulp');
const bs = require('browser-sync').create();
const child = require('child_process');
const exec = require('child_process').exec;
const colors = require('colors');

gulp.task('default', ['server', 'recompile', 'browser-sync']);

gulp.task('server', () => {
  let server = child.spawn('node', ['server.js']);
});

gulp.task('recompile', (cb) => {
  exec('npm run compile', (err, stdout, stderr) => {
    if (err) process.stderr.write(err);
    if (stderr) {
      process.stderr.write(colors.red.bold(stderr));
      cb('COMPILE ERROR');
      process.stderr.write(colors.red.bold('waiting for file changes ...'));
    } else {
      process.stdout.write(colors.white.dim(stdout));
      bs.reload();
      cb(err);
    }
  });
});

gulp.task('browser-sync', ['recompile'], () => {
  bs.init({
    proxy: 'localhost:3000',
  });
});

gulp.watch(['./cpp/**/*.{c,h,cpp,cc,hpp,hh}', 'wasm.config.js'], ['recompile']);

gulp.watch(['index.js', 'server.js', 'index.html'], () => {
  bs.reload();
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
  indexJsTxt,
  gulpTxt,
};
