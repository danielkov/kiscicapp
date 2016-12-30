const express = require('express');
const app = express();
const feed = require('feed-read');
const http = require('http');

const config = require('./config/main');

const WSS = require('wsocket.io-server');

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');

const months = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December']

function easterForYear (year) {
  var a = year % 19;
  var b = Math.floor(year / 100);
  var c = year % 100;
  var d = Math.floor(b / 4);
  var e = b % 4;
  var f = Math.floor((b + 8) / 25);
  var g = Math.floor((b - f + 1) / 3);
  var h = (19 * a + b - d - g + 15) % 30;
  var i = Math.floor(c / 4);
  var k = c % 4;
  var l = (32 + 2 * e + 2 * i - h - k) % 7;
  var m = Math.floor((a + 11 * h + 22 * l) / 451);
  var n0 = (h + l + 7 * m + 114)
  var n = Math.floor(n0 / 31) - 1;
  var p = n0 % 31 + 1;
  var date = new Date(year,n,p);
  return date;
}

function getGreeting (date) {
  let greetings = {
    xmas: 'Boldog Karácsonyt!', // dec 24 - 26
    month: 'Boldog Hónapfordulót!', // every 4th
    anniversary: 'Boldog Évfordulót!', // okt 4
    bday: 'Boldog Szülinapot!', // julius 10
    nameday: 'Boldog Luca Napot!', // dec 13
    newyear: 'Boldog Újévet!', // jan 1
    easter: 'Boldog Húsvétot!', // fullrandom
    womensday: 'Boldog Nők Napjat!', // marc 8
    other: 'Szép Napot!'
  }
  let y = date.getFullYear();
  let d = date.getDate();
  let m = date.getMonth();
  let easter = easterForYear(y);
  if (d === 4) {
    return (date.getMonth() === 9) ? greetings['anniversary'] : greetings['month'];
  }
  if (m === 0 && d === 1) {
    return greetings['newyear'];
  }
  if (m === 11) {
    if (d === 13) {
      return greetings['nameday'];
    }
    else if (d > 23 && d < 27) {
      return greetings['xmas'];
    }
  }
  if (m === 6 && d === 10) {
    return greetings['bday'];
  }
  if (m === 2 && d === 8) {
    return greetings['womensday'];
  }
  if (easter.getMonth() === m && easter.getDate() === d) {
    return greetings['easter'];
  }
  return greetings['other'];
}

function getWeather (city, cb) {
  let appId = '51614bd145a29735c6bc6f76bd81ece8';
  return http.get({
    host: 'api.openweathermap.org',
    path: `/data/2.5/weather?q=${city}&units=metric&appid=${appId}`
  }, res => {
    var response = '';
    res.on('data', d => {
      response += d;
    })
    res.on('end', () => {
      cb(JSON.parse(response));
    })
  })
}

app.get('/', (req, res) => {
  let d = new Date();
  // figure out the greeting
  let greeting = getGreeting(d);

  res.render('index', {
    user: {
      name: 'Bogyó',
      thumbnail: 'thumbnail-cica.jpg'
    },
    greeting: greeting,
    date: months[d.getMonth()] + ' ' + d.getDate()
  });

});

app.get('/api/indexhu', (req, res) => {
  feed('http://index.hu/24ora/rss/', (err, articles) => {
    if (err) res.json({success:false});
    else {
      res.json(articles);
    }
  })
});

app.get('/api/origohu/:cat', (req, res) => {
  feed(`http://www.origo.hu/contentpartner/rss/${req.params.cat}/origo.xml`, (err, articles) => {
    if (err) res.json({success:false});
    else {
      res.json(articles);
    }
  })
});

app.get('/api/weather/:city', (req, res) => {
  getWeather(req.params.city, weather => {
    if (!weather) res.json({success:false});
    else {
      res.json(weather);
    }
  })
})



app.listen(config.port);
