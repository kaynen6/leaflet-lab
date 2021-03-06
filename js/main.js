var currentYear;

//function to call once doc is loaded to create the basemap
function createMap(){
    var mymap = L.map('mapid').setView([30, -95], 4);
    
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
            createLegend(map, attributes);
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

function addCommas(number){
    var string = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return string;
};

//function to calculate the median for resymbolization
function calcMedian(map, attribute){
    //array to hold value from each feature
    var values = [];
    //get each feature
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //shorthand copied from previous function
            var props = layer.feature.properties;
            //takes value for each feature at give year and pushes to array
            values.push(props[attribute]);
        };
    });
    //median variable to return
    var median = 0;
    //length variable used for calculation
    var len = values.length;
    //sort
    values.sort();
    //calc based on odd/even
    if (len % 2 === 0){
        //even
        median = (values[len / 2-1] + values[len/2]) /2;
    }
    else {
        //odd
        median = values[(len -1) /2];
    };
    return median;
};




//initial symbolization when map loads for first time
function pointToLayer(feature, latlng, attributes){
    //create marker options w/ defualt styling
    var options = {
        radius: 8,
        fillColor: "#91bfdb",
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
    //update current year
    currentYear = year;    
    //define radius via func to calculate based on attribute data
    options.radius = calcPropRadius(attValue);
    //add commas and dollar $ign. 
    var newAttValue = "$" + addCommas(attValue);
    //create circleMarker
    var layer = L.circleMarker(latlng, options);
    //create popup content string
    var popupContent = "<p><b> " + feature.properties.MSA_Codebook + "</b></p>";
    //add panel content variable 
    var panelContent = "<p><b>City: </b>" + feature.properties.MSA_Codebook + "</p>" + "<p>Median Income in " + year + ":</b> " + newAttValue + "</p>";
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
            $("#cityinfo").html(panelContent);
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


//update symbols functions call each time something is changed or clicked on the map.
function updatePropSymbols(map, attribute,checked){
    //get the median value of that year by calcMedian function
    var yearMedian = calcMedian(map, attribute);
    //round the median to clean it up
    yearMedian = Math.round(yearMedian);
    //go through each feature's values for given year (attribute)
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            var props = layer.feature.properties;
            //check the checkbox for resymbolization if checked, resybolize with these options
            if (checked){
                $('#medianinfo').show();
                $('#median').show();
                $('#yearinfo').hide();
                $('#legendabove').show();
                $('#legendbelow').show();
                //compare value for feature to the median for that year, use options accordingly
                if ((props[attribute]) < yearMedian) {
                    //options for less than median
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
                    //options for greater than median (just treating median as greater)
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
            //if not checked, be use regular symbolization
            else{
                $('#medianinfo').hide();
                $('#yearinfo').show();
                $('#year').show();
                $('#median').hide();
                $('#legendabove').hide();
                $('#legendbelow').hide();
                var options = {
                    radius: 8,
                    fillColor: "#91bfdb",
                    color: "#000",
                    weight: 0.5,
                    opacity: 1,
                    fillOpacity: 0.3
                };
            };
            //update each feature's radius based on new att values
            var radius = calcPropRadius(Number(props[attribute]));
            //set styling and radius
            layer.setStyle(options);
            layer.setRadius(radius);
            //format the string properly
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
            //update current year
            currentYear = year;
            //get values of attribute
            var attValue = Number(props[attribute]);
            var newAttValue = "$" + addCommas(attValue);
            var popupContent = "<p><b>City:</b> " + props.MSA_Codebook + "</p>";
            //update panel content as well
            var panelContent = "<p><b>City:</b>" + props.MSA_Codebook + "</p>" + "<p>HUD Median Income in " + year + ":</b> " + newAttValue + "</p>";

            //bind the popup content to the layer and add an offset radius option
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius), closeButton: false
            });
            //mouseover and click listeners for popup/panel content set to ON
            layer.on({
                mouseover: function(){
                    this.openPopup();
                },
                mouseout: function(){
                    this.closePopup();
                },
                click: function(){
                    $("#cityinfo").html(panelContent);
                    $("#cityinfo").show();
                }
            });
        };
    });
    //update panel with yearly median
    $('#year').html(currentYear);
    $('#median').html(": " + addCommas(yearMedian));
};

//create legend function
function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },
        
        onAdd: function (map) {
            //create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');
            //add html to the container
            $(container).append('<div id="panel"><h7><div id="cityinfo"></div><span id="generic"><span id="yearinfo">Incomes for </span><span id="medianinfo">Nationwide Median Income for </span><span id="year"></span><span id="median"></span></span><div id="cboxpanel"></div><div id="legendabove"></div><div id="legendbelow"></div></h7></div>');
            
            //add svg circle
            var svg = '<svg id="legend-marker" width="180px" height="180">'
            //circle carray
            var circles = ["max", "mean", "min"];
            //loop  
            for (var i=0; i<circles.length; i++){
                //circle string
                svg += "<circle class='legend-circle' id=" + circles[i] + 'fill="#92BFDB" fill-opacity="0.5" stroke="#000000" cx="90"/>';
            };
            //close svg string
            svg += "</svg>";
            
            
            //disable the listeners for mouse action and whatnot
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e); 
            });

            
            
            return container;
        }
    });
    
    map.addControl(new LegendControl());
    $('#year').html(currentYear);
};


//create sequence controls 
function createControls(response, map, attributes){
     
    //hide median info by default
    $('#medianinfo').hide();
    $('#median').hide();
    $('#yearinfo').show();
    $('#year').show();
    //create check box for resymbolization
    $('#cboxpanel').append('<label><input type="checkbox" id="cbox" value="resymbolize"><h7>Identify cities below/above year&#39;s national median</h7></input></label><br>');
    //by default hide the legend
    $('#legendabove').hide();
    $('#legendbelow').hide();
    //create the html inside for the legend, hidden first
    $('#legendabove').append("Above Nationwide Median");
    $('#legendbelow').append("Below Nationwide Median");

    
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
        
        onAdd: function (response, map, attributes) {
            //create the control container div with a particular class name
            var container = L.DomUtil.create('div','sequence-control-container');
            //ititialize other DOM elements, add listners etc. here
     
            //create skip button
            $(container).append('<button class="skip" id="reverse"><img src="img/reverse.png"></button>');
            $(container).append('<button class="skip" id="forward"><img src="img/forward.png"></button>');
            $(container).append('<input class="range-slider" type="range">');
            console.log(container);
            
            //kill mouse event listeners on the map area sequence area
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e); 
            });
            
            return container;   
        }
    });
    map.addControl(new SequenceControl());
    
    //input listener for slider
    $('.range-slider').on('input',function(){
        //sequence
        //get new index value from fired event
        var index = $(this).val();
        //console.log(index);
        //hide city info panel on year change
        $('#cityinfo').hide();
        //update symbols
        updatePropSymbols(map, attributes[index], $('#cbox').prop('checked'));
    });
    //set slider attibutes
    $('.range-slider').attr({
        max: 12,
        min: 0,
        value: 0,
        step: 1,
    });
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
        //hide city info panel on year change
        $('#cityinfo').hide();
        //update symbols
        updatePropSymbols(map, attributes[index], $('#cbox').prop('checked'));
    });
      //listener for checkbox for resymbolization, update symbols when checked or unchecked
    $('#cbox').change(function(){
        var index = $('.range-slider').val();
        updatePropSymbols(map, attributes[index],this.checked);
    });  
};

//start calling functions after document is done loading
$(document).ready(createMap);
