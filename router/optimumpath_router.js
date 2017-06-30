module.exports = function(app, fs, http, Log)
{
	var moment = require('moment');

	app.post('/path', function(req,res){
		console.time('runtime');
		var generation = 1;
		var allTopologyInfo = req.body['node'];
		var switchCnt = 30;
		var startPoint = 2;
		var endPoint = 28;
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
		var chromosomes = [];
		var geneCnt =0;

		var appRequirement=[];
		appRequirement.push({
         "bandwidth":60,
         "delay":30.0,
         "jitter":30.0,
         "packetloss":30
		});

		while(chromosomes.length <10){
			var initGene = initPopulation(startPoint, endPoint, topoMatrix, switchCnt);
			if(!isExistGene(chromosomes, initGene)){
				chromosomes.push(initGene);
				geneCnt++;
			}
			//console.log("gene make : "+initGene);
		}
		console.log('---Initialization---');
		console.log(chromosomes);

		console.log('---Selection---');
		var selection_paths = selection(chromosomes, QoS_matrix, appRequirement);
		var offspring_path = [];
		//console.log(selection_paths);
		for(var i=0; i<selection_paths.length; i++){
			offspring_path.push(selection_paths[i].path);
		}
		console.log(offspring_path);
		var offpsringSize = offspring_path.length;

		console.log('---Operator---');
		for(var i=0; i<offpsringSize; i+=2){
			var crossOver_result = crossOver(offspring_path[i], offspring_path[i+1]);
			console.log(crossOver_result);

			if(crossOver_result.length != 0){
				offspring_path.push(crossOver_result[0]);
				offspring_path.push(crossOver_result[1]);
			}else{
				console.log("---Mutation---");
				while(true){
					var mutation_path = mutation(topoMatrix, offspring_path[i]);
					if(!isSamePath(offspring_path[i], mutation_path)){
						if(mutation_path.length != 0){
							console.log("Muation Result");
							console.log("Before : " + offspring_path[i]);
							offspring_path.push(mutation_path);
							console.log("After : " + mutation_path);
						}
						break;
					}
				}
				while(true){
					var mutation_path = mutation(topoMatrix, offspring_path[i+1]);
					if(!isSamePath(offspring_path[i+1], mutation_path)){
						if(mutation_path.length != 0){
							console.log("Muation Result");
							console.log("Before : " + offspring_path[i+1]);
							offspring_path.push(mutation_path);
							console.log("After : " + mutation_path);
						}
						break;	
					}
				}
			}
		}
		//console.log(offspring_path);
		var optimumPath=[];
		var flag = true;
		while(flag){
			generation++;
			selection_paths = selection(offspring_path, QoS_matrix, appRequirement);
			for(var i=0; i<selection_paths.length; i++){
				if(fitness(selection_paths[i])){	// 추천된 경로가 fitness 적절하다면 OPtimum Path로 등록
						/*console.log(fitness(selection_paths[i]));
						console.log(optimumPath);
						console.log(optimumPath.length);*/
					if(optimumPath.length >0){
						//for(var j=0; j<optimumPath.length; j++){
						//	if(!isSamePath(optimumPath[j], selection_paths[i])){
								optimumPath.push(selection_paths[i]);

						//	}	
						//}	
					}else{
						optimumPath.push(selection_paths[i]);
					}
				}
			}
			if(optimumPath.length > 1){
				flag = false;
				break;
			}

			console.log('---Selection---');
			offspring_path = [];
			//console.log(selection_paths);
			for(var i=0; i<selection_paths.length; i++){
				offspring_path.push(selection_paths[i].path);
			}
			//
			console.log(offspring_path);
			offpsringSize = offspring_path.length;

			console.log('---Operator---');
			for(var i=0; i<offpsringSize; i+=2){
				var crossOver_result = crossOver(offspring_path[i], offspring_path[i+1]);
				console.log(crossOver_result);

				if(crossOver_result.length != 0){
					offspring_path.push(crossOver_result[0]);
					offspring_path.push(crossOver_result[1]);
				}else{
					console.log("---Mutation---");
					while(true){
						var mutation_path = mutation(topoMatrix, offspring_path[i]);
						if(!isSamePath(offspring_path[i], mutation_path)){
							if(mutation_path.length != 0){
								console.log("Muation Result");
								console.log("Before : " + offspring_path[i]);
								offspring_path.push(mutation_path);
								console.log("After : " + mutation_path);
							}
							break;
						}
					}
					while(true){
						var mutation_path = mutation(topoMatrix, offspring_path[i+1]);
						if(!isSamePath(offspring_path[i+1], mutation_path)){
							if(mutation_path.length != 0){
								console.log("Muation Result");
								console.log("Before : " + offspring_path[i+1]);
								offspring_path.push(mutation_path);
								console.log("After : " + mutation_path);
							}
							break;	
						}
					}
				}
			}
			console.log('Generation : '+generation);
		}

		console.log("---Finish---");
		console.log("Genetic Algorithm Result");
	    console.log("Generation : "+generation);
	    console.log("Node Count : "+switchCnt);
	    console.log("Start Point : "+startPoint+" / End Point : "+endPoint);
	    console.log("Optimum Path >>> ");

	    for(var i=0 ; i < optimumPath.length; i++){
	    	console.log(optimumPath[i].path);
		    console.log("Bandwidth Score : " +optimumPath[i].bandwidth);
		    console.log("Packetloss Score : " +optimumPath[i].packetloss);
		    console.log("Delay Score : " +optimumPath[i].delay);
		    console.log("Jitter Score : " +optimumPath[i].jitter);
		    console.log("Fitness Score : " + optimumPath[i].total);
		    console.log();
	    }
	    
	    console.timeEnd('runtime');
		res.json('1');
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
			if(!isNaN(dst)){
				matrix[src-1][dst-1]=1;
				matrix[dst-1][src-1]=1;
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
				matrix[dst-1][src-1] = req_data[obj][qos];
			}
		}
		return matrix;
	}


	function initPopulation(startPoint, endPoint, topoMatrix, switchCnt){
		var cnt = 0;
		var initAllPath = topoMatrix.slice(0);
		var prePoint = startPoint;
		var visitPath = new Array();
		visitPath.push(startPoint);
		var isVisited = new Array();
		while(visitPath.indexOf(endPoint) == -1){
			var position = Math.floor(Math.random() * switchCnt);
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
			if(cnt >1000){	//무한 루프 막기위한 방법으로 강제 초기화
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
		console.log(path1);
		console.log(path2);
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
		if(cross_point.length >= 2){
			var position = Math.floor(Math.random() * (cross_point.length-1))+1;
			//var x1 = cross_point[position].i;
			//var y1 = cross_point[position].j;
			var x1 = cross_point[0].i;
			var y1 = cross_point[0].j;
			var x2 = cross_point[position].i;
			var y2 = cross_point[position].j;
			console.log(x1+','+y1);
			console.log(x2+','+y2);
			var convert_path1 = path1.slice(0,x1).concat(path2.slice(y1,y2)).concat(path1.slice(x2, path1.length));
			var convert_path2 = path2.slice(0,y1).concat(path1.slice(x1,x2)).concat(path2.slice(y2, path2.length));
			//var convert_path1 = path1.slice(0,x1).concat(path2.slice(y1,path2.length));
			//var convert_path2 = path2.slice(0,y1).concat(path1.slice(x1,path1.length));

			console.log("CrossOver Result");
			if(!isSamePath(path1, convert_path1)){
				offspring_path.push(convert_path1);
				console.log(offspring_path[0]);
			}
			if(!isSamePath(path2, convert_path2)){
				offspring_path.push(convert_path2);
				console.log(offspring_path[1]);
			}

		}else{
			console.log("CrossOver point not found");
		}
		return offspring_path;
	}

	function existCheckGene(ge) {
		return ge > 0;
	}

	function mutation(topoMatrix, path){
		var allPath = topoMatrix.slice(0);
		var path_len = path.length-2;
		var startPoint = Math.floor(Math.random()*path_len)+1;
		var endPoint = Math.floor(Math.random()*path_len)+1;
		var visitPath = [];
		var endPathBackup = [];
		var loopLimitCnt = 0;
		if(path.length > 3){
			while(true){
				if(startPoint == endPoint){
					endPoint = Math.floor(Math.random()*path_len)+1;
				}else if(startPoint > endPoint){
					var temp = startPoint;
					startPoint = endPoint;
					endPoint = temp;
				}else if(startPoint < endPoint){
					break;
				}
			}
		}else{
			startPoint = 1;
			endPoint = 2;
		}

		for(var i=0; i<startPoint; i++){
			allPath[path[i]][path[i+1]] = 0;
			visitPath.push(path[i]);
		}

		for(var i=endPoint; i<path.length; i++){
			endPathBackup.push(path[i]);
		}

		console.log(path);
		console.log("Mutation Point : "+startPoint+","+endPoint);
		var prePoint = startPoint;
		var flag = true;
		var cnt = 0;
		while(flag){
			cnt++;
			loopLimitCnt++;
			if(allPath[prePoint].indexOf(1) == 1){
				var nowPath = allPath[prePoint].slice(0);

				var availPath = [];
			
				if(nowPath[endPoint] == 1){	//현재 갈수 있는 경로중에 엔드포인트랑 연결이 되어있다면
					if(path[endPoint] != path[path.length-1]){	//엔드포인트가 넘어온 경로의 맨끝이 아닐때 미리 경로 지나온곳 표시
						for(var i=endPoint; i<path.length; i++){
							visitPath.push(path[i]);
						}
					}else{
						visitPath.push(path[endPoint]);
					}
					flag = false;
				}else{	//현재 갈수있는 경로중에 엔드포인트랑 연결이 안되어 있다면
					for(var i=0;i<nowPath.length; i++){
						if(nowPath[i] == 1){
							availPath.push(i);
						}
					}	
					var position = Math.floor(Math.random() * availPath.length);
					if(visitPath.indexOf(availPath[position]) == -1){	//방문한 경로에 현재 랜덤으로 찍힌 경로가 추가되어 있지 않을때
						if(endPathBackup.indexOf(availPath[position]) == -1){
							visitPath.push(availPath[position]);
							allPath[prePoint][availPath[position]] = 0;
							prePoint = availPath[position];	
						}
					}
				}
			}
			//var nowPath= allPath[prePoint].slice(0);


			if(cnt > 100){
				startPoint = Math.floor(Math.random()*path_len)+1;
				endPoint = Math.floor(Math.random()*path_len)+1;
				while(true){
					if(startPoint == endPoint){
						endPoint = Math.floor(Math.random()*path_len)+1;
					}else if(startPoint > endPoint){
						var temp = startPoint;
						startPoint = endPoint;
						endPoint = temp;
					}else if(startPoint < endPoint){
						break;
					}
				}
				allPath = topoMatrix.slice(0);
				prePoint = startPoint;
				cnt = 0;
				visitPath = [];
				for(var i=0; i<startPoint; i++){
					allPath[path[i]][path[i+1]] = 0;
					visitPath.push(path[i]);
				}
			}

			if(loopLimitCnt > 5000){
				visitPath = [];
				flag = false;
			}
		}
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
			var bandwidth_arr = [];
			var delay_fitness = 0;
			var delay_arr = [];
			var jitter_fitness = 0;
			var jitter_arr = [];
			var packetloss_fitness = 0;
			var packetloss_arr = [];
			for(var j=0; j<chmos[i].length-1;j++){
				var x = chmos[i][j];
				var y = chmos[i][j+1];
				if(appReq[0].bandwidth <= qos[0][x][y]){
					bandwidth_fitness+=1;
					bandwidth_arr.push(qos[0][x][y]);
				}else{
					//bandwidth_fitness-=1;
					bandwidth_arr.push(qos[0][x][y]);
				}
				if(appReq[0].jitter >= qos[1][x][y]){
					jitter_fitness+=1;
					jitter_arr.push(qos[1][x][y]);
				}else{
					//jitter_fitness-=1;
					jitter_arr.push(qos[1][x][y]);
				}
				if(appReq[0].delay >= qos[2][x][y]){
					delay_fitness+=1;
					delay_arr.push(qos[2][x][y]);
				}else{
					//delay_fitness-=1;
					delay_arr.push(qos[2][x][y]);
				}
				if(appReq[0].packetloss >= qos[3][x][y]){
					packetloss_fitness+=1;
					packetloss_arr.push(qos[3][x][y]);
				}else{
					//packetloss_fitness-=1;
					packetloss_arr.push(qos[3][x][y]);
				}
			}
			bandwidth_fitness = (bandwidth_fitness/(chmos[i].length-1));
			delay_fitness = (delay_fitness/(chmos[i].length-1));
			jitter_fitness = (jitter_fitness/(chmos[i].length-1));
			packetloss_fitness = (packetloss_fitness/(chmos[i].length-1));

			selection_result.push({
				"path" : chmos[i],
				"path_len" : chmos[i].length,
				"bandwidth" : bandwidth_fitness,
				"delay" : delay_fitness,
				"jitter" : jitter_fitness,
				"packetloss" : packetloss_fitness,
				"total" : (bandwidth_fitness+delay_fitness+jitter_fitness+packetloss_fitness),
				"bandwidth_value" : bandwidth_arr,
				"jitter_value" : jitter_arr,
				"packetloss_value" : packetloss_arr,
				"delay_value" : delay_arr,
				"rank" : 1
			});
		}

		//console.log(selection_result);

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
		for(var i=0; i<8; i++){
			selection_path.push(selection_result[i]);
		}
		return selection_path;
	}

	function fitness(offspring_path){
		if(offspring_path.total >= 4){
			return true;
		}else{
			return false;	
		}
	}
}
