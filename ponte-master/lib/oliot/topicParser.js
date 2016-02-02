/**
 * Yalew Kidane
 */
var mongoBack= require('./backend');
var response;
var protocol;
function topicparser(link, callback){
	if(link.indexOf('?')>0){
		console.log("query expression");
		var where="";
		var substring1="";
		var substring2="";
		var substring3="";
		var service="service";
		var id="id";
		var location="location";
		
		var index1= link.indexOf(service);
		var index2= link.indexOf(id);
		var index3= link.indexOf(location);
		
		//var test1=
		//"{test1: {$eq:"+"}}"
		var resource;
		var queryNumber= link.split("&").length-1;
		if(queryNumber===0){
			if(index1>0){
				substring1=link.substring(index1+8);
				where='{"services.service":"'+substring1+'"}';
			}else if(index2>0){
				substring1=link.substring(index2+3);	
				where='{"id":"'+substring1+'"}';
			}else if(index3>0){
				substring1=link.substring(index3+9);
				where='{"location":"'+substring1+'"}';
			}
		}else if(queryNumber===1){
			if(index1>0){
				if(index2>index1){
					substring1=link.substring(index1+8, index2-1);
					substring2=link.substring(index2+3);
					where='{"services.service":"'+substring1+'", "id":"'+substring2+'"}';
				}else if(index2>0){
					substring1=link.substring(index1+8);
					substring2=link.substring(index2+3, index1-1);
					where='{"services.service":"'+substring1+'", "id":"'+substring2+'"}';
				}else if(index3>index1){
					substring1=link.substring(index1+8, index3-1);
					substring2=link.substring(index3+9);
					where='{"services.service":"'+substring1+'",  "location":"'+substring2+'"}';
				}else if(index3>0){
					substring1=link.substring(index1+8 );
					substring2=link.substring(index3+9, index1-1);
					where='{"services.service":"'+substring1+'",  "location":"'+substring2+'"}';
				}
			}else if(index3>0){
				if(index2>index3){
					substring1=link.substring(index3+9, index2-1);
					substring2=link.substring(index2+3);
					where='{"id":"'+substring2+'", "location":"'+substring1+'"}';
				}else if(index2>0){
					substring1=link.substring(index3+9);
					substring2=link.substring(index2+3, index3-1);
					where='{"id":"'+substring2+'", "location":"'+substring1+'"}';
				}	
			}
		}else if(queryNumber===2){
			if((index1>0)&&(index2>0)&&(index3>0)){
				if(index1>index2){
					if(index2>index3){
						//3,2,1
						substring1=link.substring(index1+8);
						substring2=link.substring(index2+3, index1-1);
						substring3=link.substring(index3+9, index2-1);
						where='{"services.service":"'+substring1+'", "id":"'+substring2+'", "location":"'+substring3+'"}';
					}else if(index1>index3){
						//2,3,1
						substring1=link.substring(index1+8);
						substring2=link.substring(index2+3, index3-1);
						substring3=link.substring(index3+9, index1-1);
						where='{"services.service":"'+substring1+'", "id":"'+substring2+'", "location":"'+substring3+'"}';
					}else if(index1<index3){
						//2,1,3
						substring1=link.substring(index1+8, index3-1);
						substring2=link.substring(index2+3, index1-1);
						substring3=link.substring(index3+9);
						where='{"services.service":"'+substring1+'", "id":"'+substring2+'", "location":"'+substring3+'"}';
					}
				}else if(index2>index3){
					if(index3>index1){
						//1,3,2
						substring1=link.substring(index1+8, index3-1);
						substring2=link.substring(index2+3);
						substring3=link.substring(index3+9, index2-1);
						where='{"services.service":"'+substring1+'", "id":"'+substring2+'", "location":"'+substring3+'"}';
						}else if(index2>index1){
						//3,1,2
						substring1=link.substring(index1+8, index2-1);
						substring2=link.substring(index2+3);
						substring3=link.substring(index3+9,index1-1);
						where='{"services.service":"'+substring1+'", "id":"'+substring2+'", "location":"'+substring3+'"}';
						}
				}else if(index3>index2){
					if(index2>index1){
						//1,2,3
						substring1=link.substring(index1+8, index2-1);
						substring2=link.substring(index2+3, index3-1);
						substring3=link.substring(index3+9);
						where='{"services.service":"'+substring1+'", "id":"'+substring2+'", "location":"'+substring3+'"}';
						//where+="{$and["+"{"+service+": {$eq1:"+substring1+"}},"+"{"+id+": {$eq:"+substring2+"}}"+"{"+location+": {$eq:"+substring3+"}}"+"]}";
					}
				}
			}
		}
		
		var obj;
		try{
			obj=JSON.parse(where);
		}catch(ex){
			
		}
		
		callback(null, obj);
	}
}
function handleresultTopic(err, result){
	if(err){
		console.error(err.stack || err.message);
		return;
	}
	console.log("document inserted", result);
	mongoBack.selectFromMasterdataback("masterData", result,response, protocol);
	
}

//var link="https://143.48.245.234:8989/coap/resource/masterdata?service=10000999&id=urn:sgtin:1234&location=urn:sgln:567";
//var link="https://143.48.245.234:8989/coap/resource/masterdata?service=10000999&id=urn:sgtin:12345";
function getMasterdata(res,link, pro){
	response=res;
	protocol=pro;
	topicparser(link, handleresultTopic);
}
//topicparser(link, handleresultTopic);
//getMasterdata("res",link);
module.exports.getMasterdataMod=getMasterdata;
