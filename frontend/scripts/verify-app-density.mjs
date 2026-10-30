import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const phase = process.argv[2] || 'before';
const base = 'http://127.0.0.1:5185';
const resolutions = [[1366,768],[1440,900],[1536,864],[1920,1080]];
const groups = [
 ['Organization Admin',['/organization/batches','/organization/dashboard','/organization/classes','/organization/attendance','/organization/reports']],
 ['Student',['/student/batch','/student/dashboard','/student/my-classes']],
 ['Mentor',['/mentor/dashboard','/mentor/calendar','/mentor/live-classes']],
 ['HR',['/employee/hr-dashboard','/employee/hr-attendance','/employee/hr-reports']],
 ['Super Admin',['/super-admin/dashboard','/super-admin/reports']],
];
const browser = await chromium.launch({channel:'chrome',headless:true});
const results=[];
await fs.mkdir('artifacts/density',{recursive:true});
try {
 for(const [width,height] of resolutions) {
  for(const [role,routes] of groups) {
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
   // Isolated demo session; no production account, credentials, or mutations.
   await context.route('**/api/**',r=>r.fulfill({json:{data:[],success:true}}));
   const page=await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/demo-login');
   await page.getByRole('button').filter({has:page.getByRole('heading',{name:role,exact:true})}).click();
   await page.locator('[data-dashboard-role]').waitFor();
   for(const route of routes) {
    await page.goto(base+route);
    await page.locator('[data-ui="dashboard-header"]').waitFor();
    await page.waitForTimeout(800);
    const metrics=await page.evaluate(()=>{
     const el=s=>document.querySelector(s), rect=s=>el(s)?.getBoundingClientRect(), h=s=>Math.round((rect(s)?.height||0)*10)/10;
     const shell=el('[data-dashboard-role]');const main=el('.mentor-content-shell > main');
     const content=el('[data-ui="page-content"]')||main?.firstElementChild;
     const batch=el('.batch-management-page'); const pageRoot=batch||content?.firstElementChild;
     const cs=pageRoot?getComputedStyle(pageRoot):null;
     const overflow=[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&!e.closest('.overflow-x-auto, .overflow-auto, [data-ui="table-frame"]')).slice(0,8).map(e=>({tag:e.tagName,cls:e.className?.baseVal??e.className,width:e.getBoundingClientRect().width}));
     return {viewport:`${innerWidth}x${innerHeight}`,rootFont:getComputedStyle(document.documentElement).fontSize,zoom:getComputedStyle(shell).zoom,scale:visualViewport.scale,sidebar:rect('aside[data-ui="dashboard-sidebar"]')?.width,header:h('[data-ui="dashboard-header"]'),paddingX:cs?.paddingLeft,paddingY:cs?.paddingTop,outerPadding:content?getComputedStyle(content).padding:null,sectionGap:batch&&getComputedStyle(batch.children[1]).marginTop,pageHeader:batch?.firstElementChild?.getBoundingClientRect().height,kpi:h('[data-ui="kpi"]'),kpiSection:h('[aria-label="Batch statistics"]'),filters:batch?.children[2]?.getBoundingClientRect().height,control:h('input[aria-label="Search batches"]'),toolbar:batch?.querySelector('section')?.firstElementChild?.getBoundingClientRect().height,tableHeader:h('table thead'),tableRow:h('table tbody tr'),tableTop:rect('table')?.top,studentHero:h('.ksl-banner'),scrollWidth:document.documentElement.scrollWidth,horizontalOverflow:document.documentElement.scrollWidth>innerWidth,mainOverflow:main?main.scrollWidth>main.clientWidth:false,overflow};
    });
    results.push({role,route,...metrics,errors:[...errors]});
    if(route==='/organization/batches'||route==='/student/batch'||route==='/mentor/calendar') await page.screenshot({path:`artifacts/density/${phase}-${role.split(' ')[0]}-${width}.png`});
    console.log(JSON.stringify({phase,role,route,viewport:metrics.viewport,sidebar:metrics.sidebar,kpi:metrics.kpi,header:metrics.header,overflow:metrics.horizontalOverflow,mainOverflow:metrics.mainOverflow}));
   }
   await context.close();
  }
 }
} finally {await fs.writeFile(`artifacts/density/${phase}.json`,JSON.stringify(results,null,2));await browser.close();}
