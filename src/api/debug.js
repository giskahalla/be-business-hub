import { readFileSync  } from 'fs';

const dbFile = new URL("../db.json", import.meta.url).pathname;
let db = JSON.parse(readFileSync(dbFile, "utf-8"));

const customers = db.customers;
const projects = db.projects;
const companies = db.companies;
const members = db.members;


function test() {
   const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const filtered = projects.filter(item => {
      const start = new Date(item.start_date);
      const end = new Date(item.completedAt);
      return (
        start.getFullYear() === 2025 ||
        end.getFullYear() === 2025
      );
    });

    const monthlySummary = {};

    months.forEach(m => {
      monthlySummary[m] = { revenue: 0, project: 0, active: 0, completed: 0 };
    });

    filtered.forEach(proj => {
      const start = new Date(proj.start_date);
      const monthName = months[start.getMonth()];
      const budget = Number(proj.budget?.estimated || 0);
      const completedAt = proj.completedAt ? new Date(proj.completedAt) : null;

      monthlySummary[monthName].revenue += budget;
      monthlySummary[monthName].project += 1;

      if (!completedAt) {
        monthlySummary[monthName].active += 1;
      } else if (completedAt.getFullYear() === year) {
        const completedMonth = months[completedAt.getMonth()];
        monthlySummary[completedMonth].completed += 1;
      }

      console.log(monthlySummary[monthName])
    });

    const total_revenue = filtered.reduce((acc, p) => acc + Number(p.budget?.estimated || 0), 0);

    const summaries = {
      monthlySummary,
      total_revenue,
    };
    console.log(summaries);
}

test();

