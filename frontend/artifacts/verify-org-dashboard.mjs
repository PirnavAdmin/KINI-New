import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
 const user={organizationId:1,role:'org-admin',userRole:'Organization',firstName:'Kini',email:'org@example.com'};
 localStorage.setItem('user',JSON.stringify(user));
 for(const [k,v] of Object.entries({auth_token:'test-token',organizationToken:'test-token',token:'test-token',role:'org-admin',user_role:'org-admin',organization_id:'1',isAuthenticated:'true'}))localStorage.setItem(k,v);
});
const notice={notificationId:10,organizationId:1,title:'New HR user created',description:'HR colleague was added. '+ 'Notification details with long content. '.repeat(50),category:'HR',notificationType:'HRUserCreated',createdAt:new Date(Date.now()-120000).toISOString(),isRead:false};
await page.route('**/api/**',route=>{
 const path=new URL(route.request().url()).pathname;
 if(!path.startsWith('/api/'))return route.continue();
 let data=[];
 if(path==='/api/v1/organization/dashboard'||path==='/api/v1/organization/stats')data={};
 else if(path==='/api/v1/organization/students')data=[{studentId:1,organizationId:1,firstName:'Pending',lastName:'Learner',email:'pending@example.com',status:'PendingApproval',courseName:'Python'}];
 else if(path==='/api/v1/organization/employees')data=[{employeeId:2,organizationId:1,firstName:'HR',lastName:'Colleague',role:'HR',status:'Active'}];
 else if(path.includes('/notifications/organization/1'))data=path.endsWith('unread-count')?{unreadCount:1}:[notice];
 else if(path.includes('/Permission/'))data=['Dashboard','Students','Employees','Courses','Batches','Classes','Assessments','Resources','Settings'].map(moduleName=>({moduleName,canAccess:true,canView:true,canEdit:true,canAdd:true}));
 return route.fulfill({json:{data}});
});
try{
 await page.goto('http://127.0.0.1:5176/organization/dashboard');
 await page.getByRole('heading',{name:'Recent Activity',exact:true}).waitFor({state:'attached'});
 await page.getByRole('heading',{name:'Recent Activity',exact:true}).scrollIntoViewIfNeeded();
 await page.getByText('New HR user created',{exact:true}).first().waitFor();
 await page.getByText('Pending Learner',{exact:true}).first().waitFor();
 await page.screenshot({path:'artifacts/org-dashboard-regression-desktop.png',fullPage:true});
 console.log('PASS dashboard HR notification activity and PendingApproval enrollment');
 await page.getByRole('button',{name:/Upload Material Share study resources/}).click();
 await page.getByRole('dialog').waitFor();
 await page.getByRole('dialog').getByRole('button',{name:'Cancel',exact:true}).click();
 await page.waitForURL('**/organization/dashboard');
 console.log('PASS upload quick-action Cancel returns dashboard');
 await page.goto('http://127.0.0.1:5176/organization/notifications');
 await page.getByRole('listitem').filter({hasText:'New HR user created'}).first().click();
 const dialog=page.getByRole('dialog');await dialog.waitFor();
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  const rect=await dialog.boundingBox();assert.ok(rect.x>=0&&rect.y>=0&&rect.x+rect.width<=viewport.width+1&&rect.y+rect.height<=viewport.height+1);
  assert.ok(await dialog.evaluate(el=>el.parentElement===document.body));
  await page.screenshot({path:`artifacts/org-notification-details-${viewport.width}.png`,fullPage:true});
 }
 console.log('PASS notification portal and viewport bounds desktop/mobile');
 assert.deepEqual(errors,[]);
}catch(e){console.log('DEBUG',page.url(),errors,await page.locator('body').innerText());await page.screenshot({path:'artifacts/org-dashboard-debug.png'});throw e}finally{await browser.close()}
