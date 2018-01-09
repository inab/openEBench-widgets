( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

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
function ErrorDrawer(widgetElem) {
}

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
	COLORS: [
		'#006400', '#00008b', '#8b0000', '#9400d3', '#ff4500', '#008b8b',
		'#007c00', '#009500', '#00ae00', '#00c800',
		'#25259e', '#3941b1', '#4a5cc5', '#5879d9',
		'#a10002', '#b80002', '#cf0002', '#e60001',
		'#a72bd9', '#ba44de', '#cb5ae3', '#dd6ee9',
		'#ff5e00', '#ff7300', '#ff8400', '#ff9600',
		'#00a2a2', '#00b7b7', '#00cfcf', '#00e6e6'
	],
	DEFAULT_LEVEL_SIZE: 15,
	DEFAULT_WIDTH: 200,
	DEFAULT_HEIGHT: 200,
	DEFAULT_SIZE: 200,
	// Getting the max depth of the nested structure
	getStatsNodeSet: function(widgetData) {
		var levelNodeSet = [ ];
		for(var iNode=0, nNode = widgetData.metrics.length; iNode < nNode; iNode++) {
			levelNodeSet.push([widgetData.metrics[iNode]]);
		}
		var statsNodeSet = [ levelNodeSet ];
		while(levelNodeSet) {
			var nextLevelNodeSet = [];
			for(var iNodeSet=0,nNodeSet = levelNodeSet.length; iNodeSet < nNodeSet; iNodeSet++) {
				var levelNodes = levelNodeSet[iNodeSet];
				for(var iNode=0, nNode = levelNodes.length; iNode < nNode; iNode++) {
					if('submetrics' in levelNodes[iNode] && levelNodes[iNode].submetrics.length > 0) {
						nextLevelNodeSet.push(levelNodes[iNode].submetrics);
					}
				}
			}
			if(nextLevelNodeSet.length > 0) {
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
		var widgetRoot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		widgetRoot.setAttribute("class", "widget");
		widgetRoot.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
		widgetElem.appendChild(widgetRoot);

		var widgetSize = widgetElem.getAttribute("data-widget-size");
		var widgetType = widgetElem.getAttribute("data-widget-type");
    var width, height

    width = height = widgetSize !== null ? Number(widgetSize) : DemoDrawer.DEFAULT_SIZE;

    var levelSize = width * 15 / 200
		var radius = Math.min(width, height) / 2 - 1.2;
    var ext_radius = levelSize + (levelSize * 5.6)

		var draw_uptime_one_time = 0;

		var tooltip_div = d3.select(widgetElem)
			.append('div')
			.attr('class', 'tooltip');

		var svg_g = d3.select(widgetRoot)
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
      .style('display', 'inline-block')


		// First, getting the max depth
		var statsNodeSet = DemoDrawer.getStatsNodeSet(widgetData);
		var partition = d3.partition()
      .size([2 * Math.PI, radius]);
		var root = d3.hierarchy(
				{ name: "widget", description: "OpenEBench widget",submetrics: widgetData.metrics },
				function(d) { return d.submetrics ; }
			)
			//.sum(function (d) { return d.size});
			.count();
		partition(root);
		var arc = d3.arc()
			.startAngle(function(d) {
				return d.x0 + 0.005;
			})
			.endAngle(function(d) {
				return d.x1 - 0.005;
			})
			.innerRadius(function(d, i) {
				return d.y0;
	 		})
			.outerRadius(function(d) {
				return d.y1;
			});


		var maxDepth = statsNodeSet.length;

		var tooltipFunc = function(d) {
			if ( !d.data.empty ) {
				d3.select(this.parentNode.parentNode).selectAll('path').style('opacity', 0.3);
				d3.select(this).style('opacity', 1);
				tooltip_div.style('left', d3.event.pageX + 10 + 'px');
				tooltip_div.style('top', d3.event.pageY - 25 + 'px');
				tooltip_div.style('display', 'inline-block');

				if (!d.parent.data.name || d.parent.data.name != 'widget') {
          d3.select(this).style('opacity',1)
				}

				var description_counter = 0;
				var description_text = "";
        var metric  = "";
        if(d.data.ticks) {
          data = d.data
        } else {
          for (let metric of widgetData.metrics) {
            for(let tick of metric.ticks) {
              if (d.data.metric == tick.name) {
                data = metric;
                break
              }
            }
          }
        }
        for(var iTick=0, nTick = data.ticks.length;  iTick < nTick; iTick++) {
          var tick = data.ticks[iTick];
          var description = tick.name;
          var isTicked = !!tick.ticked;
          var icon = (isTicked) ? 'online' : 'offline';
          description_text += '<br><img src="styles/' + icon + '.png" height="15" width="15"> ' + description;
          description_counter++;
        }
				tooltip_div.html('<div style="text-align:center; margin:0;padding:0;"><b>' + (data.metric) + '</b></div><div>' + description_text + '</div>');
			}
		};

		var tooltipHideFunc = function(d) {
			tooltip_div.style('display', 'none');
      d3.selectAll('path')
        .style('opacity', 1);
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
			.style('fill', function(d, i) {
				return (!d.data.empty ) ? DemoDrawer.COLORS[i] : 'none';
			})
			.on('mousemove', tooltipFunc)
			.on('mouseout',tooltipHideFunc)

    var radius_lines_number = 0
    var path = svg_g.selectAll('path')
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
      })

	}
};

var WIDGET_TYPES = {
	"demo": DemoDrawer.draw
};
var DEFAULT_WIDGET_TYPE = "demo";

var OpEB = {

	apply: function() {
		var widgetElems = document.getElementsByClassName("opeb");
		for(var iw=0,nw=widgetElems.length; iw<nw ; iw++) {
			var widgetElem = widgetElems[iw];
			// Does the element have what it is needed?
			if(widgetElem.getAttribute("data-id")!==null || widgetElem.getAttribute("data-inline")!==null) {
				// The element is skipped, in case it is already in processing stage
				if(widgetElem.getAttribute("data-state")===null) {
					// This is done before entering the state
					widgetElem.setAttribute("data-state","fetching-data");
					OpEB.fetchData(widgetElem);
				}
			}
		}
	},

	// This method must select among the different drawing codes
	draw: function(widgetElem,widgetData) {
		// First, remove all the children, from the end to the beginning
		for(var children = widgetElem.childNodes, ichild = children.length-1; ichild >= 0 ; ichild --) {
			children.removeChild(children[ichild]);
		}

		// Now, delegate on the corresponding
		var widgetType = widgetElem.getAttribute("data-widget-type");
		if(widgetType===null) {
			widgetType = DEFAULT_WIDGET_TYPE;
		}
		var drawFunc = ErrorDrawer;
		if(widgetType in WIDGET_TYPES) {
			drawFunc = WIDGET_TYPES[widgetType];
		}
		drawFunc(widgetElem,widgetData);

		// Last, changing the state
		widgetElem.setAttribute("data-state","widget-drawn");
	},

  drawError: function(widgetElem,status, statusText,responseText,parseException) {
    console.log(status+' '+statusText+' '+responseText);
    console.log(parseException);
  },

	composeQuery: function(opEBId) {
		// TODO: generate URL from id
		return opEBId
	},

	fetchData: function(widgetElem) {
		// This method should draw the widget
		var doOnComplete = function(answer, headers, status, statusText) {
			widgetElem.setAttribute("data-state","drawing-data");
			OpEB.draw(widgetElem,answer);
		};

		// This method should draw what appears when there is an
		// error in the widget
		var doOnError = function(status, statusText,responseText,parseException) {
			widgetElem.setAttribute("data-state",(status!==-1) ? "error-fetching-data" : "error-data");
			OpEB.drawError(widgetElem,status, statusText,responseText,parseException);
		};

		var inlineData = widgetElem.getAttribute("data-inline");
		if(inlineData !== null) {
			try {
				var answer = JSON.parse(inlineData);
				doOnComplete(answer);
			} catch(e) {
				doOnError(-1,'JSON Parse Error',inlineData,e);
			}

		} else {
			// TODO: setup the proper path
			var queryId = widgetElem.getAttribute("data-id");
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

		req.open(method,url,isAsync,username,password);
		// Overriding for JSON requests
		if(isJSONAnswer) {
			params.mimeType = "application/json";
		}
		// Override mime type if needed
		if( params.mimeType && req.overrideMimeType ) {
			req.overrideMimeType( params.mimeType );
		}

		// X-Requested-With header
		// For cross-domain requests, seeing as conditions for a preflight are
		// akin to a jigsaw puzzle, we simply never set it to be sure.
		// (it can always be set on a per-request basis or even using ajaxSetup)
		// For same-domain requests, won't change header if already provided.
		if ( !params.crossDomain && !headers[ "X-Requested-With" ] ) {
			headers[ "X-Requested-With" ] = "XMLHttpRequest";
		}

		// Set headers
		for ( var h in headers ) {
			req.setRequestHeader( h, headers[ h ] );
		}

		// Inspired on jQuery (and borrowed from it)
		var errorCallback = null;
		var callback = function(type) {
			var retval = null;
			if(type === "abort") {
				retval = function() {
					console.log("abort");
					if(req) {
						callback = errorCallback = req.onload =
							req.onerror = req.onabort = req.onreadystatechange = null;

						req.abort();
						req = null;
					}
				};
			} else if(type === "error") {
				retval = function() {
					console.log(req);
					if(req) {
						callback = errorCallback = req.onload =
							req.onerror = req.onabort = req.onreadystatechange = null;

						// Support: IE <=9 only
						// On a manual native abort, IE9 throws
						// errors on any property access that is not readyState
						try {
							if ( typeof req.status !== "number" ) {
								doOnError( 0, "error" );
							} else {
								doOnError(
									// File: protocol always yields status 0; see #8605, #14207
									req.status,
									req.statusText
								);
							}
						} catch(e) {
							// Only protect from the callback's collateral damage
							console.log('Unhandled exception on a callback',e);
						}


						req = null;
					}
				};
			} else {
				retval = function() {
					if(req) {
						callback = errorCallback = req.onload =
							req.onerror = req.onabort = req.onreadystatechange = null;

						var answer = req.responseText;
						if(isJSONAnswer) {
							try {
								answer = JSON.parse(answer);
							} catch(e) {
								answer = null;
								doOnError(-1,'JSON Parse Error',req.responseText,e);
							}
						}

						if(answer) {
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
									xhrSuccessStatus[ req.status ] || req.status,
									req.statusText
								);
							} catch(e) {
								// Only protect from the callback's collateral damage
								console.log('Unhandled exception on a callback',e);
							}
						}

						req = null;
					}
				};
			}

			return retval;
		};
		req.onload = callback();
		errorCallback = req.onerror = callback("error");

		// Support: IE 9 only
		// Use onreadystatechange to replace onabort
		// to handle uncaught aborts
		if ( req.onabort !== undefined ) {
			req.onabort = errorCallback;
		} else {
			req.onreadystatechange = function() {
				// Check readyState before timeout as it changes
				if ( req && req.readyState === 4 ) {
					// Allow onerror to be called first,
					// but that will not handle a native abort
					// Also, save errorCallback to a variable
					// as xhr.onerror cannot be accessed
					window.setTimeout( function() {
						if ( callback ) {
							errorCallback();
						}
					} );
				}
			};
		}

		// Create the abort callback
		callback = callback( "abort" );

		try {
			// Do send the request (this may raise an exception)
			req.send(params.hasContent && params.data || null);
		} catch ( e ) {

			// #14683: Only rethrow if this hasn't been notified as an error yet
			if ( callback ) {
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
if(window.attachEvent) {
	window.attachEvent('onload', OpEBonLoad);
} else {
	if(window.onload) {
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

// Copied from jQuery
// Expose OpEB identifier, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.OpEB = OpEB;
}

return OpEB;
} );
