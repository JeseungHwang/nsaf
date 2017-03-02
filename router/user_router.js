module.exports = function(app, fs, mysql, connection)
{
    var moment = require('moment');
    
    function getDateTime(){
        return moment().format('YYYY-MM-DD hh:mm:ss');
    }

    app.post('/Login', function(req, res){
        var adminProf = req.body;
        console.log("Login - ID : "+adminProf['adminID']);
        connection.query('SELECT MEM_ID from member where MEM_ID=? && MEM_PW=?', [adminProf['adminID'], adminProf['adminPW']], function(err,result){
        	if (err){
              res.send('로그인 error');
              return;
            }
            if(result.length != 0){
            	res.send('true');	
            }else{
            	res.send('fail');
            }
        });
        
    });
}