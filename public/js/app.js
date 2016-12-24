window.onload = function () {

  var weatherReq = new XMLHttpRequest();
  weatherReq.addEventListener('load', function () {
    var res = JSON.parse(this.responseText);
    document.getElementById('temp').innerHTML = res.main.temp + ' °C';
    document.getElementById('city').innerHTML = res.name;
  });
  weatherReq.open('GET', 'http://api.openweathermap.org/data/2.5/weather?q=budapest&units=metric&appid=51614bd145a29735c6bc6f76bd81ece8');
  weatherReq.send();

}
