#!/usr/bin/env node

const fs = require('fs');
const exec = require('child_process').exec;
const path = require('path');
const colors = require('colors');
const create = require('./../lib/createFiles');
const templates = require('./../lib/templateFileContent');
const cc = require('./../lib/compileWASM');

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

// remove all files with 'clean' flag
if (args['clean']) {
  
  const folders = ['./wasm', './cpp'];
  const files = ['wasm.config.js', 'server.js', 'index.html', 'index.js', 'gulpfile.js', ];
  
  // delete wasm and cpp folders
  process.stdout.write(colors.yellow('Deleting WASM template...\n'));
  folders.forEach(el => {
    if (fs.existsSync(el)) {
      exec(`rm -rf ${el}`, (err, stdout) => {
        if (err) process.stderr.write(colors.white(err));
        process.stdout.write(stdout);
      });
    }
  });
  // delete other files
  files.forEach(el => {
    if (fs.existsSync(el)) {
      exec(`rm -rf ${el}`, (err, stdout) => {
        if (err) process.stderr.write(colors.white(err));
        process.stdout.write(stdout);
      });
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

// create config file first, to generate compile and load parameters (input & output files)
// don't overwrite config file, if rebuild flag was submitted
// (rebuild the project from the parameters in the existing config file)
if (!args['rebuild']) create.writeFile('wasm.config.js', './', templates.configTxt, 'wasm configuration file', args);
const config = require(path.join(process.cwd(), './wasm.config.js'));

// add config parameters to arguments, to be passed to other file templates
args['config'] = config;

// extract file and directory names from config file
const cppFile = args.config.inputfiles[0].slice(args.config.inputfiles[0].lastIndexOf('/') + 1);
const cppDir = args.config.inputfiles[0].slice(0, args.config.inputfiles[0].lastIndexOf('/'));
const outFile = args.config.outputfile.slice(args.config.outputfile.lastIndexOf('/') + 1);
const outDir = args.config.outputfile.slice(0, args.config.outputfile.lastIndexOf('/'));


if (!args['no-wrapper']) create.writeFile('loadWASM.js', './wasm', templates.wrapperTxt, 'wasm wrapper file', args);
if (!args['no-cpp']) create.writeFile(cppFile, cppDir, templates.cppTxt, 'C++ file', args);
if (!args['no-server']) create.writeFile('server.js', './', templates.serverTxt, 'server file', args);
if (!args['no-html']) create.writeFile('index.html', './', templates.htmlTxt, 'html file', args);
if (!args['no-indexjs'])create.writeFile('index.js', './', templates.indexJsTxt, 'index.js file', args);

// install gulp and browser-sync, if required
if (args['hot']) {
  process.stdout.write(colors.magenta('Setting up hot reloading with gulp and borwser-sync...\n'));
  exec(`npm i --save gulp browser-sync`, (err, stdout) => {
    if (err) process.stderr.write(colors.white(err));
    process.stdout.write(stdout);
  });
  create.writeFile('gulpfile.js', './', templates.gulpTxt, 'gulp file', args);
}

// only compile wasm, if there is a valid input file
if (fs.existsSync(config.inputfiles[0])) {
  cc.compileWASM(config);
}
