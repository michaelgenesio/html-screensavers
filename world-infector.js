const cities = [
  { name: "Algiers", lat: 36.753, lon: 3.058, },
  { name: "Athens", lat: 37.983, lon: 23.727, },
  { name: "Auckland", lat: -36.840, lon: 174.740, },
  { name: "Bangkok", lat: 13.752, lon: 100.494, },
  { name: "Bangkok", lat: 13.752, lon: 100.494, },
  { name: "Beijing", lat: 39.917, lon: 116.383, },
  { name: "Berlin", lat: 52.516, lon: 13.388, },
  { name: "Buenos Aires", lat: -34.603, lon: -58.381, },
  { name: "Cairo", lat: 30.044, lon: 31.235, },
  { name: "Cape Town", lat: -33.925, lon: 18.423, },
  { name: "Chicago", lat: 41.836, lon: -87.684, },
  { name: "Dallas", lat: 32.775, lon: -96.796, },
  { name: "Delhi", lat: 28.610, lon: 77.230, },
  { name: "Dublin", lat: 53.349, lon: -6.260, },
  { name: "Havana", lat: 23.133, lon: -82.383, },
  { name: "Hong Kong", lat: 22.300, lon: 114.2, },
  { name: "Honolulu", lat: 21.300, lon: -157.817, },
  { name: "Irkutsk", lat: 52.283, lon: 104.283, },
  { name: "Jakarta", lat: -6.200, lon: 106.817, },
  { name: "Khartoum", lat: 15.500, lon: 32.560, },
  { name: "Kinshasa", lat: -4.325, lon: 15.322, },
  { name: "Lagos", lat: 6.455, lon: 3.384, },
  { name: "London", lat: 51.507, lon: -0.127, },
  { name: "Los Angeles", lat: 34.050, lon: -118.250, },
  { name: "Madrid", lat: 40.383, lon: -3.717, },
  { name: "Mexico City", lat: 19.433, lon: -99.133, },
  { name: "Mogadishu", lat: 2.033, lon: 45.333, },
  { name: "Moscow", lat: 55.750, lon: 37.617, },
  { name: "Mumbai", lat: 18.975, lon: 72.825, },
  { name: "Munich", lat: 48.133, lon: 11.567, },
  { name: "Nairobi", lat: -1.150, lon: 36.650, },
  { name: "New York City", lat: 40.712, lon: -74.005, },
  { name: "Nuuk", lat: 64.175, lon: -51.738, },
  { name: "Osaka-Kobe", lat: 34.833, lon: 135.500, },
  { name: "Oslo", lat: 59.917, lon: 10.733, },
  { name: "Paris", lat: 48.856, lon: 2.350, },
  { name: "Perth", lat: -31.952, lon: 115.858, },
  { name: "Pyongyang", lat: 39.019, lon: 125.738, },
  { name: "Reykjavik", lat: 64.133, lon: -21.933, },
  { name: "Rome", lat: 41.900, lon: 12.500, },
  { name: "San Francisco", lat: 37.770, lon: -122.426, },
  { name: "Santiago", lat: -33.450, lon: -70.667, },
  { name: "Sao Paulo", lat: -23.550, lon: -46.633, },
  { name: "Seoul", lat: 37.567, lon: 126.967, },
  { name: "Shanghai", lat: 31.228, lon: 121.474, },
  { name: "Shenzhen", lat: 22.550, lon: 114.100, },
  { name: "Singapore", lat: 1.283, lon: 103.833, },
  { name: "St. Petersburg", lat: 59.950, lon: 30.300, },
  { name: "Stockholm", lat: 59.329, lon: 18.068, },
  { name: "Sydney", lat: -33.865, lon: 151.209, },
  { name: "Tashkent", lat: 41.267, lon: 69.217, },
  { name: "Tehran", lat: 35.689, lon: 51.388, },
  { name: "Tokyo", lat: 35.683, lon: 139.683, },
  { name: "Vancouver", lat: 49.250, lon: -123.100, },
  { name: "Warsaw", lat: 52.233, lon: 21.017, },
  { name: "Washington DC", lat: 38.904, lon: -77.016, },
  { name: "Winnipeg", lat: 49.899, lon: -97.139, },
];

function chooseOne(source) {
  return source[Math.floor(Math.random() * source.length)];
}

function chooseSome(source, count) {
  if (count >= source.length) {
    return source.slice();
  }

  const copy = source.slice();
  var result = [];

  while(count-- > 0) {
    result = result.concat(copy.splice(Math.floor(Math.random() * copy.length), 1));
  }

  return result;
}


const WorldInfector = function(contentDiv) {
  const width = contentDiv.clientWidth;
  const height = contentDiv.clientHeight;

  this.svg = d3.select(contentDiv)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  this.projection = d3.geoNaturalEarth1()
    .scale((width + 1) / 2 / Math.PI)
    .translate([width / 2, height / 2])
    .precision(.1);

  this.path = d3.geoPath(this.projection);

  this.gCountries = this.svg.append("g")
    .attr("fill", "#006600")
    .attr("stroke", "#009900")
    .attr("stroke-width", "1");

  this.gCircles = this.svg.append("g")
    .attr("fill", "#f00")
    .attr("stroke", "#fff");

  this.gLines = this.svg.append("g")
    .attr("stroke-dasharray", "5,5")
    .attr("fill", "none")
    .attr("stroke", "#ff0000")
    .attr("stroke-width", "3");
};

WorldInfector.prototype.start = function() {
  const that = this;
  d3.json("world-topo-min.json", function(error, world) {

    if (error) {
      return;
    }

    that.origin = chooseOne(cities);

    that.createMap(world);

    that.drawInfection();
  });
}

WorldInfector.prototype.stop = function() {
  clearInterval(this.interval);
}

WorldInfector.prototype.createMap = function(world) {
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

WorldInfector.prototype.drawInfection = function() {
  const that = this;
  // choose destinations
  const destinations = chooseSome(cities, 5);
  // make sure we didn't choose our origin
  if (destinations.includes(this.origin)) {
    destinations.splice(destinations.indexOf(this.origin), 1);
  }

  const originPoints = this.path.centroid({ "type": "Point", "coordinates": [this.origin.lon, this.origin.lat]});

  // draw origin city
  console.log(this.origin, originPoints);
  this.gCircles.append("svg:circle")
    .attr("id", "city" + this.origin.name)
    .attr("cx", originPoints[0])
    .attr("cy", originPoints[1])
    .attr("r", 50)
    .style("opacity", "1.0");

  // draw destinations
  destinations.map(function(destination) {
      const destinationPoints = that.path.centroid({ "type": "Point", "coordinates": [destination.lon, destination.lat]});

      that.gCircles.append("svg:circle")
        .attr("id", "city" + destination.name)
        .attr("cx", destinationPoints[0])
        .attr("cy", destinationPoints[1])
        .attr("r", 10)
        .style("opacity", "1.0");
  });
}