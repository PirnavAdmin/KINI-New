import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.setDefaultTimeout(15000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let fail=false;let failAssignments=false;
 await page.addInitScript(()=>{
  const user={id:1,userId:1,role:'org-admin',organizationId:1,email:'org@example.com'};
  for(const [k,v] of Object.entries({user:JSON.stringify(user),role:'org-admin',user_role:'org-admin',isAuthenticated:'true',organizationToken:'test-org',auth_token:'test-org',token:'test-org'}))localStorage.setItem(k,v);
 });
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());if(!url.pathname.startsWith('/api/'))return ['localhost','127.0.0.1'].includes(url.hostname)?route.continue():route.abort();
  let data=[];
  if(url.pathname==='/api/v1/organization/employees')data={items:[{employeeId:7,mentorId:99,employeeCode:'EMP-007',fullName:'Test mentor',role:'Mentor',status:'Active',email:'mentor@example.com'}]};
  if(url.pathname==='/api/v1/organization/batches')data=[];
  if(url.pathname==='/api/v1/organization/employees/7/batches' && failAssignments)return route.fulfill({status:500,json:{message:'Assignments unavailable'}});
  if(url.pathname==='/api/v1/organization/employees/7/batches')data={items:[{batchId:11,batchName:'First cohort',courseName:'Java',status:'Active'},{batchId:12,batchName:'Second cohort',mentorId:7,courseName:'React',status:'Active'}]};
  if(url.pathname==='/api/StudentBatch/11/students')data={students:[{studentId:1},{studentId:2}]};
  if(url.pathname==='/api/StudentBatch/12/students'){
   if(fail)return route.fulfill({status:500,json:{message:'Unavailable'}});
   data={students:[{studentId:2},{studentId:3}]};
  }
  return route.fulfill({json:{data}});
 });
 await page.goto('http://127.0.0.1:5173/organization/tutors');
 await page.getByRole('button',{name:/Test mentor.*yrs/}).click();
 const count=page.getByLabel('Mentor student total');
 await count.waitFor();assert.equal(await count.locator('b').textContent(),'3');
 await page.getByRole('button',{name:'Batches',exact:true}).click();
 await page.getByText('First cohort',{exact:true}).waitFor();
 assert.equal(await page.getByText('React Morning',{exact:true}).count(),0);
 await page.getByRole('button',{name:'Overview',exact:true}).click();
 await page.screenshot({path:'mentor-profile-students-review.png',fullPage:true});
 fail=true;await count.getByRole('button',{name:'Refresh',exact:true}).click();
 await count.getByText('Student count unavailable. Please retry.').waitFor();
 assert.equal(await count.locator('b').textContent(),'\u2014');
 fail=false;await count.getByRole('button',{name:'Retry',exact:true}).click();
 await count.getByRole('button',{name:'Refresh',exact:true}).waitFor();
 assert.equal(await count.locator('b').textContent(),'3');
 failAssignments=true;
 await count.getByRole('button',{name:'Refresh',exact:true}).click();
 await count.getByRole('button',{name:'Retry',exact:true}).waitFor();
 await page.getByRole('button',{name:'Batches',exact:true}).click();
 await page.getByRole('alert').getByText('Unable to load assigned batches. Please retry.').waitFor();
 assert.equal(await page.getByText('No assigned batches.',{exact:true}).count(),0);
 failAssignments=false;
 await page.getByRole('alert').getByRole('button',{name:'Retry'}).click();
 await page.getByText('First cohort',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Overview',exact:true}).click();
 await page.setViewportSize({width:390,height:844});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);
 console.log('PASS: unique mentor students, real batch rows, partial failure/retry, responsive profile; intercepted APIs.');
} finally {await browser.close();}
