function MongoCacheCollection(db, cacheDirectory) {
    var crypto = require("crypto");
    var fs = require("fs");
    MongoCacheCollection = MCC = this;


    this.cachedCollection = function (collectionName) {
        var collection = db.collection(collectionName);
        collection.findCached = function (cacheTime, oQuery, callback) {

            return {
                toArray: function (callback) {
                    MCC.cacheOperations.isCached(cacheTime, "find", collectionName, oQuery, function (err, isCached) {
                        if (isCached) {
                            MCC.cacheOperations.getCachedContent("find", collectionName, oQuery, function (err, items) {
                                if (typeof callback === "function") {
                                    console.log("cached callback");
                                    callback(err, items);
                                }
                            });

                        } else {
                            collection.find(oQuery).toArray(function (err, items) {
                                MCC.cacheOperations.setCacheFile("find", collectionName, oQuery, items);
                                if (typeof callback === "function") {
                                    console.log("live callback");
                                    callback(err, items);
                                }
                            });
                        }

                    });
                }
            };

        };
        return collection;
    };


    this.cacheOperations = {
        isCached: function (cacheTime, queryType, collectionName, oQuery, callback) {
            fs.lstat(this.getCacheFileUrl(queryType, collectionName, oQuery), function (err, stats) {
                var isCached = false;
                if (!err && stats) {
                    var modifiedTime = new Date(stats["mtime"]);
                    var unixDifference = (new Date().getTime() - modifiedTime.getTime());
                    var minutesDifference = (unixDifference / 1000) / 60;

                    if (minutesDifference < cacheTime) {
                        isCached = true;
                    } else {
                        isCached = false;
                    }
                }
                if (typeof callback === "function") {
                    callback(err, isCached);
                }
            });
        }
        , setCacheFolder: function (path) {
            path = path.split("/");
            path = path.slice(1, (path.length - 1));

            for (var i = 0; i < path.length; i++) {
                var thisPath = "";
                for (var j = 0; j <= i; j++) {
                    thisPath += path[j] + "/";
                }
                if (!fs.existsSync(thisPath)) {
                    fs.mkdirSync(thisPath);
                }

            }

        }
        , setCacheFile: function (queryType, collectionName, oQuery, oData) {
            var fileName = this.getCacheFileUrl(queryType, collectionName, oQuery);
            this.setCacheFolder(fileName);
            fs.writeFile(fileName, JSON.stringify(oData));
        }

        , getCacheFileUrl: function (queryType, collectionName, oQuery) {
            return cacheDirectory + "/" + collectionName + "/" + queryType + "/" + this.objectToFilename(oQuery) + ".json";
        }
        , getCachedContent: function (queryType, collectionName, oQuery, callback) {
            fs.readFile(this.getCacheFileUrl(queryType, collectionName, oQuery), function (err, items) {
                callback(err, JSON.parse(items));
            });
        }
        , objectToFilename: function (oQuery) {
            return crypto.createHash("md5").update(JSON.stringify(oQuery)).digest("hex");
        }
    };

    return this;
}

exports = module.exports = MongoCacheCollection;