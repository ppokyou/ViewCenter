/**
 * Created by wanpeng on 11/28/2016.
 */

module.exports = {
    sql_ci_test_history : "SELECT testrun.id, testrun.cycleid, testrun.browser, testrun.status, testrun.exception, cycle.build, rundefect.defectid " +
        "FROM cycle, testrun LEFT OUTER JOIN rundefect ON testrun.id = rundefect.runid " +
        "WHERE cycle.id = testrun.cycleid AND testrun.testid=(select id from test where name=$1) AND testrun.browser=$2 " +
        "ORDER BY testrun.cycleid DESC LIMIT 100",

    sql_ci_link_defect : 'INSERT INTO rundefect (runid, defectid) VALUES ($1, $2);',

    sql_ci_cycle_detail : 'SELECT test.name AS test, testrun.status, testrun.browser, testrun.exception, rundefect.defectid AS defect, testrun.id AS runid ' +
    'FROM test, testrun left outer join rundefect ON testrun.id=rundefect.runid ' +
    'WHERE testrun.cycleid=$1 and testrun.testid=test.id',

    sql_ci_cycle_list : 'SELECT id,tag FROM cycle ORDER BY id DESC',

    sql_ci_insert_cycle : 'INSERT INTO cycle (build, pass, fail, warning, duration, starttime, os, ffversion, ieversion, gcversion, tag, type) ' +
    'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;',

    sql_ci_test : 'SELECT name FROM test',

    sql_ci_cycle_on_id : 'SELECT * FROM cycle WHERE id = $1'

};