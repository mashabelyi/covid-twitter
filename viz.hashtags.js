// Following codes are adapted from https://observablehq.com/@mbostock/d3-hierarchical-edge-bundling-ii
function drawHirearchical(data, elId) {  
    const width = 600;
    const height = 600;
    const radius = width / 2;
    const tree = d3.cluster().size([2 * Math.PI, radius - 100]);
    const line = d3.radialLine()
        .curve(d3.curveBundle.beta(0.85))
        .radius(d => d.y)
        .angle(d => d.x);
    const root = tree(d3.hierarchy(data));
    const map = new Map(root.leaves().map(d => [d.data.id, d]));
    const font_size = 18
    const font_size_mouseover = 19

    const outerDiv = d3.select(elId);
    // width = outerDiv.node().getBoundingClientRect().width
    // height = nTopics*(20+5)


    // const container = d3.select(DOM.svg(width, height))
    //   .attr("viewBox", `${-width / 2-80} ${-height / 2-80} 
    //                     ${width*1.2} ${height*1.2}`)


    const container = outerDiv.append("svg")
        .attr("width",width).attr("height",width)
        .style("max-width", "100%")
        .style("height", "auto")
        .style("display", "block")
        .style("margin", "auto")
        .style("font", "1.2em sans-serif")
        .style("font-size", font_size)
        // .style("fill", "black")
                    
    const text = container.selectAll("text")
                           .data(data.name)
                           .enter()
                           .append("text")

    const link = container.append("g").attr('class','cluster-links').style('transform','translate(50%,50%)')
                        .attr("fill", "none")
                        .attr("stroke", "black")
                        .attr("stroke-opacity", 0.8)
                        .selectAll("path")
                        .data(d3.merge(root.leaves().map(d => d.data.targetIds.map(i => d.path(map.get(i))))))
                        .join("path")
                            .style("mix-blend-mode", "multiply")
                            .attr("d", line)

    //   const topic = container.append("g")
    //         .selectAll("text")
    //         .data(root.leaves())
    //         .join("text") 
    //         .text(d => d.data.topic)
    //         .attr("fill",d => d.data.color)
    //         .attr("font-size", 24)
    //         .attr("x", function(d) {
    //                             if (d.data.topic === 'Republican') {
    //                               return 150;}
    //                             if (d.data.topic === 'Economy') {
    //                               return 340;}
    //                             if (d.data.topic === 'Health Official') {
    //                               return 330;}
    //                             if (d.data.topic === 'Quarantine') {
    //                               return 50;}
    //                             if (d.data.topic === 'Health') {
    //                               return -390;}
    //                             if (d.data.topic === 'International') {
    //                               return -480;}
    //                             if (d.data.topic === 'Democrat') {
    //                               return -481;}
    //                             if (d.data.topic === 'China') {
    //                               return -350;}
    //                             if (d.data.topic === 'Other') {
    //                               return -190;}
    //                             if (d.data.topic === 'Toilet Paper') {
    //                               return -40;}
          
    //         } )
    //         .attr("y", function(d) {
    //                             if (d.data.topic === 'Republican') {
    //                               return -350;}
    //                             if (d.data.topic === 'Economy') {
    //                               return 170;}
    //                             if (d.data.topic === 'Health Official') {
    //                               return -90;}
    //                             if (d.data.topic === 'Quarantine') {
    //                               return 450;}
    //                             if (d.data.topic === 'Health') {
    //                               return 290;}
    //                             if (d.data.topic === 'International') {
    //                               return 90;}
    //                             if (d.data.topic === 'Democrat') {
    //                               return -210;}
    //                             if (d.data.topic === 'China') {
    //                               return -350;}
    //                             if (d.data.topic === 'Other') {
    //                               return -370;}
    //                             if (d.data.topic === 'Toilet Paper') {
    //                               return -410;}
          
    //         } )

    const node = container.append("g").attr('class','cluster-text').style('transform','translate(50%,50%)')
    .selectAll("text")
    // .attr("fill","black")
    .attr("font-size",font_size) 
    .data(root.leaves())
    .join("text")
      .attr("transform", d => `
        rotate(${d.x * 180 / Math.PI - 90})
        translate(${d.y},0)${d.x >= Math.PI ? `
        rotate(180)` : ""}
      `)
      .attr("dy", "0.31em")
      .attr("x", d => d.x < Math.PI ? 3 : -3)
      .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
      .text(d => d.data.id)
      .attr("fill",d => d.data.color)

    node.on('mouseover', function(d) {
     d3.select(this).style("font-weight",'bold');

     link
      .style('stroke-width',function(arcd) {
           const sourceId = arcd[0].data.id;
           const targetId = arcd[arcd.length - 1].data.id;
           return d.data.id === sourceId || d.data.id == targetId ? 4: 1;})
    });

    node.on('mouseout', function (d) {   
     node.style("font-weight","normal");
     link.style('stroke', 'black');
     link.style('stroke-width', 1);
    });


    return container.node();
}

function formatData(nodes,links){
    const groupById = new Map;
    const nodeById = new Map(nodes.map(node => [node.id, node]));

    // console.log("groupById");
    // console.log(groupById);

    for (const node of nodes) {
        let group = groupById.get(node.group);
        if (!group) groupById.set(node.group, group = {name: node.group, children: []});
            group.children.push(node);
            node.targetIds = [];
        }

        for (const {source: sourceId, target: targetId} of links) {
        const source = nodeById.get(sourceId);
        source.targetIds.push(targetId);
    }

    return {name: "topicgroups", children: [...groupById.values()]};
}


function drawBars(data, elId, dir, legend){
    // console.log(data);
    const outerDiv = d3.select(elId)
    var width = outerDiv.node().getBoundingClientRect().width
    var height = 500

    // const height = 500;
    const margin = ({top: 20, right: 10, bottom: 30, left: 40});

    const y = d3.scaleBand()
        .domain(data.map(d => d.HashtagPair))
        .range([margin.top, height - margin.bottom])
        .padding(0.1);

    const x = d3.scaleLinear()
        // .domain([0, d3.max(data, d => +d.Count)]).nice()
        .domain([0, 522]).nice()
        .range([margin.left, width - margin.right]);

    const xAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisRight(y))
        .call(g => g.select(".domain").remove());

    const yAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));

    // const svg = d3.create("svg")
    //     .attr("viewBox", [0, 0, width, height]);
    
    accent_color = "#8050bf" //#4b78d1

    const svg = outerDiv.append("svg").attr("width", width).attr('height', height);

    //bars
    const bar = svg.append("g")
                .selectAll("rect")
                .data(data)
                    .join("rect")
                    // .attr("x", d => x(Math.min(+d.Count, 0))) 
                    // .attr("x", d => +d.Count) 
                    .attr("x", function(d){
                        if (dir=="left"){
                            return (width - (+d.Count));
                        }
                        else {return  x(0)}
                    })
                    .attr("y", d => y(d.HashtagPair))
                    .attr("width", d => x(+d.Count) - x(0))
                    .attr("height", y.bandwidth())
                    .attr("fill", d => (d.Type=="political" ? accent_color: "#c2c4c3"));
    
    // text
    var tickHeight = height/data.length;
    svg.append("g")
        .selectAll("text")
        .data(data)
        .join("text")
            .attr("text-anchor", dir=="left" ? 'start': 'end')
            // .attr("x", d => x(+d.Count) - 10 )
            .attr("x", function(d){
                        if (dir=="left"){
                            return (width - (+d.Count) + 10);
                        }
                        else {return  x(+d.Count) - 10;}
                    })
            .attr("y", d => y(d.HashtagPair) + tickHeight/2)
            .text(d => d.HashtagPair)
            .attr("fill", "white")


    svg.append("g")
        .selectAll("text")
        .data(data)
        .join("text")
            .attr("text-anchor", dir=="left" ? 'end': 'start')
            // .attr("x", d => x(+d.Count) + 10 ) // - x(0) ) //Math.min?
            .attr("x", function(d){
                        if (dir=="left"){
                            return (width - (+d.Count) - 10);
                        }
                        else {return  x(+d.Count) + 10;}
                    })
            .attr("y", d => y(d.HashtagPair) + tickHeight/2)
            // .text(d => +d.Count)
            .text(d => dir=="left" ? ("| "+d.Count) : (d.Count +  " |" ))
            .attr("fill", "black")

    svg.append("g")
        .selectAll("text")
        .data(data)
        .join("text")
            .attr("text-anchor", dir=="left" ? 'end': 'start')
            // .attr("x", d => x(+d.Count) + 10 ) // - x(0) ) //Math.min?
            .attr("x", function(d){
                        if (dir=="left"){
                            return (width - (+d.Count) - 40);
                        }
                        else {return  x(+d.Count) + 40;}
                    })
            .attr("y", d => y(d.HashtagPair) + tickHeight/2)
            .text(d => d.UserCount)
            .attr("fill", "#30c74b")


    // LEGEND
    // "#4b78d1" - political
    // "#c2c4c, 3" - other
    if (legend) {
        legendW = 100

        var legend = svg.append("g").attr("class", "legend")
                        .attr("transform", "translate("+(width*0.7)+","+tickHeight+")")
                        

        legend.append("rect")
                .attr("fill", accent_color)
                .attr("width", legendW).attr("height", tickHeight)

        legend.append("rect")
                .attr("fill", "#c2c4c3") 
                .attr("width", legendW).attr("height", tickHeight)
                .attr("transform","translate(0,"+(tickHeight+10)+")") 

        legend.append("text")
                .attr("text-anchor", "middle")
                .attr("x", legendW/2).attr("y", 3+tickHeight/2)
                .attr("fill", "white")
                .text("political")

        legend.append("text")
                .attr("text-anchor", "middle")
                .attr("x", legendW/2).attr("y", 3+tickHeight/2)
                .attr("fill", "white")
                .text("other")
                .attr("transform","translate(0,"+(tickHeight+10)+")")

        legend.append("text")
                .attr("text-anchor", "middle")
                .attr("x", legendW/2).attr("y", 3+tickHeight/2)
                .attr("fill", "black")
                .text("number of tweets")
                .attr("transform","translate(0,"+(2*(tickHeight+10))+")")   

        legend.append("text")
                .attr("text-anchor", "middle")
                .attr("x", legendW/2).attr("y", 3+tickHeight/2)
                .attr("fill", "#30c74b")
                .text("number of accounts")
                .attr("transform","translate(0,"+(3*(tickHeight+5))+")")   
    }    


    // svg.append("g")
    //  .call(xAxis);

    // svg.append("g")
    //  .call(yAxis);
}

function drawLegend(elId){

    const outerDiv = d3.select(elId)
    var width = outerDiv.node().getBoundingClientRect().width
    var height = 100

    // const height = 300;
    // const width = 500;
    const margin = { top: 0, right: 0, bottom: 0, left:0 };

    const series = [
        { key: "StayHome" },
        { key: "Health" },
        { key: "Economy" },
        { key: "AntiTrump" },
        { key: "ProTrump" },
        { key: "International" },
        { key: "China" },
        { key: "Music" },
        { key: "Election" },
        { key: "New York" },
        { key: "Toilet Paper" },
        { key: "Vote Blue" },
        { key: "Cybersecurity" },
        { key: "Travel" },
        { key: "Canada" },
        { key: "SXSW" },
        { key: "Seattle" }
        ];

    const color = d3
        .scaleOrdinal()
        .domain(series.map(d => d.key))  
        .range( ['#35AAF2','#33CC89','#CC9829','#4777CC','#CC6352','#3DBBCC','#5652CC','#CC476A','#1171CC','#99957A','#CC7839','#173C80','#3DCCB3','#628000','#850F00','#CC831C','#7C8500']
              );

    const svg = outerDiv
        .append("svg")
        .attr("width", series.length * 60)
        .attr("height", 70)
        .style("font", "10px sans-serif")
        .style("margin-left", `${margin.left}px`)
        .style("display", "block").style("margin","auto")
        .attr("text-anchor", "middle");

    const g = svg
        .append("g")
        .selectAll("g")
        .data(series)
        .join("g")
        .attr("transform", (d, i) => `translate(${i * 58},0)`);

    g.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", d => color(d.key));

    g.append("text")
        .attr("x", 20)
        .attr("y", 25)
        .attr("text-anchor", "center")
        .attr("dy", "0.8em")
        .text(d => d.key);


}

Promise.all([
    d3.json("data/final_covid_hashtags_by_tweet-copy.json"),
    d3.json("data/final_covid_hashtags_by_users-copy1.json"),
    d3.csv("data/20_hashtag_pairs_formatted.csv"),
    d3.csv("data/20_hashtag_pairs_unique_formatted.csv"),
]).then(function(files) {
    // var {nodes,links} = files[0];

    data31 = formatData(files[0].nodes,files[0].links);
    
    // {n2,l2} = files[1];
    data32 = formatData(files[1].nodes,files[1].links);

    drawHirearchical(data32, "#HashtagsGraph");

    // console.log(files[2])
    drawBars(files[2], "#HashtagsBarsLeft", "left", false)
    drawBars(files[3], "#HashtagsBarsRight", "right", true)
    drawLegend("#HashtagsLegend")

    // data = files[1];
}).catch(function(err) {
    // handle error here
    console.log(err)
})



