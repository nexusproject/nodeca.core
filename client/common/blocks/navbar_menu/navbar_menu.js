/**
 *  Updates "active" tab of the navbar_menu when moving to another page.
 **/


'use strict';


/*global N, window*/


var $ = window.jQuery;


N.wire.on('navigate.exit', function navbar_menu_change_active(target) {
  var ns = target.apiPath.split('.').shift();

  $('#navbar_menu')
    .find('[data-api3-path]').removeClass('active').end()
    //
    // activate any element with same namespace as `route`:
    //
    //     route = 'foo.bar'
    //
    // will highlight elements with `[data-api3-path="foo"]`.
    //
    .find('[data-api3-path="' + ns + '"]').addClass('active');
});