/*
 * Author: Dave Millman <dave@production.pro>
 * Created: 07 Sep 2015
 */

var Fs = require('fs');
var Rss = require('rss');

// global constans
var URL = 'https://muut.com/comptop';

// the data to get things going
var fileName = 'data/data-2015-09-18.json';
var extracted_data = {};

function makeData(author, description, postTitle, url, guid, date) {
    return {
        'author': author,
        'description': description,
        'title': postTitle,
        'url': url,
        'guid': guid,
        'date': date
    };
}

function extract(entry) {
    // all the values below must be set for the entry
    var author, description, postTitle, guid, date;
    try {
        seed = entry.seed;
        author = seed.user.displayname;
        description = seed.body;
        postTitle = seed.title;
        guid = seed.key;
        date = seed.time;
    } catch (error){
        author = 'ERROR';
        description = 'There was an error extracting data from an entry. ' +
            'Please contact dave@cs.unc.edu to report an error.';
        postTitle = 'Errror extracting data for an entry';
        guid = new Date().getTime();
        date = guid;
    }
    var data = makeData(author, description, postTitle, URL, guid, date);
    console.log("data: ", data);
    return data;
}

function createFeed(data) {
    feed = new Rss({
        'title': 'https://muut.com/comptop#!/',
        'description': 'rss feed of the computational topology message board',
        'feed_url': 'https://TODO!!',
        'site_url': 'https://muut.com/comptop#!/'

    });

    for (var idx in data) {
        feed.item(data[idx]);
    }

    var xml = feed.xml();
    //console.log(xml)
}

function parseData(data) {
    var entries = data.result.moots.entries;
    extractedEntries = entries.map(extract);
    createFeed(extractedEntries);
}

// read file
Fs.readFile(fileName, 'utf8', function(err, data) {
    if (err) { throw err; }
    else {
        var jsonData = JSON.parse(data);
        parseData(jsonData); }
});
