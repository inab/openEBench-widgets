'use strict';

import '../styles/OpEB-widgets.css';

import online_plug from '../icons/online-plug.png';
import offline_plug from '../icons/offline-plug.png';
import online_tick from '../icons/online-tick.png';
import offline_tick from '../icons/offline-tick.png';
import close_button from '../icons/close-button.png';

const d3_selection = require('d3-selection');
const d3_hierarchy = require('d3-hierarchy');
const d3_shape = require('d3-shape');
const d3_time_format = require('d3-time-format');
const d3_scale = require('d3-scale');
const d3_axis = require('d3-axis');
const d3_array = require('d3-array');

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


// This one should be used to draw something when the data could not be
// parsed, fetched, etc...
function ErrorDrawer(widgetElem) {}

// All the widget drawing functions take as input an element and the
// fetched data
var DemoDrawer = {
  // https://gka.github.io/palettes/#colors=DarkGreen,Lime|steps=6|bez=1|coL=1
  // greens '#006400','#007c00','#009500','#00ae00','#00c800','#00e300','#00ff00'
  // https://gka.github.io/palettes/#colors=DarkBlue,CornflowerBlue|steps=6|bez=1|coL=1
  // blues '#00008b','#25259e','#3941b1','#4a5cc5','#5879d9','#6495ed'
  // https://gka.github.io/palettes/#colors=DarkRed,Red|steps=6|bez=1|coL=1
  // reds '#8b0000','#a10002','#b80002','#cf0002','#e60001','#ff0000'
  // https://gka.github.io/palettes/#colors=DarkViolet,Violet|steps=6|bez=1|coL=1
  // violets '#9400d3','#a72bd9','#ba44de','#cb5ae3','#dd6ee9','#ee82ee'
  // https://gka.github.io/palettes/#colors=OrangeRed,Orange|steps=6|bez=1|coL=1
  // oranges '#ff4500','#ff5e00','#ff7300','#ff8400','#ff9600','#ffa500'
  // https://gka.github.io/palettes/#colors=DarkCyan,Cyan|steps=6|bez=1|coL=1
  // cyans '#008b8b','#00a2a2','#00b7b7','#00cfcf','#00e6e6','#00ffff'
  //COLORS: [
  //	['#006400', '#00008b', '#8b0000', '#9400d3', '#ff4500', '#008b8b'],
  //	['#007c00', '#25259e', '#a10002', '#a72bd9', '#ff5e00', '#00a2a2'],
  //	['#009500', '#3941b1', '#b80002', '#ba44de', '#ff7300', '#00b7b7'],
  //	['#00ae00', '#4a5cc5', '#cf0002', '#cb5ae3', '#ff8400', '#00cfcf'],
  //	['#00c800', '#5879d9', '#e60001', '#dd6ee9', '#ff9600', '#00e6e6'],
  //],
  DEFAULT_LEVEL_SIZE: 15,
  DEFAULT_WIDTH: 200,
  DEFAULT_HEIGHT: 200,
  DEFAULT_SIZE: 200,
  // Getting the max depth of the nested structure
  getStatsNodeSet: function(widgetData) {
    var levelNodeSet = [];
    for (var iNode = 0, nNode = widgetData.metrics.length; iNode < nNode; iNode++) {
      levelNodeSet.push([widgetData.metrics[iNode]]);
    }
    var statsNodeSet = [levelNodeSet];
    while (levelNodeSet) {
      var nextLevelNodeSet = [];
      for (var iNodeSet = 0, nNodeSet = levelNodeSet.length; iNodeSet < nNodeSet; iNodeSet++) {
        var levelNodes = levelNodeSet[iNodeSet];
        for (var iNode = 0, nNode = levelNodes.length; iNode < nNode; iNode++) {
          if ('submetrics' in levelNodes[iNode] && levelNodes[iNode].submetrics.length > 0) {
            nextLevelNodeSet.push(levelNodes[iNode].submetrics);
          }
        }
      }
      if (nextLevelNodeSet.length > 0) {
        statsNodeSet.push(nextLevelNodeSet);
        levelNodeSet = nextLevelNodeSet;
      } else {
        levelNodeSet = null;
        break;
      }
    }

    return statsNodeSet;
  },
  draw: function(widgetElem, widgetData) {
    var widgetRoot = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    widgetRoot.setAttribute('class', 'widget');
    widgetRoot.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
    widgetElem.appendChild(widgetRoot);

    var widgetSize = widgetElem.getAttribute('data-widget-size');
    var widgetType = widgetElem.getAttribute('data-widget-type');
    var width, height;


    widgetSize = Number(widgetSize);
    if (widgetSize == null || widgetSize <= 0 || isNaN(widgetSize)) {
      if (widgetSize != 0) {
        console.warn('Wrong widget size: "' + widgetSize + '" provided, using default value ' + DemoDrawer.DEFAULT_SIZE);
      }
      widgetSize = DemoDrawer.DEFAULT_SIZE;
    }

    width = height = widgetSize;


    var levelSize = width * 15 / 200;
    var radius = Math.min(width, height) / 2 - 1.2;
    var ext_radius = levelSize + (levelSize * 5.6);

    var draw_uptime_one_time = true;
    var clicked = false;

    var tooltip_div = d3_selection.select(widgetElem)
      .append('div')
      .attr('class', 'tooltip');

    var svg_g = d3_selection.select(widgetRoot)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    svg_g.selectAll('.circle')
      .data([{
        'x_axis': 0,
        'y_axis': 0,
        'r_radius': (levelSize + 1)
      }, {
        'x_axis': 0,
        'y_axis': 0,
        'r_radius': (ext_radius)
      }])
      .enter().append('circle')
      .attr('class', 'circle')
      .attr('cx', function(d) {
        return d.x_axis;
      })
      .attr('cy', function(d) {
        return d.y_axis;
      })
      .attr('r', function(d) {
        return d.r_radius;
      })
      .style('fill', 'none')
      .style('stroke', 'black')
      .style('stroke-opacity', 0.5)
      .style('display', 'inline-block');


    // First, getting the max depth
    var statsNodeSet = DemoDrawer.getStatsNodeSet(widgetData);
    var partition = d3_hierarchy.partition()
      .size([2 * Math.PI, radius]);
    var root = d3_hierarchy.hierarchy({
          name: 'widget',
          description: 'OpenEBench widget',
          submetrics: widgetData.metrics
        },
        function(d) {
          return d.submetrics;
        }
      )
      //.sum(function (d) { return d.size});
      .count();
    partition(root);
    var arc = d3_shape.arc()
      .startAngle(function(d) {
        return d.x0 + 0.005;
      })
      .endAngle(function(d) {
        return d.x1 - 0.005;
      })
      .innerRadius(function(d) {
        return d.y0;
      })
      .outerRadius(function(d) {
        return d.y1;
      });


    var maxDepth = statsNodeSet.length;

    var tooltipFunc = function(d) {
      if (!clicked) {
        if (!d.data.empty && (!d.parent.data.name || d.parent.data.name != 'widget')) {
          d3_selection.select(this).style('opacity', 1);
        }
        if (!d.data.empty) {
          d3_selection.select(widgetRoot).selectAll('path').style('opacity', 0);
          d3_selection.select(widgetRoot).selectAll('.path_shown').style('opacity', 0.3);
          d3_selection.select(this).style('opacity', 1);
          d3_selection.select(this).selectAll('path').style('fill', 'black');
        }
        tooltipFuncAux(d);
      }
    };

    var tooltipFuncAux = function(d) {
      tooltip_div.style('left', d3_selection.event.pageX + 10 + 'px');
      tooltip_div.style('top', d3_selection.event.pageY - 25 + 'px');
      tooltip_div.style('display', 'inline-block');


      var description_text = '';
      var data;
      if (d.data.ticks) {
        data = d.data;
      } else {
        for (let metric of widgetData.metrics) {
          for (let tick of metric.ticks) {
            if (d.data.metric == tick.name) {
              data = metric;
              break;
            }
          }
        }
      }
      for (var iTick = 0, nTick = data.ticks.length; iTick < nTick; iTick++) {
        var tick = data.ticks[iTick];
        var description = tick.name;
        var isTicked = !!tick.ticked;
        var icon = (isTicked) ? online_tick : offline_tick;
        description_text += '<br><img src="' + icon + '" height="15" width="15"> ' + description;
      }
      tooltip_div.html('<div style="text-align:center; margin:0;padding:0;"><b style="padding-right:10px">' + (data.metric) + '</b><div id="close_icon" style="float:right;"></div><div style="text-align:left;">' + description_text + '</div>');
    };

    var tooltipHideFunc = function() {
      if (clicked) return;
      tooltip_div.style('display', 'none');
      tooltip_div.html('');
      d3_selection.select(widgetRoot).selectAll('path').style('opacity', 0);
      d3_selection.select(widgetRoot).selectAll('.path_shown').style('opacity', 1);
    };

    svg_g.selectAll('path')
      .data(root.descendants())
      .enter()
      .append('path')
      .style('stroke', 'none')
      .attr('display', function(d) {
        return d.depth ? null : 'none';
      })
      .attr('d', arc)
      .style('stroke', 'none')
      //.style('stroke', '#000000')
      //.style("fill", function (d) {return color((d.children ? d : d.parent).data.name); })
      .classed('path_shown', function(d) {
        return !d.data.empty;
      })
      .style('opacity', function(d) {
        return d.data.empty ? 0 : 1;
      })
      .style('fill', function(d) {
        return d.data.color;
      })
      .on('mousemove', tooltipFunc)
      .on('click', function(d) {
        if (d.data.empty) return;
        d3_selection.select(widgetRoot).selectAll('path').style('opacity', 0);
        d3_selection.select(widgetRoot).selectAll('.path_shown').style('opacity', 0.3);
        d3_selection.select(this).style('opacity', 1);

        if (!d.parent.data.name || d.parent.data.name != 'widget') {
          d3_selection.select(this).style('opacity', 1);
        }

        tooltipFuncAux(d);

        clicked = true;
        d3_selection.select(widgetElem).select('#close_icon').append('img')
          .attr('src', close_button)
          .attr('width', '15')
          .attr('height', '15')
          .style('cursor', 'pointer')
          .on('click', function() {
            tooltip_div.style('display', 'none');
            tooltip_div.html('');
            d3_selection.select(widgetRoot).selectAll('.path_shown').style('opacity', 1);
            clicked = false;
          });
      })
      .on('mouseout', tooltipHideFunc);

    var radius_lines_number = 0;
    svg_g.selectAll('path')
      .each(function(d) {
        if (radius_lines_number < 6) {
          radius_lines_number++;
          svg_g.selectAll('.radius').data([{
              'x1': (levelSize + 1.5) * Math.cos(d.x1 + Math.PI / 2),
              'y1': (levelSize + 1.5) * Math.sin(d.x1 + Math.PI / 2),
              'x2': (ext_radius) * Math.cos(d.x1 + Math.PI / 2),
              'y2': (ext_radius) * Math.sin(d.x1 + Math.PI / 2)
            }])
            .enter().append('line')
            .attr('class', 'line')
            .attr('x1', function(d) {
              return d.x1;
            })
            .attr('y1', function(d) {
              return d.y1;
            })
            .attr('x2', function(d) {
              return d.x2;
            })
            .attr('y2', function(d) {
              return d.y2;
            })
            .style('stroke', 'black')
            .style('stroke-width', '1')
            .style('stroke-opacity', 0.5)
            .style('display', 'inline-block');
        }
      });

    var tooltipUptimeFunc = function(d) {
      if (clicked) return;
      tooltipUptimeFuncAux(d);
    };

    var tooltipUptimeFuncAux = function() {
      var uptime = JSON.parse(JSON.stringify(widgetData.uptime));
      //http://bl.ocks.org/d3noob/38744a17f9c0141bcd04
      //https://bl.ocks.org/d3noob/3c040800ff6457717cca586ae9547dbf
      //https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e
      var margin = {
          top: 15,
          right: 15,
          bottom: 45,
          left: 45
        },
        width_uptime = 250 - margin.left - margin.right,
        height_uptime = 100 - margin.top - margin.bottom;

      // Parse the date / time
      var parseDate = d3_time_format.timeParse('%d-%b-%y');

      // Set the ranges
      var x = d3_scale.scaleTime().range([0, width_uptime]);
      var y = d3_scale.scaleLinear().range([height_uptime, 0]);

      // Define the axes
      var xAxis = d3_axis.axisBottom(x);

      var yAxis = d3_axis.axisLeft(y).ticks(1).tickFormat(function(d) {
        return d == 1 ? 'online' : 'offline';
      });

      // Define the line
      var valueline = d3_shapes.line()
        .x(function(d) {
          return x(d.date);
        })
        .y(function(d) {
          return y(d.state);
        });

      uptime.forEach(function(d) {
        d.date = parseDate(d.date);
        d.state = +d.state;
      });
      // Scale the range of the data
      x.domain(d3_array.extent(uptime, function(d) {
        return d.date;
      }));
      y.domain([0, d3_array.max(uptime, function(d) {
        return d.state;
      })]);

      // Add the valueline path.
      if (draw_uptime_one_time && !clicked) {
        tooltip_div.html('<div id="close_icon" style="float:right;"></div>');
        var svg_uptime = tooltip_div.append('svg')
          .attr('id', 'uptime')
          .attr('width', width_uptime + margin.left + margin.right)
          .attr('height', height_uptime + margin.top + margin.bottom)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        svg_uptime.append('path')
          .attr('class', 'line')
          .attr('d', valueline(uptime));

        // Add the scatterplot
        svg_uptime.selectAll('dot')
          .data(uptime)
          .enter().append('circle')
          .attr('r', 3.5)
          .attr('cx', function(d) {
            return x(d.date);
          })
          .attr('cy', function(d) {
            return y(d.state);
          });

        // Add the X Axis
        svg_uptime.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + height_uptime + ')')
          .call(xAxis)
          .selectAll('text')
          .style('text-anchor', 'end')
          .attr('dx', '-.8em')
          .attr('dy', '.15em')
          .attr('transform', 'rotate(-65)');

        // Add the Y Axis
        svg_uptime.append('g')
          .attr('class', 'y axis')
          .call(yAxis);

        draw_uptime_one_time = false;
      }

      if (!clicked) {
        tooltip_div.style('left', d3_selection.event.pageX + 10 + 'px');
        tooltip_div.style('top', d3_selection.event.pageY - 25 + 'px');
        tooltip_div.style('display', 'inline-block');
      }
    };

    var tooltipUptimeHideFunc = function() {
      if (clicked) return;
      draw_uptime_one_time = true;
      tooltip_div.style('display', 'none');
      tooltip_div.html('');
    };

    var state = widgetData.enabled ? 'online' : 'offline';
    var xy_pos = widgetData.enabled ? 0.8 : 0.7;
    var width_height = widgetData.enabled ? '12%' : '10%';
    var icon;
    svg_g.append('image')
      .attr('width', width_height)
      .attr('height', width_height)
      .attr('xlink:href', function() {
        icon = (state == 'online') ? online_plug : offline_plug;
        return icon;
      })
      .attr('x', -levelSize * xy_pos)
      .attr('y', -levelSize * xy_pos)
      .on('mousemove', tooltipUptimeFunc)
      .on('click', function(d) {

        draw_uptime_one_time = true;

        d3_selection.select(widgetRoot).selectAll('.path_shown').style('opacity', 1);

        clicked = false;
        tooltipUptimeFuncAux(d);
        clicked = true;

        d3_selection.select(widgetElem).select('#close_icon').append('img')
          .attr('src', close_button)
          .attr('width', '15')
          .attr('height', '15')
          .style('cursor', 'pointer')
          .on('click', function() {
            tooltip_div.style('display', 'none');
            tooltip_div.html('');
            draw_uptime_one_time = true;
            clicked = false;
          });
      })
      .on('mouseout', tooltipUptimeHideFunc);

  }
};

var WIDGET_TYPES = {
  'demo': DemoDrawer.draw
};
var DEFAULT_WIDGET_TYPE = 'demo';

var OpEB = {

  apply: function() {
    var widgetElems = document.getElementsByClassName('opeb');
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
    console.log(status + ' ' + statusText + ' ' + responseText);
    console.log(parseException);
  },

  composeQuery: function(opEBId) {
    // TODO: generate URL from id
    return opEBId;
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
          console.log('abort');
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
              console.log('Unhandled exception on a callback', e);
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
                console.log('Unhandled exception on a callback', e);
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
