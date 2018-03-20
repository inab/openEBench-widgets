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

  parseJson: function (widgetData) {
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
    //metric.ticks[0].ticked = false;
    // var tick = {};
    // tick.name = 'test'
    // tick.ticked = true;
    // metric.ticks.push(tick);
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
    new_widgetData.metrics.push(metric);

    new_widgetData.enabled = widgetData.project.website.operational == 200;
    new_widgetData.name = widgetData['@id'];

    //new_widgetData['uptime']
    return new_widgetData;
  },

  draw: function (widgetElem, widgetData) {

    widgetData = DemoWithBadgeDrawer.parseJson(widgetData);

    for (let metric of widgetData.metrics) {
      delete metric.submetrics;
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
    var statsNodeSet = DemoWithBadgeDrawer.getStatsNodeSet(widgetData);
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
      tooltip_div.style('left', ev.clientX + 10 + 'px'); //'10px');
      tooltip_div.style('top', ev.clientY - 25 + 'px'); //'-25px');
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
      tooltip_div.html('<div style="text-align:center; margin:0;padding:0;"><b style="padding-right:10px">' + (data.metric) + '</b><div id="close_icon" style="float:right;"></div><div style="text-align:left;"><div id="vertical_bar_tooltip" style="clear: left; float: left;"></div><div id="description_text" style="float: left;">' + description_text + '</div></div></div>');
      var tooltip_container = d3_selection.select(widgetElem).select('.tooltip').select('#vertical_bar_tooltip');
      var line_svg_container = tooltip_container
        .append('svg')
        .attr('width', 10)
        .attr('height', 60)
        .style('border', '1px solid black')
        .style('margin-right', '5px');
      if (green_ticks_total == total_ticks) {
        var rect = line_svg_container.append('rect')
          .attr('width', 10)
          .attr('height', 60)
          .attr('fill', d.data.color);
      } else if (green_ticks_total == 0) {
        var rect = line_svg_container.append('rect')
          .attr('width', 8)
          .attr('height', 60)
          .attr('fill', '#FFFFFF');
      } else {
        var rect = line_svg_container.append('rect')
          .attr('width', 10)
          .attr('height', 60 * (1- green_ticks_total/total_ticks))
          .attr('fill', '#FFFFFF');
        var rect = line_svg_container.append('rect')
          .attr('width', 10)
          .attr('height',  60 * (green_ticks_total/total_ticks))
          .attr('y', 60 - 60 * (green_ticks_total/total_ticks))
          .attr('fill', d.data.color);
      }
    };

    var tooltipHideFunc = function () {
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
        if (d.data.ticks) {
          var ticks_counter = 0;
          var total_ticks = 0;

          for (let tick of d.data.ticks) {
            if (tick.ticked) ticks_counter++;
            total_ticks++;
          }

          var color = d3_scale.scaleLinear()
            .domain([0, total_ticks])
            .range(['#FFFFFF', d.data.color]);
          return color(ticks_counter);
        }
      })
      .on('mousemove', tooltipFunc)
      .on('click', function (d) {
        if (d.data.empty) return;

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
        d3_selection.select(widgetElem).select('#close_icon').append('img')
          .attr('src', close_button)
          .attr('width', '15px')
          .attr('height', '15px')
          .style('cursor', 'pointer')
          .on('click', function () {
            tooltip_div.style('display', 'none');
            tooltip_div.empty();
            d3_selection.select(widgetRoot).selectAll('.path_shown').style('opacity', 1);
            clicked = false;
          });
      })
      .on('mouseout', tooltipHideFunc);

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

      var yAxis = d3_axis.axisLeft(y).ticks(1).tickFormat(function (d) {
        return d == 1 ? 'online' : 'offline';
      });

      // Define the line
      var valueline = d3_shape.line()
        .x(function (d) {
          return x(d.date);
        })
        .y(function (d) {
          return y(d.state);
        });

      uptime.forEach(function (d) {
        d.date = parseDate(d.date);
        d.state = +d.state;
      });
      // Scale the range of the data
      x.domain(d3_array.extent(uptime, function (d) {
        return d.date;
      }));
      y.domain([0, d3_array.max(uptime, function (d) {
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
          .attr('cx', function (d) {
            return x(d.date);
          })
          .attr('cy', function (d) {
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
        tooltip_div.style('left', ev.clientX + 10 + 'px'); //'10px');
        tooltip_div.style('top', ev.clientY - 25 + 'px'); //'-25px');
        tooltip_div.style('display', 'block');
      }
    };

    var tooltipUptimeHideFunc = function () {
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
      .attr('xlink:href', function () {
        icon = (state == 'online') ? online_plug : offline_plug;
        return icon;
      })
      .attr('x', -levelSize * xy_pos)
      .attr('y', -levelSize * xy_pos)
      // .on('mousemove', tooltipUptimeFunc)
      // .on('click', function (d) {

      //   draw_uptime_one_time = true;

      //   d3_selection.select(widgetRoot).selectAll('.path_shown').style('opacity', 1);

      //   clicked = false;
      //   tooltipUptimeFuncAux(d);
      //   clicked = true;

      //   d3_selection.select(widgetElem).select('#close_icon').append('img')
      //     .attr('src', close_button)
      //     .attr('width', '15px')
      //     .attr('height', '15px')
      //     .style('cursor', 'pointer')
      //     .on('click', function () {
      //       tooltip_div.style('display', 'none');
      //       tooltip_div.empty();
      //       draw_uptime_one_time = true;
      //       clicked = false;
      //     });
      // })
      // .on('mouseout', tooltipUptimeHideFunc);

    var tool_id = widgetElem.getAttribute('data-id');
    var tool_url = 'https://dev-openebench.bsc.es/html/ws/#!/tool/';
    var tool_name = tool_id.match(/:(.+):/)[1];

    var available_scientific_benchmark = state == 'online';
    var scientific_benchmark_status = available_scientific_benchmark ? 'available' : 'not available';

    if (width >= DemoWithBadgeDrawer.DEFAULT_BADGE_WIDTH) {
      svg_g.append('image')
        .attr('width', DemoWithBadgeDrawer.DEFAULT_BADGE_WIDTH)
        .attr('height', 20)
        .attr('xlink:href', 'https://img.shields.io/badge/Scientific%20Benchmark-' + scientific_benchmark_status + '-' + (available_scientific_benchmark ? 'green' : 'red') + '.svg?link=' + tool_url + tool_name)
        .attr('x', -(width - (width - DemoWithBadgeDrawer.DEFAULT_BADGE_WIDTH))/2)
        .attr('y', height/2 + 5)
        .style('cursor', function () {
          return available_scientific_benchmark ? 'pointer' : 'auto';
        })
        .on('click', function() {
          if (available_scientific_benchmark) {
            window.open(tool_url + tool_name);
          }
        });
    }
  },
  WIDGET_TYPE: 'new_demo_with_badge'
};

export default DemoWithBadgeDrawer;
