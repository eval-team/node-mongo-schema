const express = require("express");
var Tree = require("./datastructure/tree");
// schemaRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /schema.
const schemaRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");
// This section will help you get a list of all the records.
let flatNodeArray = [];
let prevNode = null;
const tree = new Tree('1', "root");
let result = [];
schemaRoutes.route("/schema/:tablename").get(async function (req, res) {
  tree.children = []
  result = [];
  const dbConnect = dbo.getDb();
  const coll = dbConnect.collection(req.params.tablename);
  const index = await coll.indexes();
  let indexObj={};

  const getIndexNameAndFiled=(value)=>{
    value=value.replaceAll("{}","");
    value=value.replaceAll("[]","");
    
    for (let i = 0; i < index.length; i++) {
      if(index[i].key[value]){
        indexObj.indexId=value;
        indexObj.name=index[i].name;
      }else{
        indexObj={}
      }
      console.log(indexObj);

    }

  //  let kk= index.filter((x)=>{
  //     if(x.key[value]){

  //         return indexObj
  //     }else{
  //       return indexObj={}
  //     }
  //   });
  //   console.log(kk);
    return 
  }



  dbConnect.collection(req.params.tablename).findOne({}, function (err, result) {
    if (err) {
      // res.status(400).send("Error fetching listings!");
    } else {
      let printResult = printSchema(result, 1, '1');
      // res.json(tree.data());
      // res.json(printResult);


      /// Json Representation
      let treeData = tree.data();
      flatNode(treeData);
      // res.json(flatNodeArray)

      flatNodeArray = uniqBy(flatNodeArray, JSON.stringify);

      /// Table representation
      let table = ""
      table += "<table cellpadding='5' cellspacing='0' border='1'>"
      table += "<tr>";
      table += "  <th>";
      table += "      Attribute";
      table += "  </th>";
      table += "  <th>";
      table += "      Data Type";
      table += "  </th>";
      table += "  <th>";
      table += "      Value Domain or Format";
      table += "  </th>";
      table += "  <th>";
      table += "      Encryption";
      table += "  </th>";
      table += "  <th>";
      table += "      Comments";
      table += "  </th>";
      table += "  <th>";
      table += "      Index Name";
      table += "  </th>";
      table += "  <th>";
      table += "      Index Fields";
      table += "  </th>";
      table += "  <th>";
      table += "      Partial Expression";
      table += "  </th>";
      table += "  <th>";
      table += "      Other (TTL, etc)";
      table += "  </th>";
      table += "</tr>";
      flatNodeArray.forEach(node =>{
        table += "<tr>";
        table += "  <td>";
        table += `      ${node.attribute}`;
        table += "  </th>";
        table += "  <td>";
        table += `      ${node.dataType}`;
        table += "  </th>";
        table += "  <td>";
        table += `     `;
        table += "  </th>";
        table += "  <td>";
        table += `     `;
        table += "  </th>";
        table += "  <td>";
        table += `     `;
        table += "  </th>";
        table += "  <td>";
        table += `     ${getIndexNameAndFiled(node.attribute)?.name??""}`;
        table += "  </th>";
        table += "  <td>";
        table += `     ${getIndexNameAndFiled(node.attribute)?.indexId??""}`;
        table += "  </th>";
        table += "  <td>";
        table += `     `;
        table += "  </th>";
        table += "  <td>";
        table += `     `;
        table += "  </th>";
        table += "</tr>";
      })
      table += "</table>";
      res.writeHeader(200, { "Content-Type": "text/html" });
      res.write(table);
      res.end();
    }
  });
});


let currentIterationLevel = 1;

function printSchema(obj, level, parent) {
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
      switch (typeof obj[key]) {
        case "object":
          currentObj.attribute = `${key}{}`;
          break;

        default:
          currentObj.attribute = key;
          break;
      }
      currentObj.dataType = typeof obj[key];
      currentObj.type = type
      currentObj.level = level
      tree.insert(parent, `${level}-${key}`, currentObj);
      currentIterationLevel = level;

      result.push(currentObj);

      //   result += `${level} ${key}`;

      //print(level, key, typeof obj[key], type); //print to console (e.g roles object is_Array)
      if (typeof obj[key] == "object") {
        //if current property is of object type, print its sub properties too
        printSchema(obj[key], level + 1, `${level}-${key}`);
      }
    }
  }
  return result;
}



function flatNode(node) {
  for (let child of node) {
    if (child.name != 'root') {
      let attribute = child.name.attribute;
      if (attribute == "_id{}") {
        child.children = []
      }
      for (let i = 1; i < child.name.level; i++) {
        attribute = `${prevNode.name.attribute}.${attribute}`
      }
      let nodeObj = {
        attribute: attribute,
        dataType: child.name.dataType,
      }
      flatNodeArray.push(nodeObj)
    }

    if (child.children && Array.isArray(child.children) && child.children.length > 0) {
      prevNode = child
      flatNode(child.children)
    }
  }
};

function uniqBy(a, key) {
  var seen = {};
  return a.filter(function(item) {
      var k = key(item);
      return seen.hasOwnProperty(k) ? false : (seen[k] = true);
  })
}
module.exports = schemaRoutes;
