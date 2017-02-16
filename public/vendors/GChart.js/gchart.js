//Made By.. 2017-02-16 Denial KIM
google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
        var data = google.visualization.arrayToDataTable([
          ['Date', 'NetWorkA', 'NetWorkB'],
          ['2016-02-14',  1000,      400],
          ['2016-02-15',  1170,      460],
          ['2016-02-16',  660,       1120],
          ['2016-02-17',  1030,      540]
        ]);

        var options = {
          curveType: 'function',
          legend: { position: 'bottom' }
        };

        var chart = new google.visualization.LineChart(document.getElementById('gchart'));

        chart.draw(data, options);
      }
