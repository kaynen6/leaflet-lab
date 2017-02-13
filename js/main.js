//function to call once doc is loaded to create the basemap
function createMap(){
    var mymap = L.map('mapid').setView([35, -100], 4);
    //get mapbox tile layer
    L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2F5bmVuIiwiYSI6ImNpeXVxZjJzYTAxZmMzMnI1ZzczNzBwYzkifQ.M8_CraOhpfbJXM-QulVrGA', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'kaynen',
        accessToken: 'pk.eyJ1Ijoia2F5bmVuIiwiYSI6ImNpeXVxZjJzYTAxZmMzMnI1ZzczNzBwYzkifQ.M8_CraOhpfbJXM-QulVrGA'
    }).addTo(mymap);
    //call function getData
    getData(mymap);

}

//function to retrieve the data and place it on the map
function getData(map){
    //load the data via ajax using the geojson file
    $.ajax("data/HUD median incomes 1985-2009.geojson", {
        dataType: "json",
        success: function(response){
            //create marker options
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff1900",
                color: "#000",
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.3 //soften the opacity a little to see other points and map through point feature
            };
        //create a Leaflet GeoJSON layer and add it to the map
        L.geoJson(response, {
            //point to layer converts point feature to layer to use circle marker
            pointToLayer: function (feature, latlng){
                return L.circleMarker(latlng, geojsonMarkerOptions);
            }
        }).addTo(map);
        }
    });
};

//start calling functions after document is done loading
$(document).ready(createMap);
