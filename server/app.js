var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var postgres = require('./lib/postgres');

var routes = require('./routes/index');
var users = require('./routes/users');
var config = require('./config');
var sqls = require('./sql');

var app = express();
app.use(bodyParser.json({
    limit: '5mb'
}));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.get('/', function(req, res) {
    res.send('Welcome to TruClient Automation Report Center');
});
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

function std_error(res, err, code) {
    console.error(err);
    res.status(code || 500).json({
        'error': err
    });
}

// API for test
var routerTest = express.Router();
routerTest.get('/:name', function(req, res) {
    res.send('OK');
});
app.use('/test', routerTest);


// API postresult
var postReprotRouter = express.Router();

postReprotRouter.post('/', function(req, res) {
    var report = req.body;
    var sql_cycle = sqls.sql_ci_insert_cycle;

    postgres.client.query(sql_cycle, [
        report.Build,
        report.Pass,
        report.Fail,
        report.Warning,
        report.ElapsedTime,
        report.starttime,
        report.sysinfo.OS,
        report.sysinfo.WebFF,
        report.sysinfo.WebIE,
        report.sysinfo.Chrome,
        report.tag || report.Build + '-' + report.starttime,
        'CI'
    ], function(err, results) {
        var cycle;
        if (err) {
            std_error(res, err);
            return;
        }
        cycleid = results.rows[0].id;

        updateRuns(res, cycleid);
    });

    function updateRuns(res, cycleid) {
        var runs = report.runs;
        var run_count = runs.length;
        var names = [];
        var existing_names = [];

        var sql_existing_names = sqls.sql_ci_test;
        postgres.client.query(sql_existing_names, function (err, results) {
            for (var i = 0; i<results.rows.length; ++i){
              existing_names.push(results.rows[i].name);
            }

            for (var i = 0; i < run_count; ++i) {
                if (names.indexOf(runs[i].TestName) == -1)
                    names.push(runs[i].TestName);
            }

            let a = new Set(names);
            let b = new Set(existing_names);
            let diff_a_b = new Set([...a].filter(x => !b.has(x)));
            let diff = Array.from(diff_a_b);

            // e.g. INSERT INTO test (name) VALUES('abc'), ('def'), ('eee');
            var sql_insert = 'INSERT INTO test (name) VALUES';
            for (i = 0; i < diff.length; ++i) {
                if (i > 0) {
                    sql_insert += ', ';
                }
                sql_insert += '(\'' + diff[i] + '\')';
            }
            sql_insert += ';';
            postgres.client.query(sql_insert, function(err, results) {
                var sql_query = 'SELECT id,name FROM test;';
                // error code 23505 means duplicate
                //if (err && err.error && err.error.code != 23505){ std_error(res, err); return; }

                postgres.client.query(sql_query, function(err, results) {
                    var map = {};
                    var tests = results.rows,
                        j;
                    var sql_insert_runs = 'INSERT INTO testrun (testid, status, browser, cycleid, exception) VALUES';
                    for (j = 0; j < tests.length; ++j) {
                        map[tests[j].name] = tests[j].id;
                    }

                    for (i = 0; i < run_count; ++i) {

                        if (map[runs[i].TestName]) {
                            sql_insert_runs += '(' + map[runs[i].TestName] +
                                ', \'' + runs[i].Result +
                                '\', \'' + runs[i].Browser +
                                '\', ' + cycleid +
                                ', \'' + runs[i].Exception.replace(/[\n\r\t\']/g, "") +
                                //', \'' + base64.encode(runs[i].Exception)+
                                '\'),';
                        }
                    }
                    sql_insert_runs = sql_insert_runs.slice(0, -1) + ';';
                    postgres.client.query(sql_insert_runs, function(err, results) {
                        if (err) {
                            std_error(res, err);
                            return;
                        }
                        res.send('OK');
                    });
                });
            });
        });
    }
});

app.use('/ci_report', postReprotRouter);


// API get cyclelist
var cycleListRouter = express.Router();
cycleListRouter.get('/', function(req, res) {

    console.log(sqls.sql_ci_cycle_list);
    var sql = sqls.sql_ci_cycle_list;

    postgres.client.query(sql, function(err, results) {
        if (err) {
            std_error(res, err);
            return;
        }

        if (results.rows.length === 0) {
            res.statusCode = 404;
            return res.json({
                error: ['cycle list not found']
            });
        }

        res.json(results.rows);
    });
});
app.use('/cyclelist', cycleListRouter);

// API get cycledetail
var cycleDetailRouter = express.Router();
cycleDetailRouter.get('/:id', function(req, res) {
    var cycleId = req.params.id;

    var sql = sqls.sql_ci_cycle_on_id;
    postgres.client.query(sql, [cycleId], function(err, results) {
        if (err) {
            std_error(res, err);
            return;
        }

        if (results.rows.length === 0) {
            std_error(res, err, 404);
            return;
        }

        var sql1 = sqls.sql_ci_cycle_detail;
        postgres.client.query(sql1, [cycleId], function(err, results1) {
            if (err) {
                std_error(res, err);
                return;
            }

            if (results1.rows.length === 0) {
                std_error(res, err, 404);
                return;
            }

            results.rows[0].cycledetail = results1.rows;
            //let ret = result.rows[0];
            //ret.exception = base64.decode(ret.exception);
            res.json(results.rows[0]);
        });
    });
});
app.use('/cycledetail', cycleDetailRouter);

// api post linked defect
var linkDefectRouter = express.Router();
linkDefectRouter.post('/', function(req, res) {
    var data = {
        runid: req.body.runid,
        defectid: req.body.defectid
    };

    var sql = sqls.sql_ci_link_defect;
    postgres.client.query(sql, [data.runid, data.defectid], function(err, results) {
        if (err) {
            std_error(res, err);
            return;
        }

        res.send('OK');
    });
});
app.use('/linkdefect', linkDefectRouter);

// api get test history
var testHistoryRouter = express.Router();
testHistoryRouter.get('/:name/:browser', function(req, res) {

    var sql = sqls.sql_ci_test_history;

    var data = {
        testName: req.params.name,
        browser: req.params.browser
    };
    postgres.client.query(sql, [data.testName, data.browser], function(err, results){
        if(err){
            std_error(res, err);
            return;
        }

        if (results.rows.length === 0) {
            res.statusCode = 404;
            return res.json({
                error: ['history is empty']
            });
        }

        res.json(results.rows);
    });
});
app.use('/testhistory', testHistoryRouter);

module.exports = app;
