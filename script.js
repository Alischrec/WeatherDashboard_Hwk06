// When user searches city, the following appears to the right:
//  1. Current weather:
//      a. ajax url
//      b. City name, date, temperature, humidity, wind speed
//  2. UV Index
//  3. 5 Day Forecast
// When a city is searched, it is added as a button below that links to the proper information (localStorage)

// When the document is ready...
$(document).ready(function () {
    $('#search-button').on('click', function () {
      var searchValue = $('#search-value').val();
      // Clear Input Value:
      $('#search-value').val('');
  
      searchWeather(searchValue);
    });
  
    $('.history').on('click', 'li', function () {
      searchWeather($(this).text());
    });
  
    let makeRow = (text) => {
      var li = $('<li>').addClass('list-group-item list-group-item-action').text(text);
      $('.history').append(li);
    }
  
    // Call first API (Current Weather):
    const searchWeather = (searchValue) => {
      $.ajax({
        type: 'GET',
        url: 'http://api.openweathermap.org/data/2.5/weather?q=' + searchValue + '&appid=e34e55939ca088c91b5bb9a6019f6c18&units=imperial',
        dataType: 'json',
        success: function (data) {
          if (history.indexOf(searchValue) === -1) {
            history.push(searchValue);
            window.localStorage.setItem('history', JSON.stringify(history));
  
            makeRow(searchValue);
          }
          $('#today').empty();
  
          // HTML Element creation:
          let title = $('<h3>').addClass('card-title').text(data.name + ' (' + new Date().toLocaleDateString() + ')');
          let card = $('<div>').addClass('card');
          let wind = $('<p>').addClass('card-text').text('Wind Speed: ' + data.wind.speed + ' MPH');
          let humid = $('<p>').addClass('card-text').text('Humidity: ' + data.main.humidity + '%');
          let temp = $('<p>').addClass('card-text').text('Temperature: ' + data.main.temp + ' °F');
          let cardBody = $('<div>').addClass('card-body');
          let img = $('<img>').attr('src', 'http://openweathermap.org/img/w/' + data.weather[0].icon + '.png');
  
          // merge and add to page
          title.append(img);
          cardBody.append(title, temp, humid, wind);
          card.append(cardBody);
          $('#today').append(card);
  
          // call follow-up api endpoints
          getForecast(searchValue);
          getUVIndex(data.coord.lat, data.coord.lon);
        }
      });
    }
  
    // Call API for UV Index
    const getUVIndex = (lat, lon) => {
      $.ajax({
        type: 'GET',
        url: 'http://api.openweathermap.org/data/2.5/uvi?appid=e34e55939ca088c91b5bb9a6019f6c18&lat=' + lat + '&lon=' + lon,
        dataType: 'json',
        success: function (data) {
          // HTML Elements:
          let uv = $('<p>').text('UV Index: ');
          let btn = $('<span>').addClass('btn btn-sm').text(data.value);
          
          // Change color depending on given UV Index
          if (data.value < 3) {
            btn.addClass('btn-success');
          }
          else if (data.value < 7) {
            btn.addClass('btn-warning');
          }
          else {
            btn.addClass('btn-danger');
          }
          
          $('#today .card-body').append(uv.append(btn));
        }
      });
    }
    
    // Call API for 5 day forecast
    const getForecast = (searchValue) => {
      $.ajax({
        type: 'GET',
        url: 'http://api.openweathermap.org/data/2.5/forecast?q=' + searchValue + '&appid=e34e55939ca088c91b5bb9a6019f6c18&units=imperial',
        dataType: 'json',
        success: function (data) {
          $('#forecast').html('<h4 class=\'mt-3\'>5-Day Forecast:</h4>').append('<div class=\'row\'>');
  
          // Loop through by 3 hour increments
          for (var i = 0; i < data.list.length; i++) {
            // only look at forecasts around 3:00pm
            if (data.list[i].dt_txt.indexOf('15:00:00') !== -1) {
              // HTML Elements:
              let col = $('<div>').addClass('col-md-2');
              let card = $('<div>').addClass('card bg-primary text-white');
              let body = $('<div>').addClass('card-body p-2');
  
              let title = $('<h5>').addClass('card-title').text(new Date(data.list[i].dt_txt).toLocaleDateString());
  
              let img = $('<img>').attr('src', 'http://openweathermap.org/img/w/' + data.list[i].weather[0].icon + '.png');
  
              let p1 = $('<p>').addClass('card-text').text('Temp: ' + data.list[i].main.temp_max + ' °F');
              let p2 = $('<p>').addClass('card-text').text('Humidity: ' + data.list[i].main.humidity + '%');
  
            
              col.append(card.append(body.append(title, img, p1, p2)));
              $('#forecast .row').append(col);
            }
          }
        }
      });
    }
  
    // Store history/searches within localStorage:
    let history = JSON.parse(window.localStorage.getItem('history')) || [];
  
    if (history.length > 0) {
      searchWeather(history[history.length - 1]);
    }
  
    for (var i = 0; i < history.length; i++) {
      makeRow(history[i]);
    }
  });