$('.ui.dropdown')
  .dropdown({
    on: 'hover'
  })
$(document).ready(function() {
  $('#size_range').range({
    min: 75,
    max: 500,
    start: 200,
    step: 10,
    onChange: function(value, meta){
      if(meta.triggeredByUser) {
        $('#size_label').html('Size: ' + value + ' px')
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
$('.menu.type_menu, .menu.status_menu')
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
      $('#widget_box').html('<div class="ui compact segment"><h4 class="ui header">embedded url</h4></div>')
    }
  });
$('#doApply')
  .on('click',function() {
    var area = $('#widget_viewer');
    area.empty();
    // <div class="opeb" data-id="json/metrics-online.json" data-widget-type="new_demo_with_badge" data-widget-benchmarking-type="Technical" style="display: inline; width: 200px; height: 200px;"></div>
    var widget = document.createElement('div');
    widget.setAttribute("data-id","evolution_VI_mockup/json/metrics-online.json");
    widget.setAttribute("data-widget-type","new_demo_with_badge");
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
