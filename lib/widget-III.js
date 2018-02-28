var icon = {};
icon['online'] = 'plugIn_green.png';
icon['offline'] = 'plugOut_red.png';

for (var key in icon) {
  icon[key] = 'icons/' + icon[key];
};

var width = 200;
var height = 200;
var radius = Math.min(width, height) / 5 - 1;
var RADIUS_DIFFERENCE = 15;
var big_radius = radius + RADIUS_DIFFERENCE;
var big_big_radius = big_radius + RADIUS_DIFFERENCE;
var big_big_big_radius = big_big_radius + RADIUS_DIFFERENCE;
var big_big_big_big_radius = big_big_big_radius + RADIUS_DIFFERENCE;

var draw_uptime_one_time = 0;
var clicked_tooltip = false;
var draw_exit_icon = false;

var arc = d3.arc()
  .outerRadius(radius)
  .innerRadius(radius - RADIUS_DIFFERENCE);

var outArc = d3.arc()
  .innerRadius(radius)
  .outerRadius(big_radius);

var outoutArc = d3.arc()
  .innerRadius(big_radius)
  .outerRadius(big_big_radius);

var outoutoutArc = d3.arc()
  .innerRadius(big_big_radius)
  .outerRadius(big_big_big_radius);

var outoutoutoutArc = d3.arc()
  .innerRadius(big_big_big_radius)
  .outerRadius(big_big_big_big_radius);

var pie = d3.pie()
  .sort(null)
  .value(function(d) {
    return 1;
  })
  .padAngle(.015);

var tooltip_div = d3.select('body').append('div').attr('class', 'tooltip');

//var svg = d3.select("body").append("svg")
var svg = d3.selectAll('svg.widget')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

svg.selectAll('.circle')
  .data([{
    'x_axis': 0,
    'y_axis': 0,
    'radius': radius - RADIUS_DIFFERENCE - 0.5
  }, {
    'x_axis': 0,
    'y_axis': 0,
    'radius': big_big_big_big_radius
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
    return d.radius;
  })
  .style('fill', 'none')
  .style('stroke', 'black')
  .style('stroke-opacity', 0.5)
  .style('display', 'inline-block');

var radius_lines_number = 0;


d3.json('../data/arc.json', function(error, data) {
  if (error) throw error;
  data = data.metrics;
  var data_summary = {};
  var data_summary_keys = {};
  for (let d of data) {
    data_summary[d.metric] = d;
    data_summary_keys[d.metric] = d.metric;
    for (let metric of d.description.split(' '))
      data_summary_keys[metric] = d.metric;
  }

  var color = ['#006400', '#00008b', '#8b0000', '#9400d3', '#ff4500', '#008b8b'];
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

  var g_arc = svg.selectAll('.arc')
    .data(pie(data))
    .enter().append('g')
    .attr('class', 'arc')
    .each(function(d) {
      if (radius_lines_number < 6) {
        radius_lines_number++;
        svg.selectAll('.radius').data([{
            'x1': (-radius + RADIUS_DIFFERENCE) * Math.cos(d.startAngle + Math.PI / 2),
            'y1': (-radius + RADIUS_DIFFERENCE) * Math.sin(d.startAngle + Math.PI / 2),
            'x2': -big_big_big_big_radius * Math.cos(d.startAngle + Math.PI / 2),
            'y2': -big_big_big_big_radius * Math.sin(d.startAngle + Math.PI / 2)
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
          .style('stroke-width', '1.5')
          .style('stroke-opacity', 0.5)
          .style('display', 'inline-block');

      }
    });

  g_arc.append('path')
    .attr('d', arc)
    .style('fill', function(d, i) {
      return (!d.data.metric.startsWith('empty')) ? color[i] : 'none';
    })
    .style('stroke-opacity', 0.4)
    .on('click', function(d) {
      clicked_tooltip = false;
      draw_exit_icon = true;
      tooltip_div.style('display', 'none');
      show_summary_tooltip(this, d, draw_exit_icon, tooltip_div, data_summary_keys, data_summary);
      clicked_tooltip = true;
    })
    .on('mousemove', function(d) {
      if (!clicked_tooltip) {
      show_summary_tooltip(this, d, draw_exit_icon, tooltip_div, data_summary_keys, data_summary);
      }
    })
    .on('mouseout', function() {
      if (!clicked_tooltip) {
      hide_summary_tooltip();
      }
    });

  d3.json('data/outarc.json', function(error, outdata) {
    if (error) throw error;
    outdata = outdata.metrics;
    var color = ['#007c00', '#25259e', '#a10002', '#a72bd9', '#ff5e00', '#00a2a2'];
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
    var g_outArc = svg.selectAll('.outArc')
      .data(pie(outdata))
      .enter().append('g')
      .attr('class', 'outArc');

    g_outArc.append('path')
      .attr('d', outArc)
      .style('fill', function(d, i) {
        return (!d.data.metric.startsWith('empty')) ? color[i] : 'none';
      })
      .style('stroke-opacity', 0.4)
    .on('click', function(d) {
      clicked_tooltip = false;
      draw_exit_icon = true;
      tooltip_div.style('display', 'none');
      show_summary_tooltip(this, d, draw_exit_icon, tooltip_div, data_summary_keys, data_summary);
      clicked_tooltip = true;
    })
      .on('mousemove', function(d) {
      if (!clicked_tooltip) {
      show_summary_tooltip(this, d, draw_exit_icon, tooltip_div, data_summary_keys, data_summary);
      }
      })
      .on('mouseout', function() {
      if (!clicked_tooltip) {
      hide_summary_tooltip();
      }
      });

    d3.json('data/outoutarc.json', function(error, outoutdata) {
      if (error) throw error;
      outoutdata = outoutdata.metrics;

      var color = ['#009500', '#3941b1', '#b80002', '#ba44de', '#ff7300', '#00b7b7'];
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
      var g_outoutArc = svg.selectAll('.outoutArc')
        .data(pie(outoutdata))
        .enter().append('g')
        .attr('class', 'outoutArc');

      g_outoutArc.append('path')
        .attr('d', outoutArc)
        .style('fill', function(d, i) {
          return (!d.data.metric.startsWith('empty')) ? color[i] : 'none';
        })
        .style('stroke-opacity', 0.4)
    .on('click', function(d) {
      clicked_tooltip = false;
      draw_exit_icon = true;
      tooltip_div.style('display', 'none');
      show_summary_tooltip(this, d, draw_exit_icon, tooltip_div, data_summary_keys, data_summary);
      clicked_tooltip = true;
    })
        .on('mousemove', function(d) {
      if (!clicked_tooltip) {
      show_summary_tooltip(this, d, draw_exit_icon, tooltip_div, data_summary_keys, data_summary);
      }
        })
        .on('mouseout', function() {
      if (!clicked_tooltip) {
      hide_summary_tooltip();
      }
        });

      d3.json('data/outoutoutarc.json', function(error, outoutoutdata) {
        if (error) throw error;
        outoutoutdata = outoutoutdata.metrics;

        var color = ['#00ae00', '#4a5cc5', '#cf0002', '#cb5ae3', '#ff8400', '#00cfcf'];
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
        var g_outoutoutArc = svg.selectAll('.outoutoutArc')
          .data(pie(outoutoutdata))
          .enter().append('g')
          .attr('class', 'outoutoutArc');

        g_outoutoutArc.append('path')
          .attr('d', outoutoutArc)
          .style('fill', function(d, i) {
            return (!d.data.metric.startsWith('empty')) ? color[i] : 'none';
          })
          .style('stroke-opacity', 0.4)
    .on('click', function(d) {
      clicked_tooltip = false;
      draw_exit_icon = true;
      tooltip_div.style('display', 'none');
      show_summary_tooltip(this, d, draw_exit_icon, tooltip_div, data_summary_keys, data_summary);
      clicked_tooltip = true;
    })
          .on('mousemove', function(d) {
      if (!clicked_tooltip) {
      show_summary_tooltip(this, d, draw_exit_icon, tooltip_div, data_summary_keys, data_summary);
      }
          })
          .on('mouseout', function() {
      if (!clicked_tooltip) {
      hide_summary_tooltip();
      }
          });

        d3.json('data/outoutoutoutarc.json', function(error, outoutoutoutdata) {
          if (error) throw error;
          outoutoutoutdata = outoutoutoutdata.metrics;

          var color = ['#00c800', '#5879d9', '#e60001', '#dd6ee9', '#ff9600', '#00e6e6'];
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
          var g_outoutoutoutArc = svg.selectAll('.outoutoutoutArc')
            .data(pie(outoutoutoutdata))
            .enter().append('g')
            .attr('class', 'outoutoutoutArc');

          g_outoutoutoutArc.append('path')
            .attr('d', outoutoutoutArc)
            .style('fill', function(d, i) {
              return (!d.data.metric.startsWith('empty')) ? color[i] : 'none';
            })
            .style('stroke-opacity', 0.4)
    .on('click', function(d) {
      clicked_tooltip = false;
      draw_exit_icon = true;
      tooltip_div.style('display', 'none');
      show_summary_tooltip(this, d, draw_exit_icon, tooltip_div, data_summary_keys, data_summary);
      clicked_tooltip = true;
    })
            .on('mousemove', function(d) {
      if (!clicked_tooltip) {
      show_summary_tooltip(this, d, draw_exit_icon, tooltip_div, data_summary_keys, data_summary);
      }
            })
            .on('mouseout', function() {
      if (!clicked_tooltip) {
      hide_summary_tooltip();
      }
            });

        });
      });
    });
  });

  svg.append('image')
    .attr('width', function() {
      state = this.parentNode.parentNode.getAttribute('id');
      return (state == 'online' ? 40 : 30);
    })
    .attr('height', '100%')
    .attr('state', function() {
      state = this.parentNode.parentNode.getAttribute('id');
      return state;
    })
    .attr('xlink:href', function() {
      state = this.parentNode.parentNode.getAttribute('id');
      return icon[state];
    })
    .attr('x', function() {
      state = this.parentNode.parentNode.getAttribute('id');
      return (state == 'online' ? -width / 2 + width / 2.35 : -width / 2 + width / 2.35);
    })
    .attr('y', function() {
      state = this.parentNode.parentNode.getAttribute('id');
      return (state == 'online' ? -height / 2 - 5 : -height / 2);
    })
    .on('click', function() {
      clicked_tooltip = false;
      draw_exit_icon = true;
      draw_uptime_one_time = 1;
      tooltip_div.style('display', 'none');
      show_uptime_tooltip(this, draw_exit_icon, draw_uptime_one_time, tooltip_div);
      clicked_tooltip = true;
    })
    .on('mousemove', function() {
      if (!clicked_tooltip) {
        draw_uptime_one_time++;
        draw_exit_icon = false;
        show_uptime_tooltip(this, clicked_tooltip, draw_uptime_one_time, tooltip_div);
      }
    })
    .on('mouseout', function() {
      if (!clicked_tooltip) {
        hide_uptime_tooltip();
      }
    });
});


function show_summary_tooltip(_this, d, draw_exit_icon,  tooltip_div, data_summary_keys, data_summary) {
  if (!clicked_tooltip) {
    if (!d.data.metric.startsWith('empty')) {
      var description_counter = 0;
      var description_text = '';
      var category_name = data_summary_keys[d.data.metric];
      var data_category = data_summary[category_name];
      d3.select(_this.parentNode.parentNode.parentNode).selectAll('path').style('opacity', 0.3);
      d3.select(_this).style('opacity', 1);

      for (let description of data_category.description.split(' ')) {
        description = description.replace(/_/g, ' ');
        var icon = (description_counter < data_category.ticks) ? 'online' : 'offline';
        description_text += '<br><img src="icons/' + icon + '.png" height="12" width="12"> ' + description;
        description_counter++;
      }

      tooltip_div.style('left', d3.event.pageX + 10 + 'px');
      tooltip_div.style('top', d3.event.pageY - 25 + 'px');

      exit_icon = draw_exit_icon ? '<div style="float:right;"><img style="cursor: pointer;" onclick="hide_summary_tooltip()" src="icons/exit-button-md.png" height="15" width="15"></div>' : '';

      tooltip_div.html('<div style="text-align:center; margin:0; padding:0; display: inline"><b>' + (category_name.replace(/_/g, ' ')) + '</b></div>'+ exit_icon + '<div>' + description_text + '</div>');
      tooltip_div.style('display', 'inline-block');
    }
  }
}

function hide_summary_tooltip() {
    tooltip_div.style('display', 'none');
    d3.selectAll('path')
      .style('opacity', 1);
      clicked_tooltip = false;
      draw_exit_icon = false;
}

function hide_uptime_tooltip() {
  tooltip_div.style('display', 'none');
  clicked_tooltip = false;
  draw_exit_icon = false;
  draw_uptime_one_time = 0;
}

function show_uptime_tooltip(_this, draw_exit_icon, draw_uptime_one_time, tooltip_div) {
  if (draw_uptime_one_time == 1) {
    tooltip_div.style('left', d3.event.pageX + 10 + 'px');
    tooltip_div.style('top', d3.event.pageY - 25 + 'px');
    tooltip_div.style('display', 'inline-block');

    exit_icon = draw_exit_icon ? '<div style="float:right;"><img style="cursor: pointer;" onclick="hide_uptime_tooltip()" src="icons/exit-button-md.png" height="15" width="15"></div>' : '';

    tooltip_div.html('<div style="display: inline; float: left;"><b>' + _this.getAttribute('state') + '</b></div>' + exit_icon + '<br>');


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
    var parseDate = d3.timeParse('%d-%b-%y');

    // Set the ranges
    var x = d3.scaleTime().range([0, width_uptime]);
    var y = d3.scaleLinear().range([height_uptime, 0]);

    // Define the axes
    var xAxis = d3.axisBottom(x);

    var yAxis = d3.axisLeft(y).ticks(1).tickFormat(function(d) {
      return d == 1 ? 'online' : 'offline';
    });

    // Define the line
    var valueline = d3.line()
      .x(function(d) {
        return x(d.date);
      })
      .y(function(d) {
        return y(d.state);
      });

    // Adds the svg canvas

    // Get the data
    d3.json('../data/uptime.json', function(error, data) {
      if (error) throw error;
      data = data.uptime;
      data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.state = +d.state;
      });

      // Scale the range of the data
      x.domain(d3.extent(data, function(d) {
        return d.date;
      }));
      y.domain([0, d3.max(data, function(d) {
        return d.state;
      })]);

      // Add the valueline path.
      var svg_uptime = tooltip_div.append('svg')
        .attr('id', 'uptime')
        .attr('width', width_uptime + margin.left + margin.right)
        .attr('height', height_uptime + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
      svg_uptime.append('path')
        .attr('class', 'line')
        .attr('d', valueline(data));

      // Add the scatterplot
      svg_uptime.selectAll('dot')
        .data(data)
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
    });
  }
}
