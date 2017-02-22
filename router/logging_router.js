module.exports = function(app, fs, http, Log)
{
	var moment = require('moment');

	function getDateTime(){
		return moment().format('YYYY-MM-DD hh:mm:ss');
	}

	app.post('/log', function(req,res){
		var log = new Log();
        var result='';

        log.timestamp = getDateTime();
	    log.logtype = 'INFO';
	    log.subject = 'test01';
	    log.message = req.body.log;

        /*log.save(function(err){
			if(err){
				console.error(err);
				res.json({result: 0});
				return;
	        }else{
	        	console.log("success");
	        	res.json({result: 1});	
	        }
	    });*/
    });
}