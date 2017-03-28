#!/usr/bin/env node

const path = require('path');
const colors = require('colors');
const cc = require('./../lib/compileWASM');
const config = require(path.join(process.cwd(), './wasm.config.js'));

cc.compileWASM(config, exporting=true);
