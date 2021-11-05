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
    ProcessInsertGameDetails: async function () {
        try {
            const apps = await GetAppsFromDB();
        }
        catch (err) {
            console.log(err);
        }
    },
    ProcessInsertGameReviews: async function () {

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
        return results;
    }
    catch (err) {
        throw (err);
    }
}
module.exports = retrieveData;