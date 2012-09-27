'use strict';


/*global nodeca, _*/


// internal
var rnd = require('../rnd');


////////////////////////////////////////////////////////////////////////////////


nodeca.filters.before('', { weight: -75 }, function csrf_protection(params, callback) {
  // No session - skip CSRF protection
  if (!this.session) {
    callback();
    return;
  }

  // Generate CSRF token if it was not yet set
  this.session.csrf = this.session.csrf || rnd();

  // Upon HTTP request we send csrf token
  if (this.origin.http) {
    this.runtime.csrf = this.session.csrf;
    callback();
    return;
  }

  // Upon RPC request- validate CSRF token
  if (this.origin.rpc && this.session.csrf !== this.origin.rpc.req.csrf) {
    callback({ statusCode: 401, message: 'CSRF token mismatch.' });
    return;
  }

  callback();
});