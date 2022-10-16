/**
 * this file contains all the routes related to trending torrents
 */

const express = require("express");
const router = express.Router();
const { getTorrents } = require("../controller/trendingController");

router.get("/:site/:section?/:category?", getTorrents);

module.exports = router;
