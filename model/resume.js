var db  = require('./db_connection.js');
var mysql   = require('mysql');

/* DATABASE CONFIGURATION */
var sql = mysql.createConnection(db.config);

function wrap(callback,err,result){
    return callback({'err':err, 'result':result});
}

exports.execute = function(query,callback) {
    sql.query(query, function(err, result) {
        wrap(callback,err,result);
    });
};

exports.columns = function(table,callback) {
    var query = 'SHOW COLUMNS FROM cowatson.'+table;
    sql.query(query, function(err, result) {
        wrap(callback,err,result);
    });
};

exports.recursive = function(names,data,callback) {
    if(names.length == 0) return callback(data);
    var query = 'SHOW COLUMNS FROM cowatson.'+names[0]; names.shift();
    sql.query(query, function(err, result) {
        if(err) data.err+=err;
        data.result = data.result.concat(result);
        exports.recursive(names,data,callback);
    });
};

exports.columns_all = function(table,callback) {
    exports.execute("show tables", (others) => {
        var valid = [table];
    for(var i=0; others.result.length > i; i++){
        var first = others.result[i]['Tables_in_cowatson'];
        if(~first.indexOf(table+"_")){
            valid.push(first.split("_")[1]);
            valid.push(first); }
    } exports.recursive(valid,{'err':"", 'result':[]},callback);
});
};

exports.list_all = function(table,callback) {
    var query = 'SELECT * FROM '+table;
    sql.query(query, function(err, result) {
        wrap(callback,err,result);
    });
};

exports.view_default = function(table,id,callback) {
    exports.execute("show tables", (others) => {
        var query = 'SELECT * FROM '+table+' t ';
    for(var i=0; others.result.length > i; i++){
        var first = others.result[i]['Tables_in_cowatson'];
        var second = first.split("_")[1];
        if(!~first.indexOf(table+"_")) continue;
        query +='LEFT JOIN '+first+' on '+
            first+'.'+table+'_id = t.'+table+'_id ' +
            'LEFT JOIN '+second+' on '+second+'.'+second+'_id = '+first+'.'+second+'_id ';
    }
    query+='WHERE t.'+table+'_id = '+id;
    sql.query(query, function(err, result) {
        console.log(result);
        wrap(callback,err,result);
    });
});
};

exports.update = function(table,data, callback) {
    var query = 'UPDATE '+table+' SET'
    for(key in data) if(key!=table+'_id')
        query+=" "+key+" = '"+data[key]+"',";
    query=query.substring(0, query.length - 1)
        +' WHERE '+table+'_id = '+data[table+'_id'];
    sql.query(query, function(err, result) {
        wrap(callback,err,result);
    });
};
