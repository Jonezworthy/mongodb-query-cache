function mongodbCache() {
    
    var MongoClient = require("mongodb").MongoClient;
    
    this.setCacheDirectory = function(cacheDirectory){
      this.cacheDirectory = cacheDirectory;  
    };
    
    //Connect being a copy of mongoclient's connect, but with our hooks
    this.connect = function (mongoResource, callback) {
        MongoClient.connect(mongoResource, function (err, db) {
            var MongoCacheCollection = require("./cache")(db, this.cacheDirectory);

            db.cachedCollection = MongoCacheCollection.cachedCollection;

            if (typeof callback === "function") {
                callback(err, db);
            }

        });
    };
    return this;
}

exports = module.exports = mongodbCache();