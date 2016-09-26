// Loading dependencies.
const express = require('express');
const MongoClient = require('mongodb').MongoClient;

// Creating an Express application.
const app = express();

// Defining port that the Express application will run from.
const expressPort = 8080;

// Stores reference to the database connection.
var database = null;

/**
 * Wrapper method to get a reference to the database connection. If one
 * hasn't been made yet, the connection is created and pre-populated.
 *
 * @return {Promise}
 */
function getDatabase() {
    return new Promise(function(resolve) {
        if (database) {
            resolve(database);
        } else {
            connect().then(function(db) {
                database = db;
                prepopulateDatabase(database).then(function() {
                    resolve(database);
                });
            });
        }
    });
};

/**
 * Builds a connection string to the MongoDB container from Docker variables
 * then connects and returns the instance.
 *
 * @return {Promise}
 */
function connect() {
    var address = process.env.MONGODB_PORT_27017_TCP_ADDR;
    var port = process.env.MONGODB_PORT_27017_TCP_PORT;
    var mongoURL = `mongodb://${address}:${port}`;

    return MongoClient.connect(mongoURL);
};

/**
 * Ensures that a collection exists with some dummy records in place.
 *
 * @param {Object} database - MongoDB database reference.
 * @return {Promise}
 */
function prepopulateDatabase(database) {
    return new Promise(function(resolve, reject) {
        var collection = database.collection('guestbook');

        collection.count(function(error, count) {
            if (count > 0) {
                return resolve();
            }

            collection.insertMany([
                {name: 'Joe Bloggs', message: 'Lovely B&B.'},
                {name: 'Anita Dick', message: 'Carpet could do with a clean.'}
            ], function(error, result) {
                if (!error) {
                    resolve();
                } else {
                    reject(result);
                }
            });
        });
    });
};

/**
 * Gets all of the entries from the guestbook collection.
 *
 * @return {Promise}
 */
function getEntries() {
    return new Promise(function(resolve) {
        var collection = database.collection('guestbook');

        collection.find().toArray().then(
            function(entries) {
                resolve(entries);
            }
        );
    });
};

// API Endpoint: Get all entries and return them as JSON.
app.get('/', function(request, response) {
    getDatabase()
        .then(getEntries)
        .then(function(entries) {
            response.json(entries);
        });
});

// Making the application listen to requests on the specified port.
app.listen(expressPort);

// Outputting information to the console.
console.log(`Running on http://localhost:${expressPort}`);
