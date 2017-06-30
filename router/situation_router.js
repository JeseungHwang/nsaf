module.exports = function(app, fs, http, Log)
{

   app.post('/situation', function(req,res){
      console.time('timer');
      var result = [];
      var restOptions = basicOptions;
      restOptions['method'] = 'POST';
      restOptions['path'] = '/NSAF/situation';

      http.request(restOptions, function(response){
        var str = '';

        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', function () {
          result.push(str);
        });
      }).end();

      console.timeEnd('timer');
      res.json(result);
   });

}