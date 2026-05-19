const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000; //Puerto del backend, modificar si es necesario
const dotenv = require('dotenv');

dotenv.config();
const dbService = require('./DBService');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    console.log('Received a request');
    res.send('Hello World');
})

app.listen(port, () => {
    console.log('The server is running...');
})