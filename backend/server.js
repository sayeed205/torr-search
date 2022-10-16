/**
 * main function
 */

const Express = require("express");
require("dotenv").config();

const searchRoute = require("./routes/searchRoute");
const trendingRoute = require("./routes/trendingRouter");

port = 3000 || process.env.PORT;

const app = Express();

app.use(Express.json());

app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

app.use("/api/search", searchRoute);
app.use("/api/trending", trendingRoute);
// TODO: add /api/recent route

app.listen(port, () => {
  console.log(`Server running on port ${port}\nOpen http://localhost:${port}`);
});
