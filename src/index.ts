import "./style.css";
import * as d3 from "d3";

function fetchAndExecutewithJson(
    url: string,
    jsonConsumer: (json: object) => void
) {
    fetch(url).then(response => {
        response.json().then(jsonConsumer);
    });
}

function makeAScatterplotGraph(data: object): void {
  const margin = { top: 40, right: 100, bottom: 70, left: 70 },
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  // Draw base SVG
  const svg = d3
    .select("div#d3")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const y = d3.scaleLinear().range([height, 0]);
  y.domain([d3.max(data, d => d.Place) + 2, d3.min(data, d => d.Place)]);

  // Add the Y Axis
  const yAxis = d3.axisLeft().scale(y);
  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis);

  svg
    .append("text")
    .attr("class", "yAxisLabel")
    .attr("transform", "rotate(-90)")
    .attr("y", "-2em")
    .attr("x", "-3.6em")
    .text("Ranking");

  function secondsBehindFastest(d) {
    return d.Seconds - data[0].Seconds;
  }

  function formatSeconds(seconds: number) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    function padLeft(num) {
      return ("00" + num.toString()).slice(-2);
    }
    return `${padLeft(min)}:${padLeft(sec)}`;
  }

  const x = d3.scaleLinear().range([0, width]);
  x.domain([
    d3.max(data, secondsBehindFastest) + 10,
    d3.min(data, secondsBehindFastest)
  ]);

  // Add the X Axis
  const xAxis = d3
    .axisBottom()
    .scale(x)
    .tickFormat(formatSeconds);

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg
    .append("text")
    .attr("x", width / 3)
    .attr("y", height + 50)
    .text("Minutes Behind Fastest Time");

  // Define the div for the tooltip
  var div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Add the markers
  const marker = svg
    .selectAll(".marker")
    .data(data)
    .enter()
    .append("g")
    .on("mouseover", d => {
      div
        .transition()
        .duration(200)
        .style("opacity", 0.95);
      div
        .html(
          `
              ${d.Name}: ${d.Nationality}<br/>
              Year: ${d.Year}, Time: ${d.Time}<br/>
              <br/>
              ${d.Doping || "No doping allegation"}
          `
        )
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px");
    })
    .on("mouseout", d => {
      div
        .transition()
        .duration(200)
        .style("opacity", 0);
    });

  marker
    .append("circle")
    .attr("class", d => "marker " + (d.Doping ? "yesDoping" : "noDoping"))
    .attr("cx", d => x(secondsBehindFastest(d)))
    .attr("cy", d => y(d.Place))
    .attr("r", "5px");

  marker
    .append("text")
    .text(d => d.Name)
    .attr("class", "markerText")
    .attr("x", d => x(secondsBehindFastest(d)) + 5 + 10)
    .attr("y", d => y(d.Place) + 4);

  // Add marker legends
  const legend = svg.append("g").attr("class", "legend");
  const legendYesDoping = legend.append("g");
  legendYesDoping
    .append("circle")
    .attr("class", "marker yesDoping")
    .attr("cx", 0.8 * width)
    .attr("cy", 0.8 * height)
    .attr("r", "5px");
  legend
    .append("text")
    .attr("x", 0.8 * width + 5 + 5)
    .attr("y", 0.8 * height + 5)
    .text("Has doping allegation");

  const legendNoDoping = legend.append("g");
  legendNoDoping
    .append("circle")
    .attr("class", "marker noDoping")
    .attr("cx", 0.8 * width)
    .attr("cy", 0.8 * height - 40)
    .attr("r", "5px");
  legend
    .append("text")
    .attr("x", 0.8 * width + 5 + 5)
    .attr("y", 0.8 * height - 40 + 5)
    .text("No doping allegation");
}

document.addEventListener("DOMContentLoaded", event => {
    const url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
    fetchAndExecutewithJson(url, makeAScatterplotGraph);
});

