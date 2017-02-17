var express = require('express');
var path = require('path');
var app = express();				        //서버 생성
var bodyParser = require('body-parser');	//
var app = express();
var session = require('express-session');	//세션 관련
var fs = require("fs");						//JSON 파일
var mysql = require('mysql');				//mysql 관련
var http = require('http');					//HTTP 통신 관련


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


app.use(express.static(path.join( __dirname + '/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var server = app.listen(8080, function(){
 console.log("Express server has started on port 8080")
});

//mysql 연결하기 위한 정보
var connection = mysql.createConnection({
    host :'164.125.70.15',
    port : 3306,
    user : 'sdn',
    password : 'se35363650',
    database:'nsaf'
});

//mysql 연결 시도
connection.connect(function(err) {
    if (err) {
        console.error('mysql connection error');
        console.error(err);
        throw err;
    }
});

//REST 요청에 따른 Router 등록
var r_application = require('./router/application_router')(app, fs, mysql, connection);
var r_switch = require('./router/switch_router')(app, fs, http);
var r_logging = require('./router/logging_router')(app, fs, http);
