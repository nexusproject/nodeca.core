// Populates N.models tree
//


"use strict";


/*global N, underscore*/


// stdlib
var path = require("path");


// 3rd-party
var _       = underscore;
var async   = require("async");
var fstools = require("fs-tools");


// internal
var apify       = require("./utils/apify");
var stopwatch   = require("./utils/stopwatch");
var expandTree  = require("./utils/expand_tree");


////////////////////////////////////////////////////////////////////////////////


module.exports = function (callback) {
  var timer = stopwatch();

  N.hooks.init.run("models", function (next) {
    N.models = {};

    async.forEach(N.runtime.apps, function (app, next) {
      var modelsRoot = path.join(app.root, 'models');

      fstools.walk(modelsRoot, /\.js$/, function (file, stat, next) {
        var
        collectionName  = apify(file, modelsRoot, /\.js$/),
        init            = require(file),
        model           = init(N, collectionName);

        if (!model) {
          next(collectionName +
               " model constructor returns nothing (in: " + file + ")");
          return;
        }

        if (!_.isFunction(model.__init__)) {
          N.models[collectionName] = model;
        } else {
          try {
            N.models[collectionName] = model.__init__();
          } catch (err) {
            next(err);
            return;
          }
        }

        next();
      }, next);
    }, function (err) {
      if (err) {
        next(err);
        return;
      }

      expandTree(N.models);
      next();
    });
  }, function (err) {
    if (err) {
      callback(err);
      return;
    }

    N.logger.info('Finish models init ' + timer.elapsed);
    callback();
  });
};