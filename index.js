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

  pullCityData (forecaseRangeinDays, apiKey) 
  {
    // Display searches on page
    this.DisplayObject.displaySearches();
    const city = this.SearchBarElement.value;
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=${forecaseRangeinDays}&aqi=no&alerts=no`;
    axios
    .get(apiUrl)
    .then(response => {
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
}



window.onload = (e) => {
  const clearResultsBtn = document.querySelector(".clear-results-btn");
  const searchBtn = document.querySelector(".search-btn");
  const searchBar = document.querySelector(".search");
  const apiKey = "c73bde0148334fce9db25849241907";
  
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
  searchBtn.addEventListener("click", () => weatherApp.pullCityData(7, apiKey));
}


// initial page
    // Could be anything. Have fun with this. Starter screen. 
    // Search bar starts at center, then moves up after you search 
// current weather
    // Immediately after you search for a city
// forecast