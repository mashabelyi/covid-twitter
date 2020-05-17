function drawSentiment(tw, re, states){

  // Styles
  
  // (datasets array is defined at the bottom of the page)
  // const data_by_state = d3.nest().key(d => d.state).entries(data)
  const tweets_by_state = d3.nest().key(d => d.state).entries(tw)
  const retweets_by_state = d3.nest().key(d => d.state).entries(re)
  const statenames = states
  statenames['ALL'] = 'United States'
  
  // start with tweets only
  var data_by_state = []
  function set_data(type){
    if (type == "tweets") {
      data_by_state = tweets_by_state;
    }
    else if (type == "retweets") {
      data_by_state = retweets_by_state;
    }
  }
  set_data("retweets")

  const outerDiv = d3.select("#SentimentGrid");
  width = outerDiv.node().getBoundingClientRect().width
  height = width*0.77;
  let margin = ({top: 10, bottom: 10, left: 10, right: 10});
  // const width = 900
  // let height = 700
  
  const posfill = "#f2bc27" // "#45804e"
  const negfill = "#6eabcc" // "#ae74b0"
  
  
  // Controls
  const controls = outerDiv.append("div").attr("class","controls")
  const checkbox = controls.selectAll(".checkbox")
      .data(["tweets","retweets"])
      .enter().append("div").attr("class","checkbox-container")
      .each(function(d,i){
        d3.select(this).append("input").attr("type","radio").attr("name","sentiment-type").attr("value",d=>d)
          .on("change", function(d){
            drawChart(d3.select(this).attr("value"))
          });
        d3.select(this).append("label").html("show " + d)
      });
  controls.select('input[value="tweets"]').property("checked",true)
  
  // SVG Container for the plot
  const container = outerDiv.append("svg").attr("class","states-grid")
                            .attr("width",width)
                            .attr("height", height)
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  
  
  let xGrid = d3.scaleLinear().domain([1,13]).range([0,width])
  let yGrid = d3.scaleLinear().domain([1,9]).range([0,height])
  var padding = 5
  var w = xGrid(2)-2*padding,
      h = yGrid(2)-2*padding;
  
  function row(d) {
    return d.values[0].row
  }
  function col(d) {
    return d.values[0].col
  }
  function translate(d) {
    return "translate(" + d.values[0].row + "," + d.values[0].col + ")"
  }
  
  // ------------------------------------------------------------------------------------------------DetailContaner
  // Detail container in bottom right corner
  // - shows closeup of state on hover
  var detailPadding = 20,
      detailUnits = 3
  var detailW = xGrid(2)*detailUnits - 2*detailPadding,
      detailH = yGrid(2)*detailUnits - 2*detailPadding;
  
  
  const detail = outerDiv.append("svg").attr("class","sentiment-detail")
                            .attr("width",detailW+"px")
                            .attr("height", detailH+"px")
                            // .attr("transform", "translate(" + (20+xGrid(2)*9) + "," + (yGrid(2)*-3) + ")")
                            .style("left", (20+xGrid(2)*9)+"px")
                            .style("top", (yGrid(2)*5) + "px")
 
  
  
  // background color box
  detail.append('rect')
      .attr("width",-10+xGrid(2)*detailUnits)
      .attr('height',-10+yGrid(2)*detailUnits)
      .attr('fill','white')
      .attr('stroke','#adadad')
      .attr("transform", "translate(5,5)").attr("rx",3).attr("ry",3)
  // the plot layer
  const detailGroup = detail.append("g").attr("class","detail-box").attr("transform", "translate(" + detailPadding + "," + detailPadding + ")")
  // init with sentiment data for all the states
  drawSentiment(detailGroup, get_state_data('ALL'), detailW, detailH)
  detailGroup.select('.statename').text('United States').attr("text-anchor","middle")
  
  // detail annotation layer
  // date, numtweets, pos and neg words
  var annotations = detail.append("g").attr("class","sentiment-annotation")
          .attr("transform", "translate(" + detailPadding + "," + detailPadding + ")")
          .attr("opacity", 0)
  
  annotations.append("rect")
            .attr("width", "100").attr("height", "50")
            .attr("fill", "#000000").attr("rx",3).attr("ry",3)
            .attr("x",detailPadding+padding-50+"px").attr("y", (detailH + detailPadding - 10-35)+"px")
  
  var detailDate = annotations.append("text")
        .text("March 1").attr("fill","#ffffff")
        .attr("text-anchor","middle")
        .attr("dy", (detailH + detailPadding - 20)+"px")
        .attr("dx", detailPadding+padding+"px");
  
  var detailNum = annotations.append("text")
        .text("1,029 tweets")
        .attr("text-anchor","middle").attr("fill","#ffffff")
        .attr("dy", (detailH + detailPadding + 0)+"px")
        .attr("dx", detailPadding+padding+"px");
  
  
  
  function hideDetail(){
    annotations.attr("opacity", 0)
    detailGroup.select('.dateline').attr("opacity", '0')
  }
  function updateDetail(xloc, state_data){
    detailGroup.select('.dateline').attr("opacity", '1')
      .attr("transform", "translate("+xloc*detailW+","+0+")")
    // set name to full name
    detailGroup.select('.statename').text(statenames[state_data[0].state]).attr("text-anchor","middle")
    
    var date = Math.min(1+ Math.floor(xloc*31), 31)
    detailDate.text("March " + date)
    // detailNum.text(Math.floor(Math.random()*2000) + " tweets").attr("opacity", 1)
    var idx = Math.floor(date/2)
    detailNum.text(state_data[idx].total + " tweets").attr("opacity", 1)
    
    annotations.attr("opacity", 1).attr("transform", "translate("+xloc*detailW+","+detailPadding+")")
  }
  // ------------------------------------------------------------------------------------------------DetailContaner
  
  // 
  // Draw each State
  // wrapped this in a function so we can re-draw the grid on data update
  // -----------------------------------------------------------------------------------------------------Draw Grid
  function drawChart(type){
    set_data(type)
    container.selectAll(".state")// ".state"
        .data(data_by_state)
        //.enter().append("g")
        .join("g")
          .attr('width', w)
          .attr('height', h)
          .attr("class","state")
          .attr("transform", function(d) {
            console.log(d.values[0].row,d.values[0].col)
            return "translate(" + xGrid(d.values[0].col-1) + "," + yGrid(d.values[0].row) + ")"
          })
          // .attr("transform", function(d) {return "translate(110,100)"})
          .attr("state", d => d.key)
          .each(function(d,i) {
            // draw state data
            drawSentiment(d3.select(this), get_state_data(d.key), w, h)
          }).on("mouseover", function(d){
            // show this state in the detail box
            drawSentiment(detailGroup, get_state_data(d.key), detailW, detailH)
          });
    
    drawSentiment(detailGroup, get_state_data('ALL'), detailW, detailH)
  }
  // -----------------------------------------------------------------------------------------------------Draw Grid
  drawChart("tweets")
 
  function get_state_data(state){
    return data_by_state.find(function(d) {return d.key == state}).values
  }
  
  function drawSentiment(svg, mydata, w, h) {
    // clear the element
    var currState = mydata[0].state;
    svg.selectAll("*").remove()
    // AXES
    let xScale = d3.scaleLinear()
                  .domain([1,31])
                  .range([0,w])

    let yScale = d3.scaleLinear()
                  .domain([-0.3,0.3])
                  .range([0,h])
    
    // draw x-axis - only for the detail plot
    if (svg.attr("class") == "detail-box"){
      svg.append("g")
        .attr("transform", "translate(0,"+h+")")
        .call(d3.axisTop(xScale)
              .ticks(2)
              .tickValues([1,31])
              .tickFormat(function (d) {
              return "March " + d;
              })
             );
    }
    
    // draw the 0 (baseline)
    // svg
//       .append("line")
//       .attr("x1", d => xScale(1)).attr("x2", d => xScale(31))
//       .attr("y1", d => yScale(0)).attr("y2", d => yScale(0))
//       .attr("stroke", "#bfbeba").attr("stroke-width", 1)
    
    // draw positive regions
    svg.append("path")
      .datum(mydata)
      .attr("fill", negfill).attr("stroke","none").attr("stroke-width", 1.5).attr("opacity",0.5)
      .attr("d", d3.area()
            // .defined(function(d) {return (d.pval <= 0.1);})
            .x(function(d,i) {return xScale(d.date)})
            .y0(function(d) {return yScale(0)})
            .y1(function(d) {if (-d.sentiment > 0) {return yScale(-d.sentiment)} else {return yScale(0)} }));
            // .y1(function(d) {if (-d.sentiment > 0 && d.pval <= 0.1) {return yScale(-d.sentiment)} else {return yScale(0)}}));
    
    // draw negative regions
    svg.append("path")
      .datum(mydata)
      .attr("fill", posfill).attr("stroke","none").attr("stroke-width", 1.5).attr("opacity",1)
      .attr("d", d3.area()
            // .defined(function(d) {return (d.pval <= 0.1);})
            .x(function(d,i) {return xScale(d.date)})
            .y0(function(d) {return yScale(0)})
            .y1(function(d) {if (-d.sentiment < 0) {return yScale(-d.sentiment)} else {return yScale(0)} }));
            // .y1(function(d) {if (-d.sentiment < 0 && d.pval <= 0.1) {return yScale(-d.sentiment)} else {return yScale(0)} }));
    
    // mask out uncertain regions
    // svg.append("path")
    //   .datum(mydata)
    //   .attr("fill", "#ffffff").attr("stroke","none").attr("stroke-width", 1.5).attr("opacity",0.5)
    //   .attr("d", d3.area()
    //         // .curve(d3.curveStep)
    //         .x(function(d,i) {return xScale(d.date)})
    //         .y0(function(d) {return yScale(0)})
    //         .y1(function(d) {if (d.pval > 0.1) {return yScale(-d.sentiment)} else {return yScale(0)} }));
    
    // draw the line
    svg
      .append("path")
      .datum(mydata)
      .attr("fill", "none").attr("stroke-width", 1).attr("stroke","#000000")
      .attr("d", d3.line()
            // .defined(function(d) {return (d.pval <= 0.1);})
            .x(function(d) { return xScale(d.date) })
            .y(function(d) { return yScale(-d.sentiment) })
            // .y(function(d) {if (d.pval <= 0.1)  {return yScale(-d.sentiment)} else {return yScale(0)}})
            // .y(function(d) {if (d.pval <= 0.1)  {return yScale(-d.sentiment)} else {return null}}))
            
           );
    
    // draw uncertain line
    // svg
    //   .append("path")
    //   .datum(mydata)
    //   .attr("fill", "none").attr("stroke-width", 1).attr("stroke","#000000").attr("opacity",0.5)
    //   .style("stroke-dasharray", ("3,3"))
    //   .attr("d", d3.line()
    //         .defined(function(d) {return (d.pval > 0.1);})
    //         .x(function(d) { return xScale(d.date) })
    //         // .y(function(d) { return yScale(-d.sentiment) })
    //         .y(function(d) { return yScale(0) })
    //         // .y(function(d) {if (d.pval <= 0.1)  {return yScale(-d.sentiment)} else {return yScale(0)}})
    //         // .y(function(d) {if (d.pval <= 0.1)  {return yScale(-d.sentiment)} else {return null}}))     
    //    );
    
      // .style("stroke", function(d) {
      //   if (d.pval > 0.1){return 'red'}
      //   else{ return 'black'}
      // });
      
    
    // state text label
    svg.append("text")
      .datum(mydata)
      .attr("class","statename")
      .attr("text-anchor", "middle")
      .text(d => d[0].state == 'ALL' ? 'United States' : d[0].state)
      .attr("dx", w/2) // use w/2 to center, 10 to left align
      .attr("dy", "10")
    
    // feedback vertical line
    var feedback = svg.append("line").attr("class","dateline")
      .attr("x1", d => 0).attr("x2", d => 0)
      .attr("y1", d => yScale(-0.3)).attr("y2", d => yScale(0.3))
      .attr("stroke", "#bfbeba").attr("stroke-width", 1)
      .attr("opacity", "0")
    
    
    // Add interactive layer
    const mouseCatcher = svg.append("rect").attr("class", "mouse-catcher")
        .attr("width", w).attr("height", h).attr("opacity", 0)
        .on("mouseenter mousemove", function(d){
            var coordinates= d3.mouse(this);
            var x = coordinates[0];
            var y = coordinates[1];

            // console.log(x,y);
            feedback.attr("opacity", "1").attr("transform", "translate("+x+","+0+")")
            updateDetail(x/w, mydata)
          }).on("mouseleave", function(d){
            // hide off screen
            feedback.attr("opacity", "0")
            hideDetail()
          });
  
  }
}

function drawTerms(mydata){
  const outerDiv = d3.select("#SentimentTerms");
  width = outerDiv.node().getBoundingClientRect().width

  height = d3.select("#sentiment-context").node().getBoundingClientRect().height-100
  console.log(height)
  let margin = ({top: 10, bottom: 40, left: 10, right: 10});

  const posfill = "#f2bc27" // "#45804e"
  const negfill = "#6eabcc" // "#ae74b0"


  const svg = outerDiv.append("svg").attr("width", width).attr('height', height);

  plotW = width - margin.left - margin.right
  plotH = height - margin.top - margin.bottom

  const y = d3.scaleBand()
        .domain(mydata.map(d => d.word))
        .range([margin.top, height - margin.bottom])
        .padding(0.1);
  
  var tickHeight = height/mydata.length;
  
  const x = d3.scaleLinear()
        .domain([-50, 50])
        .range([width/2, width]);

  const yAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));
  
  
  var tickHeight = height/mydata.length;
  
  const bar = svg.append("g")
                .selectAll("rect")
                .data(mydata)
                .join("rect")
                  .attr("x", function(d){
                        return x(Math.min(0, d.odds))
                   })
                  .attr("y", d => y(d.word))
                  .attr("width", function(d){
                        return Math.abs(x(d.odds) - x(0))
                  })
                  .attr("height", y.bandwidth())
                  .attr("fill", d => (d.sentiment=='pos' ? posfill : negfill))
  
  svg.append("g")
        .selectAll("text")
        .data(mydata)
        .join("text")
            .attr("text-anchor", d => d.sentiment=="pos" ? 'start': 'end') 
            .attr("x", function(d){
              return d.sentiment=="pos" ? (x(d.odds) + 10) : (x(d.odds) - 10)
             }) 
            .attr("y", d => y(d.word) + tickHeight/2)
            .text(d => d.word)
            .attr("fill", d => d.sentiment=="pos" ? posfill: negfill)
            .style('font-weight','bold').style('font-size','12px')

  svg.append("g")
     .call(yAxis);

  // x axis
  // console.log(width)
  // svg.append('text')
  //         .attr("text-anchor", "middle")
  //         .attr('x',x(0))
  //         .attr('y', plotH + margin.bottom +margin.top)
  //         .style('font-size', '12px')
  //         .text('Odds Ratio')

  outerDiv.append('div')
        .html("Word prevalence in <span style='color:#6eabcc;font-weight:bold;'>negative</span> and <span style='color:#f2bc27;font-weight:bold;'>positive</span> tweets<br/>(Calculated as odds ratio)")
        // .html("Word prevalence in <span style='color:#f2bc27;'>positive</span>and negative tweets<br/>(Calculated as odds ratio)")
        .attr("class","terms-caption")

}

Promise.all([
    d3.csv("data/tweets-smoothed.0301-0331.usa.sentiment.d3.csv"),
    d3.csv("data/retweets-smoothed.0301-0331.usa.sentiment.d3.csv"),
    d3.json("https://raw.githubusercontent.com/mashabelyi/Twitter-Covid-Response/master/scripts/us_states.json"),
    d3.csv("data/distinctive_sentiment_terms.csv")
]).then(function(files) {
    // files[0] will contain file1.csv
    // files[1] will contain file2.csv
    tw = files[0];
    re = files[1];
    states = files[2];
    terms = files[3];
    console.log(tw);
    drawSentiment(tw, re, states);
    drawTerms(terms)

}).catch(function(err) {
    // handle error here
    console.log(err)
})


