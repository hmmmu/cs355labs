var db  = require('./db_connection.js');
var mysql   = require('mysql');

/* DATABASE CONFIGURATION */
var connection = mysql.createConnection(db.config);

exports.getAll = function(render_page) {
    var query = 'SELECT * FROM address;';
    connection.query(query, function(err, result) {
        render_page(err, result);
    });
};

exports.insert = function(params, render_page) {
  var query = 'INSERT INTO address (street,zip_code) VALUES (?,?)';
  var queryData = [params.street,params.zip_code];
  connection.query(query, queryData, (err, result) => {
    render_page(err, result);
  });
};
