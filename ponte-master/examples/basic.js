var ponte = require("../lib/ponte");
var opts = {
		 persistence: {
			    // same as http://mcollina.github.io/mosca/docs/lib/persistence/mongo.js.html 
			    type: "mongo",
			    url: "mongodb://localhost:27017/ponte"
			  },
			  broker: {
			    // same as https://github.com/mcollina/ascoltatori#mongodb 
			    type: "mongo",
			    url: "mongodb://localhost:27017/ponte"
			  },
			  logger: {
			    level: 30, // or 20 or 40 
			    name: "MongoPonte"
			  }
};
var server = ponte(opts);

//server.on("updated", function(resource, buffer) {
//	console.log("in side basic");
//  console.log("Resource Updated", resource, buffer.toString());
//  
//});
