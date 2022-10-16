/**
 * this file handles the 1337x site
 */

const cheerio = require("cheerio");
const searchOptions = require("../helper/searchOptions.js");
const pageScraper = require("../helper/pageScraper.js");

/**
 * takes a string and makes it capitalized
 * @param {string} s string
 * @returns {string} capitalized string
 * @example capitalize("hello") // "Hello"
 */
const capitalize = (s) => (s && s[0].toUpperCase() + s.slice(1)) || "";

/**
 * handles everything related to 1337x
 * @class X1337x
 * @property {string} scrapeUrl the url which is being scrapped
 * @property {string} baseUrl the base url of the site
 * @property {string} searchUrl the search url of the site
 *
 * @function getTotalPages gets the total number of pages after running a search
 * @function getTorrentCount gets the total number of torrents after running a search
 * @function scrapeSearch scrapes the search results
 * @function scrapeTrending scrapes the trending torrents
 * @function getTorrentsUrls scrapes the torrent urls after running a search
 * @function getTorrentDetails scrapes the torrent details
 * @function makeTorrentsObject makes an object of the torrent details
 *
 * @example const x1337x = new X1337x();
 *
 */
class X1337x {
  constructor() {
    this.name = "1337x";
    this.baseUrl = "https://1337x.to";
    this.searchUrl = this.baseUrl + "/search";
    this.categorySearchUrl = this.baseUrl + "/category-search";
    this.trendingUrl = this.baseUrl + "/trending";
    this.trendingWeekUrl = this.baseUrl + "/trending-week";
    this.searchOptions = searchOptions;
    this.scrapeUrl = "";
    this.categoryOptions = [
      "movies",
      "tv",
      "games",
      "apps",
      "music",
      "documentaries",
      "anime",
      "other",
      "xxx",
      "all",
    ];
  }

  /**
   * takes a search url and an empty object then returns the object containing details of torrents
   * @param {String} url the url of the page to be scraped
   * @param {Object} obj the object to be filled with the details
   * @returns object with the details of the torrent
   */
  async getTorrentDetails(url, obj = {}) {
    let name = url.trim().split("/");
    obj.title = name[name.length - 2].replace(/-/g, " ");

    let response = await fetch(url, this.searchOptions);
    let html = await response.text();
    let $ = cheerio.load(html);
    try {
      let informationSection = $(".list ").eq(1).html(); // information section 1
      informationSection += $(".list ").eq(2).html(); // information section 2
      // let information = {};
      $(informationSection).each((i, el) => {
        let key = $(el).find("strong").text();
        let value = $(el).find("span").text();
        if (key && value) {
          obj[key] = value;
        }
      });

      obj.url = url;
      obj.hash = $(".infohash-box p span").text(); // infohash
      let magnet = $(".clearfix ul li a").attr("href"); // magnet link
      obj.magnet = magnet;

      try {
        let poster = $(".torrent-image img").attr("src"); // poster
        if (poster.startsWith("//")) {
          poster = "https:" + poster;
        } else if (poster.startsWith("/")) {
          poster = this.baseUrl + poster;
        }
        obj.poster = poster;
      } catch (err) {
        obj.poster;
        // console.log(err);
      }

      let images = [];
      try {
        $(".descrimg").each((i, el) => {
          images.push($(el).attr("data-original").replace(".th", "")); // screenshots
        });
        if (images && images.length > 0) {
          obj.screenshots = images;
        }
      } catch (err) {
        obj.screenshots = images;
        // console.log(err);
      }
      // obj = JSON.stringify(obj);
      // console.log(obj);
      return obj;
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * this function takes two arguments, the "section" to be scraped and the "category" of the torrents
   * @param {String} section which section to scrape "daily" or "weekly"
   * @param {String} category the category to scrape "all" or "movies" or "tv" or "games" or "apps" or "music" or "documentaries" or "anime" or "other" or "xxx"
   * @returns array of torrent objects from the trending section
   *
   * @example x1337x.scrapeTrending("daily", "all") // returns an array of torrent objects
   */
  async scrapeTrending(section = "daily", category = "all") {
    let url;
    if (section === "weekly" && category === "all") {
      // trending week all
      url = this.trendingWeekUrl;
    } else if (section === "daily" && category === "all") {
      // trending daily all
      url = this.trendingUrl;
    } else if (
      section === "weekly" &&
      category !== "all" &&
      this.categoryOptions.includes(category)
    ) {
      // trending week category
      url = this.trendingUrl + "/w/" + category + "/";
    } else if (
      section === "daily" &&
      category !== "all" &&
      this.categoryOptions.includes(category)
    ) {
      // trending daily category
      url = this.trendingUrl + "/d/" + category + "/";
    } else if (section === "top-100" && category === "all") {
      // top 100 all
      url = this.baseUrl + "/top-100";
    } else if (section === "top-100" && category !== "all") {
      // top 100 category
      url = this.baseUrl + "/top-100" + "-" + category;
    } else {
      return torrentUrls; // TODO: throw proper error
    }

    this.scrapeUrl = url;
    let html = await pageScraper(url);
    let torrentObjects = await this.makeTorrentsObject(html);
    return torrentObjects;
  }

  /**
   * this function takes three arguments, the "query" to be searched, the "category" of the torrents and the "page" number
   * @param {String} query the search query
   * @param {String} category the category to search in
   * @param {Number} page the page number to scrape
   * @returns array of torrent objects with all the details
   *
   * @example x1337x.scrapeSearch("avengers", "movies", 1) // returns an array of torrent objects
   */
  async scrapeSearch(query, category = "all", page = 1) {
    let url;
    if (category === "all") {
      url = this.searchUrl + "/" + query + "/" + page + "/";
    } else if (category === "tv" || category === "xxx") {
      url =
        this.categorySearchUrl +
        "/" +
        query +
        "/" +
        category.toUpperCase() +
        "/" +
        page +
        "/";
    } else if (this.categoryOptions.includes(category)) {
      url =
        this.categorySearchUrl +
        "/" +
        query +
        "/" +
        capitalize(category) +
        "/" +
        page +
        "/";
    } else {
      return torrentUrls; // TODO: throw error
    }
    // console.log(url);
    this.scrapeUrl = url;
    let html = await pageScraper(url);
    let torrentObjects = await this.makeTorrentsObject(html);
    return torrentObjects;
  }

  /**
   * this function takes one argument, the html of the page to be scraped
   * @param {html} html the html to be scraped
   * @returns this function returns an array of torrent objects to be used to other functions
   *
   * @example makeTorrentsObject(html) // returns an array of torrent objects
   */
  async makeTorrentsObject(html) {
    let torrentUrls = await this.getTorrentsUrls(html);
    let torrentDetails = [];
    for (let i = 0; i < torrentUrls.length; i++) {
      let obj = {};
      await this.getTorrentDetails(torrentUrls[i], obj);
      torrentDetails.push(obj);
    }

    return torrentDetails;
  }

  /**
   * this function takes one argument, the html of torrent list page and return an array of torrent urls
   * @param {html} html the html of the torrent list page
   * @returns array of torrent urls
   *
   * @example getTorrentsUrls(html) // returns an array of torrent urls
   */
  async getTorrentsUrls(html) {
    let torrentUrls = [];
    let $ = cheerio.load(html);
    $("tbody tr").each((i, el) => {
      let url = $(el)
        .find("td a")
        .filter((i, el) => {
          return $(el).attr("href").includes("torrent");
        })
        .attr("href");
      if (url.startsWith("/")) {
        url = this.baseUrl + url;
        torrentUrls.push(url);
      }
    });

    return torrentUrls;
  }

  /**
   * this function takes one argument, any url of the torrent search result page and returns the total number of pages
   * @param {String} url url of any search result page
   * @returns the total number of pages in the search result
   *
   * @example getTotalPages(url) // 50
   */
  async getTotalPages(url) {
    let html = await pageScraper(url);
    let $ = cheerio.load(html);
    let pages = $(".last").find("a").attr("href").split("/");
    let totalPages = pages[pages.length - 2];
    return parseInt(totalPages);
  }

  /**
   * this function takes one argument, the url of the search result page and returns the total number of torrents in the search result
   * @param {String} url the url of the torrent search result page
   * @returns the total number of torrents in the search result
   *
   * @example getTotalTorrents(url) // 500
   */
  async getTorrentCount(url) {
    let pages = await this.getTotalPages(url);
    url = url.slice(0, -2);
    let total = 0;
    for (let i = 1; i <= pages; i++) {
      let html = await pageScraper(url + i + "/");
      let $ = cheerio.load(html);
      let torrents = $("tbody tr").length;
      total += torrents;
    }
    return total;
  }
}

// x1337x = new x1337x();

// x1337x.scrapeSearch("avengers", "movies");

// x1337x.scrapeTrending("weekly", "movies");
// x1337x.getTorrentDetails(
//   "https://1337x.to/torrent/5401117/Bullet-Train-2022-720p-WEBRip-800MB-x264-GalaxyRG/",
//   {}
// );

module.exports = X1337x;
