import { chromium } from '@playwright/test';
import fs from 'node:fs';
const browser = await chromium.launch({ headless: true });
fs.mkdirSync('tests/artifacts/chat-viewport', { recursive: true });
try {
 for (const role of ['mentor','student']) {
  const page = await browser.newPage();
  await page.addInitScript((role) => {
   localStorage.setItem('auth_token','layout-test-only');
   localStorage.setItem('isAuthenticated','true');
   localStorage.setItem('user_role',role);
   localStorage.setItem('user',JSON.stringify({id:1,role,mentorId:1,studentId:1,name:'Layout Test',firstName:'Layout',lastName:'Test'}));
  },role);
  await page.route('**/*',async route => {
   const url = new URL(route.request().url());
   if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return route.continue();
   let data = [];
   if(url.pathname === '/api/v1/chat/conversations') data=Array.from({length:40},(_,i)=>({conversationId:i+1,student:{id:i+1,name:`Student ${i+1}`},mentor:{id:i+1,name:`Mentor ${i+1}`},unreadCount:0}));
   else if(/\/chat\/conversations\/\d+\/messages$/.test(url.pathname)) data=Array.from({length:60},(_,i)=>({messageId:i+1,conversationId:1,senderType:i%2?'Mentor':'Student',message:`Layout message ${i+1} `+'Long text '.repeat(15),sentAt:'2026-09-23T04:30:00Z',isRead:true,attachment:null}));
   else if(url.pathname.includes('unread-count')) data={unreadCount:0};
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data})});
  });
  for(const [width,height] of [[1366,768],[1920,1080],[1024,768],[768,1024],[390,844]]) {
   await page.setViewportSize({width,height});
   await page.goto(`http://127.0.0.1:4174/${role==='mentor'?'mentor/messages':'student/mentor-chat'}`);
   await page.locator('.chat-page').waitFor({timeout:60000});
   await page.locator('.chat-conversation-list button').first().waitFor();
   await page.waitForTimeout(400);
   for(const selected of [false,true]) {
    if(selected) { await page.locator('.chat-conversation-list button').first().click(); await page.locator('.chat-history').getByText('Layout message 1 ',{exact:false}).first().waitFor(); await page.waitForTimeout(400); }
    const result=await page.evaluate(()=>{
     const rect=s=>{const el=document.querySelector(s),r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,height:r.height,width:r.width,scroll:el.scrollHeight,client:el.clientHeight}};
     const selectors={page:'.chat-page',workspace:'.chat-workspace',list:'.chat-conversation-list',history:'.chat-history',composer:'.chat-composer',header:'[data-ui="dashboard-header"]',shell:'.mentor-content-shell > main'};
     return {document:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight},...Object.fromEntries(Object.entries(selectors).map(([key,s])=>[key,rect(s)]))};
    });
    console.log(role,width,height,selected?'selected':'empty',JSON.stringify(result));
    if(result.document.width>width+1||result.document.height>height+1||result.page.bottom>height+1||result.shell.scroll>result.shell.client+1) throw new Error('Page overflow');
    if((width>=1024||selected) && (result.composer.bottom>height+1||result.composer.height<30||result.history.bottom>result.composer.y+1)) throw new Error('Composer outside viewport');
    if(width>=1024 && result.list.scroll<=result.list.client) throw new Error('List not constrained');
    if(selected && result.history.scroll<=result.history.client) throw new Error('Messages not constrained');
    await page.screenshot({path:`tests/artifacts/chat-viewport/${role}-${width}-${selected?'selected':'empty'}.png`});
   }
  }
  await page.close();
 }
} finally { await browser.close(); }
