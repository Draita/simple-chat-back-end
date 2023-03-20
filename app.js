require("dotenv").config();

const http = require('http');

const express = require('express')
const errorHandler = require('./middlewares/errorHandler');
const mongoose = require('mongoose');
const cors = require('cors');




const {authMiddleware} = require('./middlewares/authMiddleware');
const app = express()
const port = 3000

const server = http.createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

// Initialize socket.io
require('./sockets/socket')(io);




app.use(cors({
  origin: 'http://localhost:5173', // replace with your frontend domain
  credentials: true // enable sending cookies over CORS requests
}));


const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.use(cookieParser())


app.use(cookieParser())
// ROUTES IMPORTS
const authRoutes = require('./routes/auth');
const friendRoutes = require('./routes/friend');
const roomRoutes = require('./routes/room');
const userRoutes = require('./routes/userRoute');
const notificationRoutes = require('./routes/notificationRoute');





app.post('/', (req, res) => {
  console.log(req.body)
  res.send("ok").status(200)

});


// define routes
app.use('/users',authMiddleware, userRoutes);

app.use('/friend',authMiddleware, friendRoutes);
app.use('/room',authMiddleware, roomRoutes);
app.use('/notification',authMiddleware, notificationRoutes);


app.use('/', authRoutes);


app.use(errorHandler);


const User = require("./models/userModel");


const { clearConnectedSockets } = require("./services/userStatus");

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  clearConnectedSockets()
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log('Failed to connect to MongoDB', err);
});
const db = mongoose.connection;

server.listen(port, () => console.log(`Server running on port ${port}`));
