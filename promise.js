/* globals console: true, setTimeout: true, Uint8Array: true  */
'use strict';

// Based on http://promisesaplus.com/#notes

// "A promise represents the eventual result of an asynchronous operation"

// Then-method registers callback for
//  FULFILLMENT(value) : 1. the promise's eventual value
//  REJECTION(reason) : 2. the reason why the promise cannot be fulfilled

function Promise()
{
  this.state = Promise.prototype.STATE.PENDING;

  // Any legal Javascript value 
  this.value = undefined;
  
  // Why promise was rejected
  this.reason = undefined;
    
 // Allow for multiple .then calls
 
    this.onFulfilled = [];
    
    this.onRejected = [];
    
  // A promise only as a single chained promise
    //this.promise2 = undefined;
    
    // Used when a fulfillment/rejection-handler returns a .then function
    
     this._resolvePromiseCalled = false;
    
     this._rejectPromiseCalled = false;
}

Promise.prototype.STATE = {
    PENDING : 'pending',
    REJECTED : 'rejected',
    FULFILLED : 'fulfilled'
};

Promise.prototype.toString = function ()
{
    return "Promise is "+ this.state+' #onFulfilled '+this.onFulfilled.length+' #onRejected '+this.onRejected.length;
};

// "To ensure that onFulfilled and onRejected execute asynchronously,...with a fresh stack"
// This function is called  via setTimeout
// Aim: to gather result from callbacks or handle exceptions 
Promise.prototype._runInSequence = function ()
{
   
    var  handlerResult,
         handlerThrowed,
         handler,
        handlers,
        result;
    
        // Loop callbacks in the order of "their originating calls to then"
        
     // console.log(this.toString());
    
      if (this.state === Promise.prototype.STATE.FULFILLED) {
          handlers = this.onFulfilled;
          result = this.value;
      }
      else if (this.state === Promise.prototype.STATE.REJECTED) {
          handlers = this.onRejected;
          result = this.reason;
      }
    
        for (var handlerNr=0, len = handlers.length; handlerNr < len; handlerNr++) {
         
            handler = handlers.shift();
             
                
              
                if (typeof handler === 'function') {
                       handlerResult = undefined; // Assume no result
                       handlerThrowed = false;
                   // console.log("Handlernr",handlerNr,"Handler=",handler,"Argument = ",result);
                   
                       try {
                           handlerResult = handler(result);
                       //    console.log("Handler result",handlerResult,this);
                         
                       } catch (e)
                       {
                           handlerThrowed = true;
                          
                           this.promise2.reject(e);
                           
                          
                       }
                    
                      if (handlerResult === undefined)
                      {
                          if (this.state === Promise.prototype.STATE.REJECTED)
                          {
                             this.promise2.reject(this.reason);
                          } else if (this.state === Promise.prototype.STATE.FULFILLED)
                          {
                              this.promise2.fulfill(this.value);
                          }
                      }
                    
                        // Now, take care of result from handler
                       
                        if (handlerResult !== undefined && !handlerThrowed) {
                          
                           this._resolution(this.promise2,handlerResult);   
                        }
                       
                   } else
                   {
                       
                       if (this.state === Promise.prototype.STATE.FULFILLED)
                           this.promise2.fulfill(result);
                       else if (this.state === Promise.prototype.STATE.REJECTED)
                           this.promise2.reject(result);
                       
                      // console.log("Promise2:",this.promise2.toString());
                   }
                
            }
            
           
};



Promise.prototype.then = function (onFulfilled, onRejected)
{
  //console.log("THEN",typeof this.chainedPromise);
       
    this.promise2 = new Promise();
    
    this.onFulfilled.push(onFulfilled);
   
    this.onRejected.push(onRejected);
   
    // Schedule sequential run of handlers if present state is not pending (already fullfilled/rejected)
    if (this.state !== Promise.prototype.STATE.PENDING) {
       // console.log("THEN: Scheduling immediate run of callbacks");
        setTimeout(this._runInSequence.bind(this),0);
    }
    
    return this.promise2;
    
};

Promise.prototype.fulfill = function (value)
{ 
        
  
    if (this.state !== Promise.prototype.STATE.PENDING) {
     
//        console.trace();
        //console.log("Promise is not pending " +this.state+" cannot fulfill it.");
       return;
    }

    // Make state and value read-only -> immutable
    
    Object.defineProperty(this,'state',{
                          value : Promise.prototype.STATE.FULFILLED,
                          writable : false });
    
    Object.defineProperty(this,'value',{ value : value,
                                        writable : false});

    // console.log("Inside fulfill",this.toString());
    // Call onFullfilled-handler
    if (this.onFulfilled.length > 0) {
      // console.log("Fulfilled, running sequence");
        setTimeout(this._runInSequence.bind(this),0);
    }
//     else
//        console.log("No onFullfilled callbacks registered with .then, will only 'fire' when .then is called");
   
    
};

Promise.prototype.reject = function (reason)
{
  
    if (this.state !== Promise.prototype.STATE.PENDING)
    {
//       console.log("Promise is not pending " +this.state+" cannot reject it.");
       return;
    }
    
     Object.defineProperty(this,'state',{
                          value : Promise.prototype.STATE.REJECTED,
                          writable : false });
    
    Object.defineProperty(this,'reason',{ value : reason,
                                        writable : false});
    

    // Fire onRejected-handlers
    if (this.onRejected.length > 0)
     setTimeout(this._runInSequence.bind(this),0,this.onRejected,this.reason);
//    else
//        console.log("No onRejected callbacks specified with .then, will only 'fire' when .then is called");
    
 
};



Promise.prototype._resolution = function (promise,x)
{
    
    var then,  
        xIsFunc = (typeof x === 'function'),
        
        resolvePromise = function (y)
                    {
                        if (this.resolvePromiseCalled)
                            console.log("Resolvepromise already called, ignoring");
                        else {
                          this.resolvePromiseCalled = true;
                            this._resolution(this,y);
                        }
                        
                    },
                        
         rejectPromise = function (r)
                    {
                        if (this.rejectPromiseCalled)
                            console.log("rejectpromisecalled");
                        else {
                            this.rejectPromiseCalled = true;
                           this.reject(r);
                        }
                           
                    };
      
       
    // Promise and x refer to same object
    
    if (promise === x)
    {
       // console.log("Chained promise is the same as result from handler!!!!!!!!!!!!!!!!!!");
       promise.reject(new TypeError('Chained promise and result of onFulfilled/onRejected refer to same object'));
    }
    
    else if (x instanceof Promise)
    {
//        if (x.state === Promise.prototype.STATE.PENDING)
//            return;
        
      //  console.log("!!!!!!!!!! x is a promise",x.toString());
//        
        // Adopt state
        x.then(function (value)
               {
                   //console.log("HELLO",value,this);
                  // console.log("pre-state:",this.state,this.value);
                   this.fulfill(value);
                 //  console.log("post-state:",this.state,this.value);
               }.bind(promise),
            
              function (reason)
        {
            
                // console.log("pre-state:",this.state,this.reason);
                   this.reject(reason);
                //   console.log("post-state:",this.state,this.reason);
               }.bind(promise)
               );
    


        
    } 
    
    /////////////////////
    else if ((typeof x === 'object' || xIsFunc) && x!==null) 
   
    {
        // console.log("TRYING to access .then",x);
        try {
          then = x.then;
         
           
            if (typeof then === 'function')
            {
             //   console.log("then=x.then=",then);
                
                try {
                    
                  then.call(x,resolvePromise.bind(promise),rejectPromise.bind(promise));
                       
                } catch (e)
                {
                   // console.log("CATCHED, accessing .then",promise);
                  if (!promise.resolvePromiseCalled && !promise.rejectPromiseCalled)
                        promise.reject(e);
                }
           }
            else // Object
            {
               // console.log("result was an object, fullfilling chained promise with",x,promise);
                
                promise.fulfill(x);
                //console.log("post",promise);
            }
            
        } catch (e)
        {
           // console.log("Catched error accessing .then",e);
            promise.reject(e);
        }
    }
    
    else if (!xIsFunc)
    
    {
     //console.log("Result was not an object (maybe null) or a function",x);
     
        
        promise.fulfill(x);
    }
};

//function MockAPI()
//{
//}
//
//MockAPI.prototype.resetSystem = function ()
//{
//    var eventuallyReset = new Promise();
//    var fakeUSBdata = new Uint8Array([1,2,3]);
//    
//    setTimeout(function () {
//        if (Date.now() % 2)
//            eventuallyReset.fulfill("Notification");
//        else
//            eventuallyReset.reject("LIBUSB: transfer failed");
//    },1000);
//    
//    return eventuallyReset;
//};
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


//p.then(function () { return 10; }).then(function (value) { console.log("Chained then got",value); });
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




module.exports = Promise;
