var searchedTerms = [];
var searchBtn = document.querySelector(".search-btn");
var clearResultsBtn = document.querySelector('.clear-results-btn')
var key = 'ce8ded9363f8838690bb46ae0314a5c5'

var checkStorage = function(){
    if (!window.localStorage.getItem('searches')) {
        window.localStorage.setItem("searches", JSON.stringify(searchedTerms))
    }
}

// This function is called when the user clicks a past search. Takes the innerHTML of the button, splits it using a comma delimiter, trims the output, and passes the output as arguments to the pullCityData function, along with the api key
var getBtnText = function(element) {
    var btnTerms = element.innerHTML.split(',');
    const [ city, state ] = btnTerms;
    pullCityData(city, state, key);
}

var getUserInput = function(){
    // Capture user input and split it by city name and state name; trim spaces and convert stateCode to uppercase only, and add "US-" so that it adheres to ISO-3166 standards
    var userInput = document.querySelector('.search').value.split(',');
    if ((userInput.length < 2 || userInput[1].trim().length > 2)) {
        alert("Please enter the city name and two-letter state code");
        return;
    }
    var [ city, state ] = userInput;
    city = city.trim()
    state = `US-${state.trim().toUpperCase()}`
    saveUserInput(city, state);
    pullCityData(city, state, key);
}

var saveUserInput = function(cityName, stateCode) {
    // Include search in local storage only if search does not already exist
    var searchedTerms = JSON.parse(window.localStorage.getItem('searches'))
    console.log(searchedTerms);
    if (!searchedTerms.includes([cityName, stateCode])) {
        searchedTerms.push([cityName, stateCode])
    }
    window.localStorage.setItem('searches', JSON.stringify(searchedTerms))
}

var pullCityData = function(cityName, stateCode, apiKey) {

    // Display searches on page
    displaySearches();

    // Insert user input into weather api. Open Weather Api has convenient "Onecall" api with current and forecast data but, oddly, only accepts lat and lon values.
    // So, this takes the user's search and uses it to extract lat and lon values from separate api, then inserts into the onecall api url
    var api = `https://api.openweathermap.org/data/2.5/weather?q=${cityName},${stateCode}&appid=${apiKey}`
    fetch(api).then(response => {if (response.ok) {response.json().then(data => {
        var oneCallApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude={part}&units=imperial&appid=${apiKey}`
        fetch(oneCallApi).then(response => {if (response.ok) {response.json().then(data => {
            console.log(data)
            displayCurrentWeatherData(data);
            displayWeatherForecast(data)})}})
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
    document.querySelector('#temp').innerHTML = `${weatherData.current.temp} ℉`
    document.querySelector('#wind').innerHTML = `${weatherData.current.wind_speed} mph`;
    document.querySelector('#humidity').innerHTML = `${weatherData.current.humidity} g.kg^-1`;
    document.querySelector('#uv-index').innerHTML = `${weatherData.current.uvi} %rh`;
}

// credit to user "sparebytes" for the following function. Source link: https://stackoverflow.com/questions/563406/add-days-to-javascript-date
// I couldn't find a date value in the data pulled from the API, so this function allows me to add however many days to a Date object
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDay() + days);
    return date;
}

var displayWeatherForecast = function(weatherData){
    // check if data was pulled 
    if (weatherData.length === 0) {document.querySelector('.tile-container').innerHTML = "No data found"}
    var tileContainer = document.querySelector('.tile-container');
    //clear tileContainer innerHTML so that weather tiles do not pile up
    tileContainer.innerHTML = '';
    var counter1 = 1;
    // var counter2 = 1;
    weatherData.daily.forEach(function(day) {
        var thumbnail;
        if (day.weather[0]['main'].toLowerCase() === 'rain') {thumbnail = './assets/images/storm-day.svg'};
        if (day.weather[0]['main'].toLowerCase() === 'clouds') {thumbnail = './assets/images/cloudy-day.svg'};
        if (day.weather[0]['main'].toLowerCase() === 'snow') {thumbnail = './assets/images/snow.svg'};
        if (day.weather[0]['main'].toLowerCase() === 'clear') {thumbnail = './assets/images/sunny-day.svg'};
        var html = `
        
        <div class="tile">
        
            <div class="front">
                <img class="thumbnail" src=${thumbnail} alt="">
                <h5 class="date">${moment(moment(), "MM-DD-YYYY").add(counter1, 'days')}</h5> <!--date can go here-->
                <div class="changing-container">
                    <p>Temp: <span class="temp">${day.temp.day} ℉</span></p>
                    <p>Wind: <span class="wind">${day.wind_speed} mph</span></p>
                    <p>Humidity: <span class="humidity">${day.humidity} %rh</span></p>
                    <p>UVI: <span class="UVI">${day.uvi} g.kg^-1</span></p>
                </div>
            </div>

            <div class="background"></div>

        </div>
            
            `

        // `
        //     <div class="weather-tile tile${counter2} flex-column a-left j-center j-space-between">
        //         <img class="weather-icon" />
        //         <p>Date: <span id="date">${date.addDays(counter1)}</span></p>
        //         <p>Temperature: <span id="temp">${day.temp.day} ℉</span></p>
        //         <p>Wind: <span id="wind">${day.wind_speed} mph</span></p>
        //         <p>Humidity: <span id="humidity">${day.humidity} %rh</span></p>
        //     </div>`
        //     ;
            
        tileContainer.innerHTML += html;
        counter1++;
        // counter2++;
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
        var city = term[0];
        var state = term[1];
        var html = `<button class="result-btn flex-row j-center a-center">${city}, ${state}</button>`
        document.querySelector('.search-results').innerHTML += html
    })
}

var colorUvIndex = function(element){
    if (element.innerHTML <= 2) {element.style.backgroundColor = "green"};
    if (element.innerHTML > 2 && element.innerHTML <= 5) {element.style.backgroundColor = "yellow"};
    if (element.innerHTML > 5) {element.style.backgroundColor = "red"};
}

checkStorage();
window.onload = displaySearches();
clearResultsBtn.addEventListener('click', clearResults);
searchBtn.addEventListener('click', getUserInput);
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('result-btn')) {getBtnText(event.target)}
});



