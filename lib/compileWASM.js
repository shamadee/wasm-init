// compileWASM.js
const fs = require('fs');
const exec = require('child_process').exec;
const colors = require('colors');

function compileWASM (config) {
  // check that emscripten path is correct
  if (!fs.existsSync(config.emscripten_path)) return process.stdout.write(colors.red(`Error: Could not find emscripten directory at ${config.emscripten_path}\n`));
  // format exported functions from config for shell script
  let expFuncs = config.exported_functions.reduce((acc, val) => acc.concat('\'', val, '\'\,'), '[');
  expFuncs = expFuncs.substring(0, expFuncs.length - 1).concat(']');

  // format flags from config for shell script
  const flags = config.flags.reduce((acc, val) => acc.concat(' ', val), '');

  process.stdout.write(colors.cyan('Running emscripten...\n'));
  
  // execute shell script
  exec(`
  if [[ :$PATH: != *:"/emsdk":* ]]
  then
    # use path to emsdk folder, relative to project directory
    BASEDIR="${config.emscripten_path}"
    EMSDK_ENV=$(find "$BASEDIR" -type f -name "emsdk_env.sh")
    source "$EMSDK_ENV"
  fi

  emcc -o ${config.outputfiles} ${config.inputfiles} -s EXPORTED_FUNCTIONS="${expFuncs}" ${flags}
  `, (err, stdout) => {
    if (err) process.stderr.write(colors.white(err));
    process.stdout.write(stdout);
    insertEventListener();
    process.stdout.write(colors.green('Compiled C++ to WASM\n'));
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

module.exports = {
  compileWASM,
  insertEventListener,
};
