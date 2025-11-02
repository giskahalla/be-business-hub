

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

  app.get('/get/project/thru/userId', (req, res) => {
    const { id } = req.query; 

    let project = [];

    if(id.includes("MEM")) {
      project = projects.filter(prj => prj.assignee === id); 
    } else {
      project = projects.filter(prj => prj.client === id);
    }

    res.json({projects: project});
  });

  app.post('/create/project', (req, res) => {
    const { data } = req.body
    const { assignee, client, budget } = data || {}

    if (!data || !client || !assignee) {
      return res.status(400).json({ error: "Missing required fields: client or assignee" });
    }

    const newProject = {
      ...data,
      id: generateProjectId(projects),
      status: 1,
      budget: { estimated: budget || 0 }
    };

    if (client) {
      const customer = customers.find(cust => cust.id === client); 
      if (customer) {
        if (!customer.projects) {
          customer.projects = []; 
        }
        customer.projects.push(newProject.id);
      }
    }

    if (assignee) {
      const member = members.find(mem => mem.id === assignee); 
      if (member) {
        if (!member.projects) {
          member.projects = []; 
        }
        member.projects.push(newProject.id);
      }
    }

    projects.push(newProject);

    const db = { projects, customers, members };
    writeFileSync(dbFile, JSON.stringify(db, null, 2));

    res.json({ project: newProject });
  });

   app.post('/update/project', (req, res) => {
    const { data } = req.body
    const { assignee, client, spent } = data || {}

    const projectIndex = projects.findIndex(project => project.id === data.id);
    
    if (projectIndex === -1) {
        return res.status(404).json({ message: 'Project not found' });
    }
    
    projects[projectIndex] = { ...projects[projectIndex], ...data, budget: {
        ...projects[projectIndex].budget.estimated,
        used: spent !== undefined ? spent : projects[projectIndex].budget.spent,
      } 
    };

    const newProjectId = data.id;

    if (client) {
        if (!customers[client].projects) {
            customers[client].projects = [];
        }
        customers[client] = {
            ...customers[client],
            projects: [...customers[client].projects, newProjectId],
        };
    }

    if (assignee) {
        if (!members[assignee].projects) {
            members[assignee].projects = [];
        }
        members[assignee] = {
            ...members[assignee],
            projects: [...members[assignee].projects, newProjectId],
        };
    }

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







