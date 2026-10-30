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
let failed = false;
const requests = [];
await page.route('**/api/**', async route => {
  const path = new URL(route.request().url()).pathname;
  if (!path.startsWith('/api/')) return route.continue();
  requests.push(path);
  let data = [];
  if (path.includes('employee-profile')) data = { employeeId:7,userRole:'HR',role:'HR',department:'HR' };
  else if (path.includes('/Permission/')) data = ['Dashboard','Employees','Attendance','Leave','Performance','Announcements','Calendar','Students','Resources','Batches','Settings','Courses','Schedule','Reports'].map(moduleName => ({ moduleName,canAccess:true,canView:true,canEdit:true,canAdd:true }));
  else if (path === '/api/v1/organization/batches') data = { data:batches,totalRecords:6,totalPages:1 };
  else if (/\/batches\/\d+$/.test(path)) {
    const id = Number(path.split('/').at(-1));
    if (failed) return route.fulfill({status:500,json:{message:'Temporary failure'}});
    data = batches.find(b=>b.batchId===id);
    if (!data) return route.fulfill({status:404,json:{message:'Missing'}});
  } else if (path.includes('/StudentBatch/')) {
    const id = Number(path.split('/').at(-2));
    data = { batchId:id,students:id===101 ? [{ studentId:44,name:'Student Forty Four',email:'44@example.com',status:'Active',attendancePercentage:92,progress:40 }] : [] };
  } else if (path === '/api/v1/live-classes') {
    const id = Number(new URL(route.request().url()).searchParams.get('batchId'));
    data = [{ id:301,batchId:id,title:'Session for '+id,scheduledDate:'2026-10-04',startTime:'10:00',endTime:'11:00',status:'Scheduled' }];
  }
  return route.fulfill({json:{data}});
});
const go = path => page.goto('http://127.0.0.1:5176'+path);
try {
  await go('/employee/batches');
  for (let i=0;i<names.length;i++) {
    const card=page.locator('article').filter({has:page.getByRole('heading',{name:names[i],exact:true})});
    await card.getByRole('button',{name:'View Details',exact:true}).click();
    await page.getByRole('heading',{name:names[i],level:1,exact:true}).waitFor();
    assert.equal(new URL(page.url()).pathname,'/employee/batches/'+(101+i));
    assert.ok(requests.includes('/api/v1/organization/batches/'+(101+i)));
    await page.locator('aside nav a[href="/employee/batches"][aria-current="page"]').waitFor();
    assert.ok(await page.getByLabel('Breadcrumb').innerText().then(t=>t.includes(names[i])));
    if(i===0) {
      await page.screenshot({path:'artifacts/hr-batch-details-desktop.png',fullPage:true});
      await page.getByRole('tab',{name:'Students',exact:true}).click();
      await page.getByText('Student Forty Four').waitFor();
      assert.equal(await page.getByRole('link',{name:'View Student Forty Four'}).getAttribute('href'),'/employee/students/44');
      await page.getByRole('tab',{name:'Sessions',exact:true}).click();
      await page.getByText('Session for 101').waitFor();
    }
    await page.getByRole('link',{name:'Back to Batches'}).click();
    console.log('PASS card '+names[i]+': own ID, breadcrumb, sidebar and back navigation');
  }
  await go('/employee/batches/106');
  await page.getByRole('heading',{name:names[5],level:1}).waitFor();
  await page.reload();
  await page.getByRole('heading',{name:names[5],level:1}).waitFor();
  await page.getByRole('button',{name:'Edit Batch',exact:true}).click();
  await page.getByRole('heading',{name:'Edit Batch',exact:true}).waitFor();
  assert.equal(await page.locator('input[name="batchName"]').count(),0); // form uses controlled inputs without name attributes
  await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await page.getByRole('button',{name:'Manage Batch',exact:true}).click();
  await page.getByText('Batch Code',{exact:true}).waitFor();
  console.log('PASS direct reload, existing edit form, inactive management preview');
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await go('/employee/batches/999');
  await page.getByRole('heading',{name:'Batch Not Found'}).waitFor();
  failed=true;
  await go('/employee/batches/101');
  await page.getByRole('heading',{name:'Unable to load batch details'}).waitFor();
  failed=false;
  await page.getByRole('button',{name:'Retry',exact:true}).click();
  await page.getByRole('heading',{name:names[0],level:1}).waitFor();
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:'artifacts/hr-batch-details-mobile.png',fullPage:true});
  console.log('PASS 404, error/retry and 390px layout without horizontal overflow');
} finally { await browser.close(); }
