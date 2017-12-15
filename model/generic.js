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
    var preproc = 'SELECT t.* ';
    var query = 'FROM '+table+' t ';
    for(var i=0; others.result.length > i; i++){
      var first = others.result[i]['Tables_in_cowatson'];
      var second = first.split("_")[1];
      if(!~first.indexOf(table+"_")) continue;
      //preproc+=", '' as _"+first+", "+first+".* ";
      preproc+=", "+second+'.'+second+"_id as _"+second+", "+second+".* ";
      query +='LEFT JOIN '+first+' on '+first+'.'+table+'_id = t.'+table+'_id ' +
      'LEFT JOIN '+second+' on '+second+'.'+second+'_id = '+first+'.'+second+'_id ';
    }
     query+='WHERE t.'+table+'_id = '+id;
    sql.query(preproc+query, function(err, result) {
        //console.log(err,result);
        wrap(callback,err,result);
    });
  });
};

exports.insert = function(table,data,callback) {
  var query = 'INSERT INTO '+table+' VALUES (NULL,';
  for(key in data) if(key!=table+'_id')
  if(typeof data[key] == "string"){
    if(data[key] === "") query+="NULL,";
    else query+=sql.escape(data[key])+",";
  } else query+=data[key]+",";
  query=query.substring(0, query.length - 1)
  query+=')'; //console.log(query);
  sql.query(query, function(err, result) {
     //console.log(err);
      wrap(callback,err,result);
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

exports.delete_one = function(table,iden,callback) {
  var query = 'DELETE FROM '+table+" WHERE "+table+"_id = "+iden;
  sql.query(query, function(err, result) {
      console.log(err);
      wrap(callback,err,result);
  });
};
