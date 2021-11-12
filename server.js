const express = require('express');
const axios = require('axios');
const cors = require('cors');
const steamAPIProcesses = require('./steamAPIProcesses.js');
const gamesRouter = require('./routes/gamesRoute');
const apiProcesses = require('./apiProcesses.js');

async function main() {
    const app = express();
    const port = process.env.port || 5000;

    const games = await apiProcesses.GetGames();
    app.use(cors());
    app.use('/games', gamesRouter.gamesRoute(games));
    // steamAPIProcesses.ProcessInsertGames();
    // steamAPIProcesses.ProcessInsertGameDetails(107056);
    // steamAPIProcesses.ProcessInsertGameReviews(54796);

    app.listen(port, err => {
        if (err)
            console.log(err);
        console.log(`Listening on the port ${port}.`);
    })
}

main();