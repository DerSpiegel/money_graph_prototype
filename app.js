var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

//var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

//Set up tooltip for nodes
var tip_node = d3.tip()
    .attr('class', 'd3-tip_node')
    .offset([40, 70])
    .html(function (d) {
        return "" +
        "<div class=tt_title>" + d.id + "</div>" +
        "<div class=tt_normal>Connected to: " + "54 entities" + "</div>" +
        "<div class=tt_normal>First document: " + "07/04/2014" + "</div>" +
        "<div class=tt_normal>Last document: " + "09/11/2015" + "</div>";
    });

var tip_edge = d3.tip()
    .attr('class', 'd3-tip_edge')
    .offset([40, 70])
    .html(function (d) {
        return "" +
            "<div class=tt_title>from: " + d.source.id + "</div>" +
            "<div class=tt_title>to: " + d.target.id + "</div>" +
            "<div class=tt_normal>date: " + "07/04/2014" + "</div>" +
            "<div class=tt_normal>links between nodes: " + "14" + "</div>" +
            "<div class=tt_normal>total amount: " + "$ 3.4 million" + "</div>";
    });


svg.call(tip_node);
svg.call(tip_edge);

// calculate circle size from number of edges
circleSize = d3.scaleQuantize()
    .range([4,5,6,8]);


d3.json("./data/miserables.json", function(error, graph) {
    if (error) throw error;

    circleSize.domain(d3.extent(graph.nodes, function(d) { return d.group; }));

    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", function(d) { return Math.sqrt(d.value); })
        .on('mouseover', tip_edge.show)
        .on('mouseout', tip_edge.hide);

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("id", function(d){
            return d.id;
        })
        .attr("r", function(d){ return circleSize(d.group); })
        .attr("fill", "steelblue")
        .attr("stroke", function(d){
            if (d.group > 7) { return "#000"; }
            else { return "#fff"; }
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
            .on('mouseover', tip_node.show)
            .on('mouseout', tip_node.hide);

    node.append("title")
        .text(function(d) { return d.id; });

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);



    var optArray = [];
    for (var i = 0; i < graph.nodes.length - 1; i++) {
        optArray.push(graph.nodes[i].id);
    }
    optArray = optArray.sort();
    $(function () {
        $("#search").autocomplete({
            source: optArray
        });
    });

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }
});

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

function searchNode() {
//only working for node names without spaces
    var selectedVal = document.getElementById('search').value;
    var selectedNode = d3.select("#" + selectedVal);
    var selectedNodeRadius = selectedNode.attr("r");

    selectedNode
        .transition()
        .duration(500)
        .attr("r", function(){
            return selectedNodeRadius * 4;
        })
        .transition()
        .duration(3000)
        .attr("r", function(){
            return selectedNodeRadius;
        });
}