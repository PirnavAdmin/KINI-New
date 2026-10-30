import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1536, height: 1000 } });
page.setDefaultTimeout(20000);
const names = ['AL&ML 1', '.Net 1', 'Devops 1', 'nodejs 1', 'Java Full Stack 1', 'React js 1'];
const batches = names.map((batchName, i) => ({ batchId: 101 + i, batchName, courseId: 10 + i, courseName: 'Course ' + i, mentorId: 7, mentorName: 'Mentor Seven', status: ['Active','Upcoming','Completed','Active','Cancelled','Upcoming'][i], batchType: 'Online', startDate: '2026-09-01', endDate: '2027-01-31', capacity: 24, totalSessions: 2, attendancePercentage: 86, completionPercentage: 35 }));
await page.addInitScript(() => {
  const user = { employeeId: 7, userId: 91, role: 'employee', userRole: 'HR', department: 'HR', firstName: 'HR', email: 'hr@example.com' };
  localStorage.setItem('user', JSON.stringify(user));
  for (const [key, value] of Object.entries({ auth_token:'test-batches',token:'test-batches',role:'employee',user_role:'employee',isAuthenticated:'true' })) localStorage.setItem(key,value);
});

const employees = ['NANI NARYANA','Lahari Gandikota','nani narendraaaa','mohannarayana minchala','Prabha Sri','THAMMUDUu LAHARI','CHINNI LAHARI'].map((fullName,i)=>({employeeId:9+i,userId:900+i,employeeCode:'EMP-'+(90+i),fullName,firstName:fullName,lastName:'',email:'employee'+i+'@example.com',role:i%2?'Mentor':'HR',status:'Active',employmentType:'Full Time'}));
const requests=[];
let failed=false;
await page.route('**/api/**',route=>{
 const path=new URL(route.request().url()).pathname;
 if(!path.startsWith('/api/')) return route.continue();
 requests.push(path);
 let data=[];
 if(path.includes('employee-profile')) data={employeeId:7,userRole:'HR',role:'HR',department:'HR'};
 else if(path.includes('/Permission/')) data=['Dashboard','Employees','Attendance','Leave','Performance','Announcements','Calendar','Students','Resources','Batches','Settings','Courses','Schedule','Reports'].map(moduleName=>({moduleName,canAccess:true,canView:true,canEdit:true,canDelete:true,canAdd:true}));
 else if(path==='/api/hr/employees') data=employees;
 else if(path==='/api/hr/leave') data=[{employeeId:9,leaveId:2,status:'Approved',leaveType:'Annual',fromDate:'2026-10-01',toDate:'2026-10-02',days:2,reason:'Personal'},{employeeId:999,leaveId:99,reason:'Other employee'}];
 else if(/^\/api\/hr\/employees\/\d+$/.test(path)) {
  if(failed) return route.fulfill({status:500,json:{message:'Temporary failure'}});
  data=employees.find(row=>String(row.employeeId)===path.split('/').at(-1));
  if(!data) return route.fulfill({status:404,json:{message:'Missing'}});
 } else if(/^\/api\/hr\/(attendance|leave|performance)\/employee\/\d+$/.test(path)) {
  data=[{employeeId:Number(path.split('/').at(-1)),attendanceId:1,leaveId:2,performanceId:3,date:'2026-10-04',checkIn:'09:00',checkOut:'18:00',workingHours:9,status:path.includes('/attendance/') ? 'Present' : 'Approved',leaveType:'Annual',fromDate:'2026-10-01',toDate:'2026-10-02',days:2,reason:'Personal',period:'Own period',performanceScore:88},{employeeId:999,period:'Other period'}];
 } else if(path.includes('/api/v1/organization/employees/')&&path.endsWith('/batches')) data={batches:[{batchId:77,batchName:'Assigned Batch',courseName:'React',status:'Active'}]};
 return route.fulfill({json:{data}});
});
const go=path=>page.goto('http://127.0.0.1:5176'+path);
try {
 await go('/employee/hr-employees');
 for(const action of ['name','details']) for(const employee of employees) {
  const button=page.getByRole('button',{name:employee.fullName,exact:true});
  if(action==='name') await button.click();
  else await page.locator('tr').filter({has:button}).getByRole('button',{name:'Details',exact:true}).click();
  await page.getByRole('heading',{name:employee.fullName,level:1,exact:true}).waitFor();
  assert.equal(new URL(page.url()).pathname,'/employee/hr-employees/'+employee.employeeId);
  assert.ok(requests.includes('/api/hr/employees/'+employee.employeeId));
  assert.ok(await page.locator('header.hrbd-header').innerText().then(t=>t.includes(employee.email)&&t.includes(employee.role)));
  await page.locator('aside nav a[href="/employee/hr-employees"][aria-current="page"]').waitFor();
  await page.getByRole('link',{name:'Back to Employees'}).click();
  console.log('PASS '+action+' '+employee.fullName+': resource ID, email, role and sidebar');
 }
 await go('/employee/hr-employees/9');
 await page.getByRole('heading',{name:employees[0].fullName,level:1}).waitFor();
 await page.reload();
 await page.getByRole('heading',{name:employees[0].fullName,level:1}).waitFor();
 await page.screenshot({path:'artifacts/hr-employee-details-desktop.png',fullPage:true});
 for(const tab of ['Attendance','Leaves','Performance','Batches']) {
  await page.getByRole('tab',{name:tab,exact:true}).click();
  await page.getByRole('table').waitFor();
  assert.equal(await page.locator('tbody tr').count(),1);
  assert.equal(requests.some(path=>path.includes('/leave/employee/')),false);
  assert.equal(await page.getByText('Other period',{exact:true}).count(),0);
 }
 assert.equal(await page.getByRole('link',{name:'View Batch'}).getAttribute('href'),'/employee/batches/77');
 await page.getByRole('tab',{name:'Overview',exact:true}).click();
 await page.getByRole('button',{name:'Edit Employee',exact:true}).click();
 await page.getByRole('heading',{name:'Edit Employee',exact:true}).waitFor();
 await page.getByRole('button',{name:'Cancel',exact:true}).click();
 await page.setViewportSize({width:390,height:844});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'artifacts/hr-employee-details-mobile.png',fullPage:true});
 console.log('PASS reload, four scoped tabs, other-employee filtering, batch link, existing edit form and mobile overflow');
 await go('/employee/hr-employees/999');
 await page.getByRole('heading',{name:'Employee not found'}).waitFor();
 failed=true;
 await go('/employee/hr-employees/9');
 await page.getByRole('heading',{name:'Unable to load employee details.'}).waitFor();
 failed=false;
 await page.getByRole('button',{name:'Retry',exact:true}).click();
 await page.getByRole('heading',{name:employees[0].fullName,level:1}).waitFor();
 console.log('PASS 404 fallback, not-found and error/retry');
} finally { await browser.close(); }
