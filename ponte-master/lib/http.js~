/*******************************************************************************
 * Copyright (c) 2013-2014 Matteo Collina
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and Eclipse Distribution License v1.0 which accompany this distribution.
 *
 * The Eclipse Public License is available at
 *    http://www.eclipse.org/legal/epl-v10.html
 * and the Eclipse Distribution License is available at
 *   http://www.eclipse.org/org/documents/edl-v10.php.
 */*******************************************************************************
 * Copyright (c) 2013-2014 Matteo Collina
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and Eclipse Distribution License v1.0 which accompany this distribution.
 *
 * The Eclipse Public License is available at
 *    http://www.eclipse.org/legal/epl-v10.html
 * and the Eclipse Distribution License is available at
 *   http://www.eclipse.org/org/documents/edl-v10.php.
 *
 * Contributors:
 *    Matteo Collina - initial API and implementation and/or initial documentation
 *******************************************************************************/

var http = require("http");
var resourcesRegexp = /^\/resources\/(.+)$/;
var callback = require("callback-stream");
var bunyan = require("bunyan");
var st = require("st");
var corsify = require("corsify");
var mongoback= require('./oliot/backend');
var topicParser= require('./oliot/topicParser');

var os = require( 'os' );
var request = require('request');
var persist;
var pont;
function HTTP(opts, done) {
  if (!(this instanceof HTTP)) {
    return new HTTP(opts, done);
  }

  if (typeof opts === "function") {
    cb = opts;
    opts = {};
  }

  var that = this;
  this._persistence = opts.ponte.persistence;
  this._ponte = opts.ponte;
  //
  persist=opts.ponte.persistence;
  pont= opts.ponte;
  if (typeof opts.authenticate === "function") {
    this.authenticate = opts.authenticate;
  }

  if (typeof opts.authorizeGet === "function") {
    this.authorizeGet = opts.authorizeGet;
  }

  if (typeof opts.authorizePut === "function") {
    this.authorizePut = opts.authorizePut;
  }

  var logger = this._logger = opts.ponte.logger.child({
    service: 'HTTP',
    serializers: {
      req: bunyan.stdSerializers.req,
      res: bunyan.stdSerializers.res
    }
  });
  this.server = http.createServer(this.buildServer(opts));
  this.server.listen(opts.port, opts.host, function(err) {
    done(err, that);
    logger.info({ port: opts.port }, "server started");
  });

  if (this._ponte.mqtt) {
    this._ponte.mqtt.attachHttpServer(this.server);
  }
}

HTTP.prototype.close = function(done) {
  this.server.close(done);
};

HTTP.prototype.buildServer = function(opts) {
  var logger = this._logger;
  var persistence = this._persistence;
  var ponte = this._ponte;

  var authenticate = this.authenticate;
  var authorizeGet = this.authorizeGet;
  var authorizePut = this.authorizePut;

  function handleAuthError(err, res) {
    logger.info(err);
    res.statusCode = 500;
    res.end();
  }

  function handleNotAuthenticated(res) {
    logger.info('authentication denied');
    res.statusCode = 401;
    res.end();
  }

  function handleNotAuthorized(res) {
    logger.info('not authorized');
    res.statusCode = 403;
    res.end();
  }

  var handlePontePublic = st(opts.publicDirs.ponte, {
    index: false,
    passthrough: true,
    dot: opts.publicDirs.mosca.match(/(^|\/)\./)
  });
  
  var handleMoscaPublic = st(opts.publicDirs.mosca, {
    index: false,
    passthrough: false,
    dot: opts.publicDirs.mosca.match(/(^|\/)\./)
  });

  function handleGetResource(subject, topic, req, res) {
    if (req.method !== 'GET') {
      return false;
    }

    authorizeGet(subject, topic, function(err, authorized) {
      if (err) {
        handleAuthError(err, res);
        return;
      }

      if (!authorized) {
        handleNotAuthorized(res);
        return;
      }
      // modified 
      console.log("HTTP GET");
      if(topic.indexOf("?")>-1){
    	  
    	  if(topic.indexOf("masterdata")>-1){
    		  //console.log("search for master data");
    		  topicParser.getMasterdataMod(res, topic, "http");
    	  }else{
    		  //console.log("search for topic");
    		  var searchword=topic.substr(topic.indexOf("?")+9);
    		  //console.log(searchword);
    		  mongoback.searchForKeywordback(searchword,res,"http");
    		  //mongoback.selectFromPubSubBack(topic, res);
    	  }
    	  
      }else{
    	  
          var indexoic= topic.indexOf("oic");
          var indexlwm2m= topic.indexOf("lwm2m");
          var topcArray=topic.split("/");
          if(indexoic>-1){
        	  var resourceoic={service:topcArray[1], attribute:topcArray[2]};
        	  //mongoback.selectFromDbBackGET(topic, res,"oic",resourceoic,handleSearchResultGET_H);
        	  mongoback.selectFromRedisBackGET(topic, res,resourceoic,handleSearchResultGET_H);
          }else if(indexlwm2m>-1){
        	  var resourcelwm2m={service:topcArray[1], attribute:topcArray[2]};
        	  //mongoback.selectFromDbBackGET(topic,  res, "lwm2m",resourcelwm2m,handleSearchResultGET_H);
        	  mongoback.selectFromRedisBackGET(topic, res,resourcelwm2m,handleSearchResultGET_H);
          }else{
              persistence.lookupRetained(topic, function(err, packets) {
                  if (packets.length === 0) {
                    res.statusCode = 404;
                    res.end('Not found');
                  } else {
                	  res.statusCode = 200;
                    res.end(packets[0].payload);
                    //res.end("text");
                  }
                });
          }
      }
      
//      persistence.lookupRetained(topic, function(err, packets) {
//        if (packets.length === 0) {
//          res.statusCode = 404;
//          res.end('Not found');
//        } else {
//          res.end(packets[0].payload);
//          //res.end("text");
//        }
//      });

    });

    return true;
  }
  
  function handleDeleteResource(subject, topic, req, res) {
	  if (req.method !== 'DELETE' ) {
	      return false;
	    }
	  if(topic.indexOf("masterdata")>-1){
		  
		  var resource=topic.substring(topic.indexOf("id")+3);
		  mongoback.deleteResourcesMasterdataBack("masterData", resource, res,"http");
		    
		 // res.statusCode = '200';
  	     // res.end("Delete");
	  }
	  return true;
	  
  }
  
  function handlePutResource(subject, topic, req, res) {
    if (req.method !== 'PUT' && req.method !== 'POST') {
      return false;
    }

    req.pipe(callback(function(err, payload) {
      payload = payload[0];

      if (typeof payload === "undefined") {
        payload = "";
      }

      authorizePut(subject, topic, payload, function(err, authorized) {
        if (err) {
          handleAuthError(err, res);
          return;
        }

        if (!authorized) {
          handleNotAuthorized(res);
          return;
        }
        if(topic.indexOf("masterdata")>-1){
      	  //console.log("payload");
      	  
      	  //console.log(payload.toString());
      	  var vart=payload.toString();
      	  try{
      		  var resource=JSON.parse(vart);
      		  mongoback.insertResourcesMasterdataBack("masterData", resource, res,"http");
      		
      		var ifaces = os.networkInterfaces( );
      		var ifacesadress;      		
      		'use strict';
      		Object.keys(ifaces).forEach(function (ifname) {
      		  var alias = 0;

      		  ifaces[ifname].forEach(function (iface) {
      		    if ('IPv4' !== iface.family || iface.internal !== false) {
      		      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      		      return;
      		    }

      		    if (alias >= 1) {
      		      // this single interface has multiple ipv4 addresses
      		     // console.log(ifname + ':' + alias, iface.address);
      		    ifacesadress=iface.address;
      		    } else {
      		      // this interface has only one ipv4 adress
      		     // console.log(ifname, iface.address);
      		    ifacesadress=iface.address;
      		    }
      		    ++alias;
      		  });
      		});

      		
      		var d = new Date();
      		var timestamp=d.toISOString();
      		
      		
      		 var discoveryData = 
      		{        "thingname":resource.id,   
      			       "data":{    "epcis_address":"onsepc.kr",           
      			        "timestamp":timestamp,        
      			        "thing_address":ifacesadress,             
      			        "location":[127.384462,36.350377]          
      			         }   
      			};
      		
      		
      		 
      		request( {
  				url:     'http://143.248.53.241:3001/register',
  				method: 'POST',
  				json: discoveryData
  			},  function (error, response_, body) {
      			        if (!error && response_.statusCode == 200) {
      			            
      			        }else{
      			        	console.log(error);
      			        	console.log(response_.statusCode);
      			        	
      			        }
      			    }
      			);
		

      		 
      	  }catch(ex){
      		  console.log("error");
      		  res.statusCode = '404';
      	      res.end();
      	  }
      	  
        }else{
        	 var packet = { topic: topic, payload: payload, retain: true };
             
             var indexoic= topic.indexOf("oic");
             var indexlwm2m= topic.indexOf("lwm2m");
             var topcArray=topic.split("/");
             //console.log("indexoic", indexoic);
             //console.log("indexlwm2m", indexlwm2m);
             if(indexoic>-1){
           	  var resourceoic={service:topcArray[1], attribute:topcArray[2]};
           	//  mongoback.selectFromDbBack(topic, payload, res,"oic",resourceoic,handleSearchResult);
           	  mongoback.selectFromRedisDbBack(topic, payload, res,resourceoic,handleSearchResult);
             }else if(indexlwm2m>-1){
           	  var resourcelwm2m={service:topcArray[1], attribute:topcArray[2]};
           	 // mongoback.selectFromDbBack(topic, payload, res, "lwm2m",resourcelwm2m,handleSearchResult);
           	  mongoback.selectFromRedisDbBack(topic, payload, res,resourcelwm2m,handleSearchResult);
             }else{
             	persistence.storeRetained(packet, function() {
                 	//console.log(packet);
                   ponte.broker.publish(topic, payload, {}, function() {
                     res.setHeader('Location', '/resources/' + topic);
                     res.statusCode = 204;
                     res.end();
                     ponte.emit('updated', topic, new Buffer(payload));
                     //console.log("Yale: topic  "+ topic);
                   });
                 });
             }
        }

       

      });
    }));

    return true;
  }

  function handleNotFound(res) {
    res.writeHeader(404);
    res.end("Not Found");
  }

  return corsify({
    endOptions: true
  }, function httpServer(req, res) {
    logger.info({ req: req });

    res.on('finish', function() {
      logger.info({ res: res });
    });

    // Only authenticate requests to the resources
    var match = req.url.match(resourcesRegexp);
    if (match) {
      topic = match[1];

      authenticate(req, function(err, authenticated, subject) {
        if (err) {
          handleAuthError(err, res);
          return;
        }

        if (!authenticated) {
          handleNotAuthenticated(res);
          return;
        }

        var handled =
          handleGetResource(subject, topic, req, res) || handleDeleteResource(subject, topic, req, res) ||
          handlePutResource(subject, topic, req, res);

        if (!handled) {
          handleNotFound(res);
        }
      });
    } else {
      // Public libraries do not require authentication
      if (opts.serveLibraries) {
        handlePontePublic(req, res, function() {
          handleMoscaPublic(req, res);
        });
      } else {
        handleNotFound(res);
      }
    }
  });
};

/**
 * The function that will be used to authenticate requests.
 * This default implementation authenticates everybody.
 * The returned subject is just a new Object.
 *
 * @param {Object} req The request object
 * @param {Function} cb The callback function. Has the following structure: cb(err, authenticated, subject)
 */
HTTP.prototype.authenticate = function(req, cb) {
  cb(null, true, {});
};

/**
 * The function that will be used to authorize subjects to GET messages from topics.
 * This default implementation authorizes everybody.
 *
 * @param {Object} subject The subject returned by the authenticate function
 * @param {string} topic The topic
 * @param {Function} cb The callback function. Has the following structure: cb(err, authorized)
 */
HTTP.prototype.authorizeGet = function(subject, topic, cb) {
  cb(null, true);
};

/**
 * The function that will be used to authorize subjects to PUT messages to topics.
 * This default implementation authorizes everybody.
 *
 * @param {Object} subject The subject returned by the authenticate function
 * @param {string} topic The topic
 * @param {string} payload The payload
 * @param {Function} cb The callback function. Has the following structure: cb(err, authorized)
 */
HTTP.prototype.authorizePut = function(subject, topic, payload, cb) {
  cb(null, true);
};

handleSearchResult=function (err, result){
	if(err){
		console.error(err.stack || err.message);
		return;
	}
	//console.log("inside handleSearchResultPUTHTTP");
	//console.log(result);
	var packetlocal = { topic: result.topic, payload: result.payload, retain: true };
	persist.storeRetained(packetlocal, function() {
		pont.broker.publish(result.topic, result.payload, {}, function() {
    	  result.res.setHeader('Location', '/resources/' + result.topic);
    	  result.res.statusCode = 204;
    	  result.res.end();
    	  pont.emit('updated', result.topic, new Buffer(result.payload));
      });
    });
	//callback(null,result);
	
};

handleSearchResultGET_H=function (err, result){
	if(err){
		console.error(err.stack || err.message);
		return;
	}
	//console.log("inside handleSearchResultGETHTTP");
	persist.lookupRetained(result.topic, function(err, packets) {
        if (packets.length === 0) {
        	result.res.statusCode = 404;
        	result.res.end('Not found');
        } else {
        	result.res.statusCode = 200;
        	result.res.end(packets[0].payload);
          //res.end("text");
        }
      });
};
module.exports = HTTP;

 * Contributors:
 *    Matteo Collina - initial API and implementation and/or initial documentation
 *******************************************************************************/

var http = require("http");
var resourcesRegexp = /^\/resources\/(.+)$/;
var callback = require("callback-stream");
var bunyan = require("bunyan");
var st = require("st");
var corsify = require("corsify");
var mongoback= require('./oliot/backend');
var topicParser= require('./oliot/topicParser');

var os = require( 'os' );
var request = require('request');
var persist;
var pont;
function HTTP(opts, done) {
  if (!(this instanceof HTTP)) {
    return new HTTP(opts, done);
  }

  if (typeof opts === "function") {
    cb = opts;
    opts = {};
  }

  var that = this;
  this._persistence = opts.ponte.persistence;
  this._ponte = opts.ponte;
  //
  persist=opts.ponte.persistence;
  pont= opts.ponte;
  if (typeof opts.authenticate === "function") {
    this.authenticate = opts.authenticate;
  }

  if (typeof opts.authorizeGet === "function") {
    this.authorizeGet = opts.authorizeGet;
  }

  if (typeof opts.authorizePut === "function") {
    this.authorizePut = opts.authorizePut;
  }

  var logger = this._logger = opts.ponte.logger.child({
    service: 'HTTP',
    serializers: {
      req: bunyan.stdSerializers.req,
      res: bunyan.stdSerializers.res
    }
  });
  this.server = http.createServer(this.buildServer(opts));
  this.server.listen(opts.port, opts.host, function(err) {
    done(err, that);
    logger.info({ port: opts.port }, "server started");
  });

  if (this._ponte.mqtt) {
    this._ponte.mqtt.attachHttpServer(this.server);
  }
}

HTTP.prototype.close = function(done) {
  this.server.close(done);
};

HTTP.prototype.buildServer = function(opts) {
  var logger = this._logger;
  var persistence = this._persistence;
  var ponte = this._ponte;

  var authenticate = this.authenticate;
  var authorizeGet = this.authorizeGet;
  var authorizePut = this.authorizePut;

  function handleAuthError(err, res) {
    logger.info(err);
    res.statusCode = 500;
    res.end();
  }

  function handleNotAuthenticated(res) {
    logger.info('authentication denied');
    res.statusCode = 401;
    res.end();
  }

  function handleNotAuthorized(res) {
    logger.info('not authorized');
    res.statusCode = 403;
    res.end();
  }

  var handlePontePublic = st(opts.publicDirs.ponte, {
    index: false,
    passthrough: true,
    dot: opts.publicDirs.mosca.match(/(^|\/)\./)
  });
  
  var handleMoscaPublic = st(opts.publicDirs.mosca, {
    index: false,
    passthrough: false,
    dot: opts.publicDirs.mosca.match(/(^|\/)\./)
  });

  function handleGetResource(subject, topic, req, res) {
    if (req.method !== 'GET') {
      return false;
    }

    authorizeGet(subject, topic, function(err, authorized) {
      if (err) {
        handleAuthError(err, res);
        return;
      }

      if (!authorized) {
        handleNotAuthorized(res);
        return;
      }
      // modified 
      console.log("HTTP GET");
      if(topic.indexOf("?")>-1){
    	  
    	  if(topic.indexOf("masterdata")>-1){
    		  //console.log("search for master data");
    		  topicParser.getMasterdataMod(res, topic, "http");
    	  }else{
    		  //console.log("search for topic");
    		  var searchword=topic.substr(topic.indexOf("?")+9);
    		  //console.log(searchword);
    		  mongoback.searchForKeywordback(searchword,res,"http");
    		  //mongoback.selectFromPubSubBack(topic, res);
    	  }
    	  
      }else{
    	  
          var indexoic= topic.indexOf("oic");
          var indexlwm2m= topic.indexOf("lwm2m");
          var topcArray=topic.split("/");
          if(indexoic>-1){
        	  var resourceoic={service:topcArray[1], attribute:topcArray[2]};
        	  //mongoback.selectFromDbBackGET(topic, res,"oic",resourceoic,handleSearchResultGET_H);
        	  mongoback.selectFromRedisBackGET(topic, res,resourceoic,handleSearchResultGET_H);
          }else if(indexlwm2m>-1){
        	  var resourcelwm2m={service:topcArray[1], attribute:topcArray[2]};
        	  //mongoback.selectFromDbBackGET(topic,  res, "lwm2m",resourcelwm2m,handleSearchResultGET_H);
        	  mongoback.selectFromRedisBackGET(topic, res,resourcelwm2m,handleSearchResultGET_H);
          }else{
              persistence.lookupRetained(topic, function(err, packets) {
                  if (packets.length === 0) {
                    res.statusCode = 404;
                    res.end('Not found');
                  } else {
                	  res.statusCode = 200;
                    res.end(packets[0].payload);
                    //res.end("text");
                  }
                });
          }
      }
      
//      persistence.lookupRetained(topic, function(err, packets) {
//        if (packets.length === 0) {
//          res.statusCode = 404;
//          res.end('Not found');
//        } else {
//          res.end(packets[0].payload);
//          //res.end("text");
//        }
//      });

    });

    return true;
  }

  function handlePutResource(subject, topic, req, res) {
    if (req.method !== 'PUT' && req.method !== 'POST') {
      return false;
    }

    req.pipe(callback(function(err, payload) {
      payload = payload[0];

      if (typeof payload === "undefined") {
        payload = "";
      }

      authorizePut(subject, topic, payload, function(err, authorized) {
        if (err) {
          handleAuthError(err, res);
          return;
        }

        if (!authorized) {
          handleNotAuthorized(res);
          return;
        }
        if(topic.indexOf("masterdata")>-1){
      	  //console.log("payload");
      	  
      	  //console.log(payload.toString());
      	  var vart=payload.toString();
      	  try{
      		  var resource=JSON.parse(vart);
      		  mongoback.insertResourcesMasterdataBack("masterData", resource, res,"http");
      		
      		var ifaces = os.networkInterfaces( );
      		var ifacesadress;      		
      		'use strict';
      		Object.keys(ifaces).forEach(function (ifname) {
      		  var alias = 0;

      		  ifaces[ifname].forEach(function (iface) {
      		    if ('IPv4' !== iface.family || iface.internal !== false) {
      		      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      		      return;
      		    }

      		    if (alias >= 1) {
      		      // this single interface has multiple ipv4 addresses
      		     // console.log(ifname + ':' + alias, iface.address);
      		    ifacesadress=iface.address;
      		    } else {
      		      // this interface has only one ipv4 adress
      		     // console.log(ifname, iface.address);
      		    ifacesadress=iface.address;
      		    }
      		    ++alias;
      		  });
      		});

      		
      		var d = new Date();
      		var timestamp=d.toISOString();
      		
      		
      		 var discoveryData = 
      		{        "thingname":resource.id,   
      			       "data":{    "epcis_address":"onsepc.kr",           
      			        "timestamp":timestamp,        
      			        "thing_address":ifacesadress,             
      			        "location":[127.384462,36.350377]          
      			         }   
      			};
      		
      		
      		 
      		request( {
  				url:     'http://143.248.53.241:3001/register',
  				method: 'POST',
  				json: discoveryData
  			},  function (error, response_, body) {
      			        if (!error && response_.statusCode == 200) {
      			            
      			        }else{
      			        	console.log(error);
      			        	console.log(response_.statusCode);
      			        	
      			        }
      			    }
      			);
		

      		 
      	  }catch(ex){
      		  console.log("error");
      		  res.statusCode = '404';
      	      res.end();
      	  }
      	  
        }else{
        	 var packet = { topic: topic, payload: payload, retain: true };
             
             var indexoic= topic.indexOf("oic");
             var indexlwm2m= topic.indexOf("lwm2m");
             var topcArray=topic.split("/");
             //console.log("indexoic", indexoic);
             //console.log("indexlwm2m", indexlwm2m);
             if(indexoic>-1){
           	  var resourceoic={service:topcArray[1], attribute:topcArray[2]};
           	//  mongoback.selectFromDbBack(topic, payload, res,"oic",resourceoic,handleSearchResult);
           	  mongoback.selectFromRedisDbBack(topic, payload, res,resourceoic,handleSearchResult);
             }else if(indexlwm2m>-1){
           	  var resourcelwm2m={service:topcArray[1], attribute:topcArray[2]};
           	 // mongoback.selectFromDbBack(topic, payload, res, "lwm2m",resourcelwm2m,handleSearchResult);
           	  mongoback.selectFromRedisDbBack(topic, payload, res,resourcelwm2m,handleSearchResult);
             }else{
             	persistence.storeRetained(packet, function() {
                 	//console.log(packet);
                   ponte.broker.publish(topic, payload, {}, function() {
                     res.setHeader('Location', '/resources/' + topic);
                     res.statusCode = 204;
                     res.end();
                     ponte.emit('updated', topic, new Buffer(payload));
                     //console.log("Yale: topic  "+ topic);
                   });
                 });
             }
        }

       

      });
    }));

    return true;
  }

  function handleNotFound(res) {
    res.writeHeader(404);
    res.end("Not Found");
  }

  return corsify({
    endOptions: true
  }, function httpServer(req, res) {
    logger.info({ req: req });

    res.on('finish', function() {
      logger.info({ res: res });
    });

    // Only authenticate requests to the resources
    var match = req.url.match(resourcesRegexp);
    if (match) {
      topic = match[1];

      authenticate(req, function(err, authenticated, subject) {
        if (err) {
          handleAuthError(err, res);
          return;
        }

        if (!authenticated) {
          handleNotAuthenticated(res);
          return;
        }

        var handled =
          handleGetResource(subject, topic, req, res) ||
          handlePutResource(subject, topic, req, res);

        if (!handled) {
          handleNotFound(res);
        }
      });
    } else {
      // Public libraries do not require authentication
      if (opts.serveLibraries) {
        handlePontePublic(req, res, function() {
          handleMoscaPublic(req, res);
        });
      } else {
        handleNotFound(res);
      }
    }
  });
};

/**
 * The function that will be used to authenticate requests.
 * This default implementation authenticates everybody.
 * The returned subject is just a new Object.
 *
 * @param {Object} req The request object
 * @param {Function} cb The callback function. Has the following structure: cb(err, authenticated, subject)
 */
HTTP.prototype.authenticate = function(req, cb) {
  cb(null, true, {});
};

/**
 * The function that will be used to authorize subjects to GET messages from topics.
 * This default implementation authorizes everybody.
 *
 * @param {Object} subject The subject returned by the authenticate function
 * @param {string} topic The topic
 * @param {Function} cb The callback function. Has the following structure: cb(err, authorized)
 */
HTTP.prototype.authorizeGet = function(subject, topic, cb) {
  cb(null, true);
};

/**
 * The function that will be used to authorize subjects to PUT messages to topics.
 * This default implementation authorizes everybody.
 *
 * @param {Object} subject The subject returned by the authenticate function
 * @param {string} topic The topic
 * @param {string} payload The payload
 * @param {Function} cb The callback function. Has the following structure: cb(err, authorized)
 */
HTTP.prototype.authorizePut = function(subject, topic, payload, cb) {
  cb(null, true);
};

handleSearchResult=function (err, result){
	if(err){
		console.error(err.stack || err.message);
		return;
	}
	//console.log("inside handleSearchResultPUTHTTP");
	//console.log(result);
	var packetlocal = { topic: result.topic, payload: result.payload, retain: true };
	persist.storeRetained(packetlocal, function() {
		pont.broker.publish(result.topic, result.payload, {}, function() {
    	  result.res.setHeader('Location', '/resources/' + result.topic);
    	  result.res.statusCode = 204;
    	  result.res.end();
    	  pont.emit('updated', result.topic, new Buffer(result.payload));
      });
    });
	//callback(null,result);
	
};

handleSearchResultGET_H=function (err, result){
	if(err){
		console.error(err.stack || err.message);
		return;
	}
	//console.log("inside handleSearchResultGETHTTP");
	persist.lookupRetained(result.topic, function(err, packets) {
        if (packets.length === 0) {
        	result.res.statusCode = 404;
        	result.res.end('Not found');
        } else {
        	result.res.statusCode = 200;
        	result.res.end(packets[0].payload);
          //res.end("text");
        }
      });
};
module.exports = HTTP;

