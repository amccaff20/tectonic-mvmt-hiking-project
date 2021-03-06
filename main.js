'use strict';


/**** Hiking Trails API *****/

const trailKey = '200979560-34016932461a258909dfbe882647288f';
const trailUrl = 'https://www.hikingproject.com/data/get-trails'

/* Format the parameters for the url */
function formatTrailParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

/* Display the trail results */
function displayTrails(responseJson) {
  $('#trail-results').empty();
  $('#trail-results').append(
    responseJson.trails.map(trail =>
      `<h3>${trail.name}</h3> <p>${trail.summary}</p> 
        <p>Trail Rating: ${trail.difficulty}</p> <img src="${trail.imgSmall}"/>
        <p>Elevation: ${trail.low}ft to ${trail.high}ft</p>
        <a href="${trail.url}" target="_blank">More Info</a>
        <p class='coordinates'>Coordinates: 
        <a href="#map"><button type='button' id="mapit-button-${trail.name.replace(/\s+/g, "-").replace("'", "").replace("/", "-")}">${trail.latitude} ${trail.longitude}</button></a>
        <br>(click on coordinates to view location on map)
        </p>`,
    ))
    responseJson.trails.forEach(trail => {
      handleMapIt(trail)
    });
  $('.weather-trails').removeClass('hidden');
  $('#map').removeClass('hidden');
};



/* handles input to sort trail results */
function sortTrails() {
  let selected = $("input[type='radio'][name='sort-trails']:checked");
  let selectedAnswer = "";
  if (selected.length > 0) {
    selectedAnswer = selected.val();
    return selectedAnswer;
  }
};


/* Gathers the data from the API based on the input from the user */
function getTrails(latitude, longitude) {
  const numTrails = $('#num-results').val();
  const sortBy = sortTrails();
  const length = $('#min-length').val();
  const params = {
    lat: latitude,
    lon: longitude,
    maxResults: numTrails,
    sort: sortBy,
    minLength: length,
    key: trailKey,
  };
  const queryString = formatTrailParams(params)
  const url = trailUrl + '?' + queryString;

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayTrails(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

/* started the request-response process */
function trailForm() {
  $('#js-trail-form').submit(event => {
    event.preventDefault();
    const city = $('#js-hike-city').val();
    getWeather(city);
  });
}

$(trailForm());





//***** Weather API *******/

const weatherKey = '9fc52be9eec442ba9de25202202011';
const weatherUrl = 'https://api.weatherapi.com/v1/forecast.json';

/* Format the parameters for the url */
function formatWeatherParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

/* Displays weather results based on the location the user entered*/
function displayWeather(responseJson) {
  getTrails(responseJson.location.lat, responseJson.location.lon);
  if (responseJson.alert !== undefined) {
    $('#weather-results').append(
      `<p>Alert: ${responseJson.alert.headline}</p>`
    )
  };
  $('#js-error-message').empty();
  $('#weather-results').empty();
  $('#weather-results').append(
    `<h3>${responseJson.location.name}, ${responseJson.location.region}</h3>
      <h4>Today:</h4>
      <p>Current Condition: ${responseJson.current.condition.text} <img src="https://${responseJson.current.condition.icon.substring(2)}"/> </p>
      <p>Feels Like ${responseJson.current.feelslike_f}ºF</p>
      <p>Wind Speed: ${responseJson.current.wind_mph}mph</p>
      <br>
      <h4>Tomorrow:</h4> <p>Condition: ${responseJson.forecast.forecastday[0].day.condition.text}
      <br>Low of ${responseJson.forecast.forecastday[0].day.mintemp_f}ºF
      <br>High of ${responseJson.forecast.forecastday[0].day.maxtemp_f}ºF</p>
      <br>
      <p>Last updated at ${responseJson.current.last_updated}</p>`)
  $('#weather-icon').empty();
  $('#weather-icon').append(`<img src="https://${responseJson.current.condition.icon.substring(2)}"/>`)

  $('#weather-results').removeClass('hidden');
};


/* Gathers weather data form API */
function getWeather(city) {
  const params = {
    key: weatherKey,
    q: city,
  };
  const queryString = formatWeatherParams(params)
  const url = weatherUrl + '?' + queryString + '&days=3';

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayWeather(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}





//***** Map API *******//
const directionsUrl = 'https://api.mapbox.com/directions/v5/mapbox/driving';
const locationUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/-105.1504,39.8130.json?'
const mapKey = 'pk.eyJ1IjoiYW1jY2FmZjA3IiwiYSI6ImNraHhrYThyeTAyc3oycG4wMG40dW5uZGkifQ.yLgQA1X2chc0tTtVLbUE7Q'

mapboxgl.accessToken = 'pk.eyJ1IjoiYW1jY2FmZjA3IiwiYSI6ImNraHhrYThyeTAyc3oycG4wMG40dW5uZGkifQ.yLgQA1X2chc0tTtVLbUE7Q';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-98.5795, 39.8283],
  zoom: 3
});

map.addControl(new mapboxgl.NavigationControl());


/* listens for button click to send trail coordinates to the marker function */
function handleMapIt(trail) {
  const marker = {lon: trail.longitude,
                lat: trail.latitude};
  $('#mapit-button-' + trail.name.replace(/\s+/g, "-").replace("'", "").replace("/", "-")).click(event => {
    dropMarker(marker);
  });
}


/* Updates marker coordinates to display new marker on map */
function dropMarker(marker) {
  var marker = new mapboxgl.Marker()
    .setLngLat(marker)
    .addTo(map);

}

