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
		var cnt = 0;
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
			cnt++;
			if(cnt >50){	//무한 루프 막기위한 방법으로 강제 초기화 
				visitPath = [];
				visitPath.push(startPoint);
				prePoint = startPoint;
				isVisited = [];
				cnt = 0;
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
		var fitness_totalscore = new Array();
		for(var i=0; i<genes.length; i++){
			var bandwidth_fitness = 0;
			var delay_fitness = 0;
			var jitter_fitness = 0;
			var packetloss_fitness = 0;
			for(var j=0; j<genes[i].length-1;j++){
				var x = genes[i][j];
				var y = genes[i][j+1];
				if(appReq[0].bandwidth <= qos[0][x][y]){
					bandwidth_fitness++;
				}else{
					bandwidth_fitness--;
				}
				if(appReq[0].jitter <= qos[1][x][y]){
					jitter_fitness++;
				}else{
					jitter_fitness--;
				}
				if(appReq[0].delay <= qos[2][x][y]){
					delay_fitness++;
				}else{
					delay_fitness--;
				}
				if(appReq[0].packetloss <= qos[3][x][y]){
					packetloss_fitness++;
				}else{
					packetloss_fitness--;
				}
			}
			fitness_totalscore.push({
				"bandwidth" : bandwidth_fitness,
				"delay" : delay_fitness,
				"jitter" : jitter_fitness,
				"packetloss" : packetloss_fitness
			});
		}
		return fitness_totalscore;
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

	function crossOver(path1, path2){
		console.log("CrossOver");
		console.log(path1);
		console.log(path2);
		for(var i=1; i<path1.length-1; i++){
			for(var j=1; j<path2.length-1; j++){
				if(path1[i] == path2[j]){
					console.log("CrossOver Point : "+i+","+j);	
					var str1 = path1.slice(0,i);
					var str2 = path1.slice(i,path1.length);

					var str3 = path2.slice(0,j);
					var str4 = path2.slice(j,path1.length);


					/*console.log(str1.concat(str4));
					console.log(str3.concat(str2));*/
					console.log(path1.slice(0,i).concat(path2.slice(j,path1.length)));
					console.log(path2.slice(0,j).concat(path1.slice(i,path1.length)));
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
		QoS_matrix.push(bandwidth_matrix);
		QoS_matrix.push(jitter_matrix);
		QoS_matrix.push(delay_matrix);
		QoS_matrix.push(packetloss_matrix);
		var genes = [];
		var geneCnt =0;
		while(genes.length < 4){
			var initGene = initPopulation(topoMatrix);
			if(!isExistGene(genes, initGene)){
				genes.push(initGene);
				geneCnt++;
			}
		}

		console.log("total Count :"+geneCnt);
		console.log(genes);
		var appRequirement=[];
		appRequirement.push({
			"bandwidth":80,
			"delay":0.3,
			"jitter":0.4,
			"packetloss":10
		});
		var fittness_score = calculateFitness(genes, QoS_matrix,appRequirement);
		console.log(fittness_score);
		crossOver(genes[0], genes[1]);
		res.json("ho");
	});
}