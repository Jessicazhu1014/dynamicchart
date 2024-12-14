const apiUrl = "https://data.cityofnewyork.us/resource/nwxe-4ae8.json";

// Fetch data from NYC Open Data
fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        // Process data
        const speciesCount = {};
        data.forEach(tree => {
            const species = tree.spc_common || "Unknown";
            speciesCount[species] = (speciesCount[species] || 0) + 1;
        });

        const chartData = Object.entries(speciesCount).map(([key, value]) => ({ species: key, count: value }));

        createChart(chartData);
    })
    .catch(error => console.error("Error fetching data:", error));

// Create the bar chart
function createChart(data) {
    const width = 1200;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 100, left: 50 };

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.species))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Create tooltip div
    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.7)")
        .style("color", "#fff")
        .style("padding", "5px 10px")
        .style("border-radius", "5px")
        .style("opacity", 0)
        .style("pointer-events", "none")
        .style("font-size", "12px");

    // Bars
    svg.append("g")
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.species))
        .attr("y", d => yScale(d.count))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.count))
        .on("mouseover", function (event, d) {
            d3.select(this).style("fill", "orange");
            tooltip
                .style("opacity", 1)
                .html(`Species: <b>${d.species}</b><br>Count: <b>${d.count}</b>`);
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", function () {
            d3.select(this).style("fill", "steelblue");
            tooltip.style("opacity", 0);
        });

    // X-axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-45)")
        .style("font-size", "10px")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em");

    // Y-axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));
}
