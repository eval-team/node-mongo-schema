const express = require("express");
const treeRoutes = express.Router();
// import { Tree } from "./datastructure/tree";
// const Tree = require('./datastructure/tree');
var Tree = require("./datastructure/tree");

// This section will help you get a list of all the records.
treeRoutes.route("/tree").get(async function (_req, res) {
  const tree = new Tree(1, "AB");
  tree.insert(1, 11, "AC");
  tree.insert(1, 12, "BC");
  tree.insert(1, 13, "CB");
  tree.insert(12, 121, "BG");

  res.json({
    data: tree.data()
  });
});

module.exports = treeRoutes;
