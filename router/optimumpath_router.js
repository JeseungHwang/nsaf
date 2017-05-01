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
	function initPopulation(topoMatrix){
		var startPoint = 4;
		var prePoint = startPoint;
		var endPoint = 8;
		var visitPath = new Array();
		visitPath.push(startPoint);
		while(visitPath.indexOf(endPoint) == -1){
			var flag = true;
			var isVisited = topoMatrix[prePoint];
			while(flag){
				var position = Math.floor(Math.random() * 10);
				if(topoMatrix[prePoint][position] == 1){	//난수 번호의 토폴로지가 연결되어 있는지
					if(visitPath.indexOf(position) == -1){	//경로 구성하는 변수에 이미 입력되었는지
						visitPath.push(position);
						isVisited[prePoint] = 0;
						prePoint = position;
						flag=false;
					}
				}
				if(isVisited.indexOf(1) == 1){
					visitPath = [];
					visitPath.push(startPoint);
				}
			}
		}
		return visitPath;
	}

	function getOrderedPath(){
		var orderedPath = [];
		
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
		var jitter_matrix;
		var delay_matrix;
		var packetloss_matrix;
		var genes = [];
		var geneCnt=0;

		while(geneCnt < 5){
			var initGene = initPopulation(topoMatrix);
			if(!isExistGene(genes, initGene)){
				genes.push(initGene);
				geneCnt++;
			}
		}
		console.log(genes);
		res.json("ho");
	});
}