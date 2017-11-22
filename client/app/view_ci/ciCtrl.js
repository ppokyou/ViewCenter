/**
 * Created by wanpeng on 11/22/2016.
 */
app.controller('ciCtrl', ['$scope', '$http', 'uiGridValidateService',
    function ($scope, $http, uiGridValidateService) {
        // side-bar
        $scope.gridBuildList = {
            enableFiltering: true,
            enableSorting: false,
            enableColumnMenus: false,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            enablePaginationControls: false,
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25,
            enableHorizontalScrollbar: 0,
            enableVerticalScrollbar: 0,
            columnDefs: [{
                name: 'tag',
                displayName: 'Build'
            }]
        };

        $scope.gridBuildList.onRegisterApi = function (gridApi) {
            $scope.gridBuildApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                var id = row.entity.id;
                $http.get('http://myd-vm03063.hpeswlab.net:5000/cycledetail/' + id)
                    .success(function (data) {
                        var count, i;
                        $scope.analyzed_count = 0;
                        $scope.unanalyzed_count = 0;
                        $scope.gridRecordList.data = data.cycledetail;
                        count = data.cycledetail.length;
                        for (i = 0; i < count; ++i) {
                            row = $scope.gridRecordList.data[i];
                            row.analyzed = row.status != 'Fail' ? 'N/A' : (row.defect ? 'True' : 'False');
                            if (row.analyzed == 'True') $scope.analyzed_count++;
                            if (row.analyzed == 'False') $scope.unanalyzed_count++;
                        }

                        $scope.summary = data;

                        var pass = data.pass;
                        var fail = data.fail;
                        var warning = data.warning;
                        var passrate = Math.round(parseInt(pass) / (parseInt(pass) + parseInt(fail) + parseInt(warning)) * 10000) / 100.00 + "%";
                        var failrate = Math.round(parseInt(fail) / (parseInt(pass) + parseInt(fail) + parseInt(warning)) * 10000) / 100.00 + "%";
                        var warningrate = Math.round(parseInt(warning) / (parseInt(pass) + parseInt(fail) + parseInt(warning)) * 10000) / 100.00 + "%";

                        $scope.passratio = passrate;
                        $scope.failratio = failrate;
                        $scope.warningratio = warningrate;
                        $scope.analyzeratio = $scope.unanalyzed_count == 0 ? '100%' :
                        Math.round($scope.analyzed_count / ($scope.analyzed_count + $scope.unanalyzed_count) * 10000) / 100.00 + "%";
                        $scope.BuildTime = convertDate(data.tag);
                        //console.log(jsonData.starttime+"   "+convertStartTime(data.starttime))
                        //console.log(data);
                        $scope.summary.startTime = convertStartTime(parseInt(data.starttime));
                        hello(parseFloat(passrate), parseFloat(failrate), parseFloat(warningrate));

                    });
                console.log(row);
            });
        }
        // Radialize the colors
        Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color) {
            return {
                radialGradient: {
                    cx: 0.5,
                    cy: 0.3,
                    r: 0.7
                },
                stops: [
                    [0, color],
                    [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
                ]
            };
        });

        function hello(pass, fail, war) {
            // $( document ).ready(function() {
            // Build the chart
            Highcharts.setOptions({
                colors: ['#FFCE56', '#FF6384', '#01a982']
            });
            Highcharts.chart('container', {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                tooltip: {
                    // pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: ''
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                fontSize: '12px',
                                fontWeight: 'normal',
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || '#610b38'

                            },
                            connectorColor: 'silver'
                        }
                    }
                },
                series: [{
                    name: '',
                    data: [
                        {name: 'Warnig', y: war},
                        {
                            name: 'Fail',
                            y: fail,
                            sliced: true,
                            selected: true
                        },
                        {name: 'Pass', y: pass},
                    ]
                }]
            });
            // });
        }


        $http.get('http://myd-vm03063.hpeswlab.net:5000/cyclelist')
            .success(function (data) {
                var count = data.length;
                var i;
                for (i = 0; i < count; ++i) {
                    data[i].tag = convertDate(data[i].tag);
                }
                $scope.gridBuildList.data = data;
            });

        // data
        $scope.gridRecordList = {
            enableHorizontalScrollbar: 0,
            enableVerticalScrollbar: 1,
            paginationPageSize: 100,
            enableColumnMenus: false,
            enableFiltering: true,
            enableSorting: true,
            enableCellEdit: false,
            //allowCellFocus: true,
            enableRowSelection: true,
            columnDefs: [{
                name: 'test',
                width: 400,
               cellTemplate: '<div style="float: left" class="ui-grid-cell-contents">{{row.entity[col.field]}}</div>'
               +  '<button ng-click="grid.appScope.testCellClicked(row)" style="float: right; width: 20px;" data-toggle="modal" data-target="#historyModal"></button>'
                 // cellTemplate: '<div ng-dblclick="grid.appScope.testCellClicked(row)" ng-model="myModal">{{row.entity[col.field]}}</div>'
            }, {
                name: 'status',
                width: 100,
                sort: {
                    direction: 'asc',
                    priority: 0
                }
            }, {
                name: 'browser',
                //allowCellFocus: false,
                width: 100
            }, {
                name: 'exception',
                width: 400
            }, {
                name: 'defect',
                enableCellEdit: true,
                width: 100,
                validators: {
                    required: true,
                    isNumber: ''
                }
            }, {
                name: 'analyzed'

            }]
        };

        $scope.gridRecordList.onRegisterApi = function (gridApi) {
            $scope.gridDataApi = gridApi;
            gridApi.cellNav.on.navigate($scope, function (newRowCol, oldRowCol) {
                console.log(newRowCol);
            });
            gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                console.log(rowEntity);
                console.log($scope.gridRecordList.data);
                var data = {
                    "runid": rowEntity.runid,
                    "defectid": newValue
                };
                if (newValue) rowEntity.analyzed = 'True';
                //console.log(data);
                $http.post('http://myd-vm03063.hpeswlab.net:5000/linkdefect', data).then(
                    function successCallback(res) {},
                    function errorCallback(res) {
                });
                if (!oldValue && newValue != null) {
                    $scope.analyzed_count++;
                    $scope.unanalyzed_count--;
                    $scope.analyzeratio = $scope.unanalyzed_count == 0 ? '100%' :
                    Math.round($scope.analyzed_count / ($scope.analyzed_count + $scope.unanalyzed_count) * 10000) / 100.00 + "%";
                }
            });
            gridApi.validate.on.validationFailed($scope, function (rowEntity, colDef, newValue, oldValue) {
                window.alert('rowEntity: ' + rowEntity + '\n' +
                    'colDef: ' + colDef + '\n' +
                    'newValue: ' + newValue + '\n' +
                    'oldValue: ' + oldValue);
            });

            $scope.testCellClicked = function (row){
                console.log('row entity:');
                console.log(row.entity);
                $http.get('http://myd-vm03063.hpeswlab.net:5000/testhistory/' + row.entity.test + '/' + row.entity.browser)
                    .success(function(res) {
                        generateHistoryChart(res);
                    });


            }

        }

        uiGridValidateService.setValidator('isNumber',
            function () {
                return function (oldValue, newValue, rowEntity, colDef) {
                    if (!newValue) {
                        return true; // We should not test for existence here
                    } else {
                        return !isNaN(newValue);
                    }
                };
            },
            function () {
                return 'You can only insert a number';
            }
        );
    }
]);

function convertDate(aa) {
    var a = aa.split("-");
    var d = new Date(parseInt(a[1]));
    var date =
        (d.getFullYear()) + "-" +
        (d.getMonth() + 1) + "-" +
        (d.getDate()) + " " +
        (d.getHours()) + ":" +
        (d.getMinutes()) + ":" +
        (d.getSeconds());
    // return a[0] + '-' + date;
    return a[0];

}

function convertStartTime(startTime) {
    var d = new Date(startTime);
    var date =
        (d.getFullYear()) + "-" +
        (d.getMonth() + 1) + "-" +
        (d.getDate()) + " " +
        (d.getHours()) + ":" +
        (d.getMinutes()) + ":" +
        (d.getSeconds());
    return date;
}