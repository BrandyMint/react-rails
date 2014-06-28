// Unobtrusive scripting adapter for React

var ReactUjs = {};

(function(document, window, React) {
  var CLASS_NAME_ATTR = 'data-react-class';
  var PROPS_ATTR = 'data-react-props';

  // jQuery is optional. Use it to support legacy browsers.
  var $ = (typeof jQuery !== 'undefined') && jQuery;

  ReactUjs.findReactDOMNodes = function() {
    var SELECTOR = '[' + CLASS_NAME_ATTR + ']';
    if ($) {
      return $(SELECTOR);
    } else {
      return document.querySelectorAll(SELECTOR);
    }
  };

  ReactUjs.mountReactComponents = function() {
    var nodes = ReactUjs.findReactDOMNodes();
    for (var i = 0; i < nodes.length; ++i) {
      var node = nodes[i];
      var className = node.getAttribute(CLASS_NAME_ATTR);
      // Assume className is simple and can be found at top-level (window).
      // Fallback to eval to handle cases like 'My.React.ComponentName'.
      var constructor = window[className] || eval.call(window, className);
      var propsJson = node.getAttribute(PROPS_ATTR);
      var props = propsJson && JSON.parse(propsJson);
      React.renderComponent(constructor(props), node);
    }
  };

  ReactUjs.unmountReactComponents = function() {
    var nodes = ReactUjs.findReactDOMNodes();
    for (var i = 0; i < nodes.length; ++i) {
      React.unmountComponentAtNode(nodes[i]);
    }
  };

  // Register page load & unload events
  if ($) {
    $(ReactUjs.mountReactComponents);
    $(window).unload(ReactUjs.unmountReactComponents);
  } else {
    document.addEventListener('DOMContentLoaded', ReactUjs.mountReactComponents);
    window.addEventListener('unload', ReactUjs.unmountReactComponents);
  }

})(document, window, React);

// Turbolinks specified events

(function(document, window, ReactUjs) {
  var handleEvent;
  // jQuery is optional. Use it to support legacy browsers.
  var $ = (typeof jQuery !== 'undefined') && jQuery;

  if ($) {
    handleEvent = function(eventName, callback) {
      $(document).on(eventName, callback);
    }
  } else {
    handleEvent = function(eventName, callback) {
      document.addEventListener(eventName, callback);
    }
  }
  if (typeof Turbolinks !== 'undefined') {
    handleEvent('page:load', ReactUjs.mountReactComponents);
    handleEvent('page:before-change', ReactUjs.unmountReactComponents);
  }
})(document, window, ReactUjs);
