const express = require('express');
const app = express();
const port = process.env.port || 5000;
const axios = require('axios');
const cors = require('cors');
app.use(cors());

app.listen(port, err => {
    if (err)
        console.log(err);
    console.log(`Listening on the port ${port}.`);
})