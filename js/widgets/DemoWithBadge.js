'use strict';

const d3_selection = require('d3-selection');
const d3_hierarchy = require('d3-hierarchy');
const d3_shape = require('d3-shape');
const d3_time_format = require('d3-time-format');
const d3_scale = require('d3-scale');
const d3_axis = require('d3-axis');
const d3_array = require('d3-array');

import online_plug from '../../icons/online-plug.png';
import offline_plug from '../../icons/offline-plug.png';
import online_tick from '../../icons/online-tick.png';
import offline_tick from '../../icons/offline-tick.png';
import close_button from '../../icons/close-button.png';

// https://stackoverflow.com/a/27709336
function colorStepGradiant (start_color, end_color, percent) {
   // strip the leading # if it's there
   start_color = start_color.replace(/^\s*#|\s*$/g, '');
   end_color = end_color.replace(/^\s*#|\s*$/g, '');

   // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
   if(start_color.length == 3){
     start_color = start_color.replace(/(.)/g, '$1$1');
   }

   if(end_color.length == 3){
     end_color = end_color.replace(/(.)/g, '$1$1');
   }

   // get colors
   var start_red = parseInt(start_color.substr(0, 2), 16),
       start_green = parseInt(start_color.substr(2, 2), 16),
       start_blue = parseInt(start_color.substr(4, 2), 16);

   var end_red = parseInt(end_color.substr(0, 2), 16),
       end_green = parseInt(end_color.substr(2, 2), 16),
       end_blue = parseInt(end_color.substr(4, 2), 16);

   // calculate new color
   var diff_red = end_red - start_red;
   var diff_green = end_green - start_green;
   var diff_blue = end_blue - start_blue;

   diff_red = ( (diff_red * percent) + start_red ).toString(16).split('.')[0];
   diff_green = ( (diff_green * percent) + start_green ).toString(16).split('.')[0];
   diff_blue = ( (diff_blue * percent) + start_blue ).toString(16).split('.')[0];

   // ensure 2 digits by color
   if( diff_red.length == 1 ) diff_red = '0' + diff_red
   if( diff_green.length == 1 ) diff_green = '0' + diff_green
   if( diff_blue.length == 1 ) diff_blue = '0' + diff_blue

   return '#' + diff_red + diff_green + diff_blue;
 };
// All the widget drawing functions take as input an element and the
// fetched data
var DemoWithBadgeDrawer = {
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
  DEFAULT_SIZE: 200,
  DEFAULT_BADGE_WIDTH: 175,
  DEFAULT_BADGE_HEIGHT: 20,
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
    for (let metric of widgetData.metrics) {
        delete metric.submetrics
    }

    var widgetRoot = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    widgetRoot.setAttribute('class', 'widget');
    widgetRoot.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
    widgetElem.appendChild(widgetRoot);

    var widgetSize = widgetElem.getAttribute('data-widget-size');
    var width, height;


    widgetSize = Number(widgetSize);
    if (widgetSize == null || widgetSize <= 0 || isNaN(widgetSize)) {
      if (widgetSize != 0) {
        console.warn('Wrong widget size: "' + widgetSize + '" provided, using default value ' + DemoWithBadgeDrawer.DEFAULT_SIZE);
      }
      widgetSize = DemoWithBadgeDrawer.DEFAULT_SIZE;
    }

    width = height = (widgetSize - DemoWithBadgeDrawer.DEFAULT_BADGE_HEIGHT - 5); // badge height

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
      .attr('height', height + DemoWithBadgeDrawer.DEFAULT_BADGE_HEIGHT + 5)
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
      .style('display', 'block');


    // First, getting the max depth
    var statsNodeSet = DemoWithBadgeDrawer.getStatsNodeSet(widgetData);
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
      .innerRadius(function() {
        return levelSize+1;
      })
      .outerRadius(function(d) {
        return d.y1;
      });


    var maxDepth = statsNodeSet.length;

    var tooltipFunc = function(d) {
      if (!clicked) {
        var one_green_tick = false
        for (let tick of d.data.ticks) {
          one_green_tick = one_green_tick || tick.ticked
          if (tick.ticked) break
        }


        if (!d.parent.data.name || d.parent.data.name != 'widget') {
          d3_selection.select(this).style('opacity', 1);
        }
          if (one_green_tick) {
            d3_selection.select(widgetRoot).selectAll('path').style('opacity', 0);
            d3_selection.select(widgetRoot).selectAll('.path_shown').style('opacity', 0.3);
            d3_selection.select(this).style('opacity', 1);
            d3_selection.select(this).selectAll('path').style('fill', 'black');
          }
            tooltipFuncAux(d);
      }
    };

    var tooltipFuncAux = function(d) {
	var ev = d3_selection.event;
      tooltip_div.style('left', ev.clientX+10+'px'); //'10px');
      tooltip_div.style('top', ev.clientY-25+'px'); //'-25px');
      tooltip_div.style('display', 'block');


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
      tooltip_div.empty();
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
        //gradient here
        if (d.data.ticks) {
          var  ticks_counter = 0
          var  total_ticks = 0

          for (let tick of d.data.ticks) {
            if (tick.ticked) ticks_counter++
            total_ticks++
          }
          return colorStepGradiant('#FFFFFF', d.data.color, ticks_counter/total_ticks)
        }
        return d.data.color;
      })
      .style('cursor', 'pointer')
      .on('mousemove', tooltipFunc)
      .on('click', function(d) {
        if (d.data.empty) return;

        var one_green_tick = false
        for (let tick of d.data.ticks) {
          one_green_tick = one_green_tick || tick.ticked
          if (tick.ticked) break
        }
        if (!one_green_tick) return;
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
          .attr('width', '15px')
          .attr('height', '15px')
          .style('cursor', 'pointer')
          .on('click', function() {
            tooltip_div.style('display', 'none');
            tooltip_div.empty();
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
      var valueline = d3_shape.line()
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
	var ev = d3_selection.event;
        tooltip_div.style('left', ev.clientX+10+'px'); //'10px');
        tooltip_div.style('top', ev.clientY-25+'px'); //'-25px');
        tooltip_div.style('display', 'block');
      }
    };

    var tooltipUptimeHideFunc = function() {
      if (clicked) return;
      draw_uptime_one_time = true;
      tooltip_div.style('display', 'none');
      tooltip_div.empty();
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
      .style('cursor', 'pointer')
      .on('mousemove', tooltipUptimeFunc)
      .on('click', function(d) {

        draw_uptime_one_time = true;

        d3_selection.select(widgetRoot).selectAll('.path_shown').style('opacity', 1);

        clicked = false;
        tooltipUptimeFuncAux(d);
        clicked = true;

        d3_selection.select(widgetElem).select('#close_icon').append('img')
          .attr('src', close_button)
          .attr('width', '15px')
          .attr('height', '15px')
          .style('cursor', 'pointer')
          .on('click', function() {
            tooltip_div.style('display', 'none');
            tooltip_div.empty();
            draw_uptime_one_time = true;
            clicked = false;
          });
      })
      .on('mouseout', tooltipUptimeHideFunc);

    if (width >= DemoWithBadgeDrawer.DEFAULT_BADGE_WIDTH) {
      svg_g.append('image')
        .attr('width', DemoWithBadgeDrawer.DEFAULT_BADGE_WIDTH)
        .attr('height', 20)
        .attr('xlink:href', 'https://img.shields.io/badge/Scientific%20Benchmark-avaible-green.svg?link=https://dev-openebench.bsc.es/html/')
        .attr('x', -(width - ((width - DemoWithBadgeDrawer.DEFAULT_BADGE_WIDTH)/2))/2)
        .attr('y', height/2 + 5)
        .style('cursor', 'pointer')
        .on('click', function() {
          window.open('https://dev-openebench.bsc.es/html/')
        })
    }
  },
  WIDGET_TYPE: 'new_demo_with_badge'
};

export default DemoWithBadgeDrawer;
