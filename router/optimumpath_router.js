module.exports = function(app, fs, http, Log)
{
	var moment = require('moment');

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
			if(!isNaN(dst)){
				matrix[src-1][dst-1]=1;
			}
		}
		return matrix;
	}

	function setQoSMatrix(req_data, cnt, qos){
		var matrix = new Array(cnt);
		for(var i=0; i<cnt; i++){
			matrix[i] = new Array(cnt);
			for(var j=0; j<cnt; j++){
				matrix[i][j] = 0;
			}
		}
		for(var obj in req_data){
			var src = parseInt(req_data[obj].switchDPID.substring(req_data[obj].switchDPID.length-2, req_data[obj].switchDPID.length));
			var dst = parseInt(req_data[obj].dst.substring(req_data[obj].dst.length-2, req_data[obj].dst.length));
			if(!isNaN(dst)){
				matrix[src-1][dst-1] = req_data[obj][qos];
			}
		}
		return matrix;
	}


	function initPopulation(topoMatrix){
		var startPoint = 4;
		var prePoint = startPoint;
		var endPoint = 8;
		var visitPath = new Array();
		visitPath.push(startPoint);
		var isVisited = new Array();

		while(visitPath.indexOf(endPoint) == -1){
			var position = Math.floor(Math.random() * 10);
			if(topoMatrix[prePoint][position] == 1){	//난수 번호의 토폴로지가 연결되어 있는지
				if(visitPath.indexOf(position) == -1){	//생성하는 경로에 아직 추가안된 부분이라면 추가
					visitPath.push(position);
					prePoint = position;
					isVisited = topoMatrix[prePoint];
					isVisited[position] = 0;
				}else{	//방문했던 경로라면 isVisited에 표시
					isVisited[position] = 0;
				}
			}
			if(isAllVisted(isVisited)){	//주변을 다 방문하고 갇혔는지 판별하는 부분
				visitPath = [];
				visitPath.push(startPoint);
				prePoint = startPoint;
				isVisited = [];
			}
		}
		return visitPath;
	}

	function isAllVisted(path) {
		var isAll = true;
		for(var i=0; i<path.length; i++){
			if(path[i] == 1){	//방문 안한곳이 있다면 아직 방문할수 있으므로 false
				isAll = false;
			}
		}
	   return isAll;
	}

	function getOrderedPath(){
		var orderedPath = [];
	}

	function calculateFitness(genes, qos, appReq){
		console.log(genes);
		/*console.log(genes[0].length);
		console.log(genes[0][0]+","+genes[0][1]);
		console.log(qos[0][0][1]);*/
		for(var i=0; i<genes.length; i++){
			for(var j=0; j<genes[i].length-1;j++){
				//console.log(genes[i][j] +","+genes[i][j+1]);
				//console.log(qos[0][genes[i][j]-1][genes[i][j+1]-1]);
			}
		}
	}

	function isExistGene(genes, initGene){
		for(var i=0; i<genes.length; i++){
			if(genes[i].length == initGene.length){
				var checkList = new Array();
				for(var j=0; j<genes[i].length; j++){
					if(genes[i][j] == initGene[j]){
						checkList.push(1);
					}else{
						checkList.push(0);
					}
				}
				if(checkList.every(existCheckGene)){
					return true;
				}
			}
		}
	}

	function existCheckGene(ge) {
	    return ge > 0;
	}

	app.post('/path', function(req,res){
		var allTopologyInfo = req.body['node'];
		var switchCnt = 10;
		var topoMatrix = setTopologyMatrix(allTopologyInfo, switchCnt);
		var bandwidth_matrix = setQoSMatrix(allTopologyInfo, switchCnt, 'bandwidth');
		var jitter_matrix = setQoSMatrix(allTopologyInfo, switchCnt, 'jitter');
		var delay_matrix = setQoSMatrix(allTopologyInfo, switchCnt, 'delay');
		var packetloss_matrix = setQoSMatrix(allTopologyInfo, switchCnt, 'packetloss');
		var QoS_matrix = [];
		/*QoS_matrix.push(bandwidth_matrix);
		QoS_matrix.push(jitter_matrix);
		QoS_matrix.push(delay_matrix);
		QoS_matrix.push(packetloss_matrix);*/
		var genes = [];
		while(genes.length < 5){
			var initGene = initPopulation(topoMatrix);
			if(!isExistGene(genes, initGene)){
				genes.push(initGene);
			}
		}
		//console.log(genes);
		var appRequirement=[];
		appRequirement.push({
			"bandwidth":100,
			"delay":0.5,
			"jitter":0.4,
			"packetloss":10
		});
		calculateFitness(genes, QoS_matrix,appRequirement);
		res.json("ho");
	});
}