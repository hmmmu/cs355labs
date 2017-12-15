//Models
var database = require('../model/generic');
//Routing
var router = require('express').Router();
function preproc(data){
  var dict = {}; var init="";
  for(i = 0; i < data.length; i++){
    for(key in data[i]){
      if(key[0]=="_"&&!dict.hasOwnProperty(key)) {
        dict[key] = {}; init=key;}
      if(key[0]=="_"&&!dict[init].hasOwnProperty(data[i][init])) {
        if(!data[i][init]){continue;}
        dict[init][data[i][init]] = {}; continue;}
      if(!init && data[i][key]) {dict[key] = data[i][key]; continue;}
      else if(data[i][key]) dict[init][data[i][init]][key] = data[i][key];
    }
  }; return dict;
}
function render(file,res,meta,data,past,req){
  var object = {
      'table':req.params.table,
      'meta':meta.result,
      'data':data.result,
      'past':past.result
  }; console.log(JSON.stringify(object,null,4));
  if(meta.err || data.err || past.err)
    res.send('meta: '+ meta.err
      + '<br>data: '+ data.err
      + '<br>past: '+ past.err);
  else res.render('generic/'+file, object);
}; module.exports = router;
// View All companies
router.get('/tables', function(req, res) {
  database.execute("show tables",(data) => {
    if(req.query.api) res.json(data.result);
    else render('tables',res,{},data,{},req);
  });
});
router.get('/meta/:table', function(req, res) {
  database.columns_all(req.params.table, (meta) => {
    if(req.query.api) res.json(meta.result);
    else render('meta',res,meta,{},{},req);
  });
});
router.get('/all/:table', function(req, res) {
  database.columns(req.params.table, (meta) => {
    database.list_all(req.params.table, (data) => {
      if(req.query.api) res.json(data.result);
      else render('index',res,meta,data,{},req);
    });
  });
});
// View one companys
router.get('/add/:table', function(req, res) {
  database.columns(req.params.table, (meta) => {
      render('add',res,meta,{},{},req);
  });
});
router.post('/new/:table', function(req, res) {
  database.insert(req.params.table,req.body, (data) => {
    res.redirect(302, '/view/'+req.params.table+'/'
      +data.result.insertId);
  });
});
// View one companys
router.get('/view/:table/:iden', function(req, res) {
  database.columns_all(req.params.table, (meta) => {
    database.view_default(req.params.table,req.params.iden, (data) => {
      console.log(data.result);
      data.result=preproc(data.result);
      render('view',res,meta,data,{},req);
    });
  });
});
// add
router.get('/add/:table/', function(req, res) {
    database.columns_all(req.params.table, (meta) => {
        database.view_default(req.params.table,req.params.iden, (data) => {
        render('view',res,meta,data,req);
      });
    });
});

router.get('/drop/:table/:iden', function(req, res) {
  database.delete_one(req.params.table,req.params.iden, (data) => {
    res.redirect(302, '/all/'+req.params.table);
  });
});

// Edit one companys
router.post('/edit/:table', function(req, res) {
  database.columns(req.params.table, (meta) => {
    database.update(req.params.table,req.body,(data) => {
      res.redirect(302, '/view/'+req.params.table+'/'
        +req.body[req.params.table+'_id']);
    });
  });
});
