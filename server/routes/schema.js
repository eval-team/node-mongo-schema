const express = require("express");

// schemaRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /schema.
const schemaRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");
// This section will help you get a list of all the records.
schemaRoutes.route("/schema").get(async function (_req, res) {
  const dbConnect = dbo.getDb();

  dbConnect.collection("zips").findOne({}, function (err, result) {
    if (err) {
      // res.status(400).send("Error fetching listings!");
    } else {
      let printResult = printSchema(result, 1);
      //   res.writeHeader(200, { "Content-Type": "text/html" });
      //   res.write(printResult);
      //   res.end();
      res.json(printResult);
    }
  });
});

let result = [];
let currentIterationLevel = 1;
function printSchema(obj, level) {
  
  
  for (var key in obj) {
    if (typeof obj[key] != "function") {
      //we don't want to print functions
      var specificDataTypes = [Date, Array]; //specify the specific data types you want to check
      var type = "";
      for (var i in specificDataTypes) {
        // looping over [Date,Array]
        if (obj[key] instanceof specificDataTypes[i]) {
          //if the current property is instance of the DataType
          type = "==is_" + specificDataTypes[i].name + "=="; //get its name
          break;
        }
      }
      let currentObj = {};
      currentObj.key = key;
      currentObj.typeof = typeof obj[key];
      currentObj.type = type
      currentObj.level = level
      if(currentIterationLevel < level){
        result[result.length-1].child = currentObj
      }
      currentIterationLevel = level;

      result.push(currentObj);
      
    //   result += `${level} ${key}`;

      //print(level, key, typeof obj[key], type); //print to console (e.g roles object is_Array)
      if (typeof obj[key] == "object") {
        //if current property is of object type, print its sub properties too
        printSchema(obj[key], level + 1);
      }
    }
  }
  return result;
}
module.exports = schemaRoutes;
