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


//create an attributes array from data
function processData(data){
    //empty array to hold attribute data
    var attributes = [];
    
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;
    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take att with population values
        if (attribute.indexOf("IN") > -1){
            attributes.push(attribute);
        };
    };
    return attributes;
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data via ajax using the geojson file
    $.ajax("data/HUD median incomes 1985-2009.geojson", {
        dataType: "json",
        success: function(response){
            //create an attributes array
            var attributes = processData(response);            
            createPropSymbols(response, map, attributes);
            createControls(response, map, attributes);
        }
    });
};


//create proportional sybols form geojson data properties
function createPropSymbols(response, map, attributes){   
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(response, {
        //point to layer converts each point feature to layer to use circle marker
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};    

//initial symbolization when map loads for first time
function pointToLayer(feature, latlng, attributes){
    //create marker options    
    var options = {
        radius: 8,
        fillColor: "#ff1900",
        color: "#000",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.3 //soften the opacity a little to see other points and map through point feature
    };
    
    //define the attribute to grab //this is the year, must be changed or made dynamic
    var attribute = attributes[0]; 
    //grad the properties of the attribute
    var attValue = Number(feature.properties[attribute]);
    //split up the string a bunch so i can make it readable and with proper 4 digit years.
    var splitStr = attribute.split("_");
    splitStr = splitStr[0].split("N");
    var year = splitStr[1];
    //add century digits appropriately 
    if (year > 80) {
        year = 19 + year;
    } 
    else {
        year = 20 + year;
    };
    //define radius via func to calculate based on attribute data
    options.radius = calcPropRadius(attValue);
    //add commas and dollar $ign. 
    var newAttValue = "$" + attValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    //create circleMarker
    var layer = L.circleMarker(latlng, options);
    //create popup content string
    var popupContent = "<p><b>City:</b> " + feature.properties.MSA_Codebook + "</p>";
    //add panel content variable 
    var panelContent = "<p><b>City:</b>" + feature.properties.MSA_Codebook + "</p>" + "<p>Median HUD Household Income in " + year + ":</b> " + newAttValue + "</p>";
    //add text and year and value to panelcontent
    //bind the popup content to the layer and add an offset radius option
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius),
        closeButton: false
    });
    //add mouseover popup functionality
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            $("#subpanel").html(panelContent);
        }
    });
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

function calcMean(map, attribute){
    var yearValues = [];
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            var props = layer.feature.properties;
            console.log(props[attribute]);
            yearValues.push(props[attribute]);
            console.log(yearValues);
        };
    });
    var yearMean = 0;
    var total = 0;
    for (i = 0; i<yearValues.length;i++){
        total += yearValues[i];    
    };
    yearMean = total/yearValues.length;
    console.log(yearMean);
    return yearMean;
};

function updatePropSymbols(map, attribute,checked){
    var yearMean = calcMean(map, attribute);
    yearMean = Math.round(yearMean);
    console.log(yearMean);
    console.log(checked);
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            var props = layer.feature.properties;
            if (checked){
                if ((props[attribute]) < yearMean) {
                    //options for less than mean
                    var options = {
                        radius: 8,
                        fillColor: "#7fbf7b",
                        color: "#000",
                        weight: 0.5,
                        opacity: 1,
                        fillOpacity: 0.3
                    };
                }
                else {
                    //options for greater than mean
                    var options = {
                        radius: 8,
                        fillColor: "#af8dc3",
                        color: "#000",
                        weight: 0.5,
                        opacity: 1,
                        fillOpacity: 0.3
                    }
                };
            }
            else{
                var options = {
                    radius: 8,
                    fillColor: "#ff1900",
                    color: "#000",
                    weight: 0.5,
                    opacity: 1,
                    fillOpacity: 0.3
                };
            };
            //update each feature's radius based on new att values
            var radius = calcPropRadius(Number(props[attribute]));
            layer.setStyle(options);
            layer.setRadius(radius);
            
            var splitStr = attribute.split("_");
            splitStr = splitStr[0].split("N");
            var year = splitStr[1];
            //add century digits appropriately 
            if (year > 80) {
                year = 19 + year;
            } 
            else {
                year = 20 + year;
            };
            //get values of attribute
            var attValue = Number(props[attribute]);
            var newAttValue = "$" + attValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            //create popup content string
            var popupContent = "<p><b>City:</b> " + props.MSA_Codebook + "</p>";
            //update panel content as well
            var panelContent = "<p><b>City:</b>" + props.MSA_Codebook + "</p>" + "<p>Median Home Price in " + year + ":</b> " + newAttValue + "</p>";

            //bind the popup content to the layer and add an offset radius option
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius), closeButton: false
            });
            layer.on({
                mouseover: function(){
                    this.openPopup();
                },
                mouseout: function(){
                    this.closePopup();
                },
                click: function(){
                    $("#subpanel").html(panelContent);
                }
            });
        };
    });
};

//create sequence controls 
function createControls(response, map, attributes){
    //create range input slider element
    $('#bottompanel').append('<input class="range-slider" type="range">');
    //set slider attibutes
    $('.range-slider').attr({
        max: Object.keys(response.features[0].properties).length-1,
        min: 1,
        value: 1,
        step: 1
    });
    //add skip buttons
    $('#bottompanel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#bottompanel').append('<button class="skip" id="forward">Skip</button>');
    
    //replce button content with images of arrows
    $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');
    //create check box for resymbolization
    $('#panel').append('<label><input type="checkbox" id="cbox" value="resymbolize"><h7>Identify cities below/above years national average</h7></input></label><br>');
    
    //click listener for buttons
    $('.skip').click(function(){
        //sequence
        //get old index value
        var index = $('.range-slider').val();
        
        //increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //if past the last attribute wrap around to beginning
            index = index > $('.range-slider').attr('max') ? $('.range-slider').attr('min') : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //if past the first attribute wrap around to last attribute
            index = index < $('.range-slider').attr('min') ? $('.range-slider').attr('max') : index;
        };
        
        //update sliider accordingly
        $('.range-slider').val(index);
        
        //update symbols
        updatePropSymbols(map, attributes[index], $('#cbox').prop('checked'));
        
        //console.log(attributes);
    });
    
    //input listener for slider
    $('.range-slider').on('input',function(){
        //sequence
        //get new index value from fired event
        var index = $(this).val();
        //console.log(index);
        //update symbols
        updatePropSymbols(map, attributes[index], $('#cbox').prop('checked'));
    });
    
    
    $('#cbox').change(function(){
        var index = $('.range-slider').val();
        updatePropSymbols(map, attributes[index],this.checked);
    });    
    
};

//start calling functions after document is done loading
$(document).ready(createMap);
