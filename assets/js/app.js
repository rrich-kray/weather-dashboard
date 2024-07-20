class WeatherApp 
{
  DisplayObject;
  UtilsObject;
  SearchBarElement;
  ClearResultsBtn;
  ApiKey;

  constructor(displayObject, utilsObject, searchBarElement, clearResultsBtn, apiKey)
  {
    this.DisplayObject = displayObject;
    this.UtilsObject = utilsObject;
    this.SearchBarElement = searchBarElement;
    this.ClearResultsBtn = clearResultsBtn;
    this.ApiKey = apiKey;
  }

  // This function is called when the user clicks a past search. Takes the innerHTML of the button, splits it using a comma delimiter, trims the output, and passes the output as arguments to the pullCityData function, along with the api key
  getBtnText(element) 
  {
    var btnTerms = element.innerHTML.split(",");
    const [city, state] = btnTerms;
    pullCityData(city, state, key);
  };

  getUserInputAndPullCityData()
  {
    var [city, state] = this.getUserInput();
    this.UtilsObject.saveUserInput(city, state);
    this.pullCityData(city, state, this.ApiKey);
  }

  getUserInput()
  { // CHANGE THIS TO BE MORE ACCEPTING OF USER INPUT
    // Capture user input and split it by city name and state name; trim spaces and convert stateCode to uppercase only, and add "US-" so that it adheres to ISO-3166 standards
    const userInput = this.SearchBarElement.value;
    if (!this.UtilsObject.validateUserInput(userInput))
    {
      alert("Please enter the city name and two-letter state code");
      return;
    }
    var [city, state] = userInput;
    city = city.trim();
    state = `US-${state.trim().toUpperCase()}`;
    return new Array(city, state);
  };

  pullCityData (cityName, stateCode, apiKey) {
    // Display searches on page
    this.DisplayObject.displaySearches();
  
    // Insert user input into weather api. Open Weather Api has convenient "Onecall" api with current and forecast data but, oddly, only accepts lat and lon values.
    // So, this takes the user's search and uses it to extract lat and lon values from separate api, then inserts into the onecall api url
    var api = `https://api.openweathermap.org/data/2.5/weather?q=${cityName},${stateCode}&appid=${apiKey}`;
    fetch(api).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            var oneCallApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude={part}&units=imperial&appid=${apiKey}`;
            fetch(oneCallApi).then((response) => {
              if (response.ok) {
                response.json().then((data) => {
                  console.log(data);
                  this.DisplayObject.displayCurrentWeatherData(data);
                  this.DisplayObject.displayWeatherForecast(data);
                });
              }
            });
          });
        } else {
          alert(`Error ${response.statusText}`);
        }
      })
      .catch(function () {
        alert("No data found!");
      });
  };
}

class Display 
{
  elementDict;
  weatherTypeThumbnailLocationDict;

  constructor() 
  {
    const elementDictTemp = 
    {
      temp: "#temp",
      wind: "#wind",
      humidity: "#humidity",
      uvIndex: "#uv-index",
      tileContainer: ".tile-container"
    }
    const weatherTypeThumbnailsDictTemp = 
    {
      rain: "./assets/images/storm-day.svg",
      clouds: "./assets/images/cloudy-day.svg",
      snow: "./assets/images/snow.svg",
      clear: "./assets/images/sunny-day.svg"
    }
    this.elementDict = elementDictTemp; 
    this.weatherTypeThumbnailLocationDict = weatherTypeThumbnailsDictTemp;
  }

  displayCurrentWeatherData (weatherData) {
    document.querySelector(this.elementDict.temp).innerHTML = `${weatherData.current.temp} ℉`;
    document.querySelector(this.elementDict.wind).innerHTML = `${weatherData.current.wind_speed} mph`;
    document.querySelector(this.elementDict.humidity).innerHTML = `${weatherData.current.humidity} g.kg^-1`;
    document.querySelector(this.elementDict.uvIndex).innerHTML = `${weatherData.current.uvi} %rh`;
  };

  // Displays the current conditions in the .weather-data-container div;
  displayWeatherForecast (weatherData) {

    const tileContainer = document.querySelector(this.elementDict.tileContainer);

    // check if data was pulled
    if (weatherData.length === 0) {
      tileContainer.innerHTML = "No data found";
    }

    //clear tileContainer innerHTML so that weather tiles do not pile up
    tileContainer.innerHTML = "";
    var counter1 = 1;
    // var counter2 = 1;
    weatherData.daily.forEach(function (day) {
      var thumbnail;
      if (day.weather[0]["main"].toLowerCase() === "rain") {
        thumbnail = this.weatherTypeThumbnailLocationDict.Rain;
      }
      if (day.weather[0]["main"].toLowerCase() === "clouds") {
        thumbnail = this.weatherTypeThumbnailLocationDict.clouds;
      }
      if (day.weather[0]["main"].toLowerCase() === "snow") {
        thumbnail = this.weatherTypeThumbnailLocationDict.snow;
      }
      if (day.weather[0]["main"].toLowerCase() === "clear") {
        thumbnail = this.weatherTypeThumbnailLocationDict.clear;
      }
      var html = `
          
          <div class="tile">
              <div class="front">
                  <img class="thumbnail" src=${thumbnail} alt="">
                  <h5 class="date">${moment(moment(), "MM-DD-YYYY").add(
                    counter1,
                    "days"
                  )}</h5> <!--date can go here-->
                  <div class="changing-container">
                      <p>Temp: <span class="temp">${day.temp.day} ℉</span></p>
                      <p>Wind: <span class="wind">${day.wind_speed} mph</span></p>
                      <p>Humidity: <span class="humidity">${
                        day.humidity
                      } %rh</span></p>
                      <p>UVI: <span class="UVI">${day.uvi} g.kg^-1</span></p>
                  </div>
              </div>
              <div class="background"></div>
          </div>
              
              `;
  
      tileContainer.innerHTML += html;
      counter1++;
      // counter2++;
    });
  };
  
  // pulls search history from local storage and creates button for each term pulled
  displaySearches() 
  {
    document.querySelector(".search-results").innerHTML = "";
    var searchedTerms = JSON.parse(window.localStorage.getItem("searches"));
    searchedTerms.forEach(function (term) {
      var city = term[0];
      var state = term[1];
      var html = `<button class="result-btn flex-row j-center a-center">${city}, ${state}</button>`;
      document.querySelector(".search-results").innerHTML += html;
    });
  };
  
  colorUvIndex (element) 
  {
    if (element.innerHTML <= 2) {
      element.style.backgroundColor = "green";
    }
    if (element.innerHTML > 2 && element.innerHTML <= 5) {
      element.style.backgroundColor = "yellow";
    }
    if (element.innerHTML > 5) {
      element.style.backgroundColor = "red";
    }
  };
}

class Utils 
{
  searchedTerms;

  constructor() 
  {
    this.searchedTerms = new Array();
  }

  checkStorage() 
  {
    if (!window.localStorage.getItem("searches")) {
      window.localStorage.setItem("searches", JSON.stringify(this.searchedTerms));
    }
  };
  
  saveUserInput(cityName, stateCode) 
  {
    // Include search in local storage only if search does not already exist
    var searchedTerms = JSON.parse(window.localStorage.getItem("searches"));
    if (!searchedTerms.includes([cityName, stateCode])) {
      searchedTerms.push([cityName, stateCode]);
    }
    window.localStorage.setItem("searches", JSON.stringify(this.searchedTerms));
  };

  // Clears past searches by pulling search history from local storage and setting array value to empty.
  //displaySearches() function is then evoked, which also clears the innerHTML of the search area to align it with what's in local storage
  clearResultsFromLocalStorage () 
  {
    window.localStorage.setItem("searches", JSON.stringify(this.searchedTerms));
    displaySearches();
  };

  validateUserInput(userInput) // Rmeove this; have seperate input boxes for city and state. State can be dropdown
  {
    const userInputSplit = userInput.split(",");
    const isUserInputArrayCorrectLength = userInputSplit.length === 2;
    const isStateAbbreviationCorrectLength = userInputSplit[1].trim().length === 2;
    const isValidCityAndState = isUserInputArrayCorrectLength && isStateAbbreviationCorrectLength // Would result in an index out of bounds error
    return isValidCityAndState;
  }
}



window.onload = (e) => {
  const clearResultsBtn = document.querySelector(".clear-results-btn");
  const searchBtn = document.querySelector(".search-btn");
  const searchBar = document.querySelector(".search");
  const apiKey = "ce8ded9363f8838690bb46ae0314a5c5";
  
  const weatherApp = new WeatherApp(
    new Display(),
    new Utils(),
    searchBar, 
    clearResultsBtn,
    apiKey
  );
  
  weatherApp.UtilsObject.checkStorage();
  weatherApp.DisplayObject.displaySearches();
  clearResultsBtn.addEventListener("click", () => weatherApp.UtilsObject.clearResultsFromLocalStorage());
  searchBtn.addEventListener("click", () => weatherApp.getUserInputAndPullCityData());
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("result-btn")) {
      getBtnText(event.target);
    }
  });
}

