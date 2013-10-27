/* globals define:true, setTimeout: true, Uint8Array: true  */

//define(function (require, exports, module) {
'use strict';

// Based on http://promisesaplus.com/#notes

// "A promise represents the eventual result of an asynchronous operation"

function Promise()
{
  this.state = Promise.prototype.STATE.PENDING;

  // Any legal Javascript value 
  this.value = undefined;
  
  // Why promise was rejected
  this.reason = undefined;
    
 // Allow for multiple .then calls to store callbacks to run on transition from pending to either fullfilment or rejection
 
    this.onFulfilled = [];
    
    this.onRejected = [];

    this.chainedPromise = [];
   // this.chainedPromise = undefined;
 
}

Promise.prototype.STATE = {
    PENDING : 'pending',
    REJECTED : 'rejected',
    FULFILLED : 'fulfilled'
};

Promise.prototype.toString = function ()
{
    var msg = this.state.toString();
    
    if (this.state === Promise.prototype.STATE.FULFILLED)
        msg += ' value: '+JSON.stringify(this.value);
    
    else if (this.state === Promise.prototype.STATE.REJECTED)
        msg += ' reason: '+this.reason;
    
    msg += ' onFulfilled# '+this.onFulfilled.length+' onRejected# '+this.onRejected.length;
    
    return msg;
};

// "To ensure that onFulfilled and onRejected execute asynchronously,...with a fresh stack"
// This function is called  via setTimeout
// Aim: to gather result from callbacks or handle exceptions 
Promise.prototype._executeHandlers = function (handlers,result)
{
    var  handlerResult,
         handler,
         chainedPromise,
        showChainedPromiseState = function (promise)
    {
//        if (promise)
//        console.log("Chained state : "+promise.toString());
    };
    
        // Loop callbacks in the order of "their originating calls to then"
        
    // console.log("Running callbacks for promise : ",this.toString());
    
       // Seems quite similar to event listening, everybody get the value if promise is fullfilled

        for (var handlerNr=0, len = handlers.length; handlerNr < len; handlerNr++) {

        showChainedPromiseState(chainedPromise);
            
            handler = handlers.shift();
            chainedPromise = this.chainedPromise.shift();
                
                if (typeof handler === 'function') {
                       handlerResult = undefined; // Assume no result
                     
                  //console.log("Handler#",handlerNr,"Handler=",handler,"Argument= ",result,"chainedPromise",chainedPromise.toString());
                   
                       try {
                           
                           handlerResult = handler(result);
                        //  console.log("Handler result",handlerResult);
                      
                         
                       } catch (e)
                       {
                           
                           //console.log("Handler throwed ",e,chainedPromise);
                          
                           chainedPromise.reject(e);
                           
                           continue;
                          
                       }
                     
                     _resolution(chainedPromise,handlerResult);   
                  
                       
                   } else // Handler was not a function, propagate result to chained promise
                   {
                      
                       if (this.state === Promise.prototype.STATE.FULFILLED)
                           chainedPromise.fulfill(result);
                       else if (this.state === Promise.prototype.STATE.REJECTED)
                           chainedPromise.reject(result);
                       
                      // console.log("chainedPromise:",this.chainedPromise.toString());
                   }
                
            }
    
           showChainedPromiseState(chainedPromise);
           
};

    
// Then-method registers callback for
//  FULFILLMENT(value) : 1. the promise's eventual value
//  REJECTION(reason) : 2. the reason why the promise cannot be fulfilled

Promise.prototype.then = function (onFulfilled, onRejected)
{
  //console.log("THEN",typeof this.chainedPromise);
       
    var chainedPromise = new Promise();
    
    this.chainedPromise.push(chainedPromise);
    //this.chainedPromise = chainedPromise;
    
    this.onFulfilled.push(onFulfilled);
     this.onRejected.push(onRejected);
   
    // Schedule sequential run of handlers if present state is not pending (already fullfilled/rejected)
    if (this.state === Promise.prototype.STATE.FULFILLED) {
       // console.log("THEN: Scheduling immediate run of callbacks");
        setTimeout(this._executeHandlers.bind(this),0,this.onFulfilled,this.value);
    } else if (this.state === Promise.prototype.STATE.REJECTED) {
         setTimeout(this._executeHandlers.bind(this),0,this.onRejected,this.reason);
    }
    
    return chainedPromise;
    
};

Promise.prototype.fulfill = function (value)
{ 
    
    if (this.state !== Promise.prototype.STATE.PENDING) {
     
//        console.trace();
//        console.log("Promise is not pending " +this.state+" cannot fulfill it.");
       return;
    }
 //   console.log("fulfill!",this.onFulfilled);

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
       setTimeout(this._executeHandlers.bind(this),0,this.onFulfilled,this.value);
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
     setTimeout(this._executeHandlers.bind(this),0,this.onRejected,this.reason);
//    else
//        console.log("No onRejected callbacks specified with .then, will only 'fire' when .then is called");
    
 
};
    
function _resolution (promise,x)
{
   var typeofx = typeof x,
       then;
        
    // X refer to same object as promise -> impossible to resolve
    
    if (x === promise)
       
        promise.reject(new TypeError('Chained promise cannot be resolved with it self')); 
    
    // X is a promise conforming to current implementation
    
    else if (x instanceof Promise) 
    {

            x.then(function _resolve(y)
                   {
                         _resolution(promise,y);

                   }.bind(x),
                function _reject (r)
                {
                
                 promise.reject(r);
                    
                }.bind(x));
  
    }
    
    // X is not conforming to this implementation, but may have a then-function, a socalled "thenable"
    
    else if ((typeofx === 'object' && x !== null) || typeofx === 'function')
   
    {
        
        // In case x === null, continuing here would lead to a TypeError: Cannot read property 'then' of null
       
        try {
            
            then = x.then;
            
        }
        
        // Failed retrieving of the property x.then
        
        catch (e)
        {
            promise.reject(e);
            
            return;
        }
            
        // x have a then function, is a "thenable"
     
        if (typeof then === 'function')
        {
         
          
            try {
              
              then.call(x,function _resolvePromise (y)
                        {
                          
                               if (this.resolveCalled || this.rejectCalled)
                                   return;
                            
                                this.resolveCalled = true;
                            
                                  _resolution(promise,y);
                          
                         
                            }.bind(x),
                  
                  function _rejectPromise (r)
              {
                    if (this.rejectCalled || this.resolveCalled)
                        return;
                  
                      this.rejectCalled = true;
                      
                      promise.reject(r);
                  
                  }.bind(x));
            
                   
            } catch (e)
            {
               if (!x.rejectCalled &&  !x.resolveCalled)
                  promise.reject(e);
                
            }
       }
        
        // x does not have a then function is of type object 
        
        else // Object
        {
           // console.log("result was an object, fullfilling chained promise with",x,promise);
            
            promise.fulfill(x);
            
           // console.log("Post-state",promise.state,promise.onFulfilled[0]);
         
        }
        
            
    } 
        
        
    
    
    else if (typeofx !== 'function')
    
    {
    
        promise.fulfill(x);
    }
}



//
module.exports = Promise;
return module.exports;
//});