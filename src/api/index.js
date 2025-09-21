
const express = require('express')
const app = express()
const api = require('../db.json');
const customers = api.customers;

app.use(express.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  next();
  });

  app.get('/get/customers', (req, res) => {
    res.json({customers: customers});
  });

  app.post('/add/customer', (req, res) => {
    const newCustomer = {
      id: customers.length + 1,
      task: req.body.task,
      done: false
    };
    
    customers.push(newCustomer);
    
    res.json(newCustomer);
    });
      
app.listen(5050, () => {})

module.exports = app;







