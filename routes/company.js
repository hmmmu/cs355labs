//Models
var company_table = require('../model/company');
var address_table = require('../model/address');
//Routing
var router = require('express').Router();
function render(file,err,result,res){
  if(err)
    res.send(err);
  else
    res.render('company/'+file, {'result': result});
}; module.exports = router;
// View All companys
router.get('/all', function(req, res) {
  company_table.getAll((err, result) => {
    render('index',err,result,res)
  });
});
// View the company for the given id
router.get('/', function(req, res){
  if(req.query.company_id == null)
    res.send('company_id is null');
  else
    company_table.getById(req.query.company_id, (err, result) => {
      render('index',err,result,res)
    });
});
// Return the add a new company form
router.get('/add', function(req, res){
    // passing all the query parameters (req.query) to the insert function instead of each individually
    address_table.getAll(function(err,result) {
        if (err) {
            res.send(err);
        }
        else {
            res.render('company/add', {'address': result});
        }
    });
});

// View the company for the given id
router.get('/insert', function(req, res){
    // simple validation
    if(req.query.company_name == null) {
        res.send('Company Name must be provided.');
    }
    else if(req.query.address_id == null) {
        res.send('At least one address must be selected');
    }
    else {
        // passing all the query parameters (req.query) to the insert function instead of each individually
        company_table.insert(req.query, function(err,result) {
            if (err) {
                console.log(err)
                res.send(err);
            }
            else {
                //poor practice for redirecting the user to a different page, but we will handle it differently once we start using Ajax
                res.redirect(302, '/company/all');
            }
        });
    }
});

router.get('/edit', function(req, res){
    if(req.query.company_id == null) {
        res.send('A company id is required');
    }
    else {
        company_table.edit(req.query.company_id, function(err, result){
            res.render('company/edit', {company: result[0][0], address: result[1]});
        });
    }

});

router.get('/edit2', function(req, res){
   if(req.query.company_id == null) {
       res.send('A company id is required');
   }
   else {
       company_table.getById(req.query.company_id, function(err, company){
           address_table.getAll(function(err, address) {
               res.render('company/edit', {company: company[0], address: address});
           });
       });
   }

});

router.get('/update', function(req, res) {
    company_table.update(req.query, function(err, result){
       res.redirect(302, '/company/all');
    });
});

// Delete a company for the given company_id
router.get('/delete', function(req, res){
    if(req.query.company_id == null) {
        res.send('company_id is null');
    }
    else {
         company_table.delete(req.query.company_id, function(err, result){
             if(err) {
                 res.send(err);
             }
             else {
                 //poor practice, but we will handle it differently once we start using Ajax
                 res.redirect(302, '/company/all');
             }
         });
    }
});
