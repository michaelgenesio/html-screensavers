const WorldHop = function(svg) {
  const width = svg.clientWidth;
  const height = svg.clientHeight;

  this.svg = d3.select(svg);

  this.projection = d3.geoNaturalEarth1()
    .scale((width + 1) / 2 / Math.PI)
    .translate([width / 2, height / 2])
    .precision(.1);

  this.path = d3.geoPath(this.projection);

  this.gCountries = this.svg.append("g")
    .attr("fill", "#00CC00")
    .attr("stroke", "#009900")
    .attr("stroke-width", "1");

  this.gCircles = this.svg.append("g")
    .attr("fill", "#f00")
    .attr("stroke", "#fff");

  this.gLines = this.svg.append("g")
    .attr("stroke-dasharray", "5,5")
    .attr("fill", "none")
    .attr("stroke", "#ff0000")
    .attr("stroke-width", "5");

  this.previousCountries = [];
};


WorldHop.prototype.start = function() {
  const that = this;
  d3.json("world-topo-min.json", function(error, world) {

    if (error) {
      return;
    }

    that.createMap(world);

    that.drawRandomPoint();
    that.interval = setInterval(that.drawRandomPoint.bind(that), 5000);
  });
}

WorldHop.prototype.stop = function() {
  clearInterval(this.interval);
}

WorldHop.prototype.createMap = function(world) {
  this.countries = topojson.feature(world, world.objects.countries).features;

  var country = this.gCountries.selectAll(".country").data(this.countries);

  country.enter()
    .insert("path")
    .attr("class", "country")
    .attr("d", this.path);

  this.gCountries.append("path")
      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
      .attr("stroke", "none")
      .attr("fill", "none")
      .attr("d", this.path);
}

WorldHop.prototype.drawRandomPoint = function() {
  var randomCountry = this.countries[Math.floor(Math.random() * this.countries.length)];
  if (!randomCountry.geometry) {
    return;
  }

  this.gCircles.append("svg:circle")
    .attr("id", "country" + randomCountry.id)
    .attr("cx", this.path.centroid(randomCountry)[0])
    .attr("cy", this.path.centroid(randomCountry)[1])
    .attr("r", 100)
    .style("opacity", "0.0")
    .transition()
      .duration(1000)
      .style("opacity", "1.0")
      .attr("r", 2);

  if (this.previousCountries.length > 0) {
    this.connectPoints(randomCountry, this.previousCountries[this.previousCountries.length - 1]);
  }

  if (this.previousCountries.length > 10) {
    const oldestPoint = this.previousCountries.shift();
    this.removePoint(oldestPoint);
  }

  this.previousCountries.push(randomCountry);
}

WorldHop.prototype.connectPoints = function(origin, target) {
  const greatArc = {
    "type": "LineString",
    "coordinates": [
      [d3.geoCentroid(origin)[0], d3.geoCentroid(origin)[1]],
      [d3.geoCentroid(target)[0], d3.geoCentroid(target)[1]],
    ]
  };

  this.gLines.append("path")
   .datum(greatArc)
   .attr("id", "lineFromCountry" + origin.id)
   .attr("d", this.path)
   .style("opacity", "0")
   .transition()
     .delay(500)
     .duration(1000)
     .style("opacity", "0.7");
}

WorldHop.prototype.removePoint = function(point) {
  d3.select("#country" + point.id)
    .transition()
    .duration(2000)
    .style("opacity", "0.0")
    .remove();
  d3.select("#lineFromCountry" + point.id)
    .transition()
    .duration(2000)
    .style("opacity", "0.0")
    .remove();
}
