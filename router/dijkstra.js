module.exports = function(app, fs, http, Log)
{
	var moment = require('moment');

	app.post('/path/dijkstra', function(req,res){
		console.time('optimum');
		var allTopologyInfo = req.body['node'];
		var switchCnt = 20;
		var bandwidth_matrix = setQoSMatrix(allTopologyInfo, switchCnt, 'bandwidth');
		var jitter_matrix = setQoSMatrix(allTopologyInfo, switchCnt, 'jitter');
		var delay_matrix = setQoSMatrix(allTopologyInfo, switchCnt, 'delay');
		var packetloss_matrix = setQoSMatrix(allTopologyInfo, switchCnt, 'packetloss');
		var QoS_matrix = [];
		QoS_matrix.push(bandwidth_matrix);
		QoS_matrix.push(jitter_matrix);
		QoS_matrix.push(delay_matrix);
		QoS_matrix.push(packetloss_matrix);

		var appRequirement=[];
		appRequirement.push({
			"bandwidth":80,
			"delay":0.3,
			"jitter":0.4,
			"packetloss":10
		});

		var startPoint = 4;
		var endPoint = 14;
		console.log(bandwidth_matrix);
		for(var i=0; i<switchCnt; i++){

		}


		console.log(QoS_matrix);
		console.timeEnd('optimum');
		res.json("zzz");
	});

	function getDateTime(){
		return moment().format('YYYY-MM-DD hh:mm:ss');
	}

	function setQoSMatrix(req_data, cnt, qos){
		var matrix = new Array(cnt);
		for(var i=0; i<cnt; i++){
			matrix[i] = new Array(cnt);
			for(var j=0; j<cnt; j++){
				matrix[i][j] = '1000';
			}
		}
		for(var obj in req_data){
			var src = parseInt(req_data[obj].switchDPID.substring(req_data[obj].switchDPID.length-2, req_data[obj].switchDPID.length));
			var dst = parseInt(req_data[obj].dst.substring(req_data[obj].dst.length-2, req_data[obj].dst.length));
			//if(!isNaN(dst)){
				matrix[src-1][dst-1] = req_data[obj][qos];
				matrix[dst-1][src-1] = req_data[obj][qos];
			//}
		}
		return matrix;
	}
}