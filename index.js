const express = require('express');
const app = express();

const config = require('./config/main');

const WSS = require('wsocket.io-server');

app.get('/', (req, res) => {
  res.send(`<h1>Hello app on ${config.port}</h1>`);
})

app.listen(config.port);
