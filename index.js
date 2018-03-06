$('.ui.dropdown')
  .dropdown({
    on: 'hover'
  })
const WIDGET_SIZE_DEFAULT = 200
var widget_size = WIDGET_SIZE_DEFAULT
$(document).ready(function() {
  $('#doApply').trigger('click')
  $('#size_range').range({
    min: 75,
    max: 500,
    start: WIDGET_SIZE_DEFAULT,
    step: 10,
    onChange: function(value, meta){
      if(meta.triggeredByUser) {
        $('#size_label').html('Size: ' + value + ' px')
        widget_size = value
      }
    }
  });
});
$('.ui.evolutions_sidebar')
  .on('click', '.item', function() {
    $(this).addClass('active').siblings().removeClass('active')
    var id = $(this).prop("id")
    path = id + "/index.html"
    if (['evolution_I_mockup'].includes(id)) {
      height = 330;
      width = 700;
    }
    else if (['initial_mockup'].includes(id)) {
      height = 430;
      width = 450;
    }
    else if (['evolution_II_mockup', 'evolution_III_mockup', 'evolution_IV_mockup', 'evolution_V_mockup', 'evolution_VI_mockup'].includes(id)) {
      height = 320;
      width = 570;
    }
    $('#widget_viewer').html('<object type="text/html" width="' + width +'" height="'+ height + '" data="' + path + '"></object>')

    $('#widget_box').html('<div class="ui compact segment"><h4 class="ui header">' +  id.replace(/_/g, ' ').replace(/\b\w/g, function(l){ return l.toUpperCase() }) + '</h4>' + box[id] + '</div>')
  })
$('.menu#type_menu, .menu#status_menu')
  .on('click', '.item', function() {
    var id = $(this).prop("id")
  })
$('.ui.widget_menu')
  .on('click', '.item', function() {
    $(this)
      .addClass('active')
      .siblings('.item')
      .removeClass('active');
    var page = $(this).text().toLowerCase()
    $('.ui.' +  page + '_sidebar').show().siblings('.sidebar').hide()
    if (page == 'evolutions') {
      $('.item#evolution_VI_mockup').trigger('click')
      $('#widget_box').html('<div class="ui compact segment"><h4 class="ui header">' +  'evolution_VI_mockup'.replace(/_/g, ' ').replace(/\b\w/g, function(l){ return l.toUpperCase() }) + '</h4>' + box['evolution_VI_mockup'] + '</div>')
    } else {
      $('#doApply').trigger('click')
    }
  });
$('#doApply')
  .on('click',function() {
    var widget_type = $('#type_menu > .active ').prop('id')
    var widget_status = $('#status_menu > .active ').prop('id')
    var area = $('#widget_viewer');
    area.empty();
    var widget_url = '<div class="opeb"></div>'
    //var widget_url = '<div class="opeb" data-id="json/metrics-online.json" data-widget-type="new_demo_with_badge"></div>';
    var widget = document.createElement('div');
    widget.setAttribute("data-id","evolution_VI_mockup/json/metrics-" + widget_status + ".json");
    widget.setAttribute("data-widget-type", widget_type);
    widget.setAttribute("data-widget-size", widget_size);
    widget.setAttribute("class","opeb");
    area.append(widget);
    var urlArea = $('#widget_box_url');
    urlArea.empty();
    var htmlwidget = area.html();
    var htmlcontainer = document.createElement('div');
    htmlcontainer.setAttribute('class','ui compact segment');
    var headercontainer = document.createElement('h4');
    headercontainer.setAttribute('class','ui header');
    headercontainer.appendChild(document.createTextNode('Embedded Url:'));
    htmlcontainer.appendChild(headercontainer);
    htmlcontainer.appendChild(document.createTextNode(htmlwidget));
    urlArea.append(htmlcontainer);
    OpEB_widgets.OpEB.apply();
  });

$('#doReset').on('click', function() {
    var widget_type = 'new_demo'
    var widget_status = 'online'
    widget_size = WIDGET_SIZE_DEFAULT
    $('#size_label').html('Size: ' + widget_size + ' px')
    $('#size_range').range({
      min: 75,
      max: 500,
      start: WIDGET_SIZE_DEFAULT,
      step: 10,
      onChange: function(value, meta){
        if(meta.triggeredByUser) {
          $('#size_label').html('Size: ' + value + ' px')
          widget_size = value
        }
      }
    });
    $('#new_demo').addClass('active').siblings().removeClass('active')
    $('#online').addClass('active').siblings().removeClass('active')
    var area = $('#widget_viewer');
    area.empty();
    var widget = document.createElement('div');
    widget.setAttribute("data-id","evolution_VI_mockup/json/metrics-" + widget_status + ".json");
    widget.setAttribute("data-widget-type", widget_type);
    widget.setAttribute("data-widget-size", widget_size);
    widget.setAttribute("class","opeb");
    area.append(widget);
    OpEB_widgets.OpEB.apply();
});

var box = {}
box['initial_mockup'] = `
      <ul class="ui list">
        <li>First idea to widget</li>
      </ul>
      `;
box['evolution_I_mockup'] = `
      <ul class="ui list">
        <li>Tooltips highlighted on hovering</li>
        <li>Colored plug-in icons</li>
      </ul>
      `;
box['evolution_II_mockup'] = `
      <ul class="ui list">
        <li>Categories summary with tick icons</li>
        <li>Online/Offline uptime plot inside the plug-in tooltip icon</li>
        <li>200x200, 100x100, 75x75 sizes</li>
      </ul>
      `;
box['evolution_III_mockup'] = `
      <ul class="ui list">
        <li>All arcs now show the metrics summary</li>
        <li>Hide arc stroke lines</li>
        <li>Add mouse click event (and a exit button) to fix the tooltips in the screen </li>
      </ul>
      `;
box['evolution_IV_mockup'] = `
      <ul class="ui list">
        <li>Library isolation</li>
        <li>Customizable widget size</li>
        <li>Fix load html without iframe behaviour</li>
        <li>Fix mime types in Ipad devices</li>
        <li>Improved click behaviour</li>
        <li>Added tooltip information to the empty widget parts</li>
        <li>All data in one JSON</li>
      </ul>
      `;
box['evolution_V_mockup'] = `
      <ul class="ui list">
        <li>Added package.json</li>
        <ul>
          <li>Scripts section</li>
          <ul>
            <li>dev: development deployment</li>
            <li>dist: distribution deployment</li>
            <li>lint: linter javascript code</li>
          </ul>
        </ul>
        <li>Refactored d3.js to import only used submodules (30 -&gt; 7 modules)</li>
        <li>Webpack (all javacripts, css and images bundled in one js)</li>
        <ul>
          <li>dev (without minified): 1.5MB</li>
          <li>dist(with minified) 216KB</li>
        </ul>
        <li>Better icons names</li>
      </ul>
      `;
box['evolution_VI_mockup'] = `
      <ul class="ui list">
        <li>Added template widget model</li>
        <ul>
          <li>Added new demo widget</li>
        <ul>
          <li>One arc per metric</li>
          <li>Color gradient according to the number of submetrics</li>
        </ul>
        </ul>
      </ul>
      `;
box['initial_mockup'] = `
      <ul class="ui list">
        <li>First idea to widget</li>
      </ul>
      `;
box['evolution_I_mockup'] = `
      <ul class="ui list">
        <li>Tooltips highlighted on hovering</li>
        <li>Colored plug-in icons</li>
      </ul>
      `;
box['evolution_II_mockup'] = `
      <ul class="ui list">
        <li>Categories summary with tick icons</li>
        <li>Online/Offline uptime plot inside the plug-in tooltip icon</li>
        <li>200x200, 100x100, 75x75 sizes</li>
      </ul>
      `;
box['evolution_III_mockup'] = `
      <ul class="ui list">
        <li>All arcs now show the metrics summary</li>
        <li>Hide arc stroke lines</li>
        <li>Add mouse click event (and a exit button) to fix the tooltips in the screen </li>
      </ul>
      `;
box['evolution_IV_mockup'] = `
      <ul class="ui list">
        <li>Library isolation</li>
        <li>Customizable widget size</li>
        <li>Fix load html without iframe behaviour</li>
        <li>Fix mime types in Ipad devices</li>
        <li>Improved click behaviour</li>
        <li>Added tooltip information to the empty widget parts</li>
        <li>All data in one JSON</li>
      </ul>
      `;
box['evolution_V_mockup'] = `
      <ul class="ui list">
        <li>Added package.json</li>
        <ul>
          <li>Scripts section</li>
          <ul>
            <li>dev: development deployment</li>
            <li>dist: distribution deployment</li>
            <li>lint: linter javascript code</li>
          </ul>
        </ul>
        <li>Refactored d3.js to import only used submodules (30 -&gt; 7 modules)</li>
        <li>Webpack (all javacripts, css and images bundled in one js)</li>
        <ul>
          <li>dev (without minified): 1.5MB</li>
          <li>dist(with minified) 216KB</li>
        </ul>
        <li>Better icons names</li>
      </ul>
      `;
box['evolution_VI_mockup'] = `
      <ul class="ui list">
        <li>Added template widget model</li>
        <ul>
          <li>Added new demo widget</li>
        <ul>
          <li>One arc per metric</li>
          <li>Color gradient according to the number of submetrics</li>
        </ul>
        </ul>
      </ul>
      `;
