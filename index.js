"use strict";

exports.root = __dirname;
exports.name = 'nodeca.core';
exports.init = function (N) { require('./lib/autoload.js')(N); };
