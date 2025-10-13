

import express from 'express';
import { readFileSync, writeFileSync } from 'fs';

import { generateCustomerId, generateProjectId } from '../handler/index.js';


const app = express()

const dbFile = new URL("../db.json", import.meta.url).pathname;
let db = JSON.parse(readFileSync(dbFile, "utf-8"));

const customers = db.customers;
const projects = db.projects;
const companies = db.companies;
const members = db.members;

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

  app.post('/create/customer', (req, res) => {
    const newCustomer = {
      ...req.body.data,
      id: generateCustomerId(customers),
      status: 2
      
    };
    
    customers.push(newCustomer);
    writeFileSync(dbFile, JSON.stringify(db, null, 2));
    
    res.json({customer: newCustomer});
  });

  app.post('/update/customer', (req, res) => {
    const { data } = req.body

     const customerIndex = customers.findIndex(customer => customer.id === data.id);
    
    if (customerIndex === -1) {
        return res.status(404).json({ message: 'Customer not found' });
    }
    
    customers[customerIndex] = { ...customers[customerIndex], ...data };

    writeFileSync(dbFile, JSON.stringify(db, null, 2));
    res.json({customer: customers[customerIndex]});
    
  });

  app.get('/get/projects', (req, res) => {
    res.json({projects: projects});
  });

  app.post('/create/project', (req, res) => {
    const newProject = {
      ...req.body.data,
      id: generateProjectId(projects),
      status: 1
      
    };
    
    projects.push(newProject);
    writeFileSync(dbFile, JSON.stringify(db, null, 2));
    
    res.json({project: newProject});
  });

   app.post('/update/project', (req, res) => {
    const { data } = req.body

     const projectIndex = projects.findIndex(project => project.id === data.id);
    
    if (projectIndex === -1) {
        return res.status(404).json({ message: 'Project not found' });
    }
    
    projects[projectIndex] = { ...projects[projectIndex], ...data };

    writeFileSync(dbFile, JSON.stringify(db, null, 2));
    res.json({project: projects[projectIndex]});
    
  });

  app.get('/get/companies', (req, res) => {
    res.json({companies: companies});
  });

  app.get('/get/members', (req, res) => {
    res.json({members: members});
  });
      
app.listen(5050, () => {})

export default app







