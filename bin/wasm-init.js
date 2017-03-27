#!/usr/bin/env node

const fs = require('fs');
const exec = require('child_process').exec;
const colors = require('colors');
const create = require('./../lib/createFiles');
const templates = require('./../lib/templateFileContent');

process.stdout.write(colors.cyan('Creating WASM template...\n'));

const argsArr = process.argv.slice(2);
const args = {};

argsArr.forEach(el => {
  const key = el.slice(0, el.indexOf('=') + 1) || el.slice(el.indexOf('=') + 1);
  const value = el.slice(el.indexOf('=') + 1);
  args[key] = value;
});

if (args['clean']) {
  return exec(`rm -rf ./wasm ./cpp && rm app.js index.html server.js wasm.config.js`, (err, stdout) => {
    if (err) process.stderr.write(colors.white(err));
    process.stdout.write(stdout);
  });
} else {
  create.writeFile('loadWASM.js', './wasm', templates.wrapperTxt, 'wasm wrapper file', args);
  create.writeFile('wasm.config.js', './', templates.configTxt, 'wasm configuration file', args);
  create.writeFile('lib.cpp', './cpp', templates.cppTxt, 'C++ file', args);
  create.writeFile('server.js', './', templates.serverTxt, 'server file', args);
  create.writeFile('index.html', './', templates.htmlTxt, 'html file', args);
  create.writeFile('app.js', './', templates.appJsTxt, 'app.js file', args);
}

const config = require('./../../../wasm.config.js');
// const config = require('./../wasm.config.js');

function compileWASM () {
  // check that emscripten path is correct
  if (!fs.existsSync(config.emscripten_path)) return process.stdout.write(colors.red(`Error: Could not find emscripten directory at ${config.emscripten_path}\n`));
  // format exported functions from config for shell script
  let expFuncs = config.exported_functions.reduce((acc, val) => acc.concat('\'', val, '\'\,'), '[');
  expFuncs = expFuncs.substring(0, expFuncs.length - 1).concat(']');

  // format flags from config for shell script
  const flags = config.flags.reduce((acc, val) => acc.concat(' ', val), '');

  // execute shell script
  exec(`
  if [[ :$PATH: != *:"/emsdk":* ]]
  then
    # use path to emsdk folder, relative to project directory
    BASEDIR="${config.emscripten_path}"
    EMSDK_ENV=$(find "$BASEDIR" -type f -name "emsdk_env.sh")
    source "$EMSDK_ENV"
  fi

  # add exported C/C++ functions here
  CPP_FUNCS="[
  '_myFunc',
  ]"

  echo "Compiling C++ to WASM ..."
  echo " "
  emcc -o ${config.outputfiles} ${config.inputfiles} \
  -s EXPORTED_FUNCTIONS="${expFuncs}" \
  ${flags}

  `, (err, stdout) => {
    if (err) process.stderr.write(colors.white(err));
    process.stdout.write(stdout);
    insertEventListener();
  });
}

// insert event dispatcher into lib.js,
// to notify us when the script is done loading
function insertEventListener () {
  fs.readFile('./wasm/lib.js', 'utf-8', (err1, data) => {
    if (err1) process.stderr.write(colors.white(err1));
    
    data = data.replace(/else\{doRun\(\)\}/g, 'else{doRun()}script.dispatchEvent(doneEvent);');
    
    fs.writeFile('./wasm/lib.temp.js', data, (err2) => {
      if (err2) process.stderr.write(colors.white(err2));
      fs.renameSync('./wasm/lib.temp.js', './wasm/lib.js');
    });
  });
}

compileWASM();

clean = function() {
  exec(`rm ./wasm/*.* `, (err, stdout) => {
    if (err) process.stderr.write(err);
    process.stdout.write(stdout);
  });
};
