const fs = require('fs');
const exec = require('child_process').exec;
const colors = require('colors');
const create = require('./lib/createFiles');
const templates = require('./lib/templateFileContent');

process.stdout.write('Creating WASM template...\n');
const args = process.argv.slice(2);

const printStr = args[0] || 'Hello WASM!';

// loadWasm.createWrapper();
// cpp.createCPP(printStr);
// configWasm.createConfig();
// server.createServer();
// html.createHtml();

create.writeFile('loadWASM.js', './wasm', templates.wrapperTxt, 'wasm wrapper file');
create.writeFile('lib.cpp', './cpp', templates.cppTxt, 'C++ file');
create.writeFile('wasm.config.js', './', templates.configTxt, 'wasm configuration file');
create.writeFile('server.js', './', templates.serverTxt, 'server file');
create.writeFile('index.html', './', templates.htmlTxt, 'html file');
create.writeFile('app.js', './', templates.appJsTxt, 'app.js file');


function compileWASM (args) {
  exec(`
  if [[ :$PATH: != *:"/emsdk":* ]]
  then
    # use path to emsdk folder, relative to project directory
    BASEDIR="./../emsdk"
    EMSDK_ENV=$(find "$BASEDIR" -type f -name "emsdk_env.sh")
    source "$EMSDK_ENV"
  fi

  # add exported C/C++ functions here
  CPP_FUNCS="[
  '_myFunc',
  ]" 

  echo "compiling C++ to WASM ..."
  emcc -o ./wasm/lib.js ./cpp/lib.cpp -lm -O3 -s WASM=1 \
  -s EXPORTED_FUNCTIONS="$CPP_FUNCS" \
  -s ALLOW_MEMORY_GROWTH=1 \

  `, (err, stdout) => {
    if (err) process.stderr.write(colors.red(err));
    console.log(stdout);
    insertEventListener();
  });
}

// insert event dispatcher into lib.js,
// to notify us when the script is done loading
function insertEventListener () {
  fs.readFile('./wasm/lib.js', 'utf-8', (err1, data) => {
    if (err1) process.stderr.write(colors.red(err1));
    
    data = data.replace(/else\{doRun\(\)\}/g, 'else{doRun()}script.dispatchEvent(doneEvent);');
    
    fs.writeFile('./wasm/lib.temp.js', data, (err2) => {
      if (err2) process.stderr.write(colors.red(err2));
      fs.renameSync('./wasm/lib.temp.js', './wasm/lib.js');
    });
  });
}

compileWASM();

clean = function() {
  exec(`rm ./wasm/*.* `, (err, stdout) => {
    if (err) console.log(err);
    console.log(stdout);
  });
};
