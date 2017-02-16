module.exports = function(app, fs, mysql, connection)
{
    app.get('/Application', function(req,res){
        var result=[];
        var sql = 'SELECT ap.APP_ID, si.SVC_NM, ap.APP_NM, me.MEM_ID, me.MEM_NM, ap.APP_RESED, ap.APP_LAST_UDDT, ap.APP_BANDWIDTH, ap.APP_JITTER, ap.APP_DELAY, ap.APP_LOSS, ap.APP_AVAILABILITY, ap.APP_SECURITY, ns.NSLA_BANDWIDTH, ns.NSLA_JITTER, ns.NSLA_DELAY, ns.NSLA_LOSS, ns.NSLA_AVAILABILITY, ns.NSLA_SECURITY FROM app_profile As ap INNER JOIN member AS me on ap.MEM_ID = me.MEM_ID INNER JOIN service_info AS si on ap.SVC_TYPE = si.SVC_TYPE INNER JOIN nsla as ns on ap.NSLA_ID = ns.NSLA_ID';
        var query = connection.query(sql, function(err,rows){
            fs.readFile( __dirname + "/../data/app_profile.json", 'utf8',  function(err, data){
                for(var i=0;i<rows.length;i++){
                    var dataObj = JSON.parse(data);
                    dataObj.ID = rows[i].APP_ID;
                    dataObj.TYPE = rows[i].TYPE;
                    dataObj.NAME = rows[i].NAME;
                    dataObj.ADMIN.ID = rows[i].MEM_ID;
                    dataObj.ADMIN.NAME = rows[i].MEM_NM;
                    dataObj.REG_DATE = rows[i].APP_RESED;
                    dataObj.LAST_UPDATE = rows[i].APP_LAST_UDDT;
                    dataObj.REQUIREMENT.BANDWIDTH = rows[i].APP_BANDWIDTH;
                    dataObj.REQUIREMENT.JITTER = rows[i].APP_JITTER;
                    dataObj.REQUIREMENT.LOSS = rows[i].APP_LOSS;
                    dataObj.REQUIREMENT.DELAY = rows[i].APP_DELAY;
                    dataObj.REQUIREMENT.AVAILABILITY = rows[i].APP_AVAILABILITY;
                    dataObj.REQUIREMENT.SECURITY = rows[i].APP_SECURITY;
                    dataObj.NSLA.BANDWIDTH = rows[i].NSLA_BANDWIDTH;
                    dataObj.NSLA.JITTER = rows[i].NSLA_JITTER;
                    dataObj.NSLA.LOSS = rows[i].NSLA_LOSS;
                    dataObj.NSLA.DELAY = rows[i].NSLA_DELAY;
                    dataObj.NSLA.AVAILABILITY = rows[i].NSLA_AVAILABILITY;
                    dataObj.NSLA.SECURITY = rows[i].NSLA_SECURITY;
                    result.push(dataObj);
               }
               res.json(result);
            })
        });
    });

    app.get('/Application/:appid', function(req,res){
        var result;
        var sql = 'SELECT ap.APP_ID, si.SVC_NM, ap.APP_NM, me.MEM_ID, me.MEM_NM, ap.APP_RESED, ap.APP_LAST_UDDT, ap.APP_BANDWIDTH, ap.APP_JITTER, ap.APP_DELAY, ap.APP_LOSS, ap.APP_AVAILABILITY, ap.APP_SECURITY, ns.NSLA_BANDWIDTH, ns.NSLA_JITTER, ns.NSLA_DELAY, ns.NSLA_LOSS, ns.NSLA_AVAILABILITY, ns.NSLA_SECURITY FROM app_profile As ap INNER JOIN member AS me on ap.MEM_ID = me.MEM_ID INNER JOIN service_info AS si on ap.SVC_TYPE = si.SVC_TYPE INNER JOIN nsla as ns on ap.NSLA_ID = ns.NSLA_ID';
        var query = connection.query(sql+' where ap.APP_ID='+mysql.escape(req.params.appid), function(err,rows){
            //app_profile.json 파일을 읽어와 DB query값과 매핑
            if (err){
              res.send('error')
              return
            }
            if (rows.length != 0){
              fs.readFile( __dirname + "/../data/app_profile.json", 'utf8',  function(err, data){
                  result = JSON.parse(data);
                  result.ID = rows[0].APP_ID;
                  result.TYPE = rows[0].TYPE;
                  result.NAME = rows[0].NAME;
                  result.ADMIN.ID = rows[0].MEM_ID;
                  result.ADMIN.NAME = rows[0].MEM_NM;
                  result.REG_DATE = rows[0].APP_RESED;
                  result.LAST_UPDATE = rows[0].APP_LAST_UDDT;
                  result.REQUIREMENT.BANDWIDTH = rows[0].APP_BANDWIDTH;
                  result.REQUIREMENT.JITTER = rows[0].APP_JITTER;
                  result.REQUIREMENT.LOSS = rows[0].APP_LOSS;
                  result.REQUIREMENT.DELAY = rows[0].APP_DELAY;
                  result.REQUIREMENT.AVAILABILITY = rows[0].APP_AVAILABILITY;
                  result.REQUIREMENT.SECURITY = rows[0].APP_SECURITY;
                  result.NSLA.BANDWIDTH = rows[0].NSLA_BANDWIDTH;
                  result.NSLA.JITTER = rows[0].NSLA_JITTER;
                  result.NSLA.LOSS = rows[0].NSLA_LOSS;
                  result.NSLA.DELAY = rows[0].NSLA_DELAY;
                  result.NSLA.AVAILABILITY = rows[0].NSLA_AVAILABILITY;
                  result.NSLA.SECURITY = rows[0].NSLA_SECURITY;
                  //res.json(result);
              })
              res.send('ture')
            }else {
              res.send('false');
            }
        });
    });

    app.post('/Application', function(req, res){

        var result = {};

        fs.readFile( __dirname + "/../data/user.json", 'utf8',  function(err, data){
            var users = JSON.parse(data);
            if(users[username]){
                // DUPLICATION FOUND
                result["success"] = 0;
                result["error"] = "duplicate";
                res.json(result);
                return;
            }

            // ADD TO DATA
            users[username] = req.body;

            // SAVE DATA
            fs.writeFile(__dirname + "/../data/user.json",
                         JSON.stringify(users, null, '\t'), "utf8", function(err, data){
                result = {"success": 1};
                res.json(result);
            })
        })
    });
    app.post('/Application/registprofile', function(req, res){
      console.log(req.body);
    })








     /*app.get('/',function(req,res){
         var sess = req.session;
          res.render('index', {
             title: "MY HOMEPAGE",
             length: 5,
             name: sess.name,
             username: sess.username
         })
     });


    app.post('/addUser/:username', function(req, res){

        var result = {  };
        var username = req.params.username;

        // CHECK REQ VALIDITY
        if(!req.body["password"] || !req.body["name"]){
            result["success"] = 0;
            result["error"] = "invalid request";
            res.json(result);
            return;
        }

        // LOAD DATA & CHECK DUPLICATION
        fs.readFile( __dirname + "/../data/user.json", 'utf8',  function(err, data){
            var users = JSON.parse(data);
            if(users[username]){
                // DUPLICATION FOUND
                result["success"] = 0;
                result["error"] = "duplicate";
                res.json(result);
                return;
            }

            // ADD TO DATA
            users[username] = req.body;

            // SAVE DATA
            fs.writeFile(__dirname + "/../data/user.json",
                         JSON.stringify(users, null, '\t'), "utf8", function(err, data){
                result = {"success": 1};
                res.json(result);
            })
        })
    });

    app.put('/updateUser/:username', function(req, res){

        var result = {  };
        var username = req.params.username;

        // CHECK REQ VALIDITY
        if(!req.body["password"] || !req.body["name"]){
            result["success"] = 0;
            result["error"] = "invalid request";
            res.json(result);
            return;
        }

        // LOAD DATA
        fs.readFile( __dirname + "/../data/user.json", 'utf8',  function(err, data){
            var users = JSON.parse(data);
            // ADD/MODIFY DATA
            users[username] = req.body;

            // SAVE DATA
            fs.writeFile(__dirname + "/../data/user.json",
                         JSON.stringify(users, null, '\t'), "utf8", function(err, data){
                result = {"success": 1};
                res.json(result);
            })
        })
    });


    app.delete('/deleteUser/:username', function(req, res){
        var result = { };
        //LOAD DATA
        fs.readFile(__dirname + "/../data/user.json", "utf8", function(err, data){
            var users = JSON.parse(data);

            // IF NOT FOUND
            if(!users[req.params.username]){
                result["success"] = 0;
                result["error"] = "not found";
                res.json(result);
                return;
            }

            // DELETE FROM DATA
            delete users[req.params.username];

            // SAVE FILE
            fs.writeFile(__dirname + "/../data/user.json",
                         JSON.stringify(users, null, '\t'), "utf8", function(err, data){
                result["success"] = 1;
                res.json(result);
                return;
            })
        })
    });



    app.get('/login/:username/:password', function(req, res){
        var sess;
        sess = req.session;

        fs.readFile(__dirname + "/../data/user.json", "utf8", function(err, data){
            var users = JSON.parse(data);
            var username = req.params.username;
            var password = req.params.password;
            var result = {};
            if(!users[username]){
                // USERNAME NOT FOUND
                result["success"] = 0;
                result["error"] = "not found";
                res.json(result);
                return;
            }

            if(users[username]["password"] == password){
                result["success"] = 1;
                sess.username = username;
                sess.name = users[username]["name"];
                res.json(result);

            }else{
                result["success"] = 0;
                result["error"] = "incorrect";
                res.json(result);
            }
        })
    });

    app.get('/logout', function(req, res){
        sess = req.session;
        if(sess.username){
            req.session.destroy(function(err){
                if(err){
                    console.log(err);
                }else{
                    res.redirect('/');
                }
            })
        }else{
            res.redirect('/');
        }
    });*/
}
