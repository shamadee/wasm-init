#!/usr/bin/env node

/**
 * This file calls the compileWASM function, which calls
 * the emmcc shell commands with the environment variables
 * from the wasm.config.js file.
 * */

const path = require('path');
const cc = require('./../lib/compileWASM');
const config = require(path.join(process.cwd(), './wasm.config.js'));

cc.compileWASM(config);
