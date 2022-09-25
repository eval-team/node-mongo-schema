const express = require('express');

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /schama.
const recordRoutes = express.Router();

// This will help us connect to the database
const dbo = require('../db/conn');

// This section will help you get a list of all the records.
recordRoutes.route('/schema').get(async function (_req, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection('zips')
    .find({})
    .limit(50)
    .toArray(function (err, req, res, next) {
      if (err) {
        res.status(400).send('Error fetching listings!');
      } else {
        res.json(result);
      }
    });
});

module.exports = recordRoutes;