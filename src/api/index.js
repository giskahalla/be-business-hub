

import express from 'express';
import { readFileSync, writeFileSync } from 'fs';

import { generateId } from '../handler/index.js';

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
      ...req.body,
      id: generateId(customers, "CUS"),
      status: 2,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    if (company) {
      const comp = companies.find(co => co.id === company);
        
        if (!comp.projects) {
            newCustomer.employees = [];
        }
        
        if (!comp.employees.includes(company)) {
          newCustomer.projects.push(company);
        }
    }
    
    customers.push(newCustomer);
    writeFileSync(dbFile, JSON.stringify(db, null, 2));
    
    res.json({customer: newCustomer});
  });

  app.post('/update/customer', (req, res) => {
    const { body } = req
    const { company } = body || {}

    if (!company) {
      return res.status(400).json({ error: "Missing required fields: company" });
    }

     const customerIndex = customers.findIndex(customer => customer.id === body.id);
    
    if (customerIndex === -1) {
        return res.status(404).json({ message: 'Customer not found' });
    }
    
    customers[customerIndex] = { ...customers[customerIndex], ...body };

    if (company) {
      const comp = companies.find(co => co.id === company);
        
        if (!comp.projects) {
            comp.employees = [];
        }
        
        if (!comp.employees.includes(company)) {
          comp.employees.push(company);
        }
    }

    writeFileSync(dbFile, JSON.stringify(db, null, 2));
    res.json({customer: customers[customerIndex], });
    
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
    const { body } = req
    const { assignee, client, budget } = body || {}

    if (!client || !assignee) {
      return res.status(400).json({ error: "Missing required fields: client or assignee" });
    }

    const newProject = {
      ...body,
      id: generateId(projects, "PRJ"),
      status: 1,
      joinedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
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
    const { body } = req
    const { assignee, client, used, tasks, status } = body || {}

    if (!body.id) {
    return res.status(400).json({ message: 'Project ID is required' });
  }

    const projectIndex = projects.findIndex(project => project.id === body.id);
    
    if (projectIndex === -1) {
        return res.status(404).json({ message: 'Project not found' });
    }
    
    const newProjectId = body.id;

    const inProgress = tasks.some(task => task.status === 'done')
    const isCompleted = tasks.every(task => task.status === 'done')

    projects[projectIndex] = { 
      ...projects[projectIndex], 
      ...body, 
      status:  inProgress ? 2 : (isCompleted ? 4 : status),
      ...(isCompleted && { completedAt: new Date().toISOString().replace("T", " ").substring(0, 16) }),
      budget: {
        estimated: projects[projectIndex].budget.estimated,
        used: used !== undefined ? used : projects[projectIndex].budget.used,
      } 
    };

    if (client) {
      const customer = customers.find(cust => cust.id === client);
        if (!customer) {
          return res.status(400).json({ message: 'Client not found' });
        }

        if (!customer.projects) {
            customer.projects = [];
        }

        if (!customer.projects.includes(newProjectId)) {
          customer.projects.push(newProjectId); 
        }
    }

    if (assignee) {
      const member = members.find(mem => mem.id === assignee);
        if (!member) {
          return res.status(400).json({ message: 'Client not found' });
        }
        
        if (!member.projects) {
            member.projects = [];
        }
        
        if (!member.projects.includes(newProjectId)) {
          member.projects.push(newProjectId);
        }
    }

    const db = { projects, customers, members };

    writeFileSync(dbFile, JSON.stringify(db, null, 2));
    res.json({project: projects[projectIndex]});
    
  });

  app.get('/get/companies', (req, res) => {
    res.json({companies: companies});
  });

  app.post('/create/company', (req, res) => {
    const newCompany = {
      ...req.body,
      id: generateId(companies, "COM"),
      status: 2
    };
    
    companies.push(newCompany);
    writeFileSync(dbFile, JSON.stringify(db, null, 2));
    
    res.json({company: newCompany});
  });

  app.post('/update/company', (req, res) => {
    const { body } = req

     const companyIndex = companies.findIndex(company => company.id === body.id);
    
    if (companyIndex === -1) {
        return res.status(404).json({ message: 'Company not found' });
    }
    
    companies[companyIndex] = { ...companies[companyIndex], ...body };

    writeFileSync(dbFile, JSON.stringify(db, null, 2));
    res.json({company: companies[companyIndex]});
    
  });

  app.get('/get/members', (req, res) => {
    res.json({members: members});
  });

  app.post('/create/member', (req, res) => {
    const newMember = {
      ...req.body,
      id: generateId(members, "MEM"),
      status: 2
    };
    
    members.push(newMember);
    writeFileSync(dbFile, JSON.stringify(db, null, 2));
    
    res.json({member: newMember});
  });

  app.post('/update/member', (req, res) => {
    const { body } = req

     const memberIndex = members.findIndex(member => member.id === body.id);
    
    if (memberIndex === -1) {
        return res.status(404).json({ message: 'Member not found' });
    }
    
    members[memberIndex] = { ...members[memberIndex], ...body };

    writeFileSync(dbFile, JSON.stringify(db, null, 2));
    res.json({member: members[memberIndex]});
    
  });

  app.get('/get/projects/summary', (req, res) => {
    const { year } = req.query; 

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const filtered = projects.filter(item => {
      const start = new Date(item.start_date);
      const end = new Date(item.completedAt);
      return (
        start.getFullYear() === Number(year) ||
        end.getFullYear() === Number(year)
      );
    });

    const monthlyMap = {};

    months.forEach(m => {
      monthlyMap[m] = { revenue: 0, project: 0, active: 0, completed: 0 };
    });

    filtered.forEach(proj => {
      const start = new Date(proj.start_date);
      const monthName = months[start.getMonth()];
      const budget = Number(proj.budget?.estimated || 0);
      // const completedAt = proj.completedAt ? new Date(proj.completedAt) : null;

      monthlyMap[monthName].revenue += budget;
      monthlyMap[monthName].project += 1;

      if (proj.status === 4) {
        monthlyMap[monthName].completed += 1;
      } else if (proj.status === 2) {
        monthlyMap[monthName].active += 1;
      }

      // if (!completedAt) {
      //   monthlyMap[monthName].active += 1;
      // } else if (completedAt.getFullYear() === year) {
      //   const completedMonth = months[completedAt.getMonth()];
      //   monthlyMap[completedMonth].completed += 1;
      // }
    });

    const monthlySummary = Object.entries(monthlyMap).map(
      ([month, data]) => ({
        month,
        ...data,
      })
    );

    const total_revenue = filtered.reduce((acc, p) => acc + Number(p.budget?.estimated || 0), 0);

    const summaries = {
      monthlySummary,
      total_revenue,
    };

    res.json({summaries: summaries});
  });

  app.get('/get/customers/summary', (req, res) => {
    const { year } = req.query; 

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const filtered = customers.filter(item => {
      const date = new Date(item.createdAt);
      return (
        date.getFullYear() === Number(year) 
      );
    });

    const monthlyMap = {};

    months.forEach(m => {
      monthlyMap[m] = { total: 0 };
    });

    filtered.forEach(proj => {
      const created = new Date(proj.createdAt);
      const monthName = months[created.getMonth()];

      monthlyMap[monthName].total += 1;

    });

    const monthlySummary = Object.entries(monthlyMap).map(
      ([month, data]) => ({
        month,
        ...data,
      })
    );

    const total_customers = filtered?.length 

    const summaries = {
      monthlySummary,
      total_customers,
    };

    res.json({summaries: summaries});
  });
      
app.listen(5050, () => {})

export default app







