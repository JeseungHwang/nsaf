module.exports = function(app, fs, http)
{
	var moment = require('moment');

	app.get('/topo', function(req,res){
		
		var result = [];

		var x_pos = 1;
		var y_pos = 10;

		for(var i=0 ; i < x_pos ; i++){
			for(var j=1 ; j <= y_pos ; j++){
				var src = (i*10)+j;
				var next = src+10;

				var name = 'S'+src;
				var switchDPID;
				if(src < 10){
					switchDPID = '00:00:00:00:00:00:00:0'+src;
				}else{
					switchDPID = '00:00:00:00:00:00:00:'+src;
				}
				var dst = '00:00:00:00:00:00:00:'+next;
				var port = '1';
				var bandwidth =  (Math.floor(Math.random() * 10 + 1) * 10 + 50).toString();
				var delay = (Math.random() * 20 + 1).toFixed(1).toString();
				var jitter =(Math.random() * 20 + 1).toFixed(1).toString();
				var packetloss = (Math.random() * 20 + 1).toFixed(1).toString();

				result.push({
					"name" : 'S'+src,
					"switchDPID" : switchDPID,
					"dst" : dst,
					"port" : port,
					"bandwidth" : bandwidth,
					"delay" : delay,
					"jitter" : jitter,
					"packetloss" : packetloss
				});

				result.push({
					"name" : 'S'+next,
					"switchDPID" : dst,
					"dst" : switchDPID,
					"port" : port,
					"bandwidth" : bandwidth,
					"delay" : delay,
					"jitter" : jitter,
					"packetloss" : packetloss
				});

				if(src % 10 != 0){
					if(src < 10){
						dst = '00:00:00:00:00:00:00:0'+(src+1);	
					}else{
						dst = '00:00:00:00:00:00:00:'+(src+1);	
					}
					bandwidth =  Math.floor(Math.random() * 100 + 1) + 50;
					delay = (Math.floor(Math.random() * 20 + 1))%100;
					jitter = (Math.floor(Math.random() * 20 + 1))%100;
					packetloss = (Math.floor(Math.random() * 20 + 1))%100;

					result.push({
						"name" : 'S'+src,
						"switchDPID" : switchDPID,
						"dst" : dst,
						"port" : port.toString(),
						"bandwidth" : bandwidth.toString(),
						"delay" : delay.toString(),
						"jitter" : jitter.toString(),
						"packetloss" : packetloss.toString()
					});

					result.push({
						"name" : 'S'+(src+1),
						"switchDPID" : dst,
						"dst" : switchDPID,
						"port" : port.toString(),
						"bandwidth" : bandwidth.toString(),
						"delay" : delay.toString(),
						"jitter" : jitter.toString(),
						"packetloss" : packetloss.toString()
					});
				}				
			}
		}

		var topo = [];
		topo.push({
			"node" : result
		});
		res.json(topo);
	});



}