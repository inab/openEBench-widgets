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

import { loadChart } from 'uptime-widget';

// All the widget drawing functions take as input an element and the
// fetched data
var NewDemoDrawer = {
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
  // Getting the max depth of the nested structure
  getStatsNodeSet: function (widgetData) {
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

  parseJson: function (widgetData, debug_mode) {
    // console.log(widgetData);
    var new_widgetData = {};
    new_widgetData.metrics = [];

    // License
    if (widgetData.project.license) {
      //console.log(widgetData.project.license)
      var metric = {};
      metric.metric = 'License';
      metric.color = '#ff895d';
      metric.ticks = [];

      for (let key in widgetData.project.license) {
        var tick = {};
        tick.name = key.replace('_', ' ');
        tick.ticked = widgetData.project.license[key];
        metric.ticks.push(tick);
      }

    } else {
      var metric = {};
      metric.metric = 'License';
      metric.color = '#ff895d';
      metric.ticks = [];
      var tick = {};
      tick.name = 'osi';
      tick.ticked = false;
      metric.ticks.push(tick);
      var another_tick = {};
      another_tick.name = 'open source';
      another_tick.ticked = false;
      metric.ticks.push(another_tick);
    }
    // metric.ticks[0].ticked = false;
    if (debug_mode) {
      var tick = {};
      tick.name = 'test';
      tick.ticked = false;
      metric.ticks.push(tick);
    }
    new_widgetData.metrics.push(metric);

    // Build
    if (widgetData.project.build) {
      var metric = {};
      metric.metric = 'Buildability';
      metric.color = '#d5eeff';
      metric.ticks = [];

      var tick = {};
      for (let key in widgetData.project.build) {
        tick.name = key.replace('_', ' ');
        tick.ticked = widgetData.project.license[key];
        metric.ticks.push(tick);
      }

      if (metric.ticks.length == 0) {
        tick.name = 'Compiler';
        tick.ticked = false;
        metric.ticks.push(tick);
        var another_tick = {};
        another_tick.name = 'Automated';
        another_tick.ticked = false;
        metric.ticks.push(another_tick);
      }
    } else {
      var metric = {};
      var tick = {};
      metric.metric = 'Buildability';
      metric.color = '#d5eeff';
      metric.ticks = [];
      tick.name = 'Compiler';
      tick.ticked = false;
      metric.ticks.push(tick);
      var another_tick = {};
      another_tick.name = 'Automated';
      another_tick.ticked = false;
      metric.ticks.push(another_tick);
    }
    new_widgetData.metrics.push(metric);

    // Support
    if (widgetData.support) {
      var metric = {};
      metric.metric = 'Support';
      metric.color = '#78bbe6';
      metric.ticks = [];

      var tick = {};
      for (let key in widgetData.support) {
        tick.name = key.replace('_', ' ');
        tick.ticked = widgetData.support[key];
        metric.ticks.push(tick);
      }

    } else {
      var metric = {};
      metric.metric = 'Support';
      metric.color = '#78bbe6';
      metric.ticks = [];
      var tick = {};
      tick.email = false;
      metric.ticks.push(tick);

    }
    new_widgetData.metrics.push(metric);

    // Documentation;
    if (widgetData.project.summary) {
      var metric = {};
      metric.metric = 'Documentation';
      metric.color = '#1b435d';
      metric.ticks = [];

      var tick = {};
      for (let key in widgetData.project.summary) {
        tick.name = key.replace('_', ' ');
        tick.ticked = widgetData.project.summary[key];
        metric.ticks.push(tick);
      }

    } else {
      var metric = {};
      metric.metric = 'Documentation';
      metric.color = '#1b435d';
      metric.ticks = [];
      var tick = {};
      tick.description = false;
      metric.ticks.push(tick);
    }

    if (debug_mode) {
      var tick = {};
      tick.name = 'test';
      tick.ticked = false;
      metric.ticks.push(tick);
    }
    new_widgetData.metrics.push(metric);

    new_widgetData.enabled = widgetData.project.website.operational == 200;
    new_widgetData.name = widgetData['@id'];

    //new_widgetData['uptime']
    return new_widgetData;
  },

  draw: function (widgetElem, widgetData) {

    var widgetRoot = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    widgetRoot.setAttribute('class', 'widget');
    widgetRoot.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
    widgetElem.appendChild(widgetRoot);

    var widgetSize = widgetElem.getAttribute('data-widget-size');
    var widgetDebug = widgetElem.getAttribute('data-widget-debug');
    var widgetId = widgetElem.getAttribute('data-id');
    var widgetIdCss = widgetId.split('/')[0].split(':').join('_').replace(/\./g,'_');
    var random = Math.random().toString().replace(/\./g, '');
    widgetIdCss += '-' + random;
    var width, height;

    widgetData = NewDemoDrawer.parseJson(widgetData, widgetDebug);

    for (let metric of widgetData.metrics) {
      delete metric.submetrics;
    }


    widgetSize = Number(widgetSize);
    if (widgetSize == null || widgetSize <= 0 || isNaN(widgetSize)) {
      if (widgetSize != 0) {
        console.warn('Wrong widget size: "' + widgetSize + '" provided, using default value ' + NewDemoDrawer.DEFAULT_SIZE);
      }
      widgetSize = NewDemoDrawer.DEFAULT_SIZE;
    }

    width = height = widgetSize;

    var levelSize = width * 15 / 200;
    var radius = Math.min(width, height) / 2 - 1.2;
    var ext_radius = levelSize + (levelSize * 5.6);

    var draw_uptime_one_time = false;
    var clicked = false;

    var tooltip_metrics = d3_selection.select(widgetElem)
      .append('div')
      .attr('id', 'tooltip_metrics-' + widgetIdCss)
      .attr('class', 'tooltip');

    var tooltip_uptime = d3_selection.select(widgetElem)
      .append('div')
      .attr('id', 'tooltip_uptime-' + widgetIdCss)
      .attr('class', 'tooltip');

    var uptime_url = widgetData.name.replace("metrics/",'rest/homepage/')

    tooltip_uptime.html('<div id="close_icon-uptime-'+ widgetIdCss +'" style="float: right"></div></br><div data-id="' + widgetIdCss + '" data-xaxis="true" data-w="400" data-h="200" data-url="' + uptime_url + '" class="opebuptime" ></div>');
    loadChart();

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
        'r_radius': ext_radius
      }])
      .enter().append('circle')
      .attr('class', 'circle')
      .attr('cx', function (d) {
        return d.x_axis;
      })
      .attr('cy', function (d) {
        return d.y_axis;
      })
      .attr('r', function (d) {
        return d.r_radius;
      })
      .style('fill', 'none')
      .style('stroke', 'black')
      .style('stroke-opacity', 0.5)
      .style('display', 'block');


    // First, getting the max depth
    var statsNodeSet = NewDemoDrawer.getStatsNodeSet(widgetData);
    var partition = d3_hierarchy.partition()
      .size([2 * Math.PI, radius]);
    var root = d3_hierarchy.hierarchy({
      name: 'widget',
      description: 'OpenEBench widget',
      submetrics: widgetData.metrics
    },
    function (d) {
      return d.submetrics;
    }
    )
      //.sum(function (d) { return d.size});
      .count();
    partition(root);

    var filtered_root_descendants = root.descendants().filter(function(d) { return d.data.metric != null; }); // remove widget root
    var total_metrics = widgetData.metrics.length;
    var radius_separator = (total_metrics > 1) ? 0.005 : 0;

    var arc = d3_shape.arc()
      .startAngle(function (d) {
        return d.x0 + radius_separator;
      })
      .endAngle(function (d) {
        return d.x1 - radius_separator;
      })
      .innerRadius(function () {
        return levelSize + 1;
      })
      .outerRadius(function () {
        return ext_radius - 0.65;
      });


    var maxDepth = statsNodeSet.length;

    var tooltipFunc = function (d) {
      if (!clicked) {
        var one_green_tick = false;
        for (let tick of d.data.ticks) {
          one_green_tick = one_green_tick || tick.ticked;
          if (tick.ticked) break;
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

    var tooltipFuncAux = function (d) {
      var ev = d3_selection.event;
      tooltip_metrics.style('left', ev.clientX + 10 + 'px'); //'10px');
      tooltip_metrics.style('top', ev.clientY - 25 + 'px'); //'-25px');
      tooltip_metrics.style('display', 'block');


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

      var green_ticks_descriptions = '';
      var red_ticks_descriptions = '';
      var green_ticks_total = 0;
      var total_ticks = data.ticks.length;
      for (var iTick = 0, nTick = data.ticks.length; iTick < nTick; iTick++) {
        var tick = data.ticks[iTick];
        var description = tick.name;
        var isTicked = !!tick.ticked;
        green_ticks_total += isTicked ? 1 : 0;
        var icon = (isTicked) ? online_tick : offline_tick;
        var full_description = '<br><img src="' + icon + '" height="15" width="15"> ' + description;
        if (isTicked) {
          green_ticks_descriptions += full_description;
        } else {
          red_ticks_descriptions += full_description;
        }
      }
      description_text = green_ticks_descriptions + red_ticks_descriptions;
      tooltip_metrics.html('<div style="text-align:center; margin:0;padding:0;"><b style="padding-right:10px">' + (data.metric) + '</b><div id="close_icon-metrics-' + widgetIdCss + '" style="float:right;"></div><div id="description_text" style="text-align: left;">' + description_text + '</div></div>');
    };

    var tooltipHideFunc = function () {
      if (clicked) return;
      tooltip_metrics.style('display', 'none');
      tooltip_metrics.empty();
      d3_selection.select(widgetRoot).selectAll('path').style('opacity', 0);
      d3_selection.select(widgetRoot).selectAll('.path_shown').style('opacity', 1);
    };

    svg_g.selectAll('path')
      .data(filtered_root_descendants) // remove widget root
      .enter()
      .append('path')
      .style('stroke', 'none')
      .attr('display', function (d) {
        return d.depth ? null : 'none';
      })
      .attr('d', arc)
      .style('stroke', 'none')
      //.style('stroke', '#000000')
      //.style("fill", function (d) {return color((d.children ? d : d.parent).data.name); })
      .classed('path_shown', function (d) {
        return !d.data.empty;
      })
      .style('opacity', function (d) {
        return d.data.empty ? 0 : 1;
      })
      .style('fill', function (d) {
        //gradient here
        var gradient_url = 'url(#'+ d.data.metric.toLowerCase().replace(' ', '_') + '-gradient-' +  widgetIdCss + ')';
        return gradient_url;
      })
      .on('mousemove', tooltipFunc)
      .on('click', function (d) {
        if (d.data.empty) return;

        tooltip_uptime.style('display', 'none');

        var one_green_tick = false;
        for (let tick of d.data.ticks) {
          one_green_tick = one_green_tick || tick.ticked;
          if (tick.ticked) break;
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
        d3_selection.select(widgetElem).select('#tooltip_metrics-'+ widgetIdCss).select('#close_icon-metrics-' + widgetIdCss).append('img')
          .attr('src', close_button)
          .attr('width', '15px')
          .attr('height', '15px')
          .style('cursor', 'pointer')
          .on('click', function () {
            tooltip_metrics.style('display', 'none');
            tooltip_metrics.empty();
            d3_selection.select(widgetRoot).selectAll('.path_shown').style('opacity', 1);
            clicked = false;
          });
      })
      .on('mouseout', tooltipHideFunc);

    var radial_gradients = svg_g
      .append('defs')
      .selectAll('radialGradient')
      .data(filtered_root_descendants)
      .enter()
      .append('radialGradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', '100%')
      .attr('id', function(d) { return d.data.metric.toLowerCase().replace(' ', '_') + '-gradient-' +  widgetIdCss;});
    radial_gradients.append('stop')
      .attr('offset', function(d) {
        var ticks_counter = 0;
        var total_ticks = 0;

        for (let tick of d.data.ticks) {
          if (tick.ticked) ticks_counter++;
          total_ticks++;
        }
        return (ticks_counter * 50 / total_ticks) + '%';
      })
      .attr('stop-color', function(d) {
        if (d.data.ticks) {
          return d.data.color;
        }
      });
    radial_gradients.append('stop')
      .attr('offset', function(d) {
        var ticks_counter = 0;
        var total_ticks = 0;

        for (let tick of d.data.ticks) {
          if (tick.ticked) ticks_counter++;
          total_ticks++;
        }
        return ((ticks_counter * 50 / total_ticks) + 3) + '%';
      })
      .attr('stop-color', '#FFFFFF');

    if (total_metrics > 1) {
      var angle;
      // Fix angle problem with an odd number of metrics
      if (total_metrics % 2 == 0) {
        angle = 0.5 * Math.PI;
      } else {
        angle = 1.5 * Math.PI;
      }

      svg_g.selectAll('path')
        .each(function (d) {
          svg_g.selectAll('.radius').data([{
            'x1': (levelSize + 1.5) * Math.cos(d.x1 + angle),
            'y1': (levelSize + 1.5) * Math.sin(d.x1 + angle),
            'x2': (ext_radius) * Math.cos(d.x1 + angle),
            'y2': (ext_radius) * Math.sin(d.x1 + angle)
          }])
            .enter().append('line')
            .attr('class', 'line')
            .attr('x1', function (d) {
              return d.x1;
            })
            .attr('y1', function (d) {
              return d.y1;
            })
            .attr('x2', function (d) {
              return d.x2;
            })
            .attr('y2', function (d) {
              return d.y2;
            })
            .style('stroke', 'black')
            .style('stroke-width', '1')
            .style('stroke-opacity', 0.5)
            .style('display', 'inline-block');
        });
    }

    var tooltipUptimeFunc = function (d) {
      if (clicked) return;
      tooltipUptimeFuncAux(d);
    };

    var tooltipUptimeFuncAux = function () {

      if (!draw_uptime_one_time && !clicked) {
        tooltip_uptime.style('display', 'block');
        draw_uptime_one_time = true;
      }

      if (!clicked) {
        var ev = d3_selection.event;
        tooltip_uptime.style('left', ev.clientX + 10 + 'px'); //'10px');
        tooltip_uptime.style('top', ev.clientY - 25 + 'px'); //'-25px');
        tooltip_uptime.style('display', 'block');

        var close_button_div = d3_selection.select(widgetElem).select('#tooltip_uptime-'+ widgetIdCss).select('#close_icon-uptime-' + widgetIdCss);
        close_button_div.select('img').style('display', 'none');
      }
    };

    var tooltipUptimeHideFunc = function () {
      if (clicked) return;
      tooltip_uptime.style('display', 'none');
      tooltip_uptime.empty();
    };

    var state = widgetData.enabled ? 'online' : 'offline';
    var xy_pos = widgetData.enabled ? 0.8 : 0.7;
    var width_height = widgetData.enabled ? '12%' : '10%';
    var icon;
    svg_g.append('image')
      .attr('width', width_height)
      .attr('height', width_height)
      .attr('xlink:href', function () {
        icon = (state == 'online') ? online_plug : offline_plug;
        return icon;
      })
      .attr('x', -levelSize * xy_pos)
      .attr('y', -levelSize * xy_pos)
      .on('mousemove', tooltipUptimeFunc)
      .on('click', function (d) {

        tooltip_metrics.style('display', 'none');

        draw_uptime_one_time = true;

        d3_selection.select(widgetRoot).selectAll('.path_shown').style('opacity', 1);

        clicked = false;
        tooltipUptimeFuncAux(d);
        clicked = true;

        var close_button_div = d3_selection.select(widgetElem).select('#tooltip_uptime-'+ widgetIdCss).select('#close_icon-uptime-' + widgetIdCss);
        if (close_button_div.select('img').empty()) {
          close_button_div.append('img')
            .attr('src', close_button)
            .attr('width', '15px')
            .attr('height', '15px')
            .style('cursor', 'pointer')
            .on('click', function () {
              tooltip_uptime.style('display', 'none');
              tooltip_uptime.empty();
              draw_uptime_one_time = true;
              clicked = false;
            });
        } else {
          close_button_div.select('img').style('display', 'block');
        }
      })
      .on('mouseout', tooltipUptimeHideFunc);
  },
  WIDGET_TYPE: 'new_demo'
};

export default NewDemoDrawer;
