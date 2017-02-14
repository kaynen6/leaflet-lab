//function to call once doc is loaded to create the basemap
function createMap(){
    var mymap = L.map('mapid').setView([35, -110], 4);
    
    //get mapbox tile layer
    L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mymap);
    //call function getData
    getData(mymap);
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data via ajax using the geojson file
    $.ajax("data/HUD median incomes 1985-2009.geojson", {
        dataType: "json",
        success: function(response){
            createPropSymbols(response, map);
        }
    });
};

//create proportional sybols form geojson data properties
function createPropSymbols(response, map){
                
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(response, {
        //point to layer converts each point feature to layer to use circle marker
        pointToLayer: pointToLayer
    }).addTo(map);
};    

function pointToLayer(feature, latlng){
    //create marker options    
    var options = {
        radius: 8,
        fillColor: "#ff1900",
        color: "#000",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.3 //soften the opacity a little to see other points and map through point feature
    };
    //define the attribute to grab
    var attribute = "IN87_HUDMED"; 
    //grad the properties of the attribute
    var attValue = Number(feature.properties[attribute]);
    var splitStr = attribute.split("_");
    splitStr = splitStr[0].split("N");
    
    year = splitStr[1];
    if (year > 80) {
        year = 19 + year;
    } 
    else {
        year = 20 + year;
    };
    
    //define radius via func to calculate based on attribute data
    options.radius = calcPropRadius(attValue);
    
    var newAttValue = "$" + addCommas(attValue);
    
    console.log(newAttValue);
    //create circleMarker
    var layer = L.circleMarker(latlng, options);
    //create popup content string
    var popupContent = "<p><b>City:</b> " + feature.properties.MSA_Codebook + "</p><p><b>" + "HUD Median Home Price in " + year + ":</b> " + newAttValue + "</p>";
    //bind the popup content to the layer
    layer.bindPopup(popupContent);
    
    return layer;
};

//calculate radius for proportional symbols
function calcPropRadius(attValue) {
    //scale factor for even symbol size adjustments
    var scaleFactor = 30;
    //area based on attribute value and scale factor
    var area = attValue / scaleFactor;
    //radius is calc based on area
    var radius = Math.sqrt(area/Math.PI);
    return radius;
};


function addCommas(attValue) {
    return attValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

//start calling functions after document is done loading
$(document).ready(createMap);
