const express = require('express');
const apiProcesses = require('../apiProcesses.js');
function gamesRoute(games) {
    const router = express.Router();

    const gamesByNames = apiProcesses.SortGamesByName(games);

    router.get('/', async (req, res) => {
        res.send(gamesByNames);
    })

    router.get('/price', async (req, res) => {
        const resJson = apiProcesses.SortGamesByPrice(games);
        res.send(resJson);
    })
    return router;
}
function GetAverageRevenue(games) {
    let averageRevenue = 0
    games.forEach(game => {
        const gameRevenue = game.total_reviews * game.initial_price;
        averageRevenue += gameRevenue;
    });
    averageRevenue = averageRevenue / games.length;
    return averageRevenue;
}
function GetAverageReviewCount(games) {
    let averageReviewCount = 0;
    games.forEach(game => {
        averageReviewCount += game.total_reviews
    });
    averageReviewCount = averageReviewCount / games.length;
    return averageReviewCount;
}
module.exports.gamesRoute = gamesRoute;