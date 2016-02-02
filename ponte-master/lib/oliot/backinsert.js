/**
 * Yalew Kidane
 */
var mongoTutorial= require('./backend');
var async=require('async');
var execSync=require('exec-sync');
function handleresult(err, result){
	if(err){
		console.error(err.stack || err.message);
		return;
	}
	console.log("document inserted", result);
}
var TempratureOIC={service:'temprature',value:'10000999', 
		attribute:[{attr:'temprature', value:'20000010'} ,
		           {attr:'unit', value:'20000014'}]};
var TempratureLWM2M={service:'3303',value:'10000999', 
		attribute:[{attr:'5700', value:'20000010'} ,
		           {attr:'5701', value:'20000014'}]};
//mongoTutorial.insertResourcesBack("oic",TempratureOIC,handleresult);
//mongoTutorial.insertResourcesBack("lwm2m",TempratureLWM2M,handleresult);
//async.series([]);
var returnedResult;
var handleSearchResult=function (err, result){
	if(err){
		console.error(err.stack || err.message);
		return;
	}
	console.log("document searched back insert");
	console.log(result);
	//returnedResult= result;
	//callback(null,result);
	
};
mongoTutorial.searchForKeywordback("200","res",handleresult);
var topic="resource/lwm2m/?/3303/5700";
var samples=topic.split("/");
console.log("length", samples.length);
var resource={service:samples[2], attribute:samples[3]};
if(topic.indexOf("?")>-1){
	console.log("Contain ?");
}else{
	console.log("Does not contain ?");
}
//async.series([
//	              function(callback){console.log("document searched 1-1");
//	              mongoTutorial.selectFromDbBack("lwm2m",resource,handleSearchResult);
//	              callback(null, 'one');
//	              },
//	              function(callback){console.log("document searched 2-1");
//	              console.log("resluted ",returnedResult);
//	              callback(null, 'Two');
//	              }
//	              ]);
//handleSearchResult()
//mongoTutorial.selectFromDbBack(topic, "payload", "res","lwm2m",resource,handleSearchResult);

	//mongoTutorial.selectFromDbBack("lwm2m",resource,handleSearchResult);//("err", result1), function(){
	//console.log("resluted ",returnedResult);
	
