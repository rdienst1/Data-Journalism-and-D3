
//Set the Stage

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// create an SVG wrapper and append an SVG group that will hold the chart

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


//Start X

// Initial Params
var varXaxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(cendata, varXaxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(cendata, d => d[varXaxis]) * 0.8,
      d3.max(cendata, d => d[varXaxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}



// function used for updating circles group with a transition to
// new circles

function renderCircles(circlesGroup, newXScale, varXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[varXaxis]));

   //help the labels move with the states! 
   chartGroup.selectAll('.stateLabel').transition()
  .duration(1000)
  .attr("x", d => newXScale(d[varXaxis])-6);

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(varXaxis,varYaxis, circlesGroup) {

  if (varXaxis === "poverty") {
    var label = "Poverty (%):";
  }
  else {
    var label = "Age";
  }

  if (varYaxis === "healthcareLow") {
    var labelY = "Healthcare (%):";
  }
  else {
    var labelY = "Obesity";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([0, -60])
    .html(function(d) {
      return (`${d.state}<br>${labelY} ${d[varYaxis]}<br>${label} ${d[varXaxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

//End X


//Start Y

// Initial Params
var varYaxis = "healthcareLow";

// function used for updating y-scale var upon click on axis label
function yScale(cendata, varYaxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(cendata, d => d[varYaxis]),
      d3.max(cendata, d => d[varYaxis])
    ])
   .range([height, 0]);

  return yLinearScale;

}

// function used for updating yAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}


// function used for updating circles group with a transition to
// new circles

function renderCirclesY(circlesGroup, newYScale, varYaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[varYaxis]));

 chartGroup.selectAll('.stateLabel').transition()
  .duration(1000)
  .attr("y", d => newYScale(d[varYaxis])+2);
  return circlesGroup;
}

//End Y

//Bring in CSV

// Retrieve data from the CSV file and execute everything below
d3.csv("cendata.csv", function(err, cendata) {
  if (err) throw err;

  // parse data
  cendata.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcareLow = +data.healthcareLow;
    data.age = +data.age;
    data.obesity = +data.obesity;
  });


  // yLinearScale function above csv import
  var xLinearScale = xScale(cendata, varXaxis);

  //  y scale function
  var yLinearScale = yScale(cendata, varYaxis);


  //  initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
   // .attr("transform", `translate(${width}, 0 )`)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(cendata)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[varXaxis]))
    .attr("cy", d => yLinearScale(d[varYaxis]))
    .attr("r", 15)
    .attr("fill", "lightblue")
    .attr("opacity", ".8");

    var stateLabels = chartGroup.selectAll('.stateLabel')
    .data(cendata)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[varXaxis])-6)
    .attr("y", d => yLinearScale(d[varYaxis])+2)
    .text(d => d.abbr)
    .classed("stateLabel",true)
    .attr("font-family", "sans-serif")
    .attr("font-size", "9px")
    .attr("fill", "darkblue");

  // Create group for  2 y axis labels
 var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    //append x axes
    var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age");

    var ylabelsGroup = chartGroup.append("g");
    

  // append y axes
  var healthcareLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcareLow")
    .classed("axis-text active", true)
    .text("Low Healthcare (%)");

   
   var obeseLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left+20)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "obesity")
    .classed("axis-text inactive", true)
    .text("Obesity");

   // X Event Listener

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(varXaxis,varYaxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== varXaxis) {

        // replaces varXaxis with value
        varXaxis = value;

        // updates x scale for new data
        xLinearScale = xScale(cendata, varXaxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, varXaxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(varXaxis, varYaxis, circlesGroup);

        // changes classes to change bold text
        if (varXaxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });


//  Y Event Listener

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(varXaxis,varYaxis, circlesGroup);

  // Y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== varYaxis) {

        // replaces varYaxis with value
        varYaxis = value;


        // updates y scale for new data
        yLinearScale = yScale(cendata, varYaxis);

        // updates y axis with transition
        yAxis = renderAxesY(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderCirclesY(circlesGroup, yLinearScale, varYaxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(varXaxis,varYaxis, circlesGroup);

        // changes classes to change bold text
        if (varYaxis === "obesity") {
          obeseLabel
            .classed("active", true)  
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

});


