module.exports = function(app, fs, http, Log)
{
	var moment = require('moment');

	app.post('/path', function(req,res){
		console.time('optimum');
		var generation = 1;
		var allTopologyInfo = req.body['node'];
		var switchCnt = 20;
		var topoMatrix = setTopologyMatrix(allTopologyInfo.slice(0), switchCnt);
		var bandwidth_matrix = setQoSMatrix(allTopologyInfo, switchCnt, 'bandwidth');
		var jitter_matrix = setQoSMatrix(allTopologyInfo, switchCnt, 'jitter');
		var delay_matrix = setQoSMatrix(allTopologyInfo, switchCnt, 'delay');
		var packetloss_matrix = setQoSMatrix(allTopologyInfo, switchCnt, 'packetloss');
		var QoS_matrix = [];
		console.log(bandwidth_matrix);
		QoS_matrix.push(bandwidth_matrix);
		QoS_matrix.push(jitter_matrix);
		QoS_matrix.push(delay_matrix);
		QoS_matrix.push(packetloss_matrix);
		var chromosomes = [];
		var geneCnt =0;

		var appRequirement=[];
		appRequirement.push({
			"bandwidth":80,
			"delay":0.3,
			"jitter":0.4,
			"packetloss":10
		});

		while(chromosomes.length < 10){
			var initGene = initPopulation(topoMatrix);
			if(!isExistGene(chromosomes, initGene)){
				chromosomes.push(initGene);
				geneCnt++;
			}
			console.log("gene make : "+initGene);
		}
		console.log(chromosomes);

		var selection_paths = selection(chromosomes, QoS_matrix, appRequirement);
		var offspring_path = [];
		console.log(selection_paths);
		for(var i=0; i<selection_paths.length; i++){
			offspring_path.push(selection_paths[i].path);
		}

		for(var i=0; i<selection_paths.length; i+=2){
			var crossOver_result = crossOver(selection_paths[i].path, selection_paths[i+1].path);
			if(crossOver_result.length >0){
				offspring_path.push(crossOver_result[0]);
				offspring_path.push(crossOver_result[1]);
			}else{
				console.log("---Mutation---");
				while(true){
					var mutation_path = mutation(topoMatrix, selection_paths[i].path);
					if(!isSamePath(selection_paths[i].path, mutation_path)){
						offspring_path.push(mutation_path);
						break;
					}
				}
				while(true){
					var mutation_path = mutation(topoMatrix, selection_paths[i+1].path);
					if(!isSamePath(selection_paths[i+1].path, mutation_path)){
						offspring_path.push(mutation_path);
						break;
					}
				}
			}
		}

		var optimumPath=[];
		var flag = true;
		while(flag){
			generation++;
			for(var i=0; i<offspring_path.length; i++){
				if(fitness(offspring_path[i])){
					optimumPath.push(offspring_path[i]);
					flag = false;
					break;
				}
			}

			selection_paths = selection(offspring_path, QoS_matrix, appRequirement);
			offspring_path = [];

			for(var i=0; i<selection_paths.length; i++){
				offspring_path.push(selection_paths[i]);
			}

			for(var i=0; i<selection_paths.length; i+=2){
				var crossOver_result = crossOver(selection_paths[i].path, selection_paths[i+1].path);
				if(crossOver_result.length >0){
					offspring_path.push(crossOver_result[0]);
					offspring_path.push(crossOver_result[1]);
				}else{
					console.log("---Mutation---");
					while(true){
						var mutation_path = mutation(topoMatrix, selection_paths[i].path);
						if(!isSamePath(selection_paths[i].path, mutation_path)){
							offspring_path.push(mutation_path);
							break;
						}
					}
					while(true){
						var mutation_path = mutation(topoMatrix, selection_paths[i+1].path);
						if(!isSamePath(selection_paths[i+1].path, mutation_path)){
							offspring_path.push(mutation_path);
							break;
						}
					}
				}
			}
		}
		console.log("---Finish---");
		console.log("Generation : "+generation);
		console.log(optimumPath);
		console.timeEnd('optimum');
		res.json(optimumPath);
	});

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
				matrix[i][j] = 0;
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


	function initPopulation(topoMatrix){
		var cnt = 0;
		var initAllPath = topoMatrix.slice(0);
		var startPoint = 4;
		var prePoint = startPoint;
		var endPoint = 14;
		var visitPath = new Array();
		visitPath.push(startPoint);
		var isVisited = new Array();
		while(visitPath.indexOf(endPoint) == -1){
			var position = Math.floor(Math.random() * 20);
			if(initAllPath[prePoint][position] == 1){	//난수 번호의 토폴로지가 연결되어 있는지
				if(visitPath.indexOf(position) == -1){	//생성하는 경로에 아직 추가안된 부분이라면 추가
					visitPath.push(position);
					prePoint = position;
					isVisited = initAllPath[prePoint].slice(0);
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
		console.log("---CrossOver---");
		var offspring_path = [];
		var cross_point = [];
		var cross_pointSize = 0;
		for(var i=1; i<path1.length-1; i++){
			for(var j=1; j<path2.length-1; j++){
				if(path1[i] == path2[j]){
					if(cross_point.length > 0){
						var pre_i = Number(cross_point[cross_pointSize-1].i);
						var pre_j = cross_point[cross_pointSize-1].j;
						if((pre_i < i) && (pre_j < j)){
							cross_point.push({i,j});
							cross_pointSize++;
						}
					}else{
						cross_point.push({i,j});
						cross_pointSize++;
					}
				}
			}
		}
		console.log("CrossOver Point >>");
		console.log(cross_point);
		if(cross_point.length >= 2){
			var position = Math.floor(Math.random() * cross_point.length);
			var x1 = cross_point[position].i;
			var y1 = cross_point[position].j;
			var convert_path1 = path1.slice(0,x1).concat(path2.slice(y1,path2.length));
			var convert_path2 = path2.slice(0,y1).concat(path1.slice(x1,path1.length));

			if(!isSamePath(path1, convert_path1)){
				offspring_path.push(convert_path1);
			}
			if(!isSamePath(path2, convert_path2)){
				offspring_path.push(convert_path2);
			}
		}
		return offspring_path;
	}

	function existCheckGene(ge) {
		return ge > 0;
	}


	function mutation(topoMatrix, path){
		var allPath = topoMatrix.slice(0);
		var path_len = path.length-2;
		console.log(path);
		var startPoint = Math.floor(Math.random() * (path_len/2) + 1);
		var endPoint = Math.floor(Math.random() * (path_len/2) + 1) + Math.floor(path_len/2);
		while(true){
			if(startPoint == endPoint){
				startPoint = Math.floor(Math.random() * (path_len/2) + 1);
				endPoint = Math.floor(Math.random() * (path_len/2) + 1) + Math.floor(path_len/2);
			}else if(startPoint < endPoint){
				var temp = endPoint;
				endPoint = startPoint;
				startPoint = temp;
			}else{
				break;
			}
		}
		var cnt = 0;
		var visitPath = new Array();
		var prePoint = path[startPoint];
		var backup_endPath = path.slice(endPoint, path.length);

		for(var i=0; i<=startPoint; i++){
			visitPath.push(path[i]);
			if(i!=0){
				allPath[path[i-1]][path[i]]	= 0;
				allPath[path[i]][path[i-1]]	= 0;
			}
		}
		while(visitPath.indexOf(path[endPoint]) == -1){
			if(allPath[prePoint][path[endPoint]] == 1){
				break;
			}


			var candidateNode = [];
			for(var i=0; i<allPath.length; i++){
				if(allPath[prePoint][i] == 1){
					candidateNode.push(i);
				}
			}
			var position = Math.floor(Math.random() * candidateNode.length);
			if(candidateNode.length > 0){
				if(visitPath.indexOf(candidateNode[position]) == -1){
					if(backup_endPath.indexOf(candidateNode[position]) == -1){
						visitPath.push(candidateNode[position]);
						allPath[prePoint][candidateNode[position]] = 0;
						allPath[candidateNode[position]][prePoint] = 0;
						prePoint = candidateNode[position];
						cnt = 0;
					}else{
						cnt++;
					}
				}else{
					cnt++;
				}
				if(cnt > 50){
					startPoint = Math.floor(Math.random() * path_len + 1);
					endPoint = Math.floor(Math.random() * (path_len/2) + 1) + Math.floor(path_len/2);
					while(true){
						if(startPoint == endPoint){
							startPoint = Math.floor(Math.random() * (path_len/2) + 1);
							endPoint = Math.floor(Math.random() * (path_len/2) + 1) + Math.floor(path_len/2);
						}else if(startPoint < endPoint){
							var temp = endPoint;
							endPoint = startPoint;
							startPoint = temp;
						}else{
							break;
						}
					}

					visitPath = [];
					prePoint = path[startPoint];
					allPath = topoMatrix.slice(0);
					for(var i=0; i<=startPoint; i++){
						visitPath.push(path[i]);
						if(i!=0){
							allPath[path[i-1]][path[i]]	= 0;
							allPath[path[i]][path[i-1]]	= 0;
						}
					}
				}
			}else{
				startPoint = Math.floor(Math.random() * path_len + 1);
				endPoint = Math.floor(Math.random() * (path_len/2) + 1) + Math.floor(path_len/2);
				while(true){
					if(startPoint == endPoint){
						startPoint = Math.floor(Math.random() * (path_len/2) + 1);
						endPoint = Math.floor(Math.random() * (path_len/2) + 1) + Math.floor(path_len/2);
					}else if(startPoint < endPoint){
						var temp = endPoint;
						endPoint = startPoint;
						startPoint = temp;
					}else{
						break;
					}
				}
				visitPath = [];
				prePoint = path[startPoint];
				allPath = topoMatrix.slice(0);
				for(var i=0; i<=startPoint; i++){
					visitPath.push(path[i]);
					if(i!=0){
						allPath[path[i-1]][path[i]]	= 0;
						allPath[path[i]][path[i-1]]	= 0;
					}
				}
				cnt = 0;
			}
		}

		for(var i=endPoint; i<path.length; i++ ){
			visitPath.push(path[i]);
		}
		console.log("Mutation Point >> Start : "+startPoint+','+"End :"+endPoint );
		return visitPath;
	}

	function isSamePath(prePath, postPath){
		if(prePath.length == postPath.length){
			for(var i=1; i<prePath.length-1; i++){
				if(prePath[i] != postPath[i]){
					return false;
				}
			}
			return true;
		}
		return false;
	}

	function selection(chmos, qos, appReq){
		var selection_result = new Array();
		for(var i=0; i<chmos.length; i++){
			var bandwidth_fitness = 0;
			var delay_fitness = 0;
			var jitter_fitness = 0;
			var packetloss_fitness = 0;
			for(var j=0; j<chmos[i].length-1;j++){
				var x = chmos[i][j];
				var y = chmos[i][j+1];
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
			bandwidth_fitness /= chmos.length;
			delay_fitness /= chmos.length;
			jitter_fitness /= chmos.length;
			packetloss_fitness /= chmos.length;

			selection_result.push({
				"path" : chmos[i],
				"path_len" : chmos[i].length,
				"bandwidth" : bandwidth_fitness,
				"delay" : delay_fitness,
				"jitter" : jitter_fitness,
				"packetloss" : packetloss_fitness,
				"total" : (bandwidth_fitness+delay_fitness+jitter_fitness+packetloss_fitness),
				"rank" : 1
			});
		}

		console.log(selection_result);

		for(var i=0; i<chmos.length; i++){
			for(var j=0; j<chmos.length; j++){
				if(selection_result[i].total < selection_result[j].total){
					selection_result[i].rank +=1;
				}
			}
		}
		selection_result.sort(function(a, b){return b.total-a.total});
		var select_cnt = 0;

		var selection_path = [];
		for(var i=0; i<4; i++){
			selection_path.push(selection_result[i]);
		}

		return selection_path;
	}

	function fitness(offspring_path){
		if(offspring_path.total >= 4){
			return true;
		}
		return false;
	}
}
