/**
 * this function will scrape the page and return the html data as text
 */

const searchOptions = require("./searchOptions.js");

/**
 * this function will scrape the page and return the html data as text
 * @param {String} url the url to scrape of the torrent list paeg
 * @returns html data as text
 */
async function pageScraper(url) {
  let response = await fetch(url, searchOptions);
  let res = await response.text();
  return res;
}

module.exports = pageScraper;
