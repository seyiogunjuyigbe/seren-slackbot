const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();
const DB = require('./database');
const { DB_URL, PORT } = require('./config/config');

// const routes = require('./routes');
new DB().connect(DB_URL);

app.use(cors());
app.use(
  bodyParser.json({
    limit: '5mb',
    type: 'application/json',
  })
);
app.use(
  bodyParser.urlencoded({
    limit: '5mb',
    extended: true,
  })
);

// log every request to the console
app.use(morgan('dev'));

// app.use('/api/', routes);

app.all('*', (req, res) => {
  return res.status(404).json({
    error: true,
    message: 'Requested route not found',
  });
});

// error handling middleware
app.use((err, req, res) => {
  console.error(err.stack || err.message || err);
  res.status(500).json({
    error: true,
    message: err.stack || err.message || err,
  });
});
const port = process.env.port || PORT || 3000;

app.listen(port, () => console.log(`API listening on port ${port}`));
