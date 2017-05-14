var request = require('request');
var cheerio = require('cheerio');
var URL =     require('url-parse');

var START_URL = "http://www.nationalrail.com";
var SEARCH_WORD = "data";
var MAX_PAGES_TO_VISIT = 10;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
crawl();

function crawl() {
    if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
        console.log("Max number of pages visited");
        return;
    }

    var nextPage = pagesToVisit.pop();
    if (nextPage in pagesVisited) {
        // page has already been crawled
        crawl();
    } else {
        // new page not crawled yet
        visitPage(nextPage, crawl);
    }
}


function visitPage(url, callback) {
    // add page to our set of pages visited
    pagesVisited[url] = true;
    numPagesVisited++;

// Make the request
  console.log("Visiting page " + url);
  request(url, function(error, response, body) {
     // Check status code (200 is HTTP OK)
     console.log("Status code: " + response.statusCode);
     if(response.statusCode !== 200) {
       callback();
       return;
     }
     // Parse the document body
     var $ = cheerio.load(body);
     var isWordFound = searchForWord($, SEARCH_WORD);
     if(isWordFound) {
       console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
     } else {
       collectInternalLinks($);
       // In this short program, our callback is just calling crawl()
       callback();
     }
  });
}

function searchForWord($, word) {
    var bodyText = $('html > body').text();
    return(bodyText.indexOf(word.toLowerCase()) !== -1 )
}

function collectInternalLinks($) {
    var relativeLinks = $("a[href^='/']");
    relativeLinks.each(function() {
        pagesToVisit.push(baseUrl + $(this).attr('href'));
    });
    console.log("Found " + relativeLinks.length + "relative links on page");
} 



