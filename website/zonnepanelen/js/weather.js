
// Setup weather data

function updateWeather() {
	$.getJSON("http://api.openweathermap.org/data/2.5/weather?id=2756253&units=metric")
			.done(function(data) { 
				$("#temp").html(data.main.temp.toFixed(0) + " &deg;C");
				$("#sky").html(data.weather[0].description);
				$("#weather").css("background", "url(http://openweathermap.org/img/w/" + data.weather[0].icon + ".png) no-repeat");
			})
			.fail(function() { console.log("http://api.openweathermap.org failed");})
}

updateWeather();
