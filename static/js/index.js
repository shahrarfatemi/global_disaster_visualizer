// d3.tip
// Copyright (c) 2013 Justin Palmer
// ES6 / D3 v4 Adaption Copyright (c) 2016 Constantin Gavrilete
// Removal of ES6 for D3 v4 Adaption Copyright (c) 2016 David Gotz
//
// Tooltips for d3.js SVG visualizations
// var current_disaster = 'Meteorological'
var color1= "#c6867a"
var color2="#fdedec"
const colorSunBurst = d3.scaleOrdinal(d3.schemeCategory10);
const port = 8000;
var currentYear = "All"
var currentCountry = "All"
var currentGroup = "All"
var currentSubGroup = "All"
var currentSubType = "All"
var type = "Natural"
const mainSubGroups = ['Meteorological', 'Geophysical', 'Hydrological', 'Climatological', 'Biological', 'Extra-terrestrial']
const yearValues = ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2010-2021']

const mainColor = {
  Hydrological: "#87c9bd",
  Biological: "#fc037b",
  Flood: "#5fada1",
  Epidemic: "#d971a3",
  Wildfire: "#F76350",
  Drought: "#AC6A5D",
  Climatological: "#db6356",
  Geophysical: "#b5a484",
  Landslide: "#3d7d85",
  Storm: "#0d2f85",
  Meteorological: "#b787c9",
  Temp: "#9c2619",
  Natural: "#F9988B",
  Earthquake: "#6A5D4D"
}

const rangeColor = {
  Hydrological_Light:"#a1ddd9" ,
  Hydrological_Deep:"#5d8a81" ,
  Biological_Light:"#fd5ca4",
  Biological_Deep:"#b00258",
  Flood_Light:"#7cc5bb",
  Flood_Deep:"#42776f" ,
  Epidemic_Light:"#ec9dc0" ,
  Epidemic_Deep:"#a3557a" ,
  Wildfire_Light:"#ff8975",
  Wildfire_Deep:"#c54a3b",
  Drought_Light:"#c49185",
  Drought_Deep:"#794d43",
  Climatological_Light:"#ef8578" ,
  Climatological_Deep:"#a94639" ,
  Geophysical_Light:"#cec3a6" ,
  Geophysical_Deep:"#82775d" ,
  Landslide_Light:"#64a1ae" ,
  Landslide_Deep:"#2b5962",
  Storm_Light:"#4a5bae" ,
  Storm_Deep:"#0a2366",
  Meteorological_Light:"#d0aae2",
  Meteorological_Deep:"#8a66a0" ,
  Temp_Light:" #bf6048",
  Temp_Deep:"#731c13",
  Natural_Light:"#d9786c",
  Natural_Deep:"#ffbab9" ,
  Earthquake_Light:"#4d4439" ,
  Earthquake_Deep: "#95897c"
}

const newRangeColor = {
  Hydrological_Light2:"#b7e0db",
  Hydrological_Deep2:"#599ea0",

  Biological_Light2:"#ff86c2",
  Biological_Deep2:"#d1006e",

  Flood_Light2:"#8fd0c4",
  Flood_Deep2:"#327a74",

  Epidemic_Light2:"#eba3c3",
  Epidemic_Deep2:"#b04e7d",

  Wildfire_Light2:"#ff9b79",
  Wildfire_Deep2:"#c84c29",

  Drought_Light2:"#d4a488",
  Drought_Deep2:"#7f5844",

  Climatological_Light2:"#f49c8e",
  Climatological_Deep2:"#b24334",

  Geophysical_Light2:"#cdc6af",
  Geophysical_Deep2:"#7a7356",

  Landslide_Light2:"#7cb4c0",
  Landslide_Deep2:"#296970",

  Storm_Light2:"#6782be",
  Storm_Deep2:"#0c3470",

  Meteorological_Light2:"#e6c3f0",
  Meteorological_Deep2:"#976cb4",

  Temp_Light2:"#d6806f",
  Temp_Deep2:"#7b321e",

  Natural_Light2:"#ffa39b",
  Natural_Deep2:"#d96761",

  Earthquake_Light2:"#878571",
  Earthquake_Deep2:"#57594b"
}

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
  
  
    tip.attr = function(n, v) {
      if (arguments.length < 2 && typeof n === 'string') {
        return getNodeEl().attr(n)
      } else {
        var args =  Array.prototype.slice.call(arguments)
        d3.selection.prototype.attr.apply(getNodeEl(), args)
      }
  
      return tip
    }

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
  
  
    tip.direction = function(v) {
      if (!arguments.length) return direction
      direction = v == null ? v : d3.functor(v)
  
      return tip
    }
  
    
    tip.offset = function(v) {
      if (!arguments.length) return offset
      offset = v == null ? v : d3.functor(v)
  
      return tip
    }
  
  
    tip.html = function(v) {
      if (!arguments.length) return html
      html = v == null ? v : d3.functor(v)
  
      return tip
    }
  
    
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
        bubble_data: data[0].bubble_data,
        sunburst_data: data[0].sunburst_data,
        top_countries: data[0].top_countries
        
    }

console.log("top_countriess:... ",obj.top_countries);

// draw_world_map(currentYear, currentGroup, currentSubType, color1, color2); // year, group, subtype
drawSunBurst(obj);
drawHistogram(obj, type);

draw_rad_viz(currentYear);
draw_world_map(currentYear, currentSubGroup, currentGroup, color1, color2); // year, group, subtype
draw_bar_chart(currentYear, currentSubType, currentCountry); // year, disaster type, country
draw_time_series3(currentYear, currentCountry, currentGroup, currentSubGroup); // year, country, group, subtype
make_slider()
function make_slider(){
  range = yearValues.length - 1//obj.eig_values.length
  intr = range // 8
  if(intr == range){

    currentYear = "All"
  }
  else{

  currentYear = yearValues[intr]
  }
  const slider = d3.select("#slider")
      .attr("value", intr)
      .attr("min", 0)
      .attr("max", range)
      .style("width", "30%") // Set the width of the slider
      .style("background-color", "#F3FFB6");
  slider.node().value = intr;
  var sliderValue = d3.select("#sliderValue");
  sliderValue.text("Year : " + yearValues[slider.property("value")])
  sliderValue.style("fill", "white"); 
  sliderValue.attr("transform", "translate(" + 800 + "," + 0 + ")")
  
  // Update value when slider is changed
  slider.on("input", function() {
    var value = this.value;
    console.log("slider value : ", yearValues[value])

    currentYear = yearValues[value]
    sliderValue.text("Year : " + yearValues[value])
    sliderValue.style("fill", "white"); 
    
    // intr_d = "PC"+value;
    // pca_plot(obj)
    // matrix_plot(obj)
    if(value < yearValues.length - 1){
      currentYear = yearValues[value]
    }
    else{
      currentYear = "All"
    }

    if(currentGroup == "subgroup"){
      // console.log('clicked node :', category)
      // currentGroup = "subgroup"
      // currentSubGroup = category
      // console.log('after clicked : ', currentYear, currentGroup, currentSubGroup, currentCountry)
      draw_world_map(currentYear, currentGroup, currentSubGroup, rangeColor[currentSubGroup+"_Light"], rangeColor[currentSubGroup+"_Deep"],); // year, group, subtype
      draw_bar_chart(currentYear, currentSubType, currentCountry); // year, disaster type, country
      draw_time_series3(currentYear, currentCountry, currentGroup, currentSubGroup); // year, country, group, subtype
      draw_rad_viz(currentYear);
    }
    else if(currentGroup == "All"){
      // currentGroup = "All"
      // currentSubGroup = "All"
      // currentSubType = "All"
      console.log('after clicked : ', currentYear, currentGroup, currentSubGroup, currentCountry)
      draw_world_map(currentYear, currentGroup, currentSubGroup, rangeColor["Natural_Light"], rangeColor["Natural_Deep"],); // year, group, subtype
      draw_bar_chart(currentYear, currentSubType, currentCountry); // year, disaster type, country
      draw_time_series3(currentYear, currentCountry, currentGroup, currentSubGroup); // year, country, group, subtype
      draw_rad_viz(currentYear);
      
    }
    else{
      // currentGroup = "subtype"
      // currentSubType = category
      console.log('after clicked : ', currentYear, currentGroup, currentSubType, currentCountry)
      draw_world_map(currentYear, currentGroup, currentSubType, rangeColor[currentSubType+"_Light"], rangeColor[currentSubType+"_Deep"],); // year, group, subtype
      draw_bar_chart(currentYear, currentSubType, currentCountry); // year, disaster type, country
      draw_time_series3(currentYear, currentCountry, currentGroup, currentSubType); // year, country, group, subtype
      draw_rad_viz(currentYear);
    }
    var histType = ""
    if(currentGroup == "subgroup"){
      histType = currentSubGroup
    }
    else if(currentGroup == "subtype"){
      histType = currentSubType
    }
    else{
      histType = "Natural"
    }
    if(currentYear == "All"){
      objBody = { subtype: histType }
    }
    else{
      objBody = { subtype: histType, year: currentYear }
    }
    type = histType
    fetch('/top_countries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subtype: histType, year : currentYear })
    })
    .then(response => response.json())  // Convert the response to JSON
    .then(data => {
        console.log("Data received:", data);
        drawHistogram(data, type);  // Pass the data directly to the drawHistogram function
    })
  });

}

function draw_time_series3(year, var_country, group, sub_type){
  const url = new URL('http://localhost:'+port+'/timeseries');
  url.searchParams.append('year', year);
  url.searchParams.append('country', var_country);
  url.searchParams.append('group', group);
  url.searchParams.append('sub_type', sub_type);
  // var values = null
  
  fetch(url)
      .then(response => response.json())
      .then(data => {
  var total_affected_data = data.total_affected_data; //obj
  var total_death_data = data.total_death_data;
        console.log('time series fetched : ', total_affected_data, total_death_data)
  t_data = {}
  if(var_country == "All"){
    Object.keys(total_affected_data).forEach(key => {
      country = total_affected_data[key];
        Object.keys(country).forEach(key2 =>{
          if (!t_data[key2]) {
              t_data[key2] = 0;  // Initialize if not already present
          }

          t_data[key2] += parseInt(country[key2]);  // Increment the count

          });

        });
    
  }
  else{
    Object.keys(total_affected_data).forEach(key => {
      if(var_country == key){
        country = total_affected_data[key]
        Object.keys(country).forEach(key2 =>{
          if (!t_data[key2]) {
              t_data[key2] = 0;  // Initialize if not already present
          }

          t_data[key2] += parseInt(country[key2]);  // Increment the count

          });
      }
    });
  }

  // for data2
  t_data2 = {}
  if(var_country == "All"){
    Object.keys(total_death_data).forEach(key => {
      country = total_death_data[key];
        Object.keys(country).forEach(key2 =>{
          if (!t_data2[key2]) {
              t_data2[key2] = 0;  // Initialize if not already present
          }

          t_data2[key2] += parseInt(country[key2]/3);  // Increment the count

          });

        });
    
  }
  else{
    Object.keys(total_death_data).forEach(key => {
      if(var_country == key){
        country = total_death_data[key]
        Object.keys(country).forEach(key2 =>{
          if (!t_data2[key2]) {
              t_data2[key2] = 0;  // Initialize if not already present
          }

          t_data2[key2] += parseInt(country[key2]/3);  // Increment the count

          });
      }
    });
  }

  // Parse the date / time
  var parseDate = d3.timeParse("%Y-%m");
  // var parseDate = d3.timeParse("%Y-%m-%d");//d3.timeParse("%Y-%m-%d");

  var data1 = []
  // console.log('trying date parsing : ', parseDate("2023-04-26"));
  Object.keys(t_data).forEach(k => {
    // console.log('actual data : ', parseDate(k))
    data1.push({
      date: parseDate(k),
      value : t_data[k]
    });
  });

    // for data2
  var data2 = []
  // console.log('trying date parsing : ', parseDate("2023-04-26"));
  Object.keys(t_data2).forEach(k => {
    // console.log('actual data : ', parseDate(k))
    data2.push({
      date: parseDate(k),
      value : t_data2[k]
    });
  });

  data1.sort((a, b) => a.date - b.date);
  data2.sort((a, b) => a.date - b.date);
  // data collecting finished

  console.log('data 1 : ', data1)
  console.log('data 2 : ', data2)  

    var svgWidth = 600, svgHeight = 400;
      var margin = {top: 10, right: 40, bottom: 100, left: 60}; //top:10, bottom:100
      var margin2 = {top: 330, right: 40, bottom: 20, left: 60}; // bottom 20, top : 330
      var height = svgHeight - margin.top - margin.bottom; //350
      var height2 = svgHeight - margin2.top - margin2.bottom-20;
  
  
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
      d3.select('#chart2').selectAll('*').remove();
      var svg = d3.select("#chart2").append("svg")
          .attr("width", svgWidth - margin.left - margin.right)
          .attr("height", svgHeight);
  
  
      
  
  
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
  
      
      // Combine the two lists
      const combinedList = [...data1, ...data2];
      console.log('combined : ', combinedList)
      // Use Array.map to extract 'value' from each object, then apply Math.max to the resulting array
      var maxValue = Math.max(...combinedList.map(obj => obj.value)) + 2;
      console.log('max Value :', maxValue)
      if(maxValue > 150){
        maxValue = 150
      }


      x.domain(d3.extent(data1, function(d) { return d.date; }));
      y.domain([0, maxValue]); // 1500
      x2.domain(x.domain());
      y2.domain(y.domain());
      
      var tip = d3.tip()
      .attr('class', 'd3_tip')
      .offset([-5, 10])
      .html(function(d) {
          return "try";
      });
      
  //add title
      svg.append("text")
      .attr("x", svgWidth / 2-30)
      .attr("y", 0 - (margin.top / 2)+30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Time Series Analysis")
      .style("fill", mainColor["Hydrological"]);

  // Add the X Axis
      svg.append("g")
      .attr("transform", "translate(0," + svgHeight + ")")
      .call(xAxis2)
      .append("text")
      .attr("y",  0) // -120
      .attr("x", svgWidth / 2)
      .attr("text-anchor", "end")
      .attr("stroke", "black")
      .style("font-size", "12px")
      .text("Date");

  // Add the Y Axis
      svg.append("g")
      .call(yAxis)
      .append("text")
      // .attr("y", svgHeight/2)
      // .attr("x",10)
      .attr("transform", "rotate(-90)")
      .attr("x", - svgHeight / 3)
      .attr("y", 15)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .style("font-size", "12px")
      .text("Frequency");
  
      Line_chart.append("path")
          .datum(data1)
          .attr("class", "line")
          .attr("d", line)
          .attr("stroke", "#CA743F")// no injured
          .attr("fill", "none")//;
          // .on('mouseover', tip.show)
          // .on('mouseout', tip.hide);
  
      Line_chart.append("path")
          .datum(data2)
          .attr("class", "line")
          .attr("d", line)
          .attr("stroke", "#F3FFB6") // no death
          .attr("fill", "none")//;
      var legend = svg.selectAll(".legend")
          .data(["Average Injured Per Month", "Average Death Per Month"])
          .enter().append("g")
          .attr("class", "legend")
          .style("font-size", "12px")
          .attr("transform", (d, i) => `translate(${0},${i * 20})`);

      legend.append("rect")
          .attr("x",  svgWidth - 130)
          .attr("y", 13)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", (d, i) => i === 0 ? "#CA743F" : "#F3FFB6");

      legend.append("text")
          .attr("x",  svgWidth + 40)
          .attr("y", 19)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(d => d);
      var verticalLine = Line_chart.append("line")
      .attr("class", "vertical-line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", height)
      .attr("stroke", "#ff0000") // Red line for visibility
      .attr("stroke-width", 1)
      .style("opacity", 0); // Initially hidden
      Line_chart.append("rect")
    .attr("class", "overlay")
    .attr("width", svgWidth - margin.left - margin.right)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", () => verticalLine.style("opacity", 1)) // Show line on mouseover
    .on("mouseout", () => verticalLine.style("opacity", 0)) // Hide line on mouseoutmouseout
    .on("mousemove", mousemove); // mousemove


    function mousemove() {
      var x0 = d3.mouse(this)[0], // Get the x position of the mouse
          xDate = x.invert(x0), // Convert the x position to a date
          bisectDate = d3.bisector(function(d) { return d.date; }).left,
          index = bisectDate(data1, xDate, 1),
          d0 = data1[index - 1],
          d1 = data1[index],
          d = xDate - d0.date > d1.date - xDate ? d1 : d0; // Find closest data point
  
      // Update the line position
      verticalLine
          .attr("transform", "translate(" + x(d.date) + ",0)");


    }
    svg.call(tip)
      /////////////////

      focus.append("path")
          .datum(data1)
          .attr("class", "line")
          .attr("d", line2)
          .attr("stroke", "#E0A458")
          .attr("fill", "none")
          .attr("trasform", "translate(0, 0)");// added 
          
  
      focus.append("path")
          .datum(data2)
          .attr("class", "line")
          .attr("d", line2)
          .attr("stroke", "#544343")
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
          // y.domain([0, 180]); // 1500
          Line_chart.selectAll(".line").attr("d", line);
          svg.select(".axis--x").call(xAxis);
      }
  
    })
    .catch(error => console.error('Error:', error));    
}





function draw_world_map(year, group, sub_type, color1, color2){ // group can be : subgroup, subtype, All

  
    const url = new URL('http://localhost:'+port+'/worldmap');
    url.searchParams.append('year', year);
    url.searchParams.append('group', group);
    url.searchParams.append('sub_type', sub_type);
    // var values = null
    
    fetch(url)
        .then(response => response.json())
        .then(data => {

          disaster_frequencies = data.disaster_frequencies;
          disaster_subgroups = data.disaster_subgroups;

          console.log('fetched map : ', disaster_frequencies, disaster_subgroups)
          
          var svgWidth = 700, svgHeight = 450;
          var margin = {top: 10, right: 40, bottom: 100, left: 20};
          
          d3.select('#world_map').selectAll('*').remove();
          var svg = d3.select("#world_map")
            .attr("width", svgWidth - margin.left - margin.right)
            .attr("height", svgHeight);//,
          width = svgWidth;
          height = svgHeight;

          svg.append("text")
            .attr("x", (svgWidth / 2))             
            .attr("y", margin.top + 20) // You can adjust the 20 to position the title vertically
            .attr("text-anchor", "middle") // This ensures the text is centered
            .style("font-size", "20px") // Adjust font size as needed
            .style("font-weight", "bold") // Makes the text bold
            .style("fill", mainColor["Hydrological"])
            .text("Disasters Across the World");
          var gfg = d3.geoAitoff()
              .scale(width / 1.8 / Math.PI)
              .rotate([0, 0])
              .center([0, 0])
              .translate([width / 2, height / 2])


          
          

          // Done only for the colorScale parent.    
          disaster_values = []
          if(group != "All"){
            Object.keys(disaster_frequencies).forEach(key => {
              country = disaster_frequencies[key];
              for (const key2 in country) {
                if (country.hasOwnProperty(key2) && key2 === sub_type) { // Check if the key is a direct property of the object
                    disaster_values.push(country[key2]);
                }
              }
            
              // console.log(key, obj[key]);
            });
          }
          console.log('not all : ', disaster_values)  
          if(group !== "All"){
            var colorScale = d3.scaleLinear()
                .range([color1, color2]).interpolate(d3.interpolateLab);
            colorScale.domain(d3.extent(disaster_values, function(d) {return d}));
          }

          subgroups = ['Meteorological', 'Geophysical', 'Hydrological', 'Climatological', 'Biological']
          if(group != "All"){
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
                              console.log("Need to change things based on the click here. printing data : ", d.properties.name);
                              // change
                              if(disaster_frequencies[d.properties.name] != null){
                                if(currentCountry == d.properties.name){currentCountry = "All"}
                              
                                else{currentCountry = d.properties.name;}
                                if(currentGroup == "subgroup"){
                                  draw_bar_chart(currentYear, currentSubType, currentCountry); // year, disaster type, country
                                  draw_time_series3(currentYear, currentCountry, currentGroup, currentSubGroup); // year, country, group, subtype
                                  draw_rad_viz(currentYear);
                                }
                                else if(currentGroup == "All"){
                                  console.log('after clicked : ', currentYear, currentGroup, currentSubGroup, currentCountry)
                                  // draw_world_map(currentYear, currentGroup, currentSubGroup, rangeColor["Natural_Light"], rangeColor["Natural_Deep"],); // year, group, subtype
                                  draw_bar_chart(currentYear, currentSubType, currentCountry); // year, disaster type, country
                                  draw_time_series3(currentYear, currentCountry, currentGroup, currentSubGroup); // year, country, group, subtype
                                  draw_rad_viz(currentYear);
                                  
                                }
                                else{
                                  // currentGroup = "subtype"
                                  // currentSubType = category
                                  console.log('after clicked : ', currentYear, currentGroup, currentSubType, currentCountry)
                                  // draw_world_map(currentYear, currentGroup, currentSubType, rangeColor[currentSubType+"_Light"], rangeColor[currentSubType+"_Deep"],); // year, group, subtype
                                  draw_bar_chart(currentYear, currentSubType, currentCountry); // year, disaster type, country
                                  draw_time_series3(currentYear, currentCountry, currentGroup, currentSubType); // year, country, group, subtype
                                  draw_rad_viz(currentYear);
                                }

                              }
                              
                              
                              // dashboard_click(d.properties.name);
                          })
                          .attr('fill', function(d,i) {
                              
                              
                              if(disaster_frequencies[d.properties.name] != null){
                                  // console.log("freq of ", d.properties.name, disaster_frequencies[d.properties.name][current_disaster])
                                  country_data = disaster_frequencies[d.properties.name]
                                  
                                    var freq = country_data[sub_type]
                                    // console.log(d.properties.name, ' freq : ', freq);
                                    return colorScale(freq);
                                  
                              }
                              else{
                                  return colorScale(0)
                                  // return mainColor["Temp"]
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
            // console.log('disaster max : ', d3.max(disaster_values))
            svg.append('rect')
                .attr('width', 10)
                .attr('height', 300)
                .style('fill', 'url(#linear-gradient)')
                .attr('transform', 'translate(50,80)');

            const legendScale = d3.scaleLinear()
                .domain(colorScale.domain())
                .range([0, 300]);
            
            const legendAxis = d3.axisLeft(legendScale)
                .ticks(5);  // Adjust the number of ticks based on your preference
            
            svg.append('g')
                .attr('transform', 'translate(50,80)')
                .call(legendAxis);

            // Create a tooltip instance
            var tip = d3.tip()
            .attr('class', 'd3_tip')
            .offset([-10, 0])
            .html(function(d) {
                if(disaster_frequencies[d.properties.name] != null){
                    return `${d.properties.name} : ${disaster_frequencies[d.properties.name][sub_type]}`;
                }
                else{
                    return `${d.properties.name} : 0`;
                }
            });

            

            // Invoke the tip in the context of your visualization
            svg.call(tip);
            console.log('d3.map : ', d3.map())

          }
          else{
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
                              console.log("Need to change things based on the click here. printing data : ", d.properties.name);
                              // change
                              if(disaster_frequencies[d.properties.name] != null){
                                if(currentCountry == d.properties.name){currentCountry = "All"}
                              
                                else{currentCountry = d.properties.name;}
                                if(currentGroup == "subgroup"){

                                  draw_bar_chart(currentYear, currentSubType, currentCountry); // year, disaster type, country
                                  draw_time_series3(currentYear, currentCountry, currentGroup, currentSubGroup); // year, country, group, subtype
                                  draw_rad_viz(currentYear);
                                }
                                else if(currentGroup == "All"){
                                  // currentGroup = "All"
                                  // currentSubGroup = "All"
                                  // currentSubType = "All"
                                  console.log('after clicked : ', currentYear, currentGroup, currentSubGroup, currentCountry)
                                  // draw_world_map(currentYear, currentGroup, currentSubGroup, rangeColor["Natural_Light"], rangeColor["Natural_Deep"],); // year, group, subtype
                                  draw_bar_chart(currentYear, currentSubType, currentCountry); // year, disaster type, country
                                  draw_time_series3(currentYear, currentCountry, currentGroup, currentSubGroup); // year, country, group, subtype
                                  draw_rad_viz(currentYear);
                                  
                                }
                                else{
                                  // currentGroup = "subtype"
                                  // currentSubType = category
                                  console.log('after clicked : ', currentYear, currentGroup, currentSubType, currentCountry)
                                  // draw_world_map(currentYear, currentGroup, currentSubType, rangeColor[currentSubType+"_Light"], rangeColor[currentSubType+"_Deep"],); // year, group, subtype
                                  draw_bar_chart(currentYear, currentSubType, currentCountry); // year, disaster type, country
                                  draw_time_series3(currentYear, currentCountry, currentGroup, currentSubType); // year, country, group, subtype
                                  draw_rad_viz(currentYear);
                                }

                              }
                              // currentCountry = d.properties.name;
                              // draw_time_series2(obj, 'All', 'All', 'All', 'All');
                              // dashboard_click(d.properties.name);
                          })
                          .attr('fill', function(d,i) {
                              
                              
                              if(disaster_frequencies[d.properties.name] != null){
                                  // console.log("freq of ", d.properties.name, disaster_frequencies[d.properties.name][current_disaster])
                                  // if(flag == true){
                                country_data = disaster_frequencies[d.properties.name]
                                mxKey = ""
                                v = -1
                                Object.keys(country_data).forEach(key => {
                                  if(country_data[key] > v){
                                    v = country_data[key]
                                    mxKey = key
                                  }
                                });

                                if(v > -1){
                                  // console.log(' mxkey : ', mxKey)
                                  // return colorScale(mxKey)
                                  return mainColor[mxKey]
                                }
                                else{
                                  // return colorScale(0)
                                  return mainColor['Temp']
                                } 
                              }
                              else{
                                  // return colorScale(0)
                                  return mainColor['Temp']
                              }
                          })
                          .style("stroke", "#9999")

                        

            })

          

            var tip = d3.tip()
            .attr('class', 'd3_tip')
            .offset([-5, 10])
            .html(function(d) {
                if(disaster_frequencies[d.properties.name] != null){
                    // console.log('why undefined : ', disaster_subgroups)
                    return `${d.properties.name} : ${disaster_subgroups[d.properties.name]}`;
                }
                else{
                    return `${d.properties.name} : N/A`;
                }
            });

            // var tip = d3.tip()
            // .attr('class', 'd3_tip')
            // .offset([-10, 0])
            // .html(function(d) { return `${d['name']}`; });
            // Invoke the tip in the context of your visualization
            svg.call(tip);



            ////////////////////
            const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(50, 30)');


            const legendHeight = 100;
            const numStops = subgroups.length;  // Number of color stops
            const rectHeight = legendHeight / numStops;

            legend.selectAll('rect')
                .data(subgroups)
                .enter().append('rect')
                .attr('x', 0)
                .attr('y', (d, i) => height/1.5 - i * rectHeight+5)
                .attr('width', 20)
                .attr('height', rectHeight)
                .attr('fill', (d) => mainColor[d])
                .style('cursor', 'pointer')  // Style as clickable
                .style('stroke', 'black')
                .style('stroke-width', 3)

            legend.selectAll('text')
            .data(subgroups, d => d)
            .enter().append('text')
            .attr('x', 25)  // Position text to the right of the rectangles
            .attr('y', (d, i) => height / 1.5 - (i * rectHeight - rectHeight))
            .text(d => d)
            .style("font-size", "12px")
            .attr('alignment-baseline', 'middle');

            ////////////////

          }
          
  })

  .catch(error => console.error('Error:', error));

}



function buildHierarchy(records) {
  const root = { name: "root", children: [] };

  records.forEach(record => {
      let currentLevel = root; // Start at the root

      // Go through each hierarchy level: Group, Subgroup, Type
      ['Disaster Group','Disaster Subgroup','Disaster Type'].forEach(levelKey => {
          // Look for an existing child
          let existingChild = currentLevel.children.find(c => c.name === record[levelKey]);
          if (!existingChild) {
              existingChild = { name: record[levelKey], children: [] };
              currentLevel.children.push(existingChild);
          }
          currentLevel = existingChild; // Move down the tree
      });

      // The leaf node contains the count
      currentLevel.size = record['Count']; // Assign the size in the leaf
  });

  return root;
}


function drawSunBurst(obj) {
  const data = obj.sunburst_data;
  const hierarchy = buildHierarchy(data); // Build the hierarchy from the flat data

  const width = 800;  // Increase the width for a better fit
  const height = 800; // Match height to width to maintain aspect ratio
  const radius = Math.min(width, height) / 8;  

  const partition = data => {
      const root = d3.hierarchy(data)
          .sum(d => d.size) // Use size to determine the weight of the node
          .sort((a, b) => b.value - a.value);
      return d3.partition()
          .size([2 * Math.PI, root.height + 1])
          (root);
  };

  const root = partition(hierarchy);
  const leaves = root.leaves();
  // const color = d3.scaleOrdinal(d3.schemeCategory10);
  color = colorSunBurst;
  console.log("check color sun : ", color("Meteorological"))
  const expandedRadius = radius * 1.1; 
  let clickedNode = null;
  const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(0.01)
    .padRadius(radius)
    .innerRadius(d => d.y0 * radius)
    .outerRadius(d => d.y1 * radius);
  const svg = d3.select('#stacked_bar_chart').append('svg')
      .attr('viewBox', [-width / 2, -height / 2, width, height])
      .style('font', '10px sans-serif');

  const paths = svg.append('g')
    .attr('fill-opacity', 0.6)
    .selectAll('path')
    .data(root.descendants().filter(d => d.depth))
    .enter().append('path')
    // .attr('fill', d => color(d.ancestors().reverse().map(d => d.data.name).join("/")))
    .attr('fill', d => mainColor[d.data.name])
    .attr('d', arc)
    .on('click', clicked);  // Corrected: Bind click directly to the paths

  
  paths.append('title')
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join('/')}\n${d.value}`);
  let lastClickedNode = null; // This will keep track of the last clicked node

function clicked(event, d) {
    // Use the node data directly from the click event
    const clickedNode = event;  

    // Check if there's a last clicked node and reset its highlight if necessary
    if (lastClickedNode && lastClickedNode.data.name !== clickedNode.data.name) {
        // Reset the previous node to its original attributes
        svg.selectAll('path')
            .filter(function(node) { return node === lastClickedNode; })
            .transition().duration(750)
            .attr('d', arc.outerRadius(lastClickedNode.y1 * radius))
            // .attr('fill', d => color(d.ancestors().reverse().map(d => d.data.name).join("/"))); // Use your fill color function
            .attr('fill', d => mainColor[d.data.name]); // Use your fill color function
    }

    // Highlight the newly clicked node, if it is not the same as the last clicked node
    if (lastClickedNode !== clickedNode) {
        if(currentYear == "All"){
          objBody = { subtype: clickedNode.data.name }
        }
        else{
          objBody = { subtype: clickedNode.data.name, year: currentYear }
        }
        type = clickedNode.data.name
        svg.selectAll('path')
            .filter(function(node) { return node === clickedNode; })
            .transition().duration(750)
            .attr('d', arc.outerRadius(clickedNode.y1 * radius)) // You can adjust this if you want to change the appearance
            .attr('fill', "#F3FFB6"); // Change to a highlight color
            fetch('/top_countries', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ subtype: clickedNode.data.name })
          })
          .then(response => response.json())  // Convert the response to JSON
          .then(data => {
              console.log("Data received:", data);
              drawHistogram(data, type);  // Pass the data directly to the drawHistogram function
          })
        lastClickedNode = clickedNode; // Update the last clicked node to the current node
        category = clickedNode.data.name
        if(mainSubGroups.includes(category)){
          console.log('clicked node :', category)
          currentGroup = "subgroup"
          currentSubGroup = category
          console.log('after clicked : ', currentYear, currentGroup, currentSubGroup, currentCountry)
          draw_world_map(currentYear, currentGroup, currentSubGroup, rangeColor[category+"_Light"], rangeColor[category+"_Deep"],); // year, group, subtype
          // draw_bar_chart(currentYear, currentSubType, currentCountry); // year, disaster type, country
          draw_time_series3(currentYear, currentCountry, currentGroup, currentSubGroup); // year, country, group, subtype
          
        }
        else if(category == "Natural"){
          currentGroup = "All"
          currentSubGroup = "All"
          currentSubType = "All"
          console.log('after clicked : ', currentYear, currentGroup, currentSubGroup, currentCountry)
          draw_world_map(currentYear, currentGroup, currentSubGroup, rangeColor[category+"_Light"], rangeColor[category+"_Deep"],); // year, group, subtype
          // draw_bar_chart(currentYear, currentSubType, currentCountry); // year, disaster type, country
          draw_time_series3(currentYear, currentCountry, currentGroup, currentSubGroup); // year, country, group, subtype
          
        }
        else{
          currentGroup = "subtype"
          currentSubType = category
          console.log('after clicked : ', currentYear, currentGroup, currentSubType, currentCountry)
          draw_world_map(currentYear, currentGroup, currentSubType, rangeColor[category+"_Light"], rangeColor[category+"_Deep"],); // year, group, subtype
          draw_bar_chart(currentYear, currentSubType, currentCountry); // year, disaster type, country
          draw_time_series3(currentYear, currentCountry, currentGroup, currentSubType); // year, country, group, subtype
        }
    } else {
        // If the same node was clicked again, reset
        svg.selectAll('path')
            .filter(function(node) { return node === clickedNode; })
            .transition().duration(750)
            .attr('d', arc.outerRadius(clickedNode.y1 * radius))
            .attr('fill', d => color(d.ancestors().reverse().map(d => d.data.name).join("/"))); // Reset to original fill color

        lastClickedNode = null;
    }
}


    svg.append('g')
      .attr('pointer-events', 'none')
      .selectAll('text')
      .data(root.descendants().filter(d => d.depth && (d.x1 - d.x0) > 0.08)) // Filter based on angle width
      .enter().append('text')
      .attr('transform', function(d) {
          // Set position and rotation
          const x = (d.x0 + d.x1) / 2 * 180 / Math.PI - 90;
          const y = (d.y0 + d.y1) / 2 * radius;
          return `translate(${Math.cos(x * Math.PI / 180) * y}, ${Math.sin(x * Math.PI / 180) * y}) rotate(${x + 90})`;
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .style('font-size', d => `${Math.max(17, (d.x1 - d.x0) * radius / 10)}px`)
      // .style('font-size', function(d){
      //   if()
      // } => `17px`)
      .text(d => d.data.name)
      .style('fill', 'white') // Set text color to white for visib
      // .on('mouseover', tip.show)  // Show tooltip on mouseover
      // .on('mouseout', tip.hide);

      
}



function draw_bar_chart(year, dis_type, country){
  const url = new URL('http://localhost:'+port+'/barchart');
  url.searchParams.append('year', year);
  url.searchParams.append('dis_type', dis_type);
  url.searchParams.append('country', country);
  // var values = null
  
  fetch(url)
      .then(response => response.json())
      .then(data => {
          // document.getElementById('results').textContent = JSON.stringify(data);

          values = data.disaster_trend_data
          console.log('fetched : ', values)
          /////////

          var data = [
            { month: 'Jan', value: 0 },
            { month: 'Jan', value: values[0] },
            { month: 'Feb', value: values[1] },
            { month: 'Mar', value: values[2] },
            { month: 'Apr', value: values[3] },
            { month: 'May', value: values[4] },
            { month: 'Jun', value: values[5] },
            { month: 'Jul', value: values[6] },
            { month: 'Aug', value: values[7] },
            { month: 'Sep', value: values[8] },
            { month: 'Oct', value: values[9] },
            { month: 'Nov', value: values[10] },
            { month: 'Dec', value: values[11] },
            { month: 'Dec', value: 0 }
          ];
        
          

          const margin = { top: 20, right: 20, bottom: 50, left: 60 },
          width = 600 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

          const x = d3.scaleBand()
              .range([0, width])
              .padding(0.1)
              .domain(data.map(d => d.month));

          const y = d3.scaleLinear()
              .range([height, 0])
              .domain([0, d3.max(data, d => d.value)]);
          
          d3.select('#bar_chart').selectAll('*').remove();
          const svg = d3.select("#bar_chart").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");
          if(dis_type != "All"){
            var c1 = newRangeColor[dis_type+"_Light2"]
            var c2 = newRangeColor[dis_type+"_Deep2"]
          }
          else{
            var c1 = newRangeColor["Natural_Light2"]
            var c2 = newRangeColor["Natural_Deep2"]
          }
          var c1 = "#D6E172"
          var c2 = "#D6E172"
          const colorScale = d3.scaleLinear()
          .domain([d3.min(data, d => d.value), d3.max(data, d => d.value)])
          .range([c1, c2]); // Light orange to dark red

            var tip = d3.tip()
            .attr('class', 'd3_tip')
            .offset([-10, 0])
            .html(function(d, i) { 
              if(i != 0 && i != data.length -1){

              return `Month: ${d.month}<br>Count: ${d.value}`; 
              }

              return `End Point`; 
            });
            svg.call(tip);

          svg.selectAll(".bar")
          .data(data)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("x", d => x(d.month))
          .attr("width", x.bandwidth())
          .attr("y", d => y(d.value))
          .attr("height", d => height - y(d.value))
          .style("fill", '#000')//d => colorScale(d.value) #d8976f', '#D6E172'
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide);

          svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
          .append("text")
          .attr("y", 35)
          .attr("x", width / 2)
          .attr("text-anchor", "end")
          .style("font-size", "12px")
          .text("Month");

      svg.append("g")
          .call(d3.axisLeft(y))
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -10)
          .attr("x", -height / 3)
          .attr("dy", "-3.1em")
          .attr("text-anchor", "end")
          .style("font-size", "12px")
          .text("Frequency");

      svg.append("text")
          .attr("x", (width + margin.left + margin.right) / 2)
          .attr("y", 0 - (margin.top / 2)+20)
          .attr("text-anchor", "middle")
          .style("font-size", "18px")
          .text("Seasonal Trend Analysis")
          .style("fill", mainColor["Hydrological"]);
                  
          const lineGenerator = d3.line()
          .x(d => x(d.month) + x.bandwidth() / 2) // this will position the line in the middle of each bar
          .y(d => y(d.value)); // the y position is the top of the bar

          // newData = data.slice(0,-1).map((arr, index) =>  arr)
          
          svg.append("path")
              .datum(data) // binds the data to the path
              .attr("fill", "none")
              .attr("stroke", "#739E82")
              .attr("stroke-width", 2)
              .attr("d", lineGenerator); // creates the line

          // Add points on the line in the middle of each bar
          svg.selectAll(".point")
              .data(data)
              .enter().append("circle") // append a circle for each datum
              .attr("class", "point")
              .attr("cx", d => x(d.month) + x.bandwidth() / 2) // centers the circle in the middle of the bar
              .attr("cy", d => y(d.value))
              .attr("r", 5) // radius of the circle
              .style("fill", "#F3FFB6")
              .on('mouseover', tip.show)
              .on('mouseout', tip.hide);    
                  
          svg.append("path")
              .datum(data)
              .attr("fill", "rgba(249, 152, 139, 0.4)")  // Transparent orange area
              .attr("stroke", "none")
              .attr("d", d3.line()
                .x(d => x(d.month) + x.bandwidth() / 2) // this will position the line in the middle of each bar
                .y(function(d, i) {
                  if(i == 0 || i == data.length - 1){
                    return y(0)
                  }
                  return y(d.value)
                })
              );

          // draw_bar_chart(values)
      })

      .catch(error => console.error('Error:', error));

}

function draw_rad_viz(year){

  const url = new URL('http://localhost:'+port+'/radviz');
  url.searchParams.append('year', year);
  // url.searchParams.append('dis_type', dis_type);
  // url.searchParams.append('country', country);
  // var values = null
  
  fetch(url)
      .then(response => response.json())
      .then(data => {
          // document.getElementById('results').textContent = JSON.stringify(data);
          values = data
          console.log('fetched radviz : ', data)
  const dimensions = data.dimensions
  const parent_groups = data.parent_groups
  // ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'];
    var data = data.data

    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const outerWidth = 450, outerHeight = 450;
    const width = outerWidth - margin.left - margin.right, 
          height = outerHeight - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;

    const anchorRadius = 10, pointRadius = 4;
    
    // const color = d3.scaleOrdinal(d3.schemeCategory10);

    d3.select('#radviz').selectAll('*').remove();
    const radviz = d3.select("#radviz").append("svg")
        // .attr("width", width+margin.left+margin.right)
        // .attr("height", height+margin.top+margin.bottom)
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .append("g")
        .attr("transform", `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);
        // .attr("transform", `translate(${totalWidth / 2}, ${totalHeight / 2})`);

    radviz.append("circle")
        .attr("r", radius)
        .attr("fill", "#369")
        .style("opacity", 0.2)
        .style("stroke", "#fff")
        .style("stroke-width", "5px");  // Dark background color
    
    
    var colorScale = colorSunBurst;

    var anchorColors = {}
    dimensions.forEach(element => {
      // anchorColors[element] = colorScale(parent_groups[element])
      anchorColors[element] = mainColor[parent_groups[element]]
    });
    console.log('anchor colors : ', anchorColors)
   


    anchorPoints = dimensions.map((dim, i) => ({
      x: radius * Math.cos(i / dimensions.length * 2 * Math.PI - Math.PI / 2),
      y: radius * Math.sin(i / dimensions.length * 2 * Math.PI - Math.PI / 2)
    }));

    const anchors = radviz.selectAll(".anchor")
        .data(dimensions)
        .enter().append("circle")
        .attr("class", "anchor-ring")
        .attr("r", anchorRadius + 4)  // Slightly larger than the anchor itself
        .attr("cx", (d, i) => radius * Math.cos(i / dimensions.length * 2 * Math.PI - Math.PI / 2))
        .attr("cy", (d, i) => radius * Math.sin(i / dimensions.length * 2 * Math.PI - Math.PI / 2))
        .style("fill", "black")
        .style("stroke", mainColor["Earthquake"])
        .style("stroke-width", "3px")
        .style("fill", d => mainColor[d]);;
        
    radviz.selectAll(".anchor-label")
      .data(dimensions)
      .enter().append("text")
      .attr("class", "anchor-label")
      .attr("x", (d, i) => (radius+10) * Math.cos(i / dimensions.length * 2 * Math.PI - Math.PI / 2))  // Offset x slightly
      .attr("y", (d, i) => (radius+10) * Math.sin(i / dimensions.length * 2 * Math.PI - Math.PI / 2))  // Offset y slightly
      .attr("dy", ".35em")  // Center align the text vertically
      .attr("transform", "rotate(-8)")
      .style("text-anchor", "middle")  // Center the text horizontally
      .text(d => d)
      .style("font-size", "13px");  // Set the text to be the dimension name

    radviz.selectAll(".anchor-line")
      .data(dimensions)
      .enter().append("line")
      .attr("class", "anchor-line")
      .attr("x1", 0)  // Center of the circle
      .attr("y1", 0)  // Center of the circle
      .attr("x2", (d, i) => radius * Math.cos(i / dimensions.length * 2 * Math.PI - Math.PI / 2))  // Same as anchor x position
      .attr("y2", (d, i) => radius * Math.sin(i / dimensions.length * 2 * Math.PI - Math.PI / 2))  // Same as anchor y position
      .attr("stroke", "gray")  // Color of the line
      .attr("stroke-width", 1);  // Thickness of the lin
      radviz.append("text")
      .attr("class", "title")
      .attr("x", 0)
      .attr("y", -(height / 2)-32)  // Adjust this to position the title correctly
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-family", "Arial, sans-serif")
      // .style("fill", "yellow")
      .style("fill", mainColor["Hydrological"])
      .text("RadViz");

    var tip = d3.tip()
            .attr('class', 'd3_tip')
            .offset([-10, 0])
            .html(function(d) { return `${d['name']}`; });

      
  
    radviz.call(tip);

    maxVal = d3.max(data, function(d) { 
        v = 0
    
        Object.keys(d).forEach(key => {
          if(key != 'name'){
            if(d[key] > v){
              v = d[key]
            }
          } 
        });
        return v;
      }
    )
    maxVal = 0.18
    // console.log('maxVal : ', maxVal)
    const points = radviz.selectAll(".point")
        .data(data)
        .enter().append("circle")
        .attr("class", "point")
        .attr("r", function(d){

          if(d['name'] == currentCountry){
            return pointRadius * 2;
          }
          return pointRadius;
        })
        .attr("cx", d => {
            const coordinates = dimensions.map((dim, i) => ({
                // x: Math.min(radius * Math.cos(i / dimensions.length * 2 * Math.PI - Math.PI / 2) * d[dim] / maxVal, (0.90 + Math.random()*0.08) * radius),
                // y: Math.min(radius * Math.sin(i / dimensions.length * 2 * Math.PI - Math.PI / 2) * d[dim] / maxVal, (0.90 + Math.random()*0.08) * radius)
                x: radius * Math.cos(i / dimensions.length * 2 * Math.PI - Math.PI / 2) * d[dim] / maxVal,
                y: radius * Math.sin(i / dimensions.length * 2 * Math.PI - Math.PI / 2) * d[dim] / maxVal
            }));
            return d3.mean(coordinates, co => co.x);
        })
        .attr("cy", d => {
            const coordinates = dimensions.map((dim, i) => ({
                // x: Math.min(radius * Math.cos(i / dimensions.length * 2 * Math.PI - Math.PI / 2) * d[dim] / maxVal, (0.90 + Math.random()*0.08) * radius),
                // y: Math.min(radius * Math.sin(i / dimensions.length * 2 * Math.PI - Math.PI / 2) * d[dim] / maxVal, (0.90 + Math.random()*0.08) * radius)
                x: radius * Math.cos(i / dimensions.length * 2 * Math.PI - Math.PI / 2) * d[dim] / maxVal,
                y: radius * Math.sin(i / dimensions.length * 2 * Math.PI - Math.PI / 2) * d[dim] / maxVal
            }));
            return d3.mean(coordinates, co => co.y);
        })
        // .style("fill", d => color(d3.mean(Object.values(d))))
        .style("fill", d => {
          mxKey = ""
          v = -1
          Object.keys(d).forEach(key => {
            if(key != 'name'){
              if(d[key] > v){
                v = d[key]
                mxKey = key
              }
            } 
          });
          console.log()

          return mainColor[mxKey]
        })

        // })
        .attr("stroke", function(d){
          if(d['name'] == currentCountry){
            return "white";
          }
          return ;
        })  // Color of the line
        .attr("stroke-width", function(d){
          if(d['name'] == currentCountry){
            return 2;
          }
          return ;

        })  // Thickness of the lin
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
      })

      .catch(error => console.error('Error:', error));
}


function drawHistogram(obj, type) {
  
  let color = mainColor[type]
  var data = obj.top_countries;
  console.log("dataaaaa",data)
  const margin = { top: 30, right: 20, bottom: 60, left: 80 },
        width = 600 - margin.left - margin.right,
        height = 380 - margin.top - margin.bottom;
  d3.select('#bubble-chart').selectAll('*').remove();
  const svg = d3.select('#bubble-chart').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  var tip = d3.tip()
      .attr('class', 'd3_tip')
      .offset([-10, 0])
      .html(function(d) {
          // return `<span style='color:black;background-color: #fff;'>${d.Country}: ${d['Total Affected']} affected</span>`;
          return `${d.Country}: ${d['Total Affected']}`;
      });
  svg.call(tip);

  const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d['Total Affected'])])
      .range([0, width]);

  const yScale = d3.scaleBand()
      .domain(data.map(d => d.Country))
      .range([0, height])
      .padding(0.1);

  svg.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('y', d => yScale(d.Country))
      .attr('width', d => xScale(d['Total Affected']))
      .attr('height', yScale.bandwidth())
      .attr('fill', color)
      .on('mouseover', tip.show)  // Show tooltip on mouseover
      .on('mouseout', tip.hide); 

  const xAxis = d3.axisBottom(xScale)
      .tickFormat(function(d) { return d / 1e6 + 'M'; });  // Convert the number to millions
    
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");
  svg.append('g')
          .attr('class', 'y-axis')
          .call(d3.axisLeft(yScale))
          .selectAll("text")
              .style("text-anchor", "end")
              .attr("dx", "-.8em")
              .attr("dy", ".15em")
              .attr("transform", "rotate(-45)");
  svg.append("text")
              .attr("x", width / 2)
              .attr("y", -5)  // Adjust position to be more visually appealing
              .attr("text-anchor", "middle")
              .style("font-size", "16px")
              .style("font-weight", "bold")
              .text("Top 10 Most Affected Countries")
              .style("fill", mainColor["Hydrological"]);
  svg.append("text")
              .attr("x", width / 2)
              .attr("y", height + 50) // Positioned below the x-axis
              .attr("text-anchor", "middle")
              .style("font-size", "12px")
              .text("Number of Affected People");
      
          // Y-axis label
          svg.append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", -70) // Offset from the y-axis
              .attr("x", -(height / 2))
              .attr("dy", "1em")
              .attr("text-anchor", "middle")
              .style("font-size", "12px")
              .text("Countries");
      
}
