require("dotenv").config();

const express = require('express')
const errorHandler = require('./middlewares/errorHandler');
const mongoose = require('mongoose');
const cors = require('cors');



const authMiddleware = require('./middlewares/authMiddleware');
const app = express()
const port = 3000


app.use(cors({
  origin: 'http://localhost:5173', // replace with your frontend domain
  credentials: true // enable sending cookies over CORS requests
}));


const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(cookieParser())
// ROUTES
const authRoutes = require('./routes/auth');

app.post('/', (req, res) => {
  console.log(req.body)
  res.send("ok").status(200)

});



app.get('/protected-route', authMiddleware, (req, res) => {


  res.send('This route is protected');
});


app.use('/', authRoutes);

app.use(errorHandler);


mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log('Failed to connect to MongoDB', err);
});

const db = mongoose.connection;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})