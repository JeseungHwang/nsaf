module.exports = function(app, fs, http)
{
	var basicOptions = {
	    hostname: '192.168.56.104',
	    port: '8080',
	    headers: {
	    	'Content-Type' : 'application/json'
	    }
	};

	app.get('/Host', function(req,res){
        var result = [];
        var restOptions = basicOptions;
        restOptions['method'] = 'GET';
        restOptions['path'] = '/wm/device/';

        http.request(restOptions, function(response){
			var str = '';
			response.on('data', function (chunk) {
				str += chunk;
			});
			response.on('end', function () {
				
			    res.json(JSON.parse(str));
			});
		}).end();
    });
}