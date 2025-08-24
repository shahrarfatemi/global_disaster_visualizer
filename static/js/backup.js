// d3.tip
// Copyright (c) 2013 Justin Palmer
// ES6 / D3 v4 Adaption Copyright (c) 2016 Constantin Gavrilete
// Removal of ES6 for D3 v4 Adaption Copyright (c) 2016 David Gotz
//
// Tooltips for d3.js SVG visualizations
var current_disaster = 'Meteorological'
d3.functor = function functor(v) {
    return typeof v === "function" ? v : function() {
      return v; 
    };
  };
  
  d3.tip = function() {
  
    var direction = d3_tip_direction,
        offset    = d3_tip_offset,
        html      = d3_tip_html,
        node      = initNode(),
        svg       = null,
        point     = null,
        target    = null
  
    function tip(vis) {
      svg = getSVGNode(vis)
      point = svg.createSVGPoint()
      document.body.appendChild(node)
    }
  
    // Public - show the tooltip on the screen
    //
    // Returns a tip
    tip.show = function() {
      var args = Array.prototype.slice.call(arguments)
      if(args[args.length - 1] instanceof SVGElement) target = args.pop()
  
      var content = html.apply(this, args),
          poffset = offset.apply(this, args),
          dir     = direction.apply(this, args),
          nodel   = getNodeEl(),
          i       = directions.length,
          coords,
          scrollTop  = document.documentElement.scrollTop || document.body.scrollTop,
          scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft
  
      nodel.html(content)
        .style('position', 'absolute')
        .style('opacity', 1)
        .style('pointer-events', 'all')
  
      while(i--) nodel.classed(directions[i], false)
      coords = direction_callbacks[dir].apply(this)
      nodel.classed(dir, true)
        .style('top', (coords.top +  poffset[0]) + scrollTop + 'px')
        .style('left', (coords.left + poffset[1]) + scrollLeft + 'px')
  
      return tip
    }
  
    // Public - hide the tooltip
    //
    // Returns a tip
    tip.hide = function() {
      var nodel = getNodeEl()
      nodel
        .style('opacity', 0)
        .style('pointer-events', 'none')
      return tip
    }
  
    // Public: Proxy attr calls to the d3 tip container.  Sets or gets attribute value.
    //
    // n - name of the attribute
    // v - value of the attribute
    //
    // Returns tip or attribute value
    tip.attr = function(n, v) {
      if (arguments.length < 2 && typeof n === 'string') {
        return getNodeEl().attr(n)
      } else {
        var args =  Array.prototype.slice.call(arguments)
        d3.selection.prototype.attr.apply(getNodeEl(), args)
      }
  
      return tip
    }
  
    // Public: Proxy style calls to the d3 tip container.  Sets or gets a style value.
    //
    // n - name of the property
    // v - value of the property
    //
    // Returns tip or style property value
    tip.style = function(n, v) {
      // debugger;
      if (arguments.length < 2 && typeof n === 'string') {
        return getNodeEl().style(n)
      } else {
        var args = Array.prototype.slice.call(arguments);
        if (args.length === 1) {
          var styles = args[0];
          Object.keys(styles).forEach(function(key) {
            return d3.selection.prototype.style.apply(getNodeEl(), [key, styles[key]]);
          });
        }
      }
  
      return tip
    }
  
    // Public: Set or get the direction of the tooltip
    //
    // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
    //     sw(southwest), ne(northeast) or se(southeast)
    //
    // Returns tip or direction
    tip.direction = function(v) {
      if (!arguments.length) return direction
      direction = v == null ? v : d3.functor(v)
  
      return tip
    }
  
    // Public: Sets or gets the offset of the tip
    //
    // v - Array of [x, y] offset
    //
    // Returns offset or
    tip.offset = function(v) {
      if (!arguments.length) return offset
      offset = v == null ? v : d3.functor(v)
  
      return tip
    }
  
    // Public: sets or gets the html value of the tooltip
    //
    // v - String value of the tip
    //
    // Returns html value or tip
    tip.html = function(v) {
      if (!arguments.length) return html
      html = v == null ? v : d3.functor(v)
  
      return tip
    }
  
    // Public: destroys the tooltip and removes it from the DOM
    //
    // Returns a tip
    tip.destroy = function() {
      if(node) {
        getNodeEl().remove();
        node = null;
      }
      return tip;
    }
  
    function d3_tip_direction() { return 'n' }
    function d3_tip_offset() { return [0, 0] }
    function d3_tip_html() { return ' ' }
  
    var direction_callbacks = {
      n:  direction_n,
      s:  direction_s,
      e:  direction_e,
      w:  direction_w,
      nw: direction_nw,
      ne: direction_ne,
      sw: direction_sw,
      se: direction_se
    };
  
    var directions = Object.keys(direction_callbacks);
  
    function direction_n() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.n.y - node.offsetHeight,
        left: bbox.n.x - node.offsetWidth / 2
      }
    }
  
    function direction_s() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.s.y,
        left: bbox.s.x - node.offsetWidth / 2
      }
    }
  
    function direction_e() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.e.y - node.offsetHeight / 2,
        left: bbox.e.x
      }
    }
  
    function direction_w() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.w.y - node.offsetHeight / 2,
        left: bbox.w.x - node.offsetWidth
      }
    }
  
    function direction_nw() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.nw.y - node.offsetHeight,
        left: bbox.nw.x - node.offsetWidth
      }
    }
  
    function direction_ne() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.ne.y - node.offsetHeight,
        left: bbox.ne.x
      }
    }
  
    function direction_sw() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.sw.y,
        left: bbox.sw.x - node.offsetWidth
      }
    }
  
    function direction_se() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.se.y,
        left: bbox.e.x
      }
    }
  
    function initNode() {
      var node = d3.select(document.createElement('div'))
      node
        .style('position', 'absolute')
        .style('top', 0)
        .style('opacity', 0)
        .style('pointer-events', 'none')
        .style('box-sizing', 'border-box')
  
      return node.node()
    }
  
    function getSVGNode(el) {
      el = el.node()
      if(el.tagName.toLowerCase() === 'svg')
        return el
  
      return el.ownerSVGElement
    }
  
    function getNodeEl() {
      if(node === null) {
        node = initNode();
        // re-add node to DOM
        document.body.appendChild(node);
      };
      return d3.select(node);
    }
  
    // Private - gets the screen coordinates of a shape
    //
    // Given a shape on the screen, will return an SVGPoint for the directions
    // n(north), s(south), e(east), w(west), ne(northeast), se(southeast), nw(northwest),
    // sw(southwest).
    //
    //    +-+-+
    //    |   |
    //    +   +
    //    |   |
    //    +-+-+
    //
    // Returns an Object {n, s, e, w, nw, sw, ne, se}
    function getScreenBBox() {
      var targetel   = target || d3.event.target;
  
      while ('undefined' === typeof targetel.getScreenCTM && 'undefined' === targetel.parentNode) {
          targetel = targetel.parentNode;
      }
  
      var bbox       = {},
          matrix     = targetel.getScreenCTM(),
          tbbox      = targetel.getBBox(),
          width      = tbbox.width,
          height     = tbbox.height,
          x          = tbbox.x,
          y          = tbbox.y
  
      point.x = x
      point.y = y
      bbox.nw = point.matrixTransform(matrix)
      point.x += width
      bbox.ne = point.matrixTransform(matrix)
      point.y += height
      bbox.se = point.matrixTransform(matrix)
      point.x -= width
      bbox.sw = point.matrixTransform(matrix)
      point.y -= height / 2
      bbox.w  = point.matrixTransform(matrix)
      point.x += width
      bbox.e = point.matrixTransform(matrix)
      point.x -= width / 2
      point.y -= height / 2
      bbox.n = point.matrixTransform(matrix)
      point.y += height
      bbox.s = point.matrixTransform(matrix)
  
      return bbox
    }
  
    return tip
  };

console.log('at the beginning!!')
console.log('jinja :', data)
obj = {
       
        disaster_subgroups : data[0].disaster_subgroups,
        disaster_frequencies : data[0].disaster_frequencies,
        disaster_subtypes : data[0].subtype_data,
        bubble_data: data[0].bubble_data
        
    }

console.log("subtypeeeeee: ",obj.bubble_data);
draw_world_map(obj);
drawStackedBarChart(obj);
drawBubbleChart(obj);
draw_time_series(obj);


function draw_time_series(obj){




    var svgWidth = 600, svgHeight = 400;
      var margin = {top: 10, right: 40, bottom: 100, left: 40};
      var margin2 = {top: 330, right: 40, bottom: 20, left: 40};
      var height = 350 - margin.top - margin.bottom;
      var height2 = 400 - margin2.top - margin2.bottom - 20;
  
      // Parse the date / time
      var parseDate = d3.timeParse("%Y-%m");
  
      var x = d3.scaleTime().range([0, svgWidth - margin.left - margin.right]);
      var x2 = d3.scaleTime().range([0, svgWidth - margin2.left - margin2.right]);
      var y = d3.scaleLinear().range([height, 0]);
      var y2 = d3.scaleLinear().range([height2, 0]);
  
      var xAxis = d3.axisBottom(x);
      var xAxis2 = d3.axisBottom(x2);
      var yAxis = d3.axisLeft(y);
  
      var brush = d3.brushX()
          .extent([[0, 0], [svgWidth - margin2.left - margin2.right, height2]])
          .on("brush end", brushed);
  
      var line = d3.line()
          .x(d => x(d.date))
          .y(d => y(d.value));
  
      var line2 = d3.line()
          .x(d => x2(d.date))
          .y(d => y2(d.value));
  
      var svg = d3.select("#chart2").append("svg")
          .attr("width", svgWidth - margin.left - margin.right)
          .attr("height", svgHeight);
  
  
      // Create a tooltip instance
      var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-5, 10])
      .html(function(d) {
          // if(disaster_frequencies[d.properties.name] != null){
          //     return "<span style='color:black;background-color: #fff'> " + d.properties.name + " : " + disaster_frequencies[d.properties.name][current_disaster] + "</span>";
          // }
          // else{
          //     return "<span style='color:black;background-color: #fff'> " + d.properties.name + " : " + 0 + "</span>";
          // }
          //console.log("inside time series tick : ", d)
          return "<span style='color:black;background-color: #fff'> " + d + " : " + 0 + "</span>";
      });
  
  
      // Invoke the tip in the context of your visualization
      svg.call(tip);
  
  
      var clip = svg.append("defs").append("svg:clipPath")
          .attr("id", "clip")
          .append("svg:rect")
          .attr("width", svgWidth - margin.left - margin.right)
          .attr("height", height)
          .attr("x", 0)
          .attr("y", 0);
  
      var Line_chart = svg.append("g")
          .attr("class", "focus")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .attr("clip-path", "url(#clip)")//;
          .attr("stroke-width", 2)
          // .on('mouseover', tip.show)
          // .on('mouseout', tip.hide);
      console.log('margin top :', margin2.top + height2)
      var focus = svg.append("g")
          .attr("class", "context")
          .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")"); //changed
  
      // Example data for two series
      var data1 = d3.range(100).map(function(d, i) {
          return {date: new Date(2010, d, 0), value: Math.random() * 100};
      });
  
      var data2 = d3.range(100).map(function(d, i) {
          console.log('d : ', d)
          return {date: new Date(2010, d, 0), value: Math.random() * 50 + 50};
      });
  
      x.domain(d3.extent(data1, function(d) { return d.date; }));
      y.domain([0, 150]);
      x2.domain(x.domain());
      y2.domain(y.domain());
  
      
  
  
  
      Line_chart.append("path")
          .datum(data1)
          .attr("class", "line")
          .attr("d", line)
          .attr("stroke", "steelblue")
          .attr("fill", "none")//;
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide);
  
      Line_chart.append("path")
          .datum(data2)
          .attr("class", "line")
          .attr("d", line)
          .attr("stroke", "red")
          .attr("fill", "none")//;
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide);
  
      focus.append("path")
          .datum(data1)
          .attr("class", "line")
          .attr("d", line2)
          .attr("stroke", "steelblue")
          .attr("fill", "none")
          .attr("trasform", "translate(0, 0)");// added 
          
  
      focus.append("path")
          .datum(data2)
          .attr("class", "line")
          .attr("d", line2)
          .attr("stroke", "red")
          .attr("fill", "none")//;
          .attr("trasform", "translate(0, 0)");// added
  
      focus.append("g")
          .attr("class", "brush")
          .attr("trasform", "translate(0, 0)")//;// added
          .call(brush)
          .call(brush.move, x.range());
  
      svg.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(" + margin.left + "," + (margin.top + height) + ")")
          .call(xAxis);
  
      svg.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(" + margin2.left + "," + (margin2.top + height2) + ")")
          .call(xAxis2);
  
      svg.append("g")
          .attr("class", "axis axis--y")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .call(yAxis);
  
      function brushed() {
          if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
          var s = d3.event.selection || x2.range();
          x.domain(s.map(x2.invert, x2));
          Line_chart.selectAll(".line").attr("d", line);
          svg.select(".axis--x").call(xAxis);
      }
  
      
  
      // Add an invisible overlay for capturing mouse events
      // svg.append("rect")
      // .attr("class", "overlay")
      // .attr("width", svgWidth - margin.left - margin.right)
      // .attr("height", height)
      // .style("fill", "none")
      // .style("pointer-events", "all")
      // .on("mousemove", moveLine)//;
      // // .on('mouseover', tip.show)
      // // .on('mouseout', tip.hide);
  
      // // Function to update line position dynamically
      // function moveLine() {
      //   // if(d3.mouse(this)[0] > margin.left && d3.mouse(this)[0] < svgWidth+margin.right+margin.left){
          
      //     // var x0 = x.invert(d3.mouse(this)[0]-margin.left) // Convert mouse position to date
      //     // nearestDate = new Date(Math.round((x0) / 1000) * 1000); // Round to nearest day or month as needed
      //     // console.log('line move x : ', x0, ' line : ', x(x0))
      //     // // Update the line's position
      //     // svg.select("line")
      //     //   .attr("x1", x(nearestDate))//-margin.left
      //     //   .attr("x2", x(nearestDate))//;
      //     //   // .attr("y1", 0)//-margin.left
      //     //   // .attr("y2", svgHeight)//;
      //     //   .on('mouseover', tip.show)
      //     //   .on('mouseout', tip.hide);
      //   // }
      // }
  
}

function draw_world_map(obj){

  

  disaster_frequencies = obj.disaster_frequencies;
  disaster_subgroups = obj.disaster_subgroups;
  d3.select('#world_map').selectAll('*').remove();
    var svg = d3.select("#world_map");//,
	width = 600,
	height = 400;

  console.log('map er width r height ', width, height);
    // NaturalEarth1 projection
    // Center(0, 0) with 0 rotation
    var gfg = d3.geoAitoff()
        .scale(width / 1.8 / Math.PI)
        .rotate([0, 0])
        .center([0, 0])
        .translate([width / 2, height / 2])


    var colorScale = d3.scaleLinear()
        .range(["#b25760","#381a1d"]).interpolate(d3.interpolateLab);
    

    // Done only for the colorScale parent.    
    disaster_values = []
    Object.keys(disaster_frequencies).forEach(key => {
      country = disaster_frequencies[key];
      for (const key2 in country) {
        if (country.hasOwnProperty(key2) && key2 === current_disaster) { // Check if the key is a direct property of the object
            disaster_values.push(country[key2]);
        }
      }
    
      // console.log(key, obj[key]);
    });
      
    colorScale.domain(d3.extent(disaster_values, function(d) {return d}));


    // Adding disaster group based label - legends
    console.log(' disaster group len : ', disaster_subgroups.length)

    const groupScale = d3.scaleSequential()
    .domain([0, disaster_subgroups.length])  // Example domain, adjust as needed
    .interpolator(d3.interpolateCool);  // Choose appropriate interpolator

    const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(10, 30)');


    const legendHeight = 100;
    const numStops = disaster_subgroups.length;  // Number of color stops
    const rectHeight = legendHeight / numStops;

    legend.selectAll('rect')
        .data(disaster_subgroups)
        .enter().append('rect')
        .attr('x', 0)
        .attr('y', (d, i) => height/1.5 - i * rectHeight)
        .attr('width', 20)
        .attr('height', rectHeight)
        .attr('fill', (d, i) => groupScale(i / numStops * 100))
        .style('cursor', 'pointer')  // Style as clickable
        .on('click', function(disaster, i) {
            // Handler for click event
            const color = groupScale(i / numStops * 100);
            handleLegendClick(color, disaster);
        });
    
    function handleLegendClick(color, disaster) {
        // Change something in the SVG based on the clicked color
       // console.log('Change Disaster Type!!!! : ', color, disaster)
        // svg.selectAll('.data-element')  // Assuming your elements have a class 'data-element'
        //     .style('fill', color);  // Example action: change their color
        current_disaster = disaster;
        draw_world_map(obj);
    }

    legend.selectAll('text')
    .data(disaster_subgroups, d => d)
    .enter().append('text')
    .attr('x', 25)  // Position text to the right of the rectangles
    .attr('y', (d, i) => height / 1.5 - (i * rectHeight - rectHeight))
    .text(d => d)
    .attr('alignment-baseline', 'middle');


    // Loading the json data
    /* Used json file stored at https://raw.githubusercontent.com/janasayantan
    /datageojson/master/world.json*/
    d3.json(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
        function(data){
            console.log('map done : ', data)
        // Drawing the map
        svg.append("g")
            .selectAll("path")
            .data(data.features)
            .enter().append("path")
                .attr("fill", "Black")
                .attr("d", d3.geoPath()
                .projection(gfg)
                )
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .on('click', function(d){ 
                    console.log("Need to change things based on the click here. printing data : ", d);
                    // dashboard_click(d.properties.name);
                })
                .attr('fill', function(d,i) {
                    
                    
                    if(disaster_frequencies[d.properties.name] != null){
                        //console.log("freq of ", d.properties.name, disaster_frequencies[d.properties.name][current_disaster])
                        var freq = disaster_frequencies[d.properties.name][current_disaster]
                        //console.log(d.properties.name, ' freq : ', freq);
                        return colorScale(freq);
                    }
                    else{
                        return colorScale(0)
                    }
                })
                .style("stroke", "#9999")

               
                

    })

    const defs = svg.append('defs');
        const linearGradient = defs.append('linearGradient')
        .attr('id', 'linear-gradient');

    // Set up the gradient from 0% to 100%
    linearGradient.selectAll('stop')
        .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
        .enter().append('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color);
    svg.append('rect')
        .attr('width', 300)
        .attr('height', 10)
        .style('fill', 'url(#linear-gradient)')
        .attr('transform', 'translate(50,10)');

    const legendScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([0, 300]);
    
    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5);  // Adjust the number of ticks based on your preference
    
    svg.append('g')
        .attr('transform', 'translate(50,20)')
        .call(legendAxis);

    // Create a tooltip instance
    var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-5, 10])
    .html(function(d) {
        if(disaster_frequencies[d.properties.name] != null){
            return "<span style='color:black;background-color: #fff'> " + d.properties.name + " : " + disaster_frequencies[d.properties.name][current_disaster] + "</span>";
        }
        else{
            return "<span style='color:black;background-color: #fff'> " + d.properties.name + " : " + 0 + "</span>";
        }
    });


    // Invoke the tip in the context of your visualization
    svg.call(tip);
    console.log('d3.map : ', d3.map())





}
function drawStackedBarChart(obj) {
  var subtypes = obj.disaster_subtypes;
  var excludeTypes = new Set(['Animal accident', 'Glacial lake outburst', 'Impact', 'Insect infestation', 'Mass movement (dry)','Volcanic activity']);

    // Filter out the specified disaster types
    subtypes = subtypes.filter(function(d) {
        return !excludeTypes.has(d['Disaster Type']);
    });

  var margin = {top: 20, right: 20, bottom: 60, left: 60},
  width = 600 - margin.left - margin.right, // Adjust width as needed
  height = 400 - margin.top - margin.bottom; // Adjust height as needed

d3.select('#stacked_bar_chart').selectAll('*').remove();

var svg = d3.select("#stacked_bar_chart").append("svg")
    // .attr("preserveAspectRatio", "xMinYMin meet")
    // .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
    // .classed("svg-content-responsive", true)
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)  
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleBand()
      .rangeRound([0, width])
      .padding(0.1)
      .domain(subtypes.map(function(d) { return d['Disaster Type']; }));

  var scale_factor = 1000000; // Scale down by a million

  // Ensure we stack in the correct order: Total Affected, Total Deaths, then No Injured
  var stack = d3.stack()
      .keys(['Total Deaths', 'No Injured'])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

  // Calculate stack data and scale it down
  var layers = stack(subtypes.map(function(d) {
      return {
          'Disaster Type': d['Disaster Type'],
          'Total Deaths': d['Total Deaths'] / scale_factor,
          'No Injured': d['No Injured'] / scale_factor
      };
  }));

  // Find the max value for the y-axis scale
  var maxY = d3.max(layers, function(layer) {
      return d3.max(layer, function(d) {
          return d[1]; // d[1] is the top of the stack
      });
  });

  var y = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0, maxY]);

  // Use colors that represent the severity of the category
  var color = d3.scaleOrdinal()
      .range([ "#BC5F04", "#874000"])
      .domain([ 'Total Deaths', 'No Injured']);

      var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
         
          var value = (d[1] - d[0]) * scale_factor;
          var key = d[0] === d.data['Total Deaths'] ? 'Total Deaths' : 'No Injured';
          // Now that we've determined the key, we can display it along with the value in the tooltip.
          return "<strong>Disaster Type:</strong> <span style='color:red'>" + d.data['Disaster Type'] + "</span><br>" +
                 "<strong>" + key + ":</strong> <span style='color:red'>" + value.toFixed(2) + "</span>"; // toFixed(2) for formatting
      });
    

  svg.call(tip);

  // Draw each layer
  svg.selectAll(".layer")
      .data(layers)
      .enter().append("g")
      .attr("class", "layer")
      .attr("fill", function(d) { return color(d.key); })
      .selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
      .attr("x", function(d) { return x(d.data['Disaster Type']); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

  // Add the X Axis
  svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // Add the Y Axis with label formatting to indicate values are in millions
  svg.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10).tickFormat(function(d) { return d + 'M'; }));
}
function drawBubbleChart(obj) {
  console.log("dhukseeeeeee")
  var bubbleData = obj.bubble_data;
  const margin = { top: 20, right: 20, bottom: 60, left: 60 },
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
  d3.select('#bubble-chart').selectAll('*').remove();
  const svg = d3.select('#bubble-chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear()
      .domain([0, 10000000])  // Adjusted maximum value to 50,000,000
      .range([0, width]);
  
  // Define y-scale for 'Total Damages'
  const yScale = d3.scaleLinear()
      .domain([0, 10000000])  // Adjusted maximum value to 80,000,000
      .range([height, 0]);

  const maxRadius = Math.min(width / 15, height /15); // Adjust the factor as needed

  const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(bubbleData, d => d['Total Deaths'])])
        .range([0, maxRadius]);
  // Append x-axis
  svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

  // Append y-axis
  svg.append('g')
      .call(d3.axisLeft(yScale));

  // Append bubbles
  svg.selectAll('.bubble')
      .data(bubbleData)
      .enter().append('circle')
      .attr('class', 'bubble')
      .attr('cx', d => xScale(d['Total Affected']))
      .attr('cy', d => yScale(d['Total Damages']))
      .attr('r', d => sizeScale(d['Total Deaths']))
      .style('fill', '#D48C70');

  // Optionally, you can add labels, titles, or a legend here
}