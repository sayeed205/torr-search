/**
 * this file handles the yts site
 */

const cheerio = require("cheerio");
const searchOptions = require("../helper/searchOptions");
const pageScraper = require("../helper/pageScraper");

/**
 * handles everything related to yts
 * @class Yts
 * @property {string} scrapeUrl the url which is being scrapped
 * @property {string} baseUrl the base url of the site
 * @property {string} searchUrl the search url of the site
 *
 * @function scrapeSearch scrapes the search results
 * @function scrapeTrending scrapes the trending torrents
 * @function getTorrentsUrls scrapes the torrent urls after running a search
 * @function getTorrentDetails scrapes the torrent details
 * @function makeTorrentsObject makes an object of the torrent details
 *
 * @example const yts = new Yts();
 *
 */
class Yts {
  constructor() {
    this.name = "Yts";
    this.baseUrl = "https://yts.mx";
    this.searchUrl = "https://yts.mx/browse-movies";
    this.searchOptions = searchOptions;
    this.scrapeUrl = "";
  }

  /**
   * takes a search url and an empty object then returns the object containing details of torrents
   * @param {String} url the url of the page to be scraped
   * @param {Object} obj the object to be filled with the details
   * @returns object with the details of the torrent
   */
  async getTorrentDetails(url, obj = {}) {
    let response = await fetch(url, this.fetchOptions);
    let html = await response.text();
    let $ = cheerio.load(html);
    try {
      let title = $("#movie-info h1").text().trim(); // title
      let year = $("#movie-info h2").eq(0).text().trim(); // year
      let genre = $("#movie-info h2").eq(1).text().split("/"); // genre
      genre = genre.join("/");
      let rating = $("[itemprop=ratingValue]").text().trim(); // rating
      let imdb = $('[title="IMDb Rating"]').attr("href"); // imdb
      let poster = $("#movie-poster img").attr("src").trim().split("/");
      poster[poster.length - 1] = "large-cover.jpg";
      poster = poster.join("/"); // poster

      let description = $("#synopsis p").eq(0).text().trim(); // description

      let runtime = $(".tech-spec-element").eq(6).text().trim(); // runtime

      let screenshots = [];
      $("#screenshots")
        .find("a")
        .map((i, el) => {
          screenshots.push($(el).attr("href"));
        }); // screenshots

      let torrents = [];
      $(".modal-torrent").each((i, el) => {
        let quality = $(el).find(".modal-quality").text().trim(); // quality
        let qualityType = $(el).find(".quality-size").eq(0).text().trim(); // quality type (BluRay, WEB, HDRip, ...)
        let size = $(el).find(".quality-size").eq(1).text().trim(); // size

        let torrentLink = $(el).find(".download-torrent").eq(0).attr("href"); // torrent link

        let magnetLink = $(el).find(".download-torrent").eq(1).attr("href"); // magnet link

        torrents.push({
          quality,
          type: qualityType,
          size,
          "torrent link": torrentLink,
          "magnet link": magnetLink,
        });
      });

      obj.title = title;
      obj.year = year;
      obj.genre = genre;
      obj.rating = rating;
      obj.imdb = imdb;
      obj.poster = poster;
      obj.description = description;
      obj.runtime = runtime;
      obj.screenshots = screenshots;
      obj.torrents = torrents;
      return obj;
    } catch (err) {
      console.log(err);
    }
  }

  /**
   *
   * @returns an array of objects containing the details of the trending torrents
   */
  async scrapeTrending() {
    let url = `${this.baseUrl}/trending-movies`;
    this.scrapeUrl = url;

    let html = await pageScraper(url);
    let torrentObjects = await this.makeTorrentObject(html);

    return torrentObjects;
  }

  /**
   * takes a html and returns an array of objects containing the details of the torrents
   */
  async makeTorrentObject(html) {
    let torrentUrls = await this.getTorrentUrls(html);
    let torrentDetails = [];
    for (let url of torrentUrls) {
      torrentDetails.push(await this.getTorrentDetails(url));
    }
    return torrentDetails;
  }

  /**
   * takes a html and returns an array of torrent urls
   */
  async getTorrentUrls(html) {
    let torrentUrls = [];
    let $ = cheerio.load(html);
    $(".browse-movie-wrap").each((i, el) => {
      torrentUrls.push($(el).find("a").attr("href"));
    });
    return torrentUrls;
  }

  /**
   * this function takes two arguments, the "query" to be searched and the "page" number
   * @param {String} query the search query
   * @param {Number} page the page number to scrape
   * @returns array of torrent objects with all the details
   *
   * @example yts.scrapeSearch("avengers", 1) // returns an array of torrent objects
   */
  async scrapeSearch(query, page = 1) {
    let url;
    if (page > 1) {
      url = `${this.searchUrl}/${query}/all/all/0/latest/0/all?page=${page}`;
    } else {
      url = `${this.searchUrl}/${query}/all/all/0/latest/0/all`;
    }
    this.scrapeUrl = url;
    let html = await pageScraper(url);
    let torrentObjects = await this.makeTorrentObject(html);

    return torrentObjects;
  }

  // TODO: add getTotalPage

  // TODO: add getTorrentCount
}

// const yts = new Yts();
// const url = "https://yts.mx/movies/avengers-age-of-ultron-2015";
// yts.scrapeSearch("of");
// let trend = yts.scrapeTrending().then((res) => console.log(res));

module.exports = Yts;
