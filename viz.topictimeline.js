function drawTimeline(topicHashtags, data){
  var nTopics = 10
  var chartData = data

  const outerDiv = d3.select("#CovidTopicsTimeline");
  width = outerDiv.node().getBoundingClientRect().width
  height = nTopics*(20+5)
  
  let margin = ({top: 30, bottom: 50, left: 0, right: 100});

  labelWidth = 100

  // buttons
  // const controls = outerDiv.append("div").attr("class","controls")
  // show more/less
  // const showMore = controls.append("button").text("show more").attr("value", nTopics) 
  // const showLess = controls.append("button").text("show less").attr("value", nTopics) 

  buttonH = 30
  const showMore = outerDiv.append("button").text("SEE MORE").attr("value", nTopics) 
                          .style("position","absolute").style("left",width-labelWidth+'px').style("top", '0px')
                          .style("width", labelWidth+'px').style("height",buttonH+"px").style("cursor","pointer")
  
  const showLess = outerDiv.append("button").text("SEE LESS").attr("value", nTopics) 
                          .style("position","absolute").style("left",width-labelWidth+'px').style("top", buttonH+10+'px')
                          .style("width", labelWidth+'px').style("height",buttonH+"px").style("cursor","pointer")

  const toggleBot = outerDiv.append("button").text("SEE BOTS").attr("value", nTopics).attr("value","human")
                          .style("position","absolute").style("left",width-labelWidth+'px').style("top", 2*(buttonH+10)+'px')
                          .style("width", labelWidth+'px').style("height",buttonH+"px").style("cursor","pointer")
  
  toggleBot.on('mouseenter', function(){
    if (this.getAttribute('value')=='human'){
        hashtags.html("Some accounts on Twitter are automated. Click to see data from automated Twitter bots.")
    }else{
      hashtags.html("Click to return to normal view.")
    }
  }).on('mouseleave', function(){
    hashtags.html("")
  });

  
  
  //
  // Data filter
  //
  // controls.append("span").html("Some accounts on Twitter are automated. Select \"Bots\" to explore automatically tweeted content:").style("padding","10px").style("font-size","14px")
  
  // let accountFilter = controls.append('select').attr("id", "filter-accounts");
  // const allMessages = [ {display: "All accounts", value: "all"},
  //                       {display: "Humans", value: "human"},
  //                       {display: "Bots", value: "bot"}]
  //  const items = accountFilter 
  //     .selectAll('options')
  //     .data(allMessages)
  //     .enter()
  //     .append('option')
  //     .text(function (d) { return d.display; }) 
  //     .attr("value", function (d) { return d.value; })
  
  //  // set the default value by settings "selected", true for the item that matches the filter
  //  items.filter(function(d) {return d.value === "All accounts"}).attr("selected",true);
  
  // controls.append("span").html("*Some accounts on Twitter are automated. Select \"Bots\" to explore automatically tweeted content.").style("padding","10px").style("font-size","14px")
  
  var hashtags = outerDiv.append("p").attr("classs", "top-context").html("").style("width", (width-labelWidth)+"px")
   
  // SVG Container for the plot
  const container = outerDiv.append("svg").attr("width",width + margin.left + margin.right)
   
  let curr_data = prepare_data(nTopics, chartData)
  
  //
  // Define X and Y Scales
  //
  
  let xScale = d3.scalePoint()
  .domain(d3.keys(data[0]).slice(0,31).map(x => +x))
  .range([0,width-labelWidth])

  let yScale = d3.scalePoint()
  .domain([...Array(nTopics).keys()])
  .range([0,height])
  
  // draw x-axis
  container.append("g")
    .attr("transform", "translate(" + margin.left + ",0)")
    .call(d3.axisBottom(xScale)
          .tickValues([1,10,20,31])
          .tickFormat(function (d) {
            return d > 1 ? "March " + d : 1;
          })
          // .tickValues(xScale.domain().filter((d, i) => d % 5 === 0)));
          );
          
  
  //
  // Initialize Vertical Grid Lines
  //
  const gridLines = container.append("g").attr("class", "vertical-grid")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("width", width-labelWidth).attr("height", height)  
  gridLines.append("line").attr("stroke", "#bfbeba").attr("stroke-width", 1).style("opacity",0)

  //
  // Color palette
  //
  var color = d3.scaleOrdinal()
    .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#dbaf2a','#a65628','#f781bf','#999999'])
    
  //
  // Initialize Topic Labels (they will animate to move around later)
  //
  const labelGroup = container.append("g").attr("class","topic-labels")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                        .attr("height", height)
  // Label Boxes
  labelGroup.append("rect")//.attr("class", "labelContainer")
  
  // Label Text
  labelGroup.append("text").attr("dy", "15px").attr("dx", "5px")
  
  //
  // Initialize Timelines
  //
 
  const pathGroup = container.append("g").attr("class","topic-lines")
                       .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  pathGroup.append("path").attr("fill", "none").attr("stroke-width", 2).attr("class", "line")
  
  //
  // Initialize Hover Interaction
  //
  
  // Mouseover the grid - will monitor mousemove events
  const mouse_catcher = container.append("g").attr("class", "mouse-catcher")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .append("rect").attr("width", width-labelWidth).attr("height", height).attr("opacity", 0)
  
  // Date highlighter
  var tickwidth = xScale(2) // width of one day
  // create a group that will move left and right based on mouse position
  const dateHelper = container.append("g").attr("class", "date-interactive")
                              .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  
  // add feedback rectangle and text
  const dateFeedbackRect = dateHelper.append("rect")
                                  .attr("width", tickwidth).attr("height", height+30)
                                  .attr("fill", "#e8e8e8").attr("opacity", "0.5")
                                  .style("pointer-events", "none")
  // label box and text are nested in another group.
  const dateLabel = dateHelper.append("g").attr("transform", "translate(0,"+(height+20)+")")
  // add date label at the bottom
  dateLabel.append("rect")
            .attr("width", "100").attr("height", "20")
            .attr("fill", "#000000").attr("rx",3).attr("ry",3).attr("x",(tickwidth-80)/2)
  
  const dateLabelText = dateLabel.append("text").attr("class","dateText")
                                 .attr("dy", "1.1em").attr("dx", "1em").text("March 12")

  function follow_pointer(x) {
    var w = xScale(2) // width of one day
    var date = Math.floor(x/w);
    // console.log(x,w,date, xScale(2))
    if (date >= 0){
      dateLabelText.text("March " + (date+1))
    }
    x = Math.floor(x/w)*(w)-(w/2);
    dateHelper.attr("transform", () =>  "translate(" + (margin.left + x) + "," + (margin.top-10) + ")")
  }
  follow_pointer(-100)
    
  mouse_catcher.on("mouseenter mousemove", function(d){
    var coordinates= d3.mouse(this);
    var x = coordinates[0];
    var y = coordinates[1];

    // console.log(x,y);
    follow_pointer(x)
  }).on("mouseleave", function(d){
    // hide off screen
    follow_pointer(-100)
  });

  //
  // All the plot elements were initialized above
  // The drawChart function updates all the elements with new data
  //
  function drawChart(nTopics){
    
    //
    // Adjust chart area
    //
    height = nTopics*(20+5)
    container.attr("height", height + margin.top + margin.bottom)
    
    //
    // Prepare the data
    //  
    let curr_data = prepare_data(nTopics, chartData)
  
    //
    // Update scales
    //
    yScale.domain([...Array(nTopics).keys()]).range([0,height])
    
    //
    // Color palette
    //
    var names = curr_data.map(function(d){ return d.key }) // list of group names
    color.domain(names)

    // Vertical Grid Lines
    var w = xScale(2) // width of one day
    gridLines.selectAll("line")
        .data([...Array(32).keys()])
        .join("line").attr("class", "grid")
          .attr("x1", function(d){
            if (d > 0){
              return xScale(d)-(w/2)
            }else{
              return -10
            }
          }) 
          .attr("x2", d => d > 0 ? xScale(d)-(w/2) : -100)
          .attr("y1", -10).attr("y2", height+10)
          .attr("stroke", "#bfbeba").attr("stroke-width", 1)
    
    // Topic Label Boxes
    let labels = labelGroup.selectAll("rect")
              .data(curr_data)
              .join("rect").attr("class", "labelContainer")
                  .attr("topic", d => d.selector)
                  .attr("name", d => d.key)
                  .attr("x", width-labelWidth)
                  .attr("rank", d => d)
                  .attr("fill", function(d){ return color(d.key) })
    
    // Topic Label Text
    let labelsText = labelGroup.selectAll("text")
              .data(curr_data)
              .join("text").attr("class", "labelText").attr("dy", "15px").attr("dx", "5px")
                .text(d => (d.values[30].rank + 1) +" " +d.key)
                // .attr("y", d => yScale(d.values[30].rank)-10)
                .attr("x", width-labelWidth)
    
    labels.transition()
            .ease(d3.easeCubicInOut)
            .duration(1000)         
            .attr("y", d => yScale(d.values[30].rank)-10)
    labelsText.transition()
            .ease(d3.easeCubicInOut)
            .duration(1000)         
            .attr("y", d => yScale(d.values[30].rank)-10)

    // draw lines
    pathGroup.selectAll("path")
      .data(curr_data)
      .join("path")
        .attr("fill", "none")
        .attr("stroke", function(d){ return color(d.key) })
        .attr("stroke-width", 2)
        .attr("class", "line")
        .attr("topic", d => d.selector)
        .attr("d", function(d){
              return d3.line()
                .curve(d3.curveMonotoneX)
                // .curve(d3.curveCatmullRom.alpha(1))
                .x(function(d) { return xScale(d.date) })
                .y(function(d) { return yScale(d.rank) })
                (d.values)
              })
 
    
    //
    // Hover Interaction
    // highlight topic label and line
    //    
    labels.on("mouseover", function(d){    
      labelGroup.selectAll("rect").attr("class", "labelContainer background")
      pathGroup.selectAll("path.line").attr("class", "line background")

      this.setAttribute("class", "labelContainer")
      pathGroup.select("path.line[topic="+this.getAttribute('topic')+"]").attr("class", "line")
      
      // print out hashtags for this topic
      var topic = this.getAttribute('name');
      var tags = topicHashtags.find(function(d) {return d.topicName == topic}).hashtags.split(' ').slice(0,50)
      // console.log()
      hashtags.html("Top hashtags in <b>"+topic+"</b> cluster:<br/>#" + tags.join(" #"))
              .style("color", color(d.key))
              .style("border-left", "2px solid " + color(d.key))
    }).on("mouseout", function(d){
      labelGroup.selectAll("rect").attr("class", "labelContainer")
      pathGroup.selectAll("path.line").attr("class", "line")
      hashtags.html("").style("border-left", "0px solid " + color(d.key))
    });
    
    
    // Update Timeline Hover Interaction 
    mouse_catcher.attr("height", height)
    dateFeedbackRect.attr("height", height+30)
    dateLabel.attr("transform", "translate(0,"+(height+20)+")")
  }
  
  drawChart(nTopics)
  
  ///
  // Show more/less topics
  //
  showMore.on("click", function(d) {
    if (nTopics >= 50){
      return
    }

    nTopics += 5
    // console.log("show more: " + nTopics)
    drawChart(nTopics)
  });
  showLess.on("click", function(d) {
    if (nTopics <= 5){
      return
    }

    nTopics -= 5
    // console.log("show more: " + nTopics)
    drawChart(nTopics)
  });
    
  ///
  // change data source
  //
  toggleBot.on('click', function() {
    // var selectedText = d3.select('#filter-accounts option:checked').text();
    // var selectedValue = d3.select("#filter-accounts").property("value") ;

    var selectedValue = this.getAttribute("value");
    var query = selectedValue == "human" ? "bot" : "human";
    var url = "https://raw.githubusercontent.com/mashabelyi/Twitter-Covid-Response/master/data/topics_timeline_v2_"+query+".csv";

    if (this.getAttribute('value')=='human'){
      this.setAttribute('value', 'bot')
      d3.select(this).text('GO BACK').style("background-color","#2ef0cc")
    }else{
      this.setAttribute('value', 'human')
      d3.select(this).text('SEE BOTS').style("background-color","black")
    }

    d3.csv(url).then(function(loaded) {
      chartData = loaded
      // console.log(chartData)
      drawChart(nTopics)
    });
    
  });
    

  //   .on('click', function(){
    
  // })
  
  // TRYING TO FIGURE OUT ANIMATION BELOW:
  //
    // function returning interpolated stroke-dasharray value
    // function tweenDash() {
    //   // var l = this.node().getTotalLength()
    //   var i = d3.interpolateString("0," + l, l + "," + l);
    //   return function(t) { return i(t); };
    // }
    
  // Timeline animation
  function set_date(date) {
    // update lines
    let paths = pathGroup.selectAll("path")
                          .join("path")
    
    // do the animation; see the posts on arc animation for explanation
    paths
   // hide the arcs
    .attr("stroke-dasharray", function () {
      // console.log(this.getTotalLength())
      return this.getTotalLength()
    })
    .attr("stroke-dashoffset",  function () {
      return this.getTotalLength()
    })
  // reveal the arcs   
     .transition()
     .duration(8000)
     // .styleTween("stroke-dasharray", function(){
     //        var l = this.node().getTotalLength()
     //        var i = d3.interpolateString("0," + l, l + "," + l);
     //        return function(t) { return i(t); };
      // }) 
     .attr("stroke-dashoffset", 0)
  // hide them again
    //  .transition()
    //  .attr("stroke-dashoffset",  function () {
    //   return this.getTotalLength()
    // })
   
    // paths.transition()
    //         .ease(d3.easeCubicInOut)
    //         .duration(1000)         
    //         .attr("d", function(d){
    //           return d3.line()
    //             .curve(d3.curveMonotoneX)
    //             // .curve(d3.curveCatmullRom.alpha(1))
    //             .x(function(d) { return xScale(d.date) })
    //             .y(function(d) { return yScale(d.rank) })
    //             (d.values.slice(0,date))
    //           })
  }
   
  // set_date(test_date)
}

function sorted_idx(arr) {
  var indexed = arr.map(function(e,i){return {ind: i, val: e}});
  indexed.sort(function(x, y){return x.val > y.val ? 1 : x.val == y.val ? 0 : -1});
  var indices = indexed.map(function(e){return e.ind});
  return indices
}

function prepare_data(n, d) {
  var tmp = d.slice(0,n);
  var out = []
  for (var t=0; t<n; t++) {
    out.push({"key": tmp[t].name, "values":[], "selector": tmp[t].name.replace(/[^A-Za-z0-9]/g,'').replace(/ /g,'')})
  }

  // calculate ranks for each day
  for (var date=1; date<32; date++) {
    var ranks = tmp.map(x => +x[date]); // list of all ranks

    // get sorted order
    var indices = sorted_idx(ranks);

    // save values
    for (var i = 0; i < indices.length; i++) {
      out[indices[i]].values.push({"date":date, "rank":i})
    }
  }

  return out;
}

Promise.all([
    d3.csv("https://raw.githubusercontent.com/mashabelyi/Twitter-Covid-Response/master/data/hashtag_clusters_unique.csv"),
    d3.csv("https://raw.githubusercontent.com/mashabelyi/Twitter-Covid-Response/master/data/topics_timeline_v2_all.csv")
]).then(function(files) {
    // files[0] will contain file1.csv
    // files[1] will contain file2.csv
    hashtags = files[0];
    data = files[1];

    drawTimeline(hashtags, data);
}).catch(function(err) {
    // handle error here
    console.log(err)
})




