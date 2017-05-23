module.exports = function(app, fs, http, Log)
{
	var math = require('mathjs');
	var moment = require('moment');
	var resStr = "";
	var switchCnt = 30;
	app.post('/path/dijkstra', function(req,res){
		console.time('optimum');
		var allTopologyInfo = req.body['node'];
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

		var startPoint = 8;
		var endPoint = 14;
		//Dikstra 함수... bandwidth_matrix, jitter_matrix, delay_matrix, packetloss_matrix 중 하나만 삽입
		console.log('QOS');
		var Qos = QoSMatrix(bandwidth_matrix,jitter_matrix,delay_matrix,packetloss_matrix)
		console.log(Qos)
		console.log('QOS');
		//console.log(bandwidth_matrix);
		dikstra(Qos, startPoint, endPoint);

		res.json(resStr);
	});
	//이건 Bandwith , jitter, delay, packetloss의 Weight를 주어 4가지 QoS를 고려한 QoSArraY를 생성하는 함수입니다..
	function QoSMatrix(bandwidth_matrix, jitter_matrix,delay_matrix,packetloss_matrix){
		//가중치값 정하기! Bandwidth는 - 값을 붙임(작으면 좋으니???)
		var bWeight = -1;
		var jWeight = 2.5;
		var dWeight = 1.5;
		var pWeight = 0.5;

		//인접행렬의 '99999'값을 빼고 데이터를 추출함 각각의 배열은 추출배열!
		var bAry = [];
		var jAry = [];
		var dAry = [];
		var pAry = [];
		//console.log(bandwidth_matrix);
		for(var i=0; i<switchCnt; i++){
			for(var j=0; j<switchCnt; j++){
				if(bandwidth_matrix[i][j] != 99999){
					bAry.push(bandwidth_matrix[i][j])
				}
				if(jitter_matrix[i][j] != 99999){
					jAry.push(jitter_matrix[i][j])
				}
				if(delay_matrix[i][j] != 99999){
					dAry.push(delay_matrix[i][j])
				}
				if(packetloss_matrix[i][j] != 99999){
					pAry.push(packetloss_matrix[i][j])
				}
			}
		}
		console.log('평균값을 출력하겠습니다... AVG!');
		console.log(math.sum(bAry)/bAry.length);
		console.log(math.sum(jAry)/jAry.length);
		console.log(math.sum(dAry)/dAry.length);
		console.log(math.sum(pAry)/pAry.length);
		console.log('표준편차 값을 출력하겠습니다...STD!');
		console.log(math.std(bAry));
		console.log(math.std(jAry));
		console.log(math.std(dAry));
		console.log(math.std(pAry));

		var bStd = math.std(bAry);
		var jStd = math.std(jAry);
		var dStd = math.std(dAry);
		var pStd = math.std(pAry);

		var bAvg = math.sum(bAry)/bAry.length;
		var jAvg = math.sum(jAry)/jAry.length;
		var dAvg = math.sum(dAry)/dAry.length;
		var pAvg = math.sum(pAry)/pAry.length;

		var QosArray = new Array(switchCnt);
		for(var idx = 0; idx < switchCnt; idx++){
			QosArray[idx] = new Array(switchCnt);
		}
		for(var i=0; i<switchCnt; i++){
			//var tempAry = [];
			for(var j=0; j<switchCnt; j++){

				if(bandwidth_matrix[i][j] != 99999){
					//계산공식 (각 표본값 - 평균 / 표준편차 )
					var pushData = 	math.square(((bandwidth_matrix[i][j]-bAvg)/bStd*bWeight)) +
													math.square(((jitter_matrix[i][j]-jAvg)/jStd*jWeight)) +
													math.square(((delay_matrix[i][j]-dAvg)/dStd*dWeight)) +
													math.square(((packetloss_matrix[i][j]-pAvg)/pStd*pWeight))
					//tempAry.push(pushData)
					QosArray[i][j] = parseFloat(pushData.toFixed(3));
				}else {
					QosArray[i][j] = 99999
					//tempAry.push(9999)
				}
			}
			//QosArray.push(QosArray)
		}
		//구현된 QosArray
		//console.log(QosArray);
		return QosArray;


	}
	function dikstra(graph, startPoint, endPoint){

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
		//console.log(historyPath);
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
