const pg = require('pg').Pool;
const connectionSettings = require('./connectionSettings.js');
const pool = new pg(connectionSettings);

const axios = require('axios');

const retrieveData = {
    ProcessInsertGames: async function () {
        try {
            const apps = await GetAppsFromSteam();
            InsertAppsIntoDB(apps);
        }
        catch (err) {
            console.log(err);
        }
    },
    ProcessInsertGameDetails: async function (initialChunk) {
        let apps = await GetAppsFromDB();
        apps = apps.slice(initialChunk);
        let counter = 0;

        for (let app of apps) {
            await Sleep(1300);
            console.log(`current chunk => ${initialChunk + counter} appid => ${app.appid}`);
            try {
                let appDetails = await GetAppDetailsFromSteam(app);
                //response might be successful but app doesn't exist
                if (appDetails?.success == false || appDetails?.data == null) {
                    counter++;
                    continue;
                }
                appDetails = SanitizeAppDetails(appDetails);
                await InsertAppDetailsIntoDB(app, appDetails);
            }
            catch (err) {
                console.log(err);
                console.log(`chunk failed on => ${initialChunk + counter}`);
                this.ProcessInsertGameDetails(initialChunk + counter);
                return;
            }
            counter++;
        }
    },
    ProcessInsertGameReviews: async function (initialChunk) {
        let games = await GetGamesFromDB();
        games = games.slice(initialChunk);
        let counter = 0;

        for (let game of games) {
            await Sleep(1300);
            console.log(`current chunk => ${initialChunk + counter} appid => ${game.appid}`);
            try {
                let gameReviewDetails = await GetGameReviewsFromSteam(game);
                //response might be successful but game doesn't exist
                if (gameReviewDetails?.success == false) {
                    counter++;
                    continue;
                }
                await InsertGameReviewsIntoDB(game, gameReviewDetails);
            }
            catch (err) {
                console.log(err);
                console.log(`chunk failed on => ${initialChunk + counter}`);
                this.ProcessInsertGameReviews(initialChunk + counter);
                return;
            }
            counter++;
        }
    }
}

async function GetAppsFromSteam() {
    try {
        const apps = await axios.get('http://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json');
        return apps.data.applist.apps;
    }
    catch (err) {
        throw (err);
    }
}
async function InsertAppsIntoDB(apps) {
    for (let app of apps) {
        const query = 'INSERT INTO games(appid, name) VALUES($1, $2) ON CONFLICT (appid) DO NOTHING';
        const values = [app.appid, app.name];
        try {
            const results = await pool.query(query, values);
            console.log(`Inserted ${app.name} into database.`);
        }
        catch (err) {
            throw err;
        }
    }
}
async function GetAppsFromDB() {
    const query = 'SELECT * FROM games ORDER BY appid';
    try {
        const results = await pool.query(query);
        return results.rows;
    }
    catch (err) {
        throw (err);
    }
}
async function GetAppDetailsFromSteam(app) {
    try {
        const results = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${app.appid}&cc=us`);
        return results.data[app.appid];
    }
    catch (err) {
        throw (err);
    }
}
async function InsertAppDetailsIntoDB(app, appDetails) {
    const query = 'INSERT INTO game_details\
    (appid,\
    name,\
    required_age,\
    is_free,\
    detailed_description,\
    about_the_game,\
    short_description,\
    supported_languages,\
    header_image,\
    website,\
    developers,\
    publishers,\
    initial_price,\
    final_price,\
    discount_percent,\
    platforms_windows,\
    platforms_mac,\
    platforms_linux,\
    metacritic_score,\
    recommendations,\
    release_date,\
    type)\
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)\
    ON CONFLICT DO NOTHING';

    const values = [
        app.appid,
        appDetails?.data?.name,
        appDetails?.data?.required_age,
        appDetails?.data?.is_free,
        appDetails?.data?.detailed_description,
        appDetails?.data?.about_the_game,
        appDetails?.data?.short_description,
        appDetails?.data?.supported_languages,
        appDetails?.data?.header_image,
        appDetails?.data?.website,
        appDetails?.data?.developers,
        appDetails?.data?.publishers,
        appDetails?.data?.price_overview?.initial,
        appDetails?.data?.price_overview?.final,
        appDetails?.data?.price_overview?.discount_percent,
        appDetails?.data?.platforms?.windows,
        appDetails?.data?.platforms?.mac,
        appDetails?.data?.platforms?.linux,
        appDetails?.data?.metacritic?.score,
        appDetails?.data?.recommendations?.total,
        appDetails?.data?.release_date?.date,
        appDetails?.data?.type
    ];

    try {
        const results = await pool.query(query, values);
        console.log(`Inserted ${app.name} details into database.`);
    }
    catch (err) {
        throw err;
    }
}
async function GetGamesFromDB() {
    const query = "SELECT * FROM game_details WHERE type = 'game' ORDER BY appid";
    try {
        const results = await pool.query(query);
        return results.rows;
    }
    catch (err) {
        throw (err);
    }
}
async function GetGameReviewsFromSteam(game) {
    try {
        const results = await axios.get(`https://store.steampowered.com/appreviews/${game.appid}?json=1&num_per_page=0&language=all`);
        return results.data;
    }
    catch (err) {
        throw (err);
    }
}
async function InsertGameReviewsIntoDB(game, gameReviewDetails) {
    const query = 'UPDATE game_details SET\
    num_reviews = $1,\
    review_score = $2,\
    review_score_desc = $3,\
    total_positive = $4,\
    total_negative = $5,\
    total_reviews = $6\
    WHERE appid = $7';

    const values = [
        gameReviewDetails?.query_summary?.num_reviews,
        gameReviewDetails?.query_summary?.review_score,
        gameReviewDetails?.query_summary?.review_score_desc,
        gameReviewDetails?.query_summary?.total_positive,
        gameReviewDetails?.query_summary?.total_negative,
        gameReviewDetails?.query_summary?.total_reviews,
        game.appid
    ];

    try {
        const results = await pool.query(query, values);
        console.log(`Inserted ${game.name} review details into database.`);
    }
    catch (err) {
        throw err;
    }
}
async function Sleep(ms) {
    return new Promise((res) => {
        setTimeout(res, ms);
    });
}
function SanitizeAppDetails(appDetails) {
    if (appDetails?.data?.release_date?.date != null && isNaN(Date.parse(appDetails?.data?.release_date?.date))) {
        appDetails.data.release_date.date = null;
    }
    else {
        //have to convert into format where postgres can accept
        appDetails.data.release_date.date = new Date(appDetails.data.release_date.date)
    }
    return appDetails;
}
module.exports = retrieveData;