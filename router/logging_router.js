module.exports = function(app, fs, http, Log)
{
	var moment = require('moment');

	function getDateTime(){
		return moment().format('YYYY-MM-DD hh:mm:ss');
	}

	app.get('/log', function(req,res){
		Log.find(function(err, data){
			if(err){ return res.status(500).send({error: 'database failure'}); }
        	else{
        		res.json(data);
        	} 
		}).sort({"timestamp" : -1})
		//DB에서 가져온 쿼리 결과값을 timestamp 내림차순 설정

	});

	app.post('/log', function(req,res){
		var log = new Log();
        var result='';

        log.timestamp = getDateTime();
	    log.logtype = 'INFO';
	    log.subject = 'test01';
	    log.message = req.body.log;
	    //console.log(log);
	    res.json({result: 1});	
        /*log.save(function(err){
			if(err){
				console.error(err);
				res.json({result: 0});
				return;
	        }else{
	        	res.json({result: 1});	
	        }
	    });*/
    });
}