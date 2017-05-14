var request = require('request');
var cheerio = require('cheerio');
var URL =     require('url-parse');

var START_URL = "http://www.nationalrail.com";
var SEARCH_WORD = "rail";
var MAX_PAGES_TO_VISIT = 10;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var pagesToVisitA = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
pagesToVisitA.push(START_URL);
crawl();

function crawl() {
    if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
        console.log("Max number of pages visited");
        return;
    }

    var nextPage = pagesToVisit.pop();
    var nextPageA = pagesToVisitA.pop();
    if ((nextPage in pagesVisited) || (nextPageA in pagesVisited)) {
        // page has already been crawled
        crawl();
    } else {
        // new page not crawled yet
        visitPage(nextPage, crawl);
    }
}

// allow scraper to grab search words and collect internal links
function visitPage(url, callback) {
    // add page to our set of pages visited
    pagesVisited[url] = true;
    numPagesVisited++;

// Make the request
  console.log("Visiting page " + url);
  request(url, function(error, response, body) {
     // Check status code (200 is HTTP OK)
     console.log("Status code: " + response.statusCode);
    //  console.log(response);
     if(response.statusCode !== 200) {
       callback();
       return;
     }
     // Parse the document body
     var $ = cheerio.load(body);
     var isWordFound = searchForWord($, SEARCH_WORD);
     if(isWordFound) {
       console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
        collectInternalLinks($);
       // In this short program, our callback is just calling crawl()
       callback();
     } else {
         console.log('word not found'); 
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
    console.log("Found " + relativeLinks.length + " relative links on page");

    var absoluteLinks = $("a[href^='http://www.nationalrail.com']");
    absoluteLinks.each(function() {
        pagesToVisitA.push(baseUrl + $(this).attr('href'));
    });
    console.log("Found " + absoluteLinks.length + " absolute links on page");
} 



