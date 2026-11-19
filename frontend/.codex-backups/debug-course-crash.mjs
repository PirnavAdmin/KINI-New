import { chromium } from 'playwright';
const b = await chromium.launch({channel:'msedge',headless:true});
const p = await b.newPage();
p.on('pageerror', e=>console.log('PAGEERROR',e.message));
p.on('console', m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,1200))});
await p.addInitScript(()=>{for(const [k,v] of Object.entries({isDemo:'true',token:'demo-token',accessToken:'demo-token',auth_token:'demo-token',token_expiration:String(Date.now()+86400000),role:'org-admin',user_role:'org-admin',isAuthenticated:'true'}))localStorage.setItem(k,v);localStorage.setItem('user',JSON.stringify({id:1,userId:1,role:'org-admin',userRole:'Organization',organizationId:1,name:'Test Organization',email:'org@example.test'}));});
await p.goto('http://localhost:5173/organization/courses',{waitUntil:'networkidle'});
console.log((await p.locator('body').innerText()).slice(0,3500));
await b.close();