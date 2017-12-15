//Models
var address_table = require('../model/address');
//Routing & utils
var router = require('express').Router();
function render(file,err,result,res){
  if(err)
    res.send(err);
  else
    res.render('address/'+file, {'result': result});
}; module.exports = router;
//Viewing All
router.get('/all', function(req, res) {
    address_table.getAll((err, result) => {
      render('index',err,result,res)
  });
});
// Insert
router.get('/add', function(req, res){
  render('add',null,null,res);
});
// Insert
router.get('/insert', function(req, res){
  address_table.insert(req.query, (err,result) => {
    if (err) {
        console.log(err)
        res.send(err);
    } else
      res.redirect(302, '/address/all');
  });
});
// Delete a company for the given company_id
router.get('/delete', function(req, res) {
    if(req.query.company_id == null)
      res.send('company_id is null');
    else {
      address_table.delete(req.query.address_id, function(err, result){
        if(err)
          res.send(err);
        else
          res.redirect(302, '/address/all');
      });
    }
});
