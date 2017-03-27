#!/usr/bin/env node

const fs = require('fs');
const exec = require('child_process').exec;
const colors = require('colors');
const create = require('./../lib/createFiles');
const templates = require('./../lib/templateFileContent');
const cc = require('./../lib/compileWASM');

process.stdout.write(colors.cyan('Creating WASM template...\n'));


const argsArr = process.argv.slice(2);
const args = {};

// populate args object with key-value pairs
argsArr.forEach(el => {
  let key;
  let value;
  if (el.indexOf('=') >= 0) {
    key = el.slice(0, el.indexOf('='));
    value = el.slice(el.indexOf('=') + 1);
  } else {
    key = el;
    value = true;
  }
  args[key] = value;
});

if (args['clean']) {
  return exec(`rm -rf ./wasm ./cpp && rm index.js index.html server.js wasm.config.js`, (err, stdout) => {
    if (err) process.stderr.write(colors.white(err));
    process.stdout.write(stdout);
  });
} else {
  create.writeFile('loadWASM.js', './wasm', templates.wrapperTxt, 'wasm wrapper file', args);
  create.writeFile('wasm.config.js', './', templates.configTxt, 'wasm configuration file', args);
  create.writeFile('lib.cpp', './cpp', templates.cppTxt, 'C++ file', args);
  create.writeFile('server.js', './', templates.serverTxt, 'server file', args);
  create.writeFile('index.html', './', templates.htmlTxt, 'html file', args);
  create.writeFile('index.js', './', templates.indexJsTxt, 'index.js file', args);
}

const config = require('./../../../wasm.config.js');
// const config = require('./../wasm.config.js');

cc.compileWASM(config);
