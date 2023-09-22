// Creating the map object
let myMap = L.map("map", {
    center: [34.0522300, -118.24368],
    zoom: 5
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Load the GeoJSON data.
let geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Customize marker size and color based on magnitude and depth
function getMarkerOptions(magnitude, depth) {
    const markerSize = magnitude * 5; // Adjust the scaling factor as needed
    const markerColor = `hsl(${(90 - depth) * 2}, 100%, 50%)`; // Adjust the color scale as needed
    return {
        radius: markerSize,
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 0.7
    };
}

// Load and plot the earthquake data
fetch(geoData)
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            onEachFeature: function(feature, layer) {
                // Set the mouse events to popup earthquake info.
                layer.on({
                    mouseover: function(event) {
                        layer = event.target;
                        layer.bindPopup(
                            "<h2>" + feature.properties.place + "</h2> <hr> <h3> magnitude " + feature.properties.mag + " depth " + feature.geometry.coordinates[2] + "m</h3>"
                        ).openPopup(); // Open the popup
                    },
                    mouseout: function(event) {
                        layer = event.target;
                        // Close the popup when the mouse leaves the object
                        layer.closePopup();
                    },
                });
            },
            pointToLayer: function(feature, latlng) {
                const magnitude = feature.properties.mag;
                const depth = feature.geometry.coordinates[2]; // Depth is the third coordinate
                return L.circleMarker(latlng, getMarkerOptions(magnitude, depth));
            },
        }).addTo(myMap);
    });
// Create a custom legend control
const legend = L.control({ position: 'bottomright' });

// Function to generate the legend's HTML content
legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'info legend');
    const colors = ['#00ff00', '#ffff00', '#ffcc00', '#ff9900', '#ff6600', '#ff3300'];

    // Create a container div with a white background
    const container = L.DomUtil.create('div', 'legend-container');
    container.style.backgroundColor = 'white';
    
    // Add legend title
    container.innerHTML = '<h4>Depth (km)</h4>';

    // Loop through depth ranges and add colored squares
    for (let i = 0; i < colors.length; i++) {
        const from = i * 10;
        const to = (i + 1) * 10;
        
        // Create a colored square with a background color
        const colorBox = L.DomUtil.create('div', 'color-box');
        colorBox.style.backgroundColor = colors[i];
        
        container.appendChild(colorBox);
        
        container.innerHTML +=
            '<span>' +
            from + (to ? '&ndash;' + to : '+') +
            '</span><br>';
    }

    // Append the container to the legend control
    div.appendChild(container);

    return div;
};

// Add the legend to the map
legend.addTo(myMap);

  