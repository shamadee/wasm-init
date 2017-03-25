const exec = require('child_process').exec;
const cpp = require('./lib/createCPP');
const loadWasm = require('./lib/createWrapper');
const configWasm = require('./lib/createWASMConfig');
const server = require('./lib/createServer');
const html = require('./lib/createHtml');
const create = require('./lib/createFiles');

console.log('creating WASM template...\n');
const args = process.argv.slice(2);

const printStr = args[0] || 'Hello WASM!';

loadWasm.createWrapper();
cpp.createCPP(printStr);
configWasm.createConfig();
server.createServer();
html.createHtml();

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
  '"$@"',
  ]" 

  echo "compiling C++ to WASM ..."
  emcc -o ./wasm/lib.js ./cpp/lib.cpp -lm -s WASM=1 \
  -s EXPORTED_FUNCTIONS="$CPP_FUNCS" \
  -s ALLOW_MEMORY_GROWTH=1 \

  `, (err, stdout, stderr) => {
    if (err) console.log(err);
    console.log(stdout);
  });
}

compileWASM();

clean = function() {
  exec(`rm ./lib/*.* `, (err, stdout, stderr) => {
    if (err) console.log(err);
    console.log(stdout);
  });
  exec(`rm ./wasm/*.* `, (err, stdout, stderr) => {
    if (err) console.log(err);
    console.log(stdout);
  });
};
