const express = require("express");

const treeRoutes = express.Router();

// This section will help you get a list of all the records.
treeRoutes.route("/tree").get(async function (_req, res) {
  res.json(mainTree);
});

module.exports = treeRoutes;
