module.exports = function(app, fs, http, Log)
{
	var moment = require('moment');
	var resStr = "";
	app.post('/path/dijkstra', function(req,res){
		console.time('optimum');
		var allTopologyInfo = req.body['node'];
		var switchCnt = 110;
		var topoMatrix = setTopologyMatrix(allTopologyInfo.slice(0), switchCnt);
		var bandwidth_matrix = setQoSMatrix(allTopologyInfo, switchCnt, 'bandwidth');
		var jitter_matrix = setQoSMatrix(allTopologyInfo, switchCnt, 'jitter');
		var delay_matrix = setQoSMatrix(allTopologyInfo, switchCnt, 'delay');
		var packetloss_matrix = setQoSMatrix(allTopologyInfo, switchCnt, 'packetloss');
		var QoS_matrix = [];
		QoS_matrix.push(bandwidth_matrix);
		QoS_matrix.push(jitter_matrix);
		QoS_matrix.push(delay_matrix);
		QoS_matrix.push(packetloss_matrix);
		//console.log(bandwidth_matrix);
		//console.log(QoS_matrix);
		 var appRequirement=[];
		 appRequirement.push({
		 	"bandwidth":80,
		 	"delay":0.3,
		 	"jitter":0.4,
		 	"packetloss":10
		 });
		var startPoint = 4;
		var endPoint = 60;
		//Dikstra 함수... bandwidth_matrix, jitter_matrix, delay_matrix, packetloss_matrix 중 하나만 삽입

		dikstra(delay_matrix, startPoint, endPoint, switchCnt);
		res.json(resStr);
	});

	function dikstra(graph, startPoint, endPoint, switchCnt){
		var inf = 99999;
		var isVisits = [];
		var distance = [];
		var historyPath = [];

		var nextVertex = startPoint;
		var min = 0;

		//초기화
		//console.log(bandwidth_matrix);
		for(var i=0; i<switchCnt; i++){
			isVisits[i] = false;
			distance[i] = inf;
			historyPath[i] = inf;
		}
		distance[startPoint] = 0;
		while (true) {
			min = inf;
			for (var j = 0; j < switchCnt; j++){
				if (isVisits[j] == false && distance[j] < min){
					nextVertex = j;
					min = distance[j];
				}
			}

			if (min == inf)
				break;

			isVisits[nextVertex] = true;

			for (var j = 0; j < switchCnt; j++){
				var distanceVertex = distance[nextVertex] + parseInt(graph[nextVertex][j]);
				if (distance[j] > distanceVertex){
					distance[j] = distanceVertex;
					historyPath[j] = nextVertex;
				}
			}
		}
		resStr = '';
		resStr += '시작점'+startPoint+' 부터 도착점 :'+endPoint+' ';
		resStr += '최단거리 : '+distance[endPoint]+' '
		console.log(startPoint+'부터 도착점 :'+endPoint);
		console.log('최단거리 : '+distance[endPoint]);

		console.timeEnd('optimum');

		printPath(historyPath, startPoint, endPoint)
	}
	function printPath(historyPath, startPoint, endPoint){
		var path = [];
		var vertex = endPoint;
		//console.log(historyPath);
		while (true) {
			path.push(vertex);
			if(vertex == startPoint)
				break;
			vertex = historyPath[vertex];
		}
		resStr += '경로 :'+' '

		console.log(startPoint+'부터 도착점 :'+endPoint+'경로 :');
		while (path.length != 0) {
			resStr += path[path.length-1]+' ';
			console.log(' '+path.pop());
		}
	}
	function getDateTime(){
		return moment().format('YYYY-MM-DD hh:mm:ss');
	}
	function setTopologyMatrix(req_data, cnt){
		var matrix = new Array(cnt);
		//2차원 배열 전체 초기화 부분
		for(var i=0; i<cnt; i++){
			matrix[i] = new Array(cnt);
			for(var j=0; j<cnt; j++){
				matrix[i][j] = 0;
			}
		}
		//Topology 연결된 부분끼리 배열에 표현
		for(var obj in req_data){
			var src = parseInt(req_data[obj].switchDPID.substring(req_data[obj].switchDPID.length-2, req_data[obj].switchDPID.length));
			var dst = parseInt(req_data[obj].dst.substring(req_data[obj].dst.length-2, req_data[obj].dst.length));
			//if(!isNaN(dst)){
				matrix[src-1][dst-1]=1;
				matrix[dst-1][src-1]=1;
			//}
		}
		return matrix;
	}
	function setQoSMatrix(req_data, cnt, qos){
		var matrix = new Array(cnt);
		for(var i=0; i<cnt; i++){
			matrix[i] = new Array(cnt);
			for(var j=0; j<cnt; j++){
				matrix[i][j] = 99999;
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
