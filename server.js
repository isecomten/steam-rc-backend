const express = require('express');
const app = express();
const port = process.env.port || 5000;
const axios = require('axios');
const cors = require('cors');
const retrieveData = require('./retrieveData.js');

//retrieveData.ProcessInsertGames();
//retrieveData.ProcessInsertGameDetails(107056);
//retrieveData.ProcessInsertGameReviews(54796);
app.use(cors());

app.listen(port, err => {
    if (err)
        console.log(err);
    console.log(`Listening on the port ${port}.`);
})