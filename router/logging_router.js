module.exports = function(app, fs, http)
{
	app.post('/log', function(req,res){
        var result='';
        console.log(req.body);
		res.json("1");
    });
}