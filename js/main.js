
function createMap(){
    var mymap = L.map('mapid').setView([35, -100], 4);

    L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2F5bmVuIiwiYSI6ImNpeXVxZjJzYTAxZmMzMnI1ZzczNzBwYzkifQ.M8_CraOhpfbJXM-QulVrGA', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'kaynen',
        accessToken: 'pk.eyJ1Ijoia2F5bmVuIiwiYSI6ImNpeXVxZjJzYTAxZmMzMnI1ZzczNzBwYzkifQ.M8_CraOhpfbJXM-QulVrGA'
    }).addTo(mymap);
    getData(mymap);

}

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/HUD median incomes 1985-2009.geojson", {
        dataType: "json",
        success: function(response){
            console.log(response);
            //create marker options
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7900",
                color: "#000",
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.8
            };
        //create a Leaflet GeoJSON layer and add it to the map
        L.geoJson(response, {
            pointToLayer: function (feature, latlng){
                return L.circleMarker(latlng, geojsonMarkerOptions);
            }
        }).addTo(map);
        }
    });
};


$(document).ready(createMap);
