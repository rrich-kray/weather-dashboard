class WeatherApp
{
  DisplayObject;
  UtilsObject;
  SearchBarElement;
  ClearResultsBtn;
  ApiUrl;
  ApiKey;

  constructor(displayObject, utilsObject, searchBarElement, clearResultsBtn, apiUrl, apiKey)
  {
    this.DisplayObject = displayObject;
    this.UtilsObject = utilsObject;
    this.SearchBarElement = searchBarElement;
    this.ClearResultsBtn = clearResultsBtn;
    this.ApiUrl = apiUrl;
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
    const city = this.SearchBarElement.value;
    // this.UtilsObject.saveUserInput(city, this.ApiKey, 7); // update to allow user ot choose forecast range
    this.pullCityData(city, 7, this.ApiKey);
  }

  getUserInput()
  { // CHANGE THIS TO BE MORE ACCEPTING OF USER INPUT
    // Capture user input and split it by city name and state name; trim spaces and convert stateCode to uppercase only, and add "US-" so that it adheres to ISO-3166 standards
    const userInput = this.SearchBarElement.value;
    /*
    if (!this.UtilsObject.validateUserInput(userInput))
    {
      alert("Please enter the city name and two-letter state code");
      return;
    }
    */
    var [city, state] = userInput;
    city = city.trim();
    state = `US-${state.trim().toUpperCase()}`;
    return new Array(city, state);
  };

  pullCityData (cityName, forecaseRangeinDays, apiKey) 
  {
    // Display searches on page
    this.DisplayObject.displaySearches();
    const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityName}&days=${forecaseRangeinDays}&aqi=no&alerts=no`;
    axios
    .get(apiUrl)
    .then(response => {
        console.log(response.data);
        this.DisplayObject.displayCurrentWeatherData(response.data.current);
        this.DisplayObject.displayWeatherForecast(response.data.forecast.forecastday);
    })
    .catch((e) => console.log(e));
  };
}

class Display 
{
  elementDict;
  weatherTypeThumbnailLocationDict;

  constructor() 
  {
    this.elementDict = 
    {
      temp: "#temp",
      wind: "#wind",
      humidity: "#humidity",
      uvIndex: "#uv-index",
      tileContainer: ".tile-container"
    }
  }

  displayCurrentWeatherData (weatherData) {
    document.querySelector(this.elementDict.temp).innerHTML = `${weatherData.temp_f} ℉`;
    document.querySelector(this.elementDict.wind).innerHTML = `${weatherData.gust_mph} mph`;
    document.querySelector(this.elementDict.humidity).innerHTML = `${weatherData.humidity} g.kg^-1`;
    document.querySelector(this.elementDict.uvIndex).innerHTML = `${weatherData.uv} %rh`;
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
    weatherData.forEach(function (day) {
      var html = `
          <div class="tile">
              <div class="front">
                  <img class="thumbnail" src=${day.day.condition.icon} alt="">
                  <h5 class="date">${moment(moment(), "MM-DD-YYYY").add(
                    counter1,
                    "days"
                  )}</h5> <!--date can go here-->
                  <div class="changing-container">
                      <p>Temp: <span class="temp">${day.day.avgtemp_f} ℉</span></p>
                      <p>Wind: <span class="wind">${day.day.maxwind_mph} mph</span></p>
                      <p>Humidity: <span class="humidity">${day.day.avghumidity} %rh</span></p>
                      <p>UVI: <span class="UVI">${day.day.uv} g.kg^-1</span></p>
                  </div>
              </div>
              <div class="background"></div>
          </div>
              `;
  
      tileContainer.innerHTML += html;
      counter1++;
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
  const apiKey = "c73bde0148334fce9db25849241907";
  const apiUrl = "`http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityName}&days=${forecaseRangeinDays}&aqi=no&alerts=no"
  
  const weatherApp = new WeatherApp(
    new Display(),
    new Utils(),
    searchBar, 
    clearResultsBtn,
    apiUrl,
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


// initial page
    // Could be anything. Have fun with this. Starter screen. 
    // Search bar starts at center, then moves up after you search 
// current weather
    // Immediately after you search for a city
// forecast