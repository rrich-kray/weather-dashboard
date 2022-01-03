var searchedTerms = [];
var searchBtn = document.querySelector(".search-btn");
var key = 'ce8ded9363f8838690bb46ae0314a5c5'

var checkStorage = function(){
    if (!window.localStorage.getItem('searches')) {
        window.localStorage.setItem("searches", JSON.stringify(searchedTerms))
    }
}

// This function is called when the user clicks a past search. Takes the innerHTML of the button, splits it using a comma delimiter, trims the output, and passes the output as arguments to the pullCityData function, along with the api key
var getBtnText = function(element) {
    var btnText = element.innerHTML;
    var city = btnText.split(',')[0].trim();
    var state = btnText.split(',')[1].trim();
    var key = 'ce8ded9363f8838690bb46ae0314a5c5';
    pullCityData(city, state, key);
}

var getUserInput = function(){
    // Capture user input and split it by city name and state name; trim spaces and convert stateCode to uppercase only, and add "US-" so that it adheres to ISO-3166 standards
    var userInput = document.querySelector('.search').value;
    if (userInput.split(',').length < 2) {
        alert("Please enter the city name and two-letter state code");
    }
    var city = userInput.split(',')[0].trim().toLowerCase();
    var state =  `US-${userInput.split(',')[1].trim().toUpperCase()}`;
    var key = 'ce8ded9363f8838690bb46ae0314a5c5'; 
    saveUserInput(city, state);
    pullCityData(city, state, key);
}

var saveUserInput = function(cityName, stateCode) {
    // Include search in local storage only if search does not already exist
    var searchedTerms = JSON.parse(window.localStorage.getItem('searches'))
    if (!searchedTerms.includes(cityName)) {
        var tempObj = {cityName: cityName, stateCode: stateCode}
        searchedTerms.push(tempObj)
    }
    window.localStorage.setItem('searches', JSON.stringify(searchedTerms))
}

var pullCityData = function(cityName, stateCode, apiKey){

    // Display searches on page
    displaySearches();

    //Insert user input into weather api. Open Weather Api has convenient "Onecall" api with current and forecast data but, oddly, only accepts lat and lon values.
    // So, this takes the user's search and uses it to extract lat and lon values from separate api, then inserts into the onecall api url
    var api = `https://api.openweathermap.org/data/2.5/weather?q=${cityName},${stateCode}&appid=${apiKey}`
    fetch(api).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                var oneCallApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude={part}&appid=${apiKey}`
                fetch(oneCallApi).then(function(response) {
                    if (response.ok) {
                        response.json().then(function(data) {
                            // take data and pass it as arguments to the following functions
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
        alert("No data found!");
    })
}

// Displays the current conditions in the .weather-data-container div; 
var displayCurrentWeatherData = function(weatherData){
    if (weatherData.length === 0) {
        document.querySelector('.weather-data-container').textContent = "No data found";
        return;
    }
    document.querySelector('#temp').innerHTML = weatherData.current.temp
    document.querySelector('#wind').innerHTML = weatherData.current.wind_speed;
    document.querySelector('#humidity').innerHTML = weatherData.current.humidity;
    document.querySelector('#uv-index').innerHTML = weatherData.current.uvi;
    colorUvIndex(document.querySelector('#uv-index'));
}

// credit to user "sparebytes" for the following function. Source link: https://stackoverflow.com/questions/563406/add-days-to-javascript-date
// I couldn't find a date value in the data pulled from the API, so this function allows me to add however many days to a Date object
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

var displayWeatherForecast = function(weatherData){
    // check if data was pulled 
    if (weatherData.length === 0) {document.querySelector('.tile-container').innerHTML = "No data found"}
    var tileContainer = document.querySelector('.tile-container');
    //clear tileContainer innerHTML so that weather tiles do not pile up
    tileContainer.innerHTML = '';
    var date = new Date()
    var counter = 1;
    weatherData.daily.forEach(function(day) {
        var html = `
            <div class="weather-tile flex-column a-left j-center j-space-between">
                <img class="weather-icon" />
                <p>Date: <span id="date">${date.addDays(counter)}</span></p>
                <p>Temperature: <span id="temp">${day.temp.day}</span></p>
                <p>Wind: <span id="wind">${day.wind_speed}</span></p>
                <p>Humidity: <span id="humidity">${day.humidity}</span></p>
            </div>
        `;
        tileContainer.innerHTML += html;
        counter++
    })
}

// Clears past searches by pulling search history from local storage and setting array value to empty. 
//displaySearches() function is then evoked, which also clears the innerHTML of the search area to align it with what's in local storage 
var clearResults = function() {
    var searchedTerms = JSON.parse(window.localStorage.getItem('searches'));
    searchedTerms = [];
    window.localStorage.setItem('searches', JSON.stringify(searchedTerms));
    displaySearches();
}

// pulls search history from local storage and creates button for each term pulled
var displaySearches = function(){
    document.querySelector('.search-results').innerHTML = '';
    var searchedTerms = JSON.parse(window.localStorage.getItem('searches'));
    searchedTerms.forEach(function(term){
        var city = term['cityName']
        var state = term['stateCode']
        var html = `<button class="result-btn flex-row j-center a-center">${city}, ${state}</button>`
        document.querySelector('.search-results').innerHTML += html
    })
}

var colorUvIndex = function(element){
    console.log(element.innerHTML)
    if (element.innerHTML <= 2) {element.style.backgroundColor = "green"}
    if (element.innerHTML > 2 && parseInt(element.innerHTML) <= 5) {element.style.backgroundColor = "yellow"}
    if (element.innerHTML > 5) {element.style.backgroundColor = "red"}
}

checkStorage();
window.onload = displaySearches();
document.querySelector(".clear-results-btn").addEventListener('click', clearResults);
searchBtn.addEventListener('click', getUserInput);
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('result-btn')) {getBtnText(event.target)}
});



