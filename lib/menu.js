"use strict";


/*global nodeca, _*/


// nodeca
var NLib = require('nlib');


// 3rd-party
var Async = NLib.Vendor.Async;


// dummy function that interrupts execution after all before filters
function skipper(params, next) {
  next({allowed: true});
}


// get server method names, of items with check_permissions
function get_methods(menu) {
  var methods = [];

  _.each(menu, function (opts, key) {
    if (opts.to && opts.check_permissions) {
      methods.push(opts.to);
    }

    if (opts.submenu) {
      methods = methods.concat(get_methods(opts.submenu));
    }
  });

  return methods;
}


module.exports.get_menu_permissions = function (menu_ids, env, callback) {
  var methods = [];

  nodeca.shared.common.menus.walk(menu_ids, function (ns, id, menu) {
    methods = methods.concat(get_methods(menu));
  });

  Async.map(_.uniq(methods), function (name, next) {
    nodeca.filters.run(name, {}, skipper, function (err) {
      if (undefined === err.allowed && undefined === err.denied) {
        // generic error occured.
        nodeca.logger.error(
          "Failed to run permission test: " + (err.message || err),
          {name: name, env: env}
        );
      }

      next(null, {name: name, result: (!!err.allowed && !err.denied)});
    }, _.clone(env));
  }, function (err, results) {
    var map = {};
    results.forEach(function (o) { map[o.name] = o.result; });
    callback(err, map);
  });
};