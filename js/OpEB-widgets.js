'use strict';

import style from '../styles/OpEB-widgets.css';

import WidgetDrawer from './widgets/Widget';

// Copied from jQuery
var document = window.document;

// Borrowed from jQuery
var xhrSuccessStatus = {
  // File protocol always yields status code 0, assume 200
  0: 200,
  // Support: IE <=9 only
  // #1450: sometimes IE returns 1223 when it should be 204
  1223: 204
};

var WIDGET_TYPES = {};

RegisterWidget(WIDGET_TYPES, WidgetDrawer);

// Register widgets to draw
function RegisterWidget(WIDGET_TYPES, Drawer) {
  WIDGET_TYPES[Drawer.WIDGET_TYPE] = Drawer.draw;
}

// This one should be used to draw something when the data could not be
// parsed, fetched, etc...
function ErrorDrawer(widgetElem) {}

var DEFAULT_WIDGET_TYPE = 'demo';

var OpEB = {

  apply: function(widgetElems = []) {

    // Travel all DOM tree if widgetElems is empty
    if (!(Array.isArray(widgetElems) && widgetElems.length)) {
      widgetElems = document.getElementsByClassName('opeb');
    }

    for (var iw = 0, nw = widgetElems.length; iw < nw; iw++) {
      var widgetElem = widgetElems[iw];
      // Does the element have what it is needed?
      if (widgetElem.getAttribute('data-id') !== null || widgetElem.getAttribute('data-inline') !== null) {
        // The element is skipped, in case it is already in processing stage
        if (widgetElem.getAttribute('data-state') === null) {
          // This is done before entering the state
          widgetElem.setAttribute('data-state', 'fetching-data');
          OpEB.fetchData(widgetElem);
        }
      }
    }
  },

  // This method must select among the different drawing codes
  draw: function(widgetElem, widgetData) {
    // First, remove all the children, from the end to the beginning
    for (var children = widgetElem.childNodes, ichild = children.length - 1; ichild >= 0; ichild--) {
      children.removeChild(children[ichild]);
    }

    // Now, delegate on the corresponding
    var widgetType = widgetElem.getAttribute('data-widget-type');
    if (widgetType === null) {
      widgetType = DEFAULT_WIDGET_TYPE;
    }
    var drawFunc = ErrorDrawer;
    if (widgetType in WIDGET_TYPES) {
      drawFunc = WIDGET_TYPES[widgetType];
    }
    drawFunc(widgetElem, widgetData);

    // Last, changing the state
    widgetElem.setAttribute('data-state', 'widget-drawn');
  },

  drawError: function(widgetElem, status, statusText, responseText, parseException) {
    console.warn(status + ' ' + statusText + ' ' + responseText);
    console.warn(parseException);
  },

  composeQuery: function(opEBId) {
    return 'https://openebench.bsc.es/monitor/rest/widget/metrics/' + opEBId;
  },

  fetchData: function(widgetElem) {
    // This method should draw the widget
    var doOnComplete = function(answer, headers, status, statusText) {
      widgetElem.setAttribute('data-state', 'drawing-data');
      OpEB.draw(widgetElem, answer);
    };

    // This method should draw what appears when there is an
    // error in the widget
    var doOnError = function(status, statusText, responseText, parseException) {
      widgetElem.setAttribute('data-state', (status !== -1) ? 'error-fetching-data' : 'error-data');
      OpEB.drawError(widgetElem, status, statusText, responseText, parseException);
    };

    var inlineData = widgetElem.getAttribute('data-inline');
    if (inlineData !== null) {
      try {
        var answer = JSON.parse(inlineData);
        doOnComplete(answer);
      } catch (e) {
        doOnError(-1, 'JSON Parse Error', inlineData, e);
      }

    } else {
      // TODO: setup the proper path
      var queryId = widgetElem.getAttribute('data-id');
      var queryURL = OpEB.composeQuery(queryId);
      OpEB.send({
        url: queryURL,
        async: true,
        doOnComplete: doOnComplete,
        doOnError: doOnError,
        jsonAnswer: true
      });
    }
  },

  // Inspired on jQuery (and borrowed from it)
  send: function(params) {
    var method = params.type || 'GET';
    var url = params.url;
    var headers = params.headers || [];
    var isAsync = !!params.async;
    var username = params.username || null;
    var password = (params.password && username) ? params.password : null;
    var doOnComplete = params.doOnComplete;
    var doOnError = params.doOnError;
    var isJSONAnswer = !!params.jsonAnswer;

    var req = new XMLHttpRequest();

    req.open(method, url, isAsync, username, password);
    // Overriding for JSON requests
    if (isJSONAnswer) {
      params.mimeType = 'application/json';
    }
    // Override mime type if needed
    if (params.mimeType && req.overrideMimeType) {
      req.overrideMimeType(params.mimeType);
    }

    // X-Requested-With header
    // For cross-domain requests, seeing as conditions for a preflight are
    // akin to a jigsaw puzzle, we simply never set it to be sure.
    // (it can always be set on a per-request basis or even using ajaxSetup)
    // For same-domain requests, won't change header if already provided.
    if (!params.crossDomain && !headers['X-Requested-With']) {
      headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    // Set headers
    for (var h in headers) {
      req.setRequestHeader(h, headers[h]);
    }

    // Inspired on jQuery (and borrowed from it)
    var errorCallback = null;
    var callback = function(type) {
      var retval = null;
      if (type === 'abort') {
        retval = function() {
          console.warn('abort');
          if (req) {
            callback = errorCallback = req.onload =
              req.onerror = req.onabort = req.onreadystatechange = null;

            req.abort();
            req = null;
          }
        };
      } else if (type === 'error') {
        retval = function() {
          if (req) {
            callback = errorCallback = req.onload =
              req.onerror = req.onabort = req.onreadystatechange = null;

            // Support: IE <=9 only
            // On a manual native abort, IE9 throws
            // errors on any property access that is not readyState
            try {
              if (typeof req.status !== 'number') {
                doOnError(0, 'error');
              } else {
                doOnError(
                  // File: protocol always yields status 0; see #8605, #14207
                  req.status,
                  req.statusText
                );
              }
            } catch (e) {
              // Only protect from the callback's collateral damage
              console.warn('Unhandled exception on a callback', e);
            }


            req = null;
          }
        };
      } else {
        retval = function() {
          if (req) {
            callback = errorCallback = req.onload =
              req.onerror = req.onabort = req.onreadystatechange = null;

            var answer = req.responseText;
            if (isJSONAnswer) {
              try {
                answer = JSON.parse(answer);
              } catch (e) {
                answer = null;
                doOnError(-1, 'JSON Parse Error', req.responseText, e);
              }
            }

            if (answer) {
              try {
                doOnComplete(
                  //// Support: IE <=9 only
                  //// IE9 has no XHR2 but throws on binary (trac-11426)
                  //// For XHR2 non-text, let the caller handle it (gh-2498)
                  //( xhr.responseType || "text" ) !== "text"  ||
                  //typeof xhr.responseText !== "string" ?
                  //	{ binary: xhr.response } :
                  //	{ text: xhr.responseText },
                  answer,
                  req.getAllResponseHeaders(),
                  xhrSuccessStatus[req.status] || req.status,
                  req.statusText
                );
              } catch (e) {
                // Only protect from the callback's collateral damage
                console.warn('Unhandled exception on a callback', e);
              }
            }

            req = null;
          }
        };
      }

      return retval;
    };
    req.onload = callback();
    errorCallback = req.onerror = callback('error');

    // Support: IE 9 only
    // Use onreadystatechange to replace onabort
    // to handle uncaught aborts
    if (req.onabort !== undefined) {
      req.onabort = errorCallback;
    } else {
      req.onreadystatechange = function() {
        // Check readyState before timeout as it changes
        if (req && req.readyState === 4) {
          // Allow onerror to be called first,
          // but that will not handle a native abort
          // Also, save errorCallback to a variable
          // as xhr.onerror cannot be accessed
          window.setTimeout(function() {
            if (callback) {
              errorCallback();
            }
          });
        }
      };
    }

    // Create the abort callback
    callback = callback('abort');

    try {
      // Do send the request (this may raise an exception)
      req.send(params.hasContent && params.data || null);
    } catch (e) {

      // #14683: Only rethrow if this hasn't been notified as an error yet
      if (callback) {
        throw e;
      }
    }

    return isAsync ? callback : function() {};
  }
};

var OpEBonLoad = function(evt) {
  OpEB.apply();
};

// This is launched once the page is loaded
// Perhaps we should used 'DOMContentLoaded'
if (window.attachEvent) {
  window.attachEvent('onload', OpEBonLoad);
} else {
  if (window.onload) {
    var curronload = window.onload;
    var newonload = function(evt) {
      curronload(evt);
      OpEBonLoad(evt);
    };
    window.onload = newonload;
  } else {
    window.onload = OpEBonLoad;
  }
}

//window.setTimeout(function() { OpEB.apply(); }, 1000);

// Not needed
// Copied from jQuery
// Expose OpEB identifier, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
//if (!noGlobal) {
//window.OpEB = OpEB;
//}

export {
  OpEB
};