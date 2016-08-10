var MongoCache = require("./index");
MongoCache.setCacheDirectory(__dirname + "/-cache");

MongoCache.connect("mongodb://localhost:27017/jobjobjob", function (err, db) {
    if (err) {
        throw err;
    }

    var oJobs = db.collection("jobs");
    oJobs.find({}).toArray(function(err, items){
        console.log(items.length);
    });

    var oCJobs = db.cachedCollection("jobs");
    oCJobs.findCached(60, {}).toArray(function(err, items){
        console.log(items.length);
    });
  
});