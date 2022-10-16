/**
 * this file contains the routes for the search page
 */

const express = require("express");
const router = express.Router();
const { getTorrents } = require("../controller/searchController");

router.get("/:site/:query/:category?/:page?", getTorrents);

module.exports = router;
