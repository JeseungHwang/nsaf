module.exports = function(app, fs, http)
{
	var basicOptions = {
	    hostname: '192.168.56.104',
	    port: '8080',
	    headers: {
	    	'Content-Type' : 'application/json'
	    }
	};
	app.get('/topology', function(req,res){
        var result='';
        var restOptions = basicOptions;
        restOptions['method'] = 'GET';
        restOptions['path'] = '/wm/device/';

		http.request(restOptions, function(response){
			var str = '';
			response.on('data', function (chunk) {

				str += chunk;
			});
			response.on('end', function () {
					//Parse..
					console.log(str);
			    res.json(JSON.parse(str));
			});
		}).end();


	});
	app.get('/topologyswitch', function(req,res){
				var result='';
				var restOptions = basicOptions;
				restOptions['method'] = 'GET';
				restOptions['path'] = '/wm/topology/links/json';

		http.request(restOptions, function(response){
			var str = '';
			response.on('data', function (chunk) {

				str += chunk;
			});
			response.on('end', function () {
					//Parse..
					console.log(str);
					res.json(JSON.parse(str));
			});
		}).end();


	});

	app.get('/Switch', function(req,res){
        var result = [];
        var restOptions = basicOptions;
        restOptions['method'] = 'GET';
        restOptions['path'] = '/wm/core/switch/all/desc/json';

        http.request(restOptions, function(response){
			var str = '';
			response.on('data', function (chunk) {
				str += chunk;
			});
			response.on('end', function () {
				result.push(JSON.parse(str));

				restOptions['path'] = '/wm/core/switch/all/port-desc/json';
				http.request(restOptions, function(response){
					var str = '';
					response.on('data', function (chunk) {
						str += chunk;
					});
					response.on('end', function () {
						result.push(JSON.parse(str));

						restOptions['path'] = '/wm/core/controller/switches/json';
						http.request(restOptions, function(response){
							var str = '';
							response.on('data', function (chunk) {
								str += chunk;
							});
							response.on('end', function () {
								var res_data = JSON.parse(str);
								var jsonObj = {};
								for(var i=0; i<res_data.length;i++){
									var obj_name = res_data[i].switchDPID.substring(0,25);
									jsonObj[obj_name] = res_data[i];
								}
								result.push(jsonObj);
							    res.json(result);
							});
						}).end();
					});
				}).end();
			});
		}).end();
    });
}
