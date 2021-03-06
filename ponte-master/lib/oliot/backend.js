/**
 * Author Yalew Kiane
 */
var MongoClient = require('mongodb').MongoClient;
var redis=require('redis');
var redis_client = redis.createClient();

function selectFromDb(topic, payload, res,collection, resource, callback){
	
	MongoClient.connect("mongodb://localhost:27017/ponte", function(err, db){
		if(err){
			console.log("connection problem");
			return console.dir(err);
		}
		 var collectionUser=db.collection(collection);
		 var resultResource;
		 var searchStatud=false;
		 var brick="";
		 var attribute="";
		collectionUser.find({$and: [{service:resource.service}, {"attribute.attr":resource.attribute}]}).toArray(function(err, result){
			if(err){
				console.log(err);
			}else if(result.length){

			    searchStatud=true;
				brick=result[0].value;
				var attributes=result[0].attribute;
				for(var i=0; i<attributes.length; i++){
					if(attributes[i].attr===resource.attribute){
						attribute=attributes[i].value;
					}
				}
				//console.log("topic:-",topic);
				var samples=topic.split("/");
				//console.log("length", samples.length);
				//if(samples.lenght>2){
					samples[1]=brick;
					samples[2]=attribute;
					topic=samples[1]+"/"+samples[2];
					for(var xi=3; xi<samples.length; xi++){
						topic+="/"+samples[xi];
					}
//					for(var it=0; it<samples.lenght;it++){
//						topic+=samples[it]+"/";
//					}
				//}				
				resultResource= {searchStatud:searchStatud, brick:brick, attribute:attribute,topic:topic, payload:payload, res:res};
				//console.log(topic);
				//console.log("result found");
				//console.log(resultResource);
				//resource=resultResource;
				callback(null,resultResource);
				db.close();
			}else{
				//console.log("no document found");
				resultResource= {searchStatud:searchStatud, brick:brick, attribute:attribute,topic:topic, payload:payload, res:res};
				//console.log("result not found");
				callback(null,resultResource);
			}
			
		});
	});
}

function selectFromRedisDb(topic, payload, res, resource, callback){
	
	redis_client.hgetall(resource.service+'_'+resource.attribute, function(err, reply){
		if(err|| reply===null){
			//console.log('key not found');
			resultResource= {topic:topic , payload:payload ,res:res};
			callback(null,resultResource);
		}else{
			//console.log('key found from redis');
			var samples=topic.split("/");
			//console.log("length", samples.length);
				samples[1]=reply.service;
				samples[2]=reply.attr;
				topic=samples[1]+"/"+samples[2];		
				for(var xi=3; xi<samples.length; xi++){
					topic+="/"+samples[xi];
				}
			resultResource= {topic:topic  , payload:payload ,res:res};
			callback(null,resultResource);
			//console.log(reply.service);
		}
		
	});
	
}

function selectFromDbGET(topic, res,collection, resource, callback){
	MongoClient.connect("mongodb://localhost:27017/ponte", function(err, db){
		if(err){
			console.log("connection problem");
			return console.dir(err);
		}
		 var collectionUser=db.collection(collection);
		 var resultResource;
		 var searchStatud=false;
		 var brick="";
		 var attribute="";
		collectionUser.find({$and: [{service:resource.service}, {"attribute.attr":resource.attribute}]}).toArray(function(err, result){
			if(err){
				console.log(err);
			}else if(result.length){

			    searchStatud=true;
				brick=result[0].value;
				var attributes=result[0].attribute;
				for(var i=0; i<attributes.length; i++){
					if(attributes[i].attr===resource.attribute){
						attribute=attributes[i].value;
					}
				}
				//console.log("topic:-",topic);
				var samples=topic.split("/");
				//console.log("length", samples.length);
					samples[1]=brick;
					samples[2]=attribute;
					topic=samples[1]+"/"+samples[2];		
					for(var xi=3; xi<samples.length; xi++){
						topic+="/"+samples[xi];
					}
				resultResource= {searchStatud:searchStatud, brick:brick, attribute:attribute,topic:topic,  res:res};
				//console.log(topic);
				//console.log("result found");
				callback(null,resultResource);
				db.close();
			}else{
				resultResource= {searchStatud:searchStatud, brick:brick, attribute:attribute,topic:topic,  res:res};
				//console.log("result not found");
				callback(null,resultResource);
			}
			
		});
	});
}

function selectFromRedisGET(topic, res, resource, callback){
	
	redis_client.hgetall(resource.service+'_'+resource.attribute, function(err, reply){
		if(err|| reply===null){
			//console.log('key not found');
			resultResource= {topic:topic,  res:res};
			callback(null,resultResource);
		}else{
			//console.log('key found from redis');
			var samples=topic.split("/");
			//console.log("length", samples.length);
				samples[1]=reply.service;
				samples[2]=reply.attr;
				topic=samples[1]+"/"+samples[2];		
				for(var xi=3; xi<samples.length; xi++){
					topic+="/"+samples[xi];
				}
			resultResource= {topic:topic,  res:res};
			callback(null,resultResource);
			//console.log(reply.service);
		}
		
	});
	
	
}

function selectFromPubSub(resource, res){
	MongoClient.connect("mongodb://localhost:27017/ponte", function(err, db){
		if(err){
			console.log("connection problem");
			return console.dir(err);
		}
		var collectionUser=db.collection("pubsub");
		collectionUser.findOne({$and: [{service:resource.service}, {"attribute.attr":resource.attribute}]}).toArray(function(err, result){
			if(err){
				console.log(err);
			}else if(result.length){
				console.log("result found");
				callback(null,result);
				db.close();
			}else{
				console.log("result not found");
				callback(null,result);
			}
			
		});
	});
}

function searchForKeyword(keyword, res, protocol){
	//console.log("inside back");
	MongoClient.connect("mongodb://localhost:27017/ponte", function(err, db){
		if(err){
			console.log("connection problem");
			return console.dir(err);
		}
		var collectionUser=db.collection("pubsub");
		var resultTopic="";
		var it=1;
		collectionUser.find({topic: new RegExp(keyword, "i")}).toArray (function(err, result){
			if(err){
				console.log(err);
			}else if(result.length){
				//console.log("result found");
				///console.log(result[0]);
				if(protocol==="coap"){
					 res.statusCode = '2.05';
					 resultTopic=result[0].topic;
					 for(it=1; it<result.length; it++){
						 resultTopic+=", "+result[it].topic;
					 }
				     res.end(resultTopic);
				}else if(protocol==="http"){
					 resultTopic=result[0].topic;
					 for(it=1; it<result.length; it++){
						 resultTopic+=", "+result[it].topic;
					 }
					 res.statusCode = 200;
				     res.end(resultTopic);
				}
				db.close();
			}else{
				//console.log("result not found ");
				if(protocol==="coap"){
					 res.statusCode = '2.05';
				     res.end(result[0]);
				}else if(protocol==="http"){
					res.statusCode = 200;
                  res.end(result[0]);
				}
				db.close();
				//callback(null,result);
			}
			
		});
	});
}

function insertResourcesMasterdata(collection,resource, res, protocol){
	MongoClient.connect("mongodb://localhost:27017/ponte", function(err, db){
		if(err){
			console.log("connection problem");
			return console.dir(err);
		}
		var collectionUser=db.collection(collection);
		collectionUser.insert(resource, function(err, result){
			if(err){
				console.log(err);
				res[deliver](err);
			}else{
				//console.log("document inseted");
				if(protocol==="coap"){
					 res.statusCode = '2.04';
				     res.end(JSON.stringify(result.ops));
				}else if(protocol==="http"){
					res.statusCode = 200;
                    res.end(JSON.stringify(result.ops));
				}
				
			}
			db.close();
		});
		
	});
}

function deleteResourcesMasterdata(collection,resource, res, protocol){
	MongoClient.connect("mongodb://localhost:27017/ponte", function(err, db){
		if(err){
			console.log("connection problem");
			return console.dir(err);
		}
		var collectionUser=db.collection(collection);
		collectionUser.deleteMany({"id":resource}, function(err, result){
			if(err){
				console.log(err);
				res[deliver](err);
			}else{
				//console.log("document inseted");
				var source;
				if(protocol==="coap"){
					 res.statusCode = '2.04';
					 source=JSON.parse(result);
				     res.end(source.n +" row is deleted ");
				}else if(protocol==="http"){
					res.statusCode = 200;
					source=JSON.parse(result);
                    res.end(source.n +" row is deleted ");
				}
				
			}
			db.close();
		});
		
	});
}

function selectFromMasterdata(collection, resource,res,protocol){
	MongoClient.connect("mongodb://localhost:27017/ponte", function(err, db){
		if(err){
			//console.log("connection problem");
			return console.dir(err);
		}
		var collectionUser=db.collection(collection);
		collectionUser.find({$and: [resource]}).toArray(function(err, result){
			if(err){
				console.log(err);
			}else if(result.length){
				//console.log("result found", result[0]);
				if(protocol==="coap"){
					 res.statusCode = '2.05';
				     res.end(JSON.stringify(result));
				}else if(protocol==="http"){
					//console.log("sending text");
					res.statusCode = 200;
                   res.end(JSON.stringify(result));
				}
				db.close();
			}else{
				//console.log("result not found");
				if(protocol==="coap"){
					 res.statusCode = '2.05';
				     res.end(JSON.stringify(result));
				}else if(protocol==="http"){
					res.statusCode = 200;
                    res.end(JSON.stringify(result));
				db.close();
			}
			}
		});
		
	});
}
function insertResources(collection,resource, callback){
	MongoClient.connect("mongodb://localhost:27017/ponte", function(err, db){
		if(err){
			console.log("connection problem");
			return console.dir(err);
		}
		var collectionUser=db.collection(collection);
		collectionUser.insert(resource, function(err, result){
			if(err){
				console.log(err);
			}else{
				console.log("document inseted");
			}
		});
	});
}

module.exports.insertResourcesBack=insertResources;
module.exports.selectFromDbBack=selectFromDb;
module.exports.selectFromRedisDbBack=selectFromRedisDb;
module.exports.selectFromDbBackGET=selectFromDbGET;
module.exports.selectFromRedisBackGET=selectFromRedisGET;
module.exports.selectFromPubSubBack=selectFromPubSub;
module.exports.insertResourcesMasterdataBack=insertResourcesMasterdata; 
module.exports.deleteResourcesMasterdataBack=deleteResourcesMasterdata;
module.exports.searchForKeywordback=searchForKeyword;
module.exports.selectFromMasterdataback=selectFromMasterdata;
