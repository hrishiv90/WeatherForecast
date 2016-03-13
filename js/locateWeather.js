$(function () {
	var weather, forecast, unitSystem, position;

	var getLocation = function () {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(getWeather || $.noop, showError || $.noop);
		} else {
			$("#weather").html("Geolocation is not supported by this browser!");
		}
	};

	var getWeather = function  (position) {

		var data = { appid: 'b77c3c01e81fad07d8bd9657c8414303', units: 'metric' };
		if (position) {
			this.position = position;
			data.lat = position.coords.latitude;
			data.lon = position.coords.longitude;
			$('#get-location-form').hide();
			$('#loader').show();
		} else if ($('#latitude').val().length && $('#longitude').val().length) {
			data.lat = $('#latitude').val();
			data.lon = $('#longitude').val();
		} else if ($('#postCode').val().length && !isNaN($('#postCode').val())) {
			data.zip = $('#postCode').val();
		} else if ($('#cityName').val().length && isNaN($('#cityName').val())) {
			data.q = $('#cityName').val();
		} else {
			$("#weather").html("Please fill appropriate fields to retrieve weather or forecast: ");
			return;
		}
		
		$.ajax({
			method: 'GET',
			url: 'http://api.openweathermap.org/data/2.5/weather',
			data: data
		})
		.done(function (response) {
			$.ajax({
				method: 'GET',
				url: 'http://api.openweathermap.org/data/2.5/forecast/daily',
				data: data
			})
			.done(function (forecast) {
				$('#loader').hide();
				$("#failed").hide();
				showWeatherInfo(response, forecast);
			})
			.fail(function (error) {
				$('#loader').hide();
				$("#failed").html("Error retrieving weather or forecast: " + error.status).show();
			});
		})
		.fail(function (error) {
			$('#loader').hide();
			$("#failed").html("Error retrieving weather or forecast: " + error.status).show();
		});
	}

	var showWeatherInfo = function (data, forecast) {
		if (!data || !forecast) {
			data = this.weather;
			forecast = this.forecast;
		} else {
			this.weather = data;
			this.forecast = forecast;
		}
		$('#get-location-form').hide();
		$('.weatherInfo').show();
		var backgroundSrc = "assets/backgrounds/" + data.weather[0].icon + ".jpg";
		var foregroundSrc = "assets/icons/" + data.weather[0].icon + ".png";
		var temperature = localizeTemperature(data.main.temp);
		var description = data.weather[0].description;
		var windSpeed = localizeSpeed(data.wind.speed);
		
		var dailyHigh = localizeTemperature(forecast.list[0].temp.max);
		var dailyLow = localizeTemperature(forecast.list[0].temp.min);
		
		$("body").css("background", "url('" + backgroundSrc + "') no-repeat fixed 50% 50%")
				 .css("background-size", "cover");
		$("#weather").empty()
					 .append("<h2>" + data.name + "</h2>")
					 .append("<img class='icon' src='" + foregroundSrc + "' />")
					 .append("<span id='temp'>" + temperature + "</span>")
					 .append("<p id='description'>" + data.weather[0].description + "</p>")
					 .append("<p><span id='humidity'>" + data.main.humidity + "% humid </span>" +
								"<span id='wind-speed'>" + windSpeed + "</span></p>");
		$("#forecast").empty()
					  .append("<p id='daily'>Today's Forecast: " + forecast.list[0].weather[0].main + "</p>")
					  .append("<p><span id='high'>High: " + dailyHigh + "</span>" +
								 "<span id='low'>Low: " + dailyLow + "</span></p>");
	};

	function localizeTemperature(metric) {
		metric = Math.round(metric);
		if (getUnitSystem() == "imperial") {
			return (metric * 9 / 5 + 32).toFixed(1) + "&deg;F";
		} else {
			return metric.toFixed(1) + "&deg;C";
		}
	}

	function localizeSpeed(metric) {
		var MILES_PER_METRE = 1 / 1609.344;
		var HOURS_PER_SECOND = 1 / 60 / 60;
		if (getUnitSystem() == "imperial") {
			return (metric * MILES_PER_METRE / HOURS_PER_SECOND).toFixed(2) + " mph";
		} else {
			return metric.toFixed(2) + " m/s";
		}
	}

	var getUnitSystem = function () {
		return this.unitSystem; 
	};

	var setUnitSystem = function (unitSystem) {
		this.unitSystem = unitSystem;
	};

	var showError = function (error) {
		var errorMessages = {
			PERMISSION_DENIED    : "User denied the request for geolocation.",
			POSITION_UNAVAILABLE : "Location information is unavailable.",
			TIMEOUT              : "The request to get user location timed out.",
			UNKNOWN_ERROR        : "An unknown error occurred."
		};
		$("#weather").html(errorMessages.UNKNOWN_ERROR);
		for (var msg in errorMessages)
			if (error[msg] === error.code)
				$("#weather").html(errorMessages[msg]);
	};

	setUnitSystem('imperial');
	getLocation();
	$('#imperial, #metric').on('click', function (e) {
		setUnitSystem(e.delegateTarget.getAttribute('id'));
		showWeatherInfo();
	});
	$('#getWeather').on('click', function () {
		setUnitSystem('imperial');
		getWeather();
	});
	$('#changeLocation').on('click', function () {
		$('#get-location-form').show();
		$('.weatherInfo').hide();
	});
});
