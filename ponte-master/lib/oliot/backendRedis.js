/**
 * http://usejsdoc.org/
 */
var redis=require('redis');
var client = redis.createClient();

client.on('connect', function(){
	console.log('connected');
});

client.hmset('temprature_temprature', 'service', '10000999', 'attr','20000010');
client.hmset('temprature_unit', 'service', '10000999', 'attr','20000014');
client.hmset('3303_5700', 'service', '10000999', 'attr','20000010');
client.hmset('3303_5701', 'service', '10000999', 'attr','20000014');

client.hgetall('temprature_temprature', function(err, reply){
	if(err|| reply===null){
		console.log('key not found');
	}else{
		console.log('connected');
		console.log(reply.service);
	}
	
});
