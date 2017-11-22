/**
 * Created by wanpeng on 11/22/2016.
 */

function generateHistoryChart(arr) {

    Highcharts.chart('history_container', {

        chart: {
            type: 'heatmap',
            marginTop: 0,
            marginBottom: 0,
            plotBorderWidth: 1,
            height: 150
        },

        credits: {
            enabled: false
        },


        title: {
            text: ''
        },

        xAxis: {
            labels:{
                enabled:false
            }
        },

        yAxis: {

            title: null,

            labels:{
                enabled:false
            }
        },

        colorAxis: {
            //min: 0,
            minColor: '#FF6384',
            maxColor: '#01a982'
        },

        legend: {
            enable: true,
            align: 'right',
            layout: 'vertical'
        },


        tooltip: {
            formatter: function () {
                return 'Status: <b>' + this.point.status + '</b><br>Build: <b>' + this.point.build + '</b><br>Defect: <b>' + this.point.defectid + '</b><br>Exception: <b>' + this.point.exception + '</b>';
            }
        },

        series: [{
            type: 'heatmap',
            //name: 'test status',
            borderWidth:1,
            borderColor: "#ffffff",
            data: constrctHistoryData(arr),
            dataLabels: {
                enabled: false,
                color: '#000000'
            }
        }]

    });
}

function constrctHistoryData(source){
    for(var i=0; i<100; i++){
        if(source[i]){
            source[i].value = i;
            if (source[i].status == "Pass"){
                source[i].color = "#01a982";
            }
            else if (source[i].status == "Fail"){
                source[i].color = "#FF6384";
            }
            else if (source[i].status == "Warning"){
                source[i].color = "#ffcc00";
            }
            //source[i].color = (source[i].status == "Pass")? "#01a982" : "#FF6384";
        }
        else{
            source[i] = {
                id : null,
                cycleid: null,
                browser: null,
                status: null,
                exception: null,
                build: null,
                defectid: null,
                value: i,
                color: "#d9d9d9",
                x: null,
                y: null
            }
        }

        if (i<20){
            source[i].x = i;
            source[i].y = 4;
        }
        else if (20<=i && i<40){
            source[i].x = i-20;
            source[i].y = 3;
        }
        else if (40<=i && i<60){
            source[i].x = i-40;
            source[i].y = 2;
        }
        else if (60<=i && i<80){
            source[i].x = i-60;
            source[i].y = 1;
        }
        else if (80<=i && i<100){
            source[i].x = i-80;
            source[i].y = 0;
        }

    }
    console.log(source);
    return source;
}
