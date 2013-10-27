function MockAPI()
{
}

MockAPI.prototype.resetSystem = function ()
{
    var p = new Promise();
    var fakeUSBdata = new Uint8Array([1,2,3]);
    
    setTimeout(function () {
        if (Date.now() % 2)
            eventuallyReset.fulfill("Notification");
        else
            eventuallyReset.reject("LIBUSB: transfer failed");
    },1000);
    
    return eventuallyReset;
};
//
//var mockApi =new MockAPI();
//var promise = mockApi.resetSystem()
//                    .then(function (value) { 
//                        console.log("Fulfillment callback with value",value); 
//                       // throw new Error('Something went wrong in fullfillment callback');
//                       // return 10;
//                        
//                        // Test : return promise
////                        var p = new Promise();
////                        p.then(function (value) { console.log("Promise inside fulfillment handler with value",value);
////                                                 return 88;
////                                                });
////                        p.fulfill(100);
////                        return p;
//                        
//                        // Test : return object
//                        var o = {
//                            a : 10 };
//                        
//                        // test: return function
//                        
//                        var f = {
//                            then : function _then (fulfill,reject)
//                            {
//                                console.log("Yippi then called",fulfill,reject);
//                                fulfill(1001);
//                            }
//                        };
//                        
//                        return f;
//                    },
//                          function (reason) { 
//                              console.log("Rejection callback with reason",reason); 
//                         //     throw new Error('Something went wrong i rejection callback');
//                         //     return -10;
//                                            })
//                .then(function (value) {
//                    console.log("Next fullfillment callback got",value);
//                    return 5;
//                })
//                .then (function (value) {
//                    console.log("Last fullfillment callback got",value);
//                    throw new Error('Not so easy');
//                    //return 1;
//                });
////console.log("Promise",promise);
////var promise = (new Promise()).then(undefined,undefined).then(undefined,undefined);
//setTimeout(function ()
//           {
//               console.log("Now promise",promise);
//           },2000);

//var p = new Promise();
//p.fulfill(1);
//p.then(function (value) {
//return { then : function (onFulfillment,onRejection) 
//        { onFulfillment(null);
//         }
//       };
//});


//p.then(function () { throw new Error('test'); }).then(function (value) { console.log("Chained then got",value); });
//p.then(function () { throw "Fail"; }).then(null, function (reason) { console.log("Chained then got ",reason); });
////p.then(function () { return 99; }).then(function (value) { console.log("Chained then got",value); });

//p.then(function () { return p; }).then(null, function (reason) { console.log("Reason is now",reason,reason instanceof TypeError); });


//p.then(function _promiseHandler (value) {
//            var p = new Promise();
//            setTimeout(function () {
//                console.log("Fulfilling promise",p);
//                p.fulfill("100");
//            },2050);
//            
//            return p;
//        }).then(function _fullfilmentHandler(value) { console.log("Got from inner promise ",value); });
//
//console.log("p.chainedPromise",p.chainedPromise);
//
//var p = new Promise();
//p.fulfill("Fulfill");
//var finalresult = p.then();
////p.fulfill("Testing");
//////var finalresult = p.then().then(function (v) { console.log("Next then got",v); }).then(function (value) { console.log("Got value",value); });
////var finalresult = p.then();
////p.then(function (v) { console.log("v",v); });
//////var nextResult = p.then();
//////var nextResult = p.then(undefined,function (reason) {console.log("Got reason",reason); });
//////.then().then(undefined,function (reason) { console.log("Finaly got",reason); });
////console.log("Immediate result",finalresult);
//setTimeout(function () { 
//    console.log("Final result",finalresult);
//},2000);
//
//var p = new Promise();
//p.fulfill("Testing testing testing");
//p.then(function (value)
//       {
//           var nextP = new Promise();
//           setTimeout(function () {
//               nextP.reject("NEXTP");
//           },1000);
//           return nextP;
//       });

var p = new Promise();
p.then();
//p.then(undefined,function (r) { console.log("Rejected:"+r); throw new Error("Test error"); });
//p.then(undefined,function (r2) { console.log("Last chained",r2);  return { "test" : 10 };});
