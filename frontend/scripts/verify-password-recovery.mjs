import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({headless:true, channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge'});
const results = [];
try {
for (const outcome of ['success','expired','validation','network']) {
 const context = await browser.newContext(); const page = await context.newPage(); page.setDefaultTimeout(12000); let resets=0, verifies=0; console.log('Checking '+outcome); page.on('pageerror', e=>console.log('Page error: '+e.message));
 await context.route('**/*', async route => {
  const u=new URL(route.request().url());
  if(!u.pathname.startsWith('/api/')) return ['127.0.0.1','localhost'].includes(u.hostname) ? route.continue() : route.abort();
  const json=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  if(u.pathname==='/api/Auth/forgot-password') return json({success:true,message:'OTP sent successfully.'});
  if(u.pathname==='/api/Auth/verify-otp') { verifies++; return json({success:true,message:'OTP verified successfully.',resetToken:'test-reset-only-token',resetTokenExpiresAt:new Date(Date.now()+300000).toISOString()}); }
  if(u.pathname==='/api/Auth/reset-password') {
   resets++;
   const body=route.request().postDataJSON(); assert.equal(body.resetToken,'test-reset-only-token'); assert.ok(!('otp' in body)); assert.equal(body.identifier,'learner@example.com');
   await new Promise(r=>setTimeout(r,600));
   if(outcome==='network') return route.abort('failed');
   return outcome==='success' ? json({success:true,message:'Password reset successfully.'}) : outcome==='expired' ? json({success:false,message:'OTP expired.'}) : json({errors:{newPassword:['Password is not permitted.']}},400);
  }
  return json({data:[]});
 });
 await page.goto('http://127.0.0.1:4173/forgot-password');
 await page.getByLabel('Email address',{exact:true}).fill('learner@example.com');
 await page.getByRole('button',{name:'Send reset code'}).click();
 await page.getByRole('button',{name:'Enter verification code'}).click();
 for (const [index, digit] of [...'482913'].entries()) await page.getByLabel('Verification code digit '+(index+1)).fill(digit);
 await page.getByRole('button',{name:'Verify code'}).click();
 await page.waitForURL('**/reset-password');
 await page.getByLabel('New password',{exact:true}).fill('Strong@2026');
 await page.getByLabel('Confirm new password',{exact:true}).fill('Strong@2026');
 const toggles=page.getByRole('button',{name:/^Show .*password$/});
 assert.equal(await toggles.count(),2);
 for(const toggle of await toggles.all()) assert.equal(await toggle.getAttribute('type'),'button');
 await page.getByRole('button',{name:'Update password'}).click();
 await page.locator('form').evaluate(form=>{form.requestSubmit();form.requestSubmit();}).catch(()=>{});
 if(outcome==='success') {
  await page.waitForURL('**/Auth/login');
  await page.getByText('Password updated successfully. Please sign in.',{exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('passwordResetVerified')),null);
  await page.goBack();
  assert.ok(!new URL(page.url()).pathname.includes('reset-password'));
  assert.equal(verifies,1);
 } else if(outcome==='expired') {
  await page.getByRole('button',{name:'Restart password reset'}).waitFor().catch(async e=>{console.log('URL: '+page.url()+' Body: '+(await page.locator('body').innerText()).slice(-1800));throw e;});
  assert.equal(new URL(page.url()).pathname,'/reset-password');
 } else {
  await page.getByRole('alert').waitFor().catch(async e=>{console.log('URL: '+page.url()+' Body: '+(await page.locator('body').innerText()).slice(-1800));throw e;});
  assert.equal(new URL(page.url()).pathname,'/reset-password');
  assert.equal(await page.getByRole('button',{name:'Update password'}).isEnabled(),true);
 }
 assert.equal(resets,1);
 console.log(outcome+': passed'); results.push(outcome+': passed'); await context.close();
}
const direct = await browser.newPage();
await direct.goto('http://127.0.0.1:4173/reset-password');
await direct.getByRole('button',{name:'Restart password reset'}).waitFor();
assert.equal(new URL(direct.url()).pathname,'/reset-password');
await direct.close();
results.push('missing authorization: passed');
console.log(JSON.stringify({mode:'intercepted browser requests; no real accounts modified',results},null,2));
} finally {await browser.close();}

