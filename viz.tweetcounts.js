function drawTweetsByDay(pop_data, tweet_data, state_converter, us) {

  highlight_color = '#6eabcc';

  const outerDiv = d3.select("#TweetsByDay");
  width = outerDiv.node().getBoundingClientRect().width
  height = width*0.5;

  const path = d3.geoPath()

  
  const outerMap = d3.select("#TweetsByDay-map");
  // width = 975
  // height = 1000
  const svg = outerMap.append("svg").attr('class','usa-map')
                .attr("width",width).attr("height", height)
                .style('font', '0.8em sans-serif')
                .style('text-anchor', 'middle')
                .style('fill', '#426080')
  
  // Initializing graph text
  svg.append('text')
              .attr('class', 'bartext')
              .attr('x', (width / 2))             
              .attr('y', 680)
              .style('font-size', '16px')
              .text('Number of tweets mentioning COVID-19 by date:');
  
  svg.append('text')
              .attr('class', 'bartextState')
              .attr('x', (width / 2))             
              .attr('y', 705)
              .style('font-size', '16px')
              .style('font-weight', 'bold')
              .style('fill', '#CC442F')
              .text('California');
  
  svg.append('text')
              .attr('x', (width / 2))             
              .attr('y', 730)
              .style('font-size', '16px')
              .text('State Population:');
  
  svg.append('text')
              .attr('class', 'bartextPop')
              .attr('x', (width / 2))             
              .attr('y', 755)
              .style('font-size', '16px')
              .style('font-weight', 'bold')
              .style('fill', '#CC442F')
              .text("39512223");
  
  svg.append('text')
              .attr('x', (width / 2))
              .attr('y', 950)
              .style('font-size', '12px')
              .text('Date in March')

  
  scale = 0.5
  // Adds the map
  svg.append('g')
    .selectAll('path')
    .data(topojson.feature(us, us.objects.states).features)
    // .enter().append('path')
    .join("path")
      .attr('class', 'stateShape')
      .attr("transform", "scale("+scale+")")
      .attr('d', path)
      .style('cursor', 'pointer')
      .attr('fill', d => {return (d.id == "06") ? '#CC442F' : highlight_color})
      .attr('opacity', d => {return (d.id == "06") ? 1 : .7})
      .on('click mouseenter', d => {
        console.log("clicked")
        d3.selectAll('.stateShape')
          .attr('fill', highlight_color)
          .attr('opacity', .7);
        const id = d.id; // d.id is the number code for the state
        outline.attr('d', path(d));
        update(state_converter.find((d) => {return d.id == id}).stateAbr);
      });

  // Outlines the states in white
  svg.append('path')
      .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-linejoin', 'round')
      .attr("transform", "scale("+scale+")")
      .attr('d', path);

  // Changes fill of clicked state
  const outline = svg.append('path')
      .attr('fill',  '#CC442F')
      .attr('stroke', 'white')
      .attr('stroke-linejoin', 'round')
      .attr("transform", "scale("+scale+")");
  
  // -------------------------------------------------------
  // DRAW BAR CHART
  // -------------------------------------------------------

  const outerBars = d3.select("#TweetsByDay-bars");
  barsW = outerBars.node().getBoundingClientRect().width;
  console.log(barsW)
  barsH = 200
  margin = ({top: 30, right: 30, bottom: 30, left: 40})
  const bars = outerBars.append("svg")
                .attr("width",barsW + margin.left+margin.right).attr("height", barsH+ margin.top+margin.bottom)
                .style('font', '0.8em sans-serif')
                .style('text-anchor', 'middle')
                .style('fill', '#426080')


  x = d3.scaleBand()
    .domain(d3.range(tweet_data.length))
    .range([margin.left, margin.left+barsW])
    .padding(0.1)

  y = d3.scaleLinear()
    .domain([0, 100000])
    .range([barsH+margin.bottom,margin.bottom]) // reverse the direction. smart!


  xAxis = g => g
    .attr('transform', `translate(0,${barsH + margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(i => tweet_data[i].date).tickSizeOuter(0))
    .call(g => g.selectAll('text')
        .style('font', '0.8em sans-serif')
        .style('text-anchor', 'middle')
        .style('fill', '#426080'))
  bars.append('g')
      .call(xAxis);

  yAxis = g => g
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, tweet_data.format))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('text')
        .attr('x', -margin.left + 15)
        .attr('y', 0)
        .style('font', '0.8em sans-serif')
        .style('text-anchor', 'middle')
        .style('fill', '#426080'))
  bars.append('g')
    .call(yAxis);

  // Bar chart
  bars.append('g')
      .attr('class', 'bars')
      .attr('fill', highlight_color)
      .selectAll('rect')
      .data(tweet_data)
      .join('rect')
      .attr('x', (d, i) => x(i))
      .attr('y', d => y(d.CA))
      .attr('height', d => y(0) - y(d.CA))
      .attr('width', x.bandwidth())
      .style('opacity', 0.7);

  

  
  
  // Updates the bar graph for the clicked state
  function update(key) {
    d3.select('.bars').selectAll('rect')
      .attr('y', y(0))
      .attr('height', 0)
      .transition() // bar graph animation
        .duration(800)
        .attr('y', (d) => {return y(d[key])})
        .attr('height', (d) => {return y(0) - y(d[key])})
        .delay((d,i) => {return(i*20)});
    
    d3.selectAll('.bartextState').remove()
    d3.selectAll('.bartextPop').remove()
    
    let stateName = state_converter.find((d) => {return d.stateAbr == key}).stateName
    
    bars
      .append('text') // adds new bar graph title
      .attr('class', 'bartextState')
      .attr('x', (width / 2)) 
      .attr('y', 705)
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#CC442F')
      .text(stateName)
    
    bars // adds population
      .append('text')
      .attr('class', 'bartextPop')
      .attr('x', (width / 2))             
      .attr('y', 755)
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#CC442F')
      .text(pop_data.find((d) => {return d.NAME == stateName}).POPESTIMATE2019);
  }

}

Promise.all([
    d3.csv("data/nst-est2019-alldata.csv"),
    d3.csv("data/tweets_counts_by_state_by_date.csv"),
    d3.csv("data/state_converter.csv"),
    d3.json('data/states-albers-10m.json')
]).then(function(files) {
    // files[0] will contain file1.csv
    // files[1] will contain file2.csv
    pop_data = files[0];
    tweet_data = files[1];
    state_converter = files[2];
    us = files[3];

    drawTweetsByDay(pop_data, tweet_data, state_converter, us);
}).catch(function(err) {
    // handle error here
    console.log(err)
})



