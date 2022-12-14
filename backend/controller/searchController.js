/**
 * this file is a controller for the search route
 */

const X1337x = require("../torrents/X1337x.js");
const Yts = require("../torrents/Yts.js");

const x1337x = new X1337x();
const yts = new Yts();
let scrappedUrl, totalPages, totalTorrents, torrents;

/**
 * this function handles 1337x site and returns the torrents , scrappedUrl, totalPages, totalTorrents
 * @param {String} query query to search // "the flash"
 * @param {String} category category to search // "all" or "movies" or "tv" .....etc
 * @param {Number} page page number to search // 1
 * @returns an object containing torrent data, scrapped url, total pages, total torrents
 *
 * @example handle1337x("the flash", "all", 1)
 */
const handle1337x = async (query, category, page) => {
  torrents = await x1337x.scrapeSearch(query, category, page);
  scrappedUrl = x1337x.scrapeUrl;
  totalPages = await x1337x.getTotalPages(scrappedUrl);
  totalTorrents = await x1337x.getTorrentCount(scrappedUrl);
  return { torrents, scrappedUrl, totalPages, totalTorrents };
};

const handleYts = async (query, page) => {
  torrents = await yts.scrapeSearch(query, page);
  scrappedUrl = yts.scrapeUrl;
  totalPages = "unknown"; // TODO: add total pages for yts
  totalTorrents = "unknown"; // TODO: add total torrents for yts
  return { torrents, scrappedUrl, totalPages, totalTorrents };
};

/**
 * this function checks which site to scrape from and return all the needed data
 * @param {String} site the site to search from // "1337x" "yts" "rarbg" "limetorrents"
 * @param {String} query query to search // "the flash"
 * @param {String} category category to search // "all" or "movies" or "tv" .....etc
 * @param {Number} page page number to search // 1
 * @returns all the same data as handle1337x function but for the site you choose
 */
const handleSite = async (site, query, category, page) => {
  switch (site) {
    case "1337x":
      return handle1337x(query, category, page);
    case "yts":
      return handleYts(query, page);
    case "rarbg": // TODO: add rarbg
      return rarbg;
    case "limetorrents": // TODO: add limetorrents
      return limetorrents;
    default:
      return {
        torrents: "Error: Site not found",
        scrappedUrl: "",
        totalPages: 0,
        totalTorrents: 0,
      };
  }
};

/**
 * this function is a controller for the search route
 * @param {object} req request object
 * @param {object} res response object
 *
 * @example getTorrents(req, res) // req.params = {site: "1337x", query: "the flash", category: "all", page: 1}
 */
const getTorrents = async (req, res) => {
  let result = {};
  let { site, query, category, page } = req.params;
  category ? (category = category.toLowerCase()) : (category = "all");
  page ? (page = parseInt(page)) : (page = 1);
  site = site.toLowerCase();
  try {
    const { torrents, scrappedUrl, totalPages, totalTorrents } =
      await handleSite(site, query, category, page);

    result.data = torrents;
    site === "yts" && (result.note = "yts only has movies category");
    if (page > 1 && torrents.length === 0) {
      result.status = "error";
      result.error = "only 1 page available";
    } else {
      result.status = "success";
    }
    result["current page"] = page;
    result["total pages"] = totalPages;
    result["showing result"] = torrents.length;
    result["total torrents"] = totalTorrents;
    result["scrapped url"] = scrappedUrl;

    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(404).json({ err: err.message });
  }
};

module.exports = { getTorrents };
