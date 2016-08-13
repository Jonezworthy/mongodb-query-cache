# mongodb-query-cache
MongDB caching library

#How to
Connect to your Database through MongoCache



```
var MongoCache = require("./index");
MongoCache.setCacheDirectory(__dirname + "/-cache");

MongoCache.connect("mongodb://localhost:27017/db", function (err, db) {
    if (err) {
        throw err;
    }
    //Normal query
    var oJobs = db.collection("jobs");
    oJobs.find({}).toArray(function(err, items){
        console.log(items.length);
    });
    
    //Cached query
    var cacheTime = 60;//60 minutes
    var oCJobs = db.cachedCollection("jobs");
    oCJobs.findCached(cacheTime, {}).toArray(function(err, items){
        console.log(items.length);
    });
  
});
```