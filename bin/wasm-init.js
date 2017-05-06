#!/usr/bin/env node

const fs = require('fs');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const path = require('path');
const colors = require('colors');
const create = require('./../lib/createFiles');
const templates = require('./../lib/templateFileContent');
const cc = require('./../lib/compileWASM');

// check if the wasm.config.js file already exists, and require it in
let config = null;
if (fs.existsSync(path.join(process.cwd(), './wasm.config.js'))) {
  config = require(path.join(process.cwd(), './wasm.config.js'));
}
// populate args object with key-value pairs
const argsArr = process.argv.slice(2);
const args = {};
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

// remove files with 'clean' flag
if (args['clean'] || args['clean-all']) {
  let cppFolder = './cpp';
  let wasmFolder = './wasm';
  if (config) {
    cppFolder = config.inputfile.slice(0, config.inputfile.lastIndexOf('/'));
    wasmFolder = config.outputfile.slice(0, config.outputfile.lastIndexOf('/'));
  }
  const folders = [wasmFolder, cppFolder];
  const files = ['server.js', 'index.html', 'index.js', 'gulpfile.js', ];
  // delete wasm.config.js file, if flag is clean-all
  if (args['clean-all']) files.push('wasm.config.js');
  
  // delete wasm and cpp folders
  process.stdout.write(colors.yellow('Deleting WASM template...\n'));
  folders.forEach(el => {
    if (fs.existsSync(el)) {
      let curPath;
      fs.readdirSync(el).forEach((file, i) => {
        curPath = `${el}/${file}`;
        fs.unlinkSync(curPath);
      });
      fs.rmdirSync(el);
    }
  });
  // delete other files
  files.forEach(el => {
    if (fs.existsSync(el)) {
      fs.unlinkSync(el);
    }
  });
  
  return;
}

// create files

// set flags to only create config file, if 'minimal'
if (args['minimal']) {
  args['no-cpp'] = true;
  args['no-wrapper'] = true;
  args['no-server'] = true;
  args['no-html'] = true;
  args['no-indexjs'] = true;
}
process.stdout.write(colors.cyan('Creating WASM template...\n'));

// create config file first, to generate compile and load parameters (input & output files, flags)
// don't overwrite config file, if build flag was submitted
// (build the project from the parameters in the existing config file)
if (!args['build']) create.writeFile('wasm.config.js', './', templates.configTxt, 'wasm configuration file', args);
if (!fs.existsSync(path.join(process.cwd(), './wasm.config.js'))) {
  process.stdout.write(colors.red('Could not find wasm.config.js file'));
}
config = require(path.join(process.cwd(), './wasm.config.js'));

// add config parameters to arguments, to be passed to other file templates
args['config'] = config;

// extract file and directory names from config file
const cppFile = args.config.inputfile.slice(args.config.inputfile.lastIndexOf('/') + 1);
const cppDir = args.config.inputfile.slice(0, args.config.inputfile.lastIndexOf('/'));
const outFile = args.config.outputfile.slice(args.config.outputfile.lastIndexOf('/') + 1);
const outDir = args.config.outputfile.slice(0, args.config.outputfile.lastIndexOf('/'));

if (!args['no-wrapper']) create.writeFile('loadWASM.js', outDir, templates.wrapperTxt, 'wasm wrapper file', args);
if (!args['no-cpp']) create.writeFile(cppFile, cppDir, templates.cppTxt, 'C++ file', args);
if (!args['no-server']) create.writeFile('server.js', './', templates.serverTxt, 'server file', args);
if (!args['no-html']) create.writeFile('index.html', './', templates.htmlTxt, 'html file', args);
if (!args['no-indexjs'])create.writeFile('index.js', './', templates.indexJsTxt, 'index.js file', args);

// install gulp and browser-sync, if required
if (args['hot']) {
  process.stdout.write(colors.magenta('Setting up hot reloading with gulp and browser-sync...\n'));
  if (!fs.existsSync(path.join(process.cwd(), 'node_modules/gulp'))) {
    process.stdout.write(colors.magenta('Installing gulp and browser-sync...\n'));
    execSync(`npm install --save gulp browser-sync`, (err, stdout) => {
      if (err) process.stderr.write(colors.white(err));
      process.stdout.write(stdout);
    });
  }
  create.writeFile('gulpfile.js', './', templates.gulpTxt, 'gulp file', args);
}

// only compile wasm, if there is a valid input file
if (fs.existsSync(config.inputfile)) {
  cc.compileWASM(config);
}
