const dataLocation = "https://raw.githubusercontent.com/keiyafa/traffick_data_viz/main/detected-trafficking.csv";

export function map(el) {
  const width = 1500;
  const height = 300;
  const container = d3.select(".home");
  var svg = d3.select(el).append("svg")
    .attr("width", width)
    .attr("height", height);

  const tooltip = d3.select(el).append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  const projection = d3.geoMercator()
    .scale(100)
    .center([0,20])
    .translate([width / 2, height / 2]);

  const data = d3.map();
  const colorScale = d3.scaleThreshold()
    .domain([10, 25, 50, 100, 150, 200])
    .range(d3.schemeBuGn[7]);

  let zoom = d3.zoom()
  .scaleExtent([1, 4])
  .translateExtent([[-500, -300], [1500, 1000]])
  .on('zoom', () => {
      svg.attr('transform', d3.event.transform)
  });
  
  d3.select("#zoom_in").on("click", function() {
  zoom.scaleBy(svg.transition().duration(750), 1.2);
});
d3.select("#zoom_out").on("click", function() {
  zoom.scaleBy(svg.transition().duration(750), 0.8);
});

 svg.call(zoom);


  d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/keiyafa/traffick_data_viz/main/world.geojson")
    .defer(d3.csv, dataLocation, function(d) { data.set(d.Country, +d[2017])})
    .await(ready);

  function ready(error, topo) {
    svg.append("g")
      .selectAll("path")
      .data(topo.features)
      .enter()
      .append("path")
        .attr("d", d3.geoPath()
          .projection(projection)
        )
        .attr("fill", function (d) {
          d.total = data.get(d.properties.name) || 0;
          return colorScale(d.total);
        })
      .on('mousemove', function (d) {
        if(d.total > 0) {
          tooltip.transition()
            .duration(100)
            .style("opacity", 1);

          tooltip.style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY) + "px")
            .text(() => `${d.properties.name}: ${d.total}`)
        }
      })
      .on("mouseover", function (d) {
        if(d.total > 0) {
          d3.select(this)
            .style("cursor", "pointer");
        }
      })
      .on("mouseout", function (d, i) {
          tooltip.transition()
            .duration(100)
            .style("opacity", 0);
      });
      
  }
  
}

export function trendgraph(el) {
  const margin = {top: 30, right: 30, bottom: 70, left: 60},
      width = 1200 - margin.left - margin.right,
      height = 700 - margin.top - margin.bottom;

  const svg = d3.select(el)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  d3.csv(dataLocation, function(data) {
    const dates = [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017]
    const sum = dates.map(date => {
      return {
        date: date,
        sum: d3.sum(data.map(function(d){ return d[date]}))
      }
    })
    
    var color = d3.scaleOrdinal([`#DE3163`, `#584c77`,`#6495ED`, `#33431e`, `#a36629`, `#92462f`,`#9FE2BF`, `#b63e36`, `#b74a70`,`#CCCCFF`, `#946943`,`#8B0000`,`#383857`,`#DE3163`,`#EE82EE`]);
    const x = d3.scaleBand()
      .range([ 0, width ])
      .domain(sum.map(function(d) { return d.date; }))
      .padding(0.2);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .style("fill","white");

    const y = d3.scaleLinear()
      .domain([0, d3.max(sum, function(d) { return d.sum; })])
      .range([ height, 0]);

    var valueline = d3.line()
      .x(function (d) { return x(d.date) + x.bandwidth()/2; })
      .y(function (d) { return y(d.sum); });

    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
        .style("fill","white");

    svg.selectAll("bar")
      .data(sum)
      .enter()
      .append("rect")
        .attr("x", function(d) { return x(d.date); })
        .attr("width", x.bandwidth())
        .attr("fill", function(d,i) {
          return color(i);
        })
        
        .attr("height", function(d) { return height - y(0); })
        .attr("y", function(d) { return y(d.sum); })

      
      svg.selectAll("rect")
        .transition()
        .duration(2000)
        .attr("y", function(d) { return y(d.sum); })
        .attr("height", function(d) { return height - y(d.sum); })
        .delay(function(d, i){console.log(i) ; return(i*100)})

      // Add the valueline path
    svg.append("path")
      .attr("d", valueline(sum))
      .attr("fill", "none")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 1.5);
  })
}

export function bargraph(el) {
  const margin = {top: 30, right: 30, bottom: 70, left: 60},
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  const svg = d3.select(el)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  d3.csv(dataLocation, function(data) {
    const top = data.sort(function(a, b) {
      return d3.descending(+a[2017], +b[2017]);
    }).slice(0, 10);

    
    var color = d3.scaleOrdinal([`#383867`, `#584c77`, `#33431e`, `#a36629`, `#92462f`, `#b63e36`, `#b74a70`, `#946943`,`#383857`,`#DE3163`]);
    const x = d3.scaleBand()
      .range([ 0, width ])
      .domain(top.map(function(d) { return d.Country; }))
      .padding(0.2);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .style("fill","white");

    const y = d3.scaleLinear()
      .domain(d3.extent(data, function(d) { return +d[2017]; }))
      .range([ height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
        .style("fill","white");

    svg.selectAll("bar")
      .data(top)
      .enter()
      .append("rect")
        .attr("x", function(d) { return x(d.Country); })
        .attr("width", x.bandwidth())
        .attr("fill", function(d,i) {
          return color(i);
        })
        
        .attr("height", function(d) { return height - y(0); })
        .attr("y", function(d) { return y(d[2017]); })

    
    svg.selectAll("rect")
    .transition()
    .duration(2000)
    .attr("y", function(d) { return y(d[2017]); })
    .attr("height", function(d) { return height - y(d[2017]); })
    .delay(function(d, i){console.log(i) ; return(i*100)})
  })
}

export function timeserie() {
 
  
  var yearFields = [2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017];

  d3.csv(dataLocation, function(error, data) {
  var countryMap = {};
  data.forEach(function(d) {
      var countryy = d.Country;
      countryMap[countryy] = [];

      
      yearFields.forEach(function(field) {
          countryMap[countryy].push( +d[field] );
      });
  });
  makeVis(countryMap);
  });

  var makeVis = function(countryMap) {
  
  var margin = { top: 30, right: 50, bottom: 70, left: 50 },
      width  = 800 - margin.left - margin.right,
      height = 500 - margin.top  - margin.bottom;

  
  var xScale = d3.scaleBand()
      .domain(yearFields)
      .range([0, width], 0.1)
      .padding(0.2);

  
  var yScale = d3.scaleLinear()
      .domain([0,2000])
      .range([height, 0]);

  
  var canvas = d3.select("#vis-container")
      .append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  
  var xAxis = d3.axisBottom(xScale)

  canvas.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end")
          .style("fill","white");

  
  var yAxis = d3.axisLeft(yScale)

  var yAxisHandleForUpdate = canvas.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .selectAll("text")
        .style("fill","white");

  yAxisHandleForUpdate.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      

  var updateBars = function(data) {
      
      yScale.domain( d3.extent(data) );
      yAxisHandleForUpdate.call(yAxis);

      var bars = canvas.selectAll(".bar").data(data);

      
      bars.enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", function(d,i) { return xScale( yearFields[i] ); })
          .attr("width", xScale.bandwidth)
          .attr("fill", "#69b3a2")
          .attr("y", function(d,i) { return yScale(d); })
          .attr("height", function(d,i) { return height - yScale(d); });

      
      bars
          .transition().duration(1500)
          .attr("y", function(d,i) { return yScale(d); })
          .attr("height", function(d,i) { return height - yScale(d); });

      
      bars.exit().remove();
  };

  
  var dropdownChange = function() {
      var newCereal = d3.select(this).property('value'),
          newData   = countryMap[newCereal];

      updateBars(newData);
  };

  
  var cereals = Object.keys(countryMap).sort();

  var dropdown = d3.select("#vis-container")
      .insert("select", "svg")
      .on("change", dropdownChange);

  dropdown.selectAll("option")
      .data(cereals)
      .enter().append("option")
      .attr("value", function (d) { return d; })
      .text(function (d) {
          return d[0].toUpperCase() + d.slice(1,d.length); // capitalize 1st letter
      });

  var initialData = countryMap[ cereals[0] ];
  updateBars(initialData);
  };
}