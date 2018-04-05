#!/usr/bin/env node

'use strict';

var bustycache = require('./lib/busty-cache');
var fs = require('fs');

var filePath = 'test/test.html';

if (process.argv[2] === undefined) {
  return console.log('No path supplied.');
}

filePath = process.argv[2];

fs.readFile(filePath, 'utf8', onFileRead);

function onFileRead(err, data) {
    if (err) {
      throw err;
    }
    var options = {};
    console.log(bustycache.bust(data, options));
}
