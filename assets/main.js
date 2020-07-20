function createCityList(citySearchList) {
  // empties the list of cities at the start of the function to prevent dusplicates 
  $("#city-list").empty();
  // defines the city as a key 
  var keys = Object.keys(citySearchList);
  // for loop to run through the list of cities and make a button for each one
  for (var i = 0; i < keys.length; i++) {
    var cityListEntry = $("<button>");
    // adds styling to the city list item
    cityListEntry.attr("class", "list-group-item list-group-item-action");
    var splitStr = keys[i].split(" ");

    // defines cities in the list as variables
    var titleCity = splitStr.join(" ");

    cityListEntry.text(titleCity);
    //Places the city into the menu
    $("#city-list").append(cityListEntry);

  }
}

function populateCityWeather(city, citySearchList) {
  createCityList(citySearchList);
  var queryURL =
    "https://api.openweathermap.org/data/2.5/weather?&units=imperial&appid=dc644253a490b31ad20affc0c135f009&q=" +
    city;
  var queryURL2 =
    "https://api.openweathermap.org/data/2.5/forecast?&units=imperial&appid=dc644253a490b31ad20affc0c135f009&q=" +
    city;

  $.ajax({
    url: queryURL,
    method: "GET"
  })
    // Store all of the retrieved data inside of an object called "weather"
    .then(function (weather) {
      //Uses moment.js to get the date
      var nowMoment = moment();
      var displayMoment = $("<h2>");
      $("#city-name").empty();
      $("#city-name").append(
        // defines the format for moment to display
        displayMoment.text("(" + nowMoment.format("M/D/YYYY") + ")")
      );
      // makes an h3 tag for the text
      var cityName = $("<h2>").text(weather.name);
      //targets the city-name div and prepends it
      $("#city-name").prepend(cityName);
      //defines weather condition icon as a variable to add to page later
      var icon = $("<img>");
      // gets the approptiate icon and adds it to that element 
      icon.attr("src", "https://openweathermap.org/img/w/" + weather.weather[0].icon + ".png");
      //Removes any weather icons previously used
      $("#currentIcon").empty();
      //Puts the weather info into the appropriate elements
      $("#currentIcon").append(icon);
      $("#currentTemp").text("Temperature: " + weather.main.temp + " °F");
      $("#currentHumidity").text("Humidity: " + weather.main.humidity + "%");
      $("#currentWind").text("Wind Speed: " + weather.wind.speed + " MPH");
      var latitude = weather.coord.lat;
      var longitude = weather.coord.lon;
      //query URL for AJAX request
      var queryURL3 =
        "https://api.openweathermap.org/data/2.5/uvi/forecast?&units=imperial&appid=dc644253a490b31ad20affc0c135f009&q=" +
        "&lat=" +
        latitude +
        "&lon=" +
        longitude;
      //ajax request
      $.ajax({
        url: queryURL3,
        method: "GET"

        // Store all of the retrieved UV index data inside of an object called "uvIndex"
        // and color code it based on the value
      }).then(function (uvIndex) {
        //Defines UV Index as a variable
        var uvIndexDisplay = $("<button>");

        uvIndexDisplay.attr("class", "btn btn-primary currentUV")
        $("#currentUV").text("UV Index: ");
        $("#currentUV").append(uvIndexDisplay.text(uvIndex[0].value));
        //Checks the value of UV index and sets the appropriate color
        if ((uvIndex[0].value) < 3) {
          $(uvIndexDisplay).attr("class", "btn btn-success");
        }
        else if ((uvIndex[0].value) < 6) {
          $(uvIndexDisplay).attr("class", "btn btn-warning");
        }
        else if ((uvIndex[0].value) < 8) {
          $(uvIndexDisplay).attr("class", "btn orange");
        }
        else if ((uvIndex[0].value) < 11) {
          $(uvIndexDisplay).attr("class", "btn btn-danger");
        }
        // console.log(uvIndex[0].value);
        $.ajax({
          url: queryURL2,
          method: "GET"

          // Store all of the retrieved data inside of an object called "forecast"
        }).then(function (forecast) {
          // for loop to run through for each of the 5 days
          for (var i = 6; i < forecast.list.length; i += 8) {

            var forecastDate = $("<h4>");
            var forecastPosition = (i + 2) / 8;
            //targets the forecast date, empties the previous and appends the new
            $("#forecastDate" + forecastPosition).empty();
            $("#forecastDate" + forecastPosition).append(
              forecastDate.text(nowMoment.add(1, "days").format("MMMM/D"))
            );
            var forecastIcon = $("<img>");
            forecastIcon.attr(
              "src",
              "https://openweathermap.org/img/w/" +
              forecast.list[i].weather[0].icon +
              ".png"
            );
            //empties the previous entries and puts the weather info to its respective ID on the page
            $("#forecastIcon" + forecastPosition).empty();
            $("#forecastIcon" + forecastPosition).append(forecastIcon);
            $("#forecastTemp" + forecastPosition).text("Temp: " + forecast.list[i].main.temp + " °F");
            $("#forecastHumidity" + forecastPosition).text("Humidity: " + forecast.list[i].main.humidity + "%");
            $(".forecast").attr("class", "bg-primary forecast");
          }
        });
      });
    });

  //Clear the city list and localStorage
  $("#clear-button").on("click", function (event) {
    $("#city-list").empty();
    localStorage.clear();
  });
}


$(document).ready(function () {
  var citySearchListStringified = localStorage.getItem("citySearchList");
  var citySearchList = JSON.parse(citySearchListStringified);
  if (citySearchList == null) {
    citySearchList = {};
  }

  createCityList(citySearchList);
  $("#currentWeather").hide();
  $("#forecastWeather").hide();
  $("#search-button").on("click", function (event) {
    event.preventDefault();
    var city = $("#city-input").val().trim();
    if (city != "") {
      //Check to see if there is any text entered
      citySearchList[city] = true;
      localStorage.setItem("citySearchList", JSON.stringify(citySearchList));
      populateCityWeather(city, citySearchList);
      $("#currentWeather").show();
      $("#forecastWeather").show();
    }
  });

  $("#city-list").on("click", "button", function (event) {
    event.preventDefault();
    var city = $(this).text();
    populateCityWeather(city, citySearchList);
    $("#currentWeather").show();
    $("#forecastWeather").show();
  });
})