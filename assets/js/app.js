var searchedTerms = [];
var searchBtn = document.querySelector(".search-btn");
var Key = 'ce8ded9363f8838690bb46ae0314a5c5'

var checkStorage = function(){
    if (!window.localStorage.getItem('searches')) {
        window.localStorage.setItem("searches", JSON.stringify(searchedTerms))
    }
}

var pullCityData = function(countryCode="US", apiKey='ce8ded9363f8838690bb46ae0314a5c5', days=5){
    // Capture user input and split it by city name and state name; trim spaces and convert stateCode to uppercase only
    var userInput = document.querySelector('.search').value;
    var cityName = userInput.split(',')[0].trim();
    var stateCode =  `US-${userInput.split(',')[1].trim().toUpperCase()}`;
    var searchedTerms = JSON.parse(window.localStorage.getItem('searches'))
    // Include search in local storage only if search does not already exist
    if (!searchedTerms.includes(cityName.toLowerCase())) {searchedTerms.push(cityName)}
    window.localStorage.setItem('searches', JSON.stringify(searchedTerms))
    // Display searches on page
    displaySearches();
    //Insert user input into weather api. Open Weather Api has convenient "Onecall" api with current and forecast data but, oddly, only accepts lat and lon values.
    // So, use user search to extract lat and lon values from separate api, then insert into the onecall api url
    var api = `https://api.openweathermap.org/data/2.5/weather?q=${cityName},${stateCode}&appid=${apiKey}`
    fetch(api).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                console.log(data);
                var oneCallApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude={part}&appid=${apiKey}`
                fetch(oneCallApi).then(function(response) {
                    if (response.ok) {
                        response.json().then(function(data) {
                            console.log(data);
                            displayCurrentWeatherData(data);
                            displayWeatherForecast(data);
                        })
                    }
                })
            })
        } else {
            alert(`Error ${response.statusText}`)
        }
    })
    .catch(function(){
        alert("No data found");
    })
}


var displayCurrentWeatherData = function(weatherData){
    if (weatherData.length === 0) {
        document.querySelector('.weather-data-container').textContent = "No data found";
        return;
    }
    document.querySelector('#temp').innerHTML = weatherData.current.temp;
    document.querySelector('#wind').innerHTML = weatherData.current.wind_speed;
    document.querySelector('#humidity').innerHTML = weatherData.current.humidity;
    document.querySelector('#uv-index').innerHTML = weatherData.current.uvi;
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

var displayWeatherForecast = function(weatherData){
    if (weatherData.length === 0) {document.querySelector('.tile-container').innerHTML = "No data found";}
    var tileContainer = document.querySelector('.tile-container');
    var date = new Date()
    var counter = 1;
    weatherData.daily.forEach(function(day) {
        console.log(day);
        var html = `
            <div class="weather-tile flex-column a-center j-center">
                <p>Date: <span id="date">${date.addDays(counter)}</span></p>
                <p>Temperature: <span id="temp">${day.temp}</span></p>
                <p>Wind: <span id="wind">${day.wind_speed}</span></p>
                <p>Humidity: <span id="humidity">${day.humidity}</span></p>
            </div>
        `;
        // if (tileContainer[tileContainer.length-1].length === 5) {
        //     var html = `<div class="tile-row flex-row a-center j-center"></div>`;
        //     tileContainer.appendChild(html);
        //     return;
        // }
        tileContainer.innerHTML += html;
        counter++
    })
}

var clearResults = function() {
    var searchedTerms = JSON.parse(window.localStorage.getItem('searches'));
    searchedTerms = [];
    window.localStorage.setItem('searches', JSON.stringify(searchedTerms));
    displaySearches();
}

var displaySearches = function(){
    document.querySelector('.search-results').innerHTML = '';
    var searchedTerms = JSON.parse(window.localStorage.getItem('searches'))
    searchedTerms.forEach(function(term){
        var button = document.createElement('button')
        button.innerHTML = term;
        button.setAttribute("class", "result-btn flex-row j-center a-center");
        document.querySelector('.search-results').appendChild(button)
    })
}

checkStorage();
window.onload = displaySearches();
document.querySelector(".clear-results-btn").addEventListener('click', clearResults)
searchBtn.addEventListener('click', pullCityData);
