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
var DemoBadgeDrawer = {
  DEFAULT_BADGE_WIDTH: 175,
  DEFAULT_BADGE_HEIGHT: 20,

  draw: function(widgetElem, widgetData) {
    var widgetRoot = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    widgetRoot.setAttribute('class', 'widget');
    widgetRoot.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
    widgetElem.appendChild(widgetRoot);

    var  width = DemoBadgeDrawer.DEFAULT_BADGE_WIDTH
    var  height = DemoBadgeDrawer.DEFAULT_BADGE_HEIGHT

    var svg_g = d3_selection.select(widgetRoot)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + 0 + ',' + 0 + ')');

      svg_g.append('image')
        .attr('width', width)
        .attr('height', height)
        .attr('xlink:href', 'https://img.shields.io/badge/Scientific%20Benchmark-avaible-green.svg?link=https://dev-openebench.bsc.es/html/')
        .attr('x', 0)
        .attr('y', 0)
        .style('cursor', 'pointer')
        .on('click', function() {
          window.open('https://dev-openebench.bsc.es/html/')
        })
  },
  WIDGET_TYPE: 'demo_badge'
};

export default DemoBadgeDrawer;
