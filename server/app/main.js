const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const app = express();

const routes = require('./routes');
const db = require('../model');

const port = process.env.PORT || 1337;

// Socket setup
const socketio = require('socket.io');
const http = require('http');
const server = http.createServer();
server.on('request', app);
const io = socketio(server);
const socketEvents = require('./sockets');
socketEvents(io);

// Logging Middleware
if (port === 1337) { app.use(morgan('dev')); }

// Server up static files from '../../public'
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// Body parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'invalid secret key',
  resave: false,
  saveUninitialized: false,
}));

// Authentication Middleware
// app.use(passport.initialize());
// app.use(passport.session());


// cofiguring body-parser
app.use(bodyParser.json({ // setting json limit   
    limit: 1024 * 10000
}));
app.use(bodyParser.text({   // setting text limit
    limit: 1024 * 10000
}));
app.use(bodyParser.raw({  // setting raw limit
    limit: 1024 * 10000
}));


// CORS Issue Fix
app.use(function(req, res, next) {                            
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// Reroute to /api
app.use('/api', routes);

// Sync database then start listening if we are running the file directly
// Needed to remove errors during http testing
if (module === require.main) {
  server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

module.exports = app;
