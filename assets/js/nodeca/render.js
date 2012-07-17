/**
 *  nodeca.render(view, data)
 *
 *  This module provides function for view rendering.
 **/


//= depend_on nodeca
//= require jade/runtime
//= require jason


/*global window, $, _, jade, JASON, nodeca*/


////////////////////////////////////////////////////////////////////////////////


(function () {
  'use strict';


  var tzOffset = (new Date).getTimezoneOffset();


  //////////////////////////////////////////////////////////////////////////////


  var helpers = {};

  helpers.t = function (phrase, params) {
    try {
      // TODO: should be removed once BabelFish is fixed
      return nodeca.runtime.i18n.t(nodeca.runtime.locale, phrase, params);
    } catch (err) {
      nodeca.logger.error('Failed translate phrase', phrase, params, err);
      return phrase;
    }
  };

  helpers.date = function (value, format) {
    return nodeca.shared.common.date(value, format, nodeca.runtime.locale, tzOffset);
  };

  helpers.asset_path = function (pathname) {
    /*global alert*/
    alert('asset_path() is not implemented yet');
    return "";
  };

  helpers.asset_include = function () {
    /*global alert*/
    alert('asset_include() is a server-side only helper');
    return "";
  };

  helpers.config = function (path) {
    var parts, val;

    if (!path) {
      return nodeca.config;
    }

    parts = path.split('.');
    val   = nodeca.config;

    // returns part of the config by path
    //
    //    find({foo: {bar: 123}}, 'foo.bar') // -> 123
    //    find({foo: {bar: 123}}, 'bar.foo') // -> undefined
    //
    while (val && parts.length) {
      val = val[parts.shift()];
    }

    return val;
  };

  helpers.link_to = function (name, params) {
    return nodeca.runtime.router.linkTo(name, params) || '#';
  };

  helpers.nodeca = nodeca;

  helpers.jason = JASON.stringify;


  //////////////////////////////////////////////////////////////////////////////


  // nodeca.render(apiPath, layout, data) -> Void
  // - apiPath (String): Server method API path.
  // - layout (String): Layout or layouts stack
  // - data (Oject): Locals data for the renderer
  //
  nodeca.render = function (apiPath, layout, data) {
    var placeholder, $content_el, locals, html;

    // prepare variables
    placeholder = layout.split('.').shift(); // first part is a 'base layout'
    $content_el = $('[data-nodeca-layout-content="' + placeholder + '"]');
    layout      = nodeca.shared.common.render.getLayoutStack(layout).slice(1);

    if (!$content_el.length) {
      nodeca.logger.warn('Content placeholder <' + placeholder + '> is unknown');
      throw 'NODECA_PLACEHOLDER_NOT_FOUND';
    }

    locals  = _.extend(data, helpers);
    html    = nodeca.shared.common.render(nodeca.views, apiPath, layout, locals);

    $content_el.html(html);
  };
}());
