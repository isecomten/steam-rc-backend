
const pg = require('pg').Pool;
const connectionSettings = require('./connectionSettings.js');
const pool = new pg(connectionSettings);

const retrieveData = {
    GetGames: async function () {
        const query = "SELECT * FROM game_details WHERE type = 'game'";
        try {
            const results = await pool.query(query);
            return results.rows;
        }
        catch (err) {
            throw (err);
        }
    },
    SortGamesByName: function (games) {
        return games.sort((a, b) => {
            if (a.name > b.name) return 1;
            if (a.name < b.name) return -1;
            return 0;
        }).map(({ appid, name }) => ({ appid, name }));
    },
    SortGamesByPrice: function (games) {
        const priceSort = (a, b) => {
            if (a.total_reviews > b.total_reviews) return 1;
            if (a.total_reviews < b.total_reviews) return -1;
            if (a.name > b.name) return 1;
            if (a.name < b.name) return -1;
            return 0;
        };
        const gamesPrice = {
            1: games.filter(game => game.initial_price < 500)
                .sort(priceSort),
            2: games.filter(game => game.initial_price < 1500)
                .sort(priceSort),
            3: games.filter(game => game.initial_price < 4000)
                .sort(priceSort),
            4: games.filter(game => game.initial_price >= 4000)
                .sort(priceSort),
            5: games.filter(game => game.initial_price >= 4000)
                .sort(priceSort),
            6: games.filter(game => game.initial_price >= 4000)
                .sort(priceSort)
        }
        return gamesPrice;
    },
    SortGamesByScore: function (games) {
        const scoreSort = (a, b) => {
            if (a.metacritic_score > b.metacritic_score) return 1;
            if (a.metacritic_score < b.metacritic_score) return -1;
            if (a.total_reviews > b.total_reviews) return 1;
            if (a.total_reviews < b.total_reviews) return -1;
            if (a.name > b.name) return 1;
            if (a.name < b.name) return -1;
            return 0;
        }
        return games.sort(scoreSort)
    }
}
module.exports = retrieveData;