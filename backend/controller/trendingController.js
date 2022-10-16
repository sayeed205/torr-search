/**
 * this file contains paths and routes to handle the trending torrents
 */

const X1337x = require("../torrents/X1337x.js");

const x1337x = new X1337x();
let scrappedUrl, torrents;

/**
 * this function handles 1337x site and returns the torrents , scrappedUrl as an object
 * @param {String} section section to search // "daily" or "weekly" {default: "daily"}
 * @param {String} category category to search // "all" or "movies" or "tv" .....etc {default: "all"}
 * @returns the torrents, scrapped url from 1337x
 */
const handle1337x = async (section, category) => {
  torrents = await x1337x.scrapeTrending(section, category);
  scrappedUrl = x1337x.scrapeUrl;
  return { torrents, scrappedUrl };
};

/**
 * this function checks which site to scrape from and return all the needed data
 * @param {String} site the site to search from // "1337x" "yts" "rarbg" "limetorrents"
 * @param {String} section section to search // "daily" or "weekly" {default: "daily"}
 * @param {String} category category to search // "all" or "movies" or "tv" .....etc {default: "all"}
 * @returns same data as handle1337x function but for the site you choose
 */
const handleSite = async (site, section, category) => {
  switch (site) {
    case "1337x":
      return handle1337x(section, category);
    case "yts": // TODO: add yts
      return yts;
    case "rarbg": // TODO: add rarbg
      return rarbg;
    case "limetorrents": // TODO: add limetorrents
      return limetorrents;
    default:
      scrappedUrl = x1337x.scrapeUrl;
      torrents = await x1337x.scrapeSearch(query, category, page);
      return { torrents, scrappedUrl };
  }
};

/**
 * this function is a controller for the trending route
 * @param {object} req request object
 * @param {object} res response object
 * @example getTrending(req, res) // req.params = {site: "1337x", section: "daily", category: "all"}
 */
const getTorrents = async (req, res) => {
  let result = {};

  let { site, section, category } = req.params;
  section ? (section = section.toLowerCase()) : (section = "daily");
  category ? (category = category.toLowerCase()) : (category = "all");
  site = site.toLowerCase();

  try {
    const { torrents, scrappedUrl } = await handleSite(site, section, category);

    result.data = torrents;
    result.status = "success";
    result["showing result"] = torrents.length;
    result["total torrents"] = torrents.length;
    result["section"] = section;
    result["category"] = category;
    result["scrapped url"] = scrappedUrl;

    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ err: err.message });
    console.log(err);
  }
};

module.exports = { getTorrents };
