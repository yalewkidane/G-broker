/**
 * Yalew Kidane
 */

var MongoClient = require('mongodb').MongoClient;

var resource= { 
		"id":"urn:sgtin:1234",
		"location":"urn:sgln:567",
		"services": [{
			"service":"10000999",
			"GTIN":"10614141000415",
			"attribute_values":[{
				"attribute_value":{
					"attribute":"20000010",
					"value":"30000000"
				},
				"attribute_value":{
					"attribute":"20000014",
					"value":"30000023"
				},
				"attribute_value":{
					"attribute":"20000011",
					"value":"30000043"
				},
				"attribute_value":{
					"attribute":"20000017",
					"value":"30000053"
				},
				"attribute_value":{
					"attribute":"20000104",
					"value":"30000063"
				},
				"attribute_value":{
					"attribute":"20000510",
					"value":"30000073"
				}
			}]
		}]
};

function insertResources(collection,resource){
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
			db.close();
		});
		
	});
}

var resurce1={"service":"10000999",
		"id":"urn:sgtin:1234",
		"location":"urn:sgln:567"};
var where= '{"services.service":"10000999","id":"urn:sgtin:1234","location":"urn:sgln:567"}';
function selectFromDb(collection, resource){
	MongoClient.connect("mongodb://localhost:27017/ponte", function(err, db){
		if(err){
			console.log("connection problem");
			return console.dir(err);
		}
		var collectionUser=db.collection(collection);
		
		var obj=JSON.parse(where);
		//console.log(obj);
		//collectionUser.find({$and: [{"id":resource.id},{"services.service":resource.service}, {"location":resource.location}]}).toArray(function(err, result){
		//collectionUser.find({$and: [{"services.service":"10000999"},{"id":"urn:sgtin:1234"},{"location":"urn:sgln:567"}]}).toArray(function(err, result){
		collectionUser.find({$and: [obj]}).toArray(function(err, result){
			if(err){
				console.log(err);
			}else if(result.length){
				console.log("result found", result[0]);
				//callback(null,result);
				db.close();
			}else{
				console.log("result not found");
				//callback(null,result);
				db.close();
			}
			
		});
		
	});
}
//insertResources("masterData",resource);
selectFromDb("masterData",resurce1);
//var obj=JSON.parse(where);
//console.log(obj);
//{$and[{service: {$eq:=012}},{id: {$eq:=urn:sgtin:1234}}{location: {$eq:=urn:sgln:123}}]}
