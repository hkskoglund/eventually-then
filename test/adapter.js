/* globals require: true, exports: true */
var Promise = require('../promise.js');

exports.resolved = function (value)
{
    
    var promise = new Promise();
    promise.fulfill(value);
    //console.log("ADAPTER RESOLVED",promise);
    return promise;
};

exports.rejected = function (reason)
{
    
    var promise = new Promise();
    promise.reject(reason);
   // console.log("ADAPTER REJECTED",promise);
    return promise;
    
};

exports.deferred = function ()
{
    
    var promise = new Promise();
    var o = {
        promise : promise,
        resolve : function (value) {
           // console.log("Resolve with value",value);
            promise.fulfill(value);
        },
        reject : function (reason) {
            promise.reject(reason);
        }
    };
    
  //  console.log("ADAPTER DEFERRED",o);
    return o;
};

