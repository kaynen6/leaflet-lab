//Getting Started Tutorial
//create variable of mymap using L.map() and give it starting coordinates and zoom level. This creates the base leaflet map layer on the page, centered on a point and zoomed according to parameters.
var mymap = L.map('mapid').setView([43.074, -89.384], 12);

//has leaflet get the base tile layer from mapbox (or other service) and adds it to the map
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2F5bmVuIiwiYSI6ImNpeXVxZjJzYTAxZmMzMnI1ZzczNzBwYzkifQ.M8_CraOhpfbJXM-QulVrGA', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'kaynen',
    accessToken: 'pk.eyJ1Ijoia2F5bmVuIiwiYSI6ImNpeXVxZjJzYTAxZmMzMnI1ZzczNzBwYzkifQ.M8_CraOhpfbJXM-QulVrGA'
}).addTo(mymap);

//create a marker and add it to mymap at given lat/long
var marker = L.marker([43.074,-89.384]).addTo(mymap);

//create a L.circle circle feature and add it to mymap at given coordinates with styling specified
var circle = L.circle([43.080,-89.4], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);


//creates a polygon using L.polygon made from given points.
var polygon = L.polygon([
    [43.074, -89.384],
    [43.060, -89.304],
    [43.08, -89.29]
]).addTo(mymap);

//create a leaflet popup variable with L.popup() popup marker feature to be called upon later
var popup = L.popup();

//create a function to call when a click event is recognized
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

//tells mymap that if a click event is seen on the map, call onMapClick function
mymap.on('click', onMapClick);



///////
///////GeoJSON tutorial
///////
//create a variable that holds data for a geojson point feature type example w/ properties at given coordinates
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

//create and add a geojson layer (from geojsonFeature) to the map
L.geoJSON(geojsonFeature).addTo(mymap);

//create an array of line features of given coordinate points
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

//you can optionally create an empty geojson layer variable, added to map first
var myLayer = L.geoJSON().addTo(mymap);
//add the geojson feature data to the empty geojson layer created and added above.
myLayer.addData(geojsonFeature);

//create a variable to hold style parameters
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

//add myLines using myStyle styling to the map
L.geoJSON(myLines, {
    style: myStyle
}).addTo(mymap);

//create a states variable to hold two types of states with properties.
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

//add states to the geojson layer on the map using generic function and switch statement to color states according to party property.
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(mymap);

//create marker options variable to style marker
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

//adds a circle marker to map via pointToLayer to create a layer from point feature of a circle marker
L.geoJSON(someGeojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);

//function to display property popupContent if clicked feature has one.
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

//create geojson feature for ballpark
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

//add the feature to the map calling the onEachFeature function first on that feature
L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map);

//ballpark features variable w/ show_on_map property
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

//use the filter to add features to the map. Only show a feature if show_on_map is true.
L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(mymap);