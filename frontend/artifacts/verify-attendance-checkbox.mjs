import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
console.log('Launching browser');
const browser = await chromium.launch({timeout:15000});
console.log('Browser launched');
const report = [];
try {
for (const width of [1440, 768, 390]) {
  console.log('Width', width);
  const page = await browser.newPage({viewport: {width, height: 1000}, acceptDownloads: true});
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  await page.addInitScript(() => {
    for (const [k,v] of Object.entries({token:'demo-token',auth_token:'demo-token',token_expiration:new Date(Date.now()+86400000).toISOString(),role:'org-admin',user_role:'org-admin',isAuthenticated:'true'})) localStorage.setItem(k,v);
    localStorage.setItem('user', JSON.stringify({userId:1,organizationId:3,role:'org-admin',name:'Kini',email:'organization@example.test',isDemo:true}));
  });
  const rows = Array.from({length:17}, (_,i) => ({attendanceId:i+1,attendanceDate:`2026-10-${String(i+1).padStart(2,'0')}`,className:`React class ${i+1}`,status:i%2?'Present':'Absent',checkIn:'09:00 AM',checkOut:'10:00 AM'}));
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (!path.startsWith('/api/')) return route.continue();
    const data = /\/Attendance\/student\/1$/.test(path) ? rows : /\/organization\/students\/1$/.test(path) ? {studentId:1,firstName:'Gandikota',lastName:'Lahari',status:'Active',courseName:'React',batchName:'React 1'} : [];
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data})});
  });
  console.log('Navigating');
  await page.goto('http://127.0.0.1:5188/organization/students/1?tab=Attendance', {waitUntil:'domcontentloaded',timeout:60000});
  console.log('Loaded', page.url());
  const table = page.locator('table.student-profile-attendance');
  await table.waitFor({timeout:30000}).catch(async e => {console.log('Page content', (await page.locator('body').innerText()).slice(0,2000)); await page.screenshot({path:'artifacts/attendance-browser-error.png'}); throw e;});
  console.log('Table ready');
  await page.getByText('Showing 1 to 15 of 17 records',{exact:true}).waitFor();
  assert.equal(await table.locator('input[type=checkbox]').count(),0);
  assert.deepEqual(await table.locator('th').allTextContents(),['ID','Date ?','Class','Status','Join','Leave']);
  const geometry = await table.evaluate(t => {
    const head = [...t.querySelectorAll('th')];
    const cells = [...t.querySelector('tbody tr').cells];
    return {aligned:head.every((h,i)=>Math.abs(h.getBoundingClientRect().x-cells[i].getBoundingClientRect().x)<1), widths:head.map(h=>Math.round(h.getBoundingClientRect().width)),colors:head.map(h=>getComputedStyle(h).color),pageOverflow:document.documentElement.scrollWidth-innerWidth,scrollable:t.parentElement.scrollWidth>t.parentElement.clientWidth};
  });
  assert.ok(geometry.aligned);
  assert.equal(geometry.pageOverflow,0);
  await table.scrollIntoViewIfNeeded();
  await page.screenshot({path:`artifacts/attendance-no-checkbox-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'Next page',exact:true}).click();
  await page.getByText('Showing 16 to 17 of 17 records',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Previous page',exact:true}).click();
  await table.getByRole('button',{name:/Date/}).click();
  assert.equal(await table.locator('tbody tr:first-child td:first-child').innerText(),'1');
  await page.getByRole('button',{name:'Select Date Range'}).click();
  await page.getByLabel('From',{exact:true}).fill('2026-10-05');
  await page.getByLabel('To',{exact:true}).fill('2026-10-07');
  await page.getByRole('button',{name:'Apply',exact:true}).click();
  await page.getByText('Showing 1 to 3 of 3 records',{exact:true}).waitFor();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button',{name:'Export',exact:true}).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  let csv=''; for await (const chunk of stream) csv += chunk.toString();
  assert.equal(csv.split('\n').length,4);
  assert.ok(csv.includes('React class 5') && csv.includes('React class 7') && !csv.includes('React class 8'));
  report.push({width,...geometry,checks:'checkbox removal, columns, alignment, pagination, sorting, date filtering, CSV export passed'});
  await page.close();
}
writeFileSync('artifacts/attendance-checkbox-browser.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
} finally { await browser.close(); }
