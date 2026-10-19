const CATS=["Garbage Collection","Road / Drainage","Street Lighting","Peace & Order","Barangay Clearance","Certificate of Residency","Certificate of Indigency","Health Assistance","Other"];
const STAT=["Pending","In Progress","Completed","Rejected"];
let realUid=null,db=null,usr=null,uid=null,me=null,reqs=[],profs=[],loaded=false,flash=null,out=false;
try{out=sessionStorage.getItem("out")==="1"}catch(e){}
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cap=s=>s?String(s).charAt(0).toUpperCase()+String(s).slice(1):"";const fmt=t=>t?new Date(t).toLocaleString([], {dateStyle:"medium",timeStyle:"short"}):"";
const role=()=>me?me.role:null,isStaff=()=>["admin","staff"].includes(role());
const tag=s=>`<span class="tag ${s.replace(" ","-")}">${s}</span>`;
function go(h){location.hash=h;render()}
function setFlash(t,e){flash={t,e}}
async function init(){
  const c=window.claude;
  try{db=c&&await c.use("db");usr=c&&await c.use("user")}catch(e){}
  if(db&&usr){try{uid=await usr.id();realUid=uid;try{const a=localStorage.getItem("acct");if(a)uid=a}catch(e){}}catch(e){}}
  if(db&&uid){
    db.collection("requests").onSnapshot(s=>{reqs=s.docs.map(d=>({id:d.id,...d.data()}));loaded=true;render()},()=>{loaded=true;render()});
    db.collection("profiles").onSnapshot(s=>{profs=s.docs.map(d=>({id:d.id,...d.data()}));me=profs.find(p=>p.id===uid)||null;if(!me&&uid!==realUid){uid=realUid;me=profs.find(p=>p.id===uid)||null}loaded=true;render()},()=>{loaded=true;render()});
  }else{loaded=true}
  render();
}
function nav(r){
  const l=[["home","🏠 Home"]];
  if(me&&!out){l.push(["dash","📊 Dashboard"],["requests","📝 Requests"],["reports","📈 Reports"]);if(role()==="admin")l.push(["users","👥 Users"]);l.push(["profile","👤 Profile"])}
  l.push(["about","❓ Help"],["log","🧾 Prompt Log"]);
  $("#nav").innerHTML=`<span class="logo" onclick="go('home')">🏛️ Barangay Maligaya</span>`+l.map(([h,t])=>`<a href="#${h}" class="${r===h||(h==="requests"&&r==="form")?'on':''}">${t}</a>`).join("")+
  (me&&!out?(realAdmin()?acctSel():"")+`<button class="btn sec" onclick="logout()">Logout</button>`:`<button class="btn sec" onclick="go('login')">Login</button><button class="btn" onclick="go('register')">Register</button>`);
}
function logout(){out=true;try{sessionStorage.setItem("out","1")}catch(e){}setFlash("You have been logged out.");go("home")}
function login(){out=false;try{sessionStorage.removeItem("out")}catch(e){}setFlash("Welcome back, "+me.name+"!");go("dash")}
function render(){
  const raw=(location.hash||"#home").slice(1),[r,arg]=raw.split("/");
  nav(r);let h="";
  const prot=["dash","requests","form","reports","profile","users"];
  if(!loaded)h=`<p class="mut">Loading…</p>`;
  else if(prot.includes(r)&&(!me||out))h=authGate("Please log in to continue.");
  else if(r==="users"&&role()!=="admin")h=`<div class="card">Access denied: administrators only.</div>`;
  else h=({home,login:()=>authGate(),register:()=>authGate(),dash,requests,form:()=>form(arg),reports,profile,users,about,log}[r]||home)();
  const f=flash?`<div class="msg ${flash.e?'e':''}" role="status">${esc(flash.t)}</div>`:"";flash=null;
  $("#app").innerHTML=f+h;
}
function home(){return `<section class="hero"><h1>Barangay Maligaya<br><span style="color:var(--pri)">Online Service Request</span></h1>
<p class="mut" style="max-width:560px;margin:auto">Official online portal of the Office of the Punong Barangay. File requests for barangay clearance, certificates, garbage collection, road and drainage repair, street lighting, peace and order concerns, and health assistance, then track them until they are resolved.</p>
<p><button class="btn" onclick="go('${me&&!out?'dash':'register'}')">${me&&!out?'Go to dashboard':'Get started'}</button></p></section>
<div class="grid">${[["📝","Submit requests","Fill in a short form from any device."],["🔎","Track status","See Pending, In Progress, or Completed."],["🧑‍💼","Barangay staff","Officials and staff update the status and add notes."],["📊","Reports","Admins see totals and charts."]].map(x=>`<div class="card clk" onclick="go('${me&&!out?'requests':'register'}')"><div style="font-size:28px">${x[0]}</div><b>${x[1]}</b><p class="mut">${x[2]}</p></div>`).join("")}</div>`}
function authGate(m){
  if(!db||!uid)return `<div class="card"><b>Sign-in unavailable</b><p class="mut">Open this page while signed in to Claude to use accounts and the shared database.</p></div>`;
  if(me)return `<div class="card" style="max-width:440px;margin:auto"><h2>Login</h2>${m?`<p class="mut">${m}</p>`:""}<p>Signed in as <b>${esc(me.name)}</b> (${esc(cap(me.role))}).</p><button class="btn" onclick="login()">Continue as ${esc(me.name)}</button></div>`;
  return `<div class="card" style="max-width:480px;margin:auto"><h2>Create your account</h2>${m?`<p class="mut">${m}</p>`:""}
<form onsubmit="return reg(event)" novalidate>
<label for="n">Full name</label><input id="n"><div class="err" id="en"></div>
<label for="e">Email</label><input id="e" type="email"><div class="err" id="ee"></div>
<label for="c">Mobile (09XXXXXXXXX)</label><input id="c" inputmode="numeric"><div class="err" id="ec"></div>
<label for="p">Purok / Street</label><input id="p"><div class="err" id="ep"></div>
<label for="w">Password</label><input id="w" type="password"><div class="err" id="ew"></div>
<label for="w2">Confirm password</label><input id="w2" type="password"><div class="err" id="e2"></div>
<button class="btn" style="width:100%;margin-top:8px">Register</button></form>
<p class="mut" style="font-size:14px">Your sign-in is secured by your Claude account. The password is checked for strength, but it is not stored.</p></div>`}
async function reg(ev){ev.preventDefault();
  const v=i=>$("#"+i).value.trim(),E={};
  if(v("n").length<3)E.en="Enter your full name (3+ characters).";
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("e")))E.ee="Enter a valid email address.";
  else if(profs.some(p=>p.email?.toLowerCase()===v("e").toLowerCase()))E.ee="This email is already registered.";
  if(!/^09\d{9}$/.test(v("c")))E.ec="Use an 11-digit number starting with 09.";
  if(!v("p"))E.ep="Purok / street is required.";
  const w=$("#w").value;if(w.length<8||!/\d/.test(w)||!/[A-Za-z]/.test(w))E.ew="At least 8 characters with a letter and a number.";
  if($("#w2").value!==w)E.e2="Passwords do not match.";
  ["en","ee","ec","ep","ew","e2"].forEach(k=>$("#"+k).textContent=E[k]||"");
  if(Object.keys(E).length)return false;
  try{const first=!profs.length||(await usr.isOwner());
    await db.doc("profiles/"+uid).set({name:v("n"),email:v("e"),contact:v("c"),purok:v("p"),role:first?"admin":"resident",createdAt:Date.now()});
    out=false;try{sessionStorage.removeItem("out")}catch(e){}
    setFlash("Registration successful!"+(first?" You are the first user, so you are the administrator.":""));go("dash");
  }catch(e){setFlash("Could not register: "+(e.message||"database unavailable"),1);render()}
  return false}
function visible(){return isStaff()?reqs:reqs.filter(r=>r.createdBy===uid)}
function dash(){const v=visible(),c=s=>v.filter(r=>r.status===s).length;
  const recent=[...v].sort((a,b)=>b.updatedAt-a.updatedAt).slice(0,5);
  return `<h2>Dashboard</h2><div class="grid">
<div class="card stat clk" onclick="fs='';go('requests')"><b>${v.length}</b><span>${isStaff()?"Total requests":"My requests"}</span></div>
<div class="card stat clk" onclick="fs='Pending';go('requests')"><b style="color:var(--warn)">${c("Pending")}</b><span>Pending</span></div>
<div class="card stat clk" onclick="fs='In Progress';go('requests')"><b style="color:var(--info)">${c("In Progress")}</b><span>In progress</span></div>
<div class="card stat clk" onclick="fs='Completed';go('requests')"><b style="color:var(--ok)">${c("Completed")}</b><span>Completed</span></div>
${role()==="admin"?`<div class="card stat clk" onclick="go('users')"><b>${profs.length}</b><span>Registered users</span></div>`:""}</div>
<div class="card"><h3>Status overview</h3>${donut(STAT.map(s=>[s,c(s)]),["#f59e0b","#60a5fa","#4ade80","#f87171"])}</div>
<div class="card"><h3>Recent activity</h3>${recent.length?recent.map(r=>`<p><a href="#form/${r.id}">${esc(r.title)}</a> ${tag(r.status)} <span class="mut">· ${fmt(r.updatedAt)}</span></p>`).join(""):`<p class="mut">No activity yet. <a href="#form/new">Submit your first request</a>.</p>`}</div>`}
function bars(d){const m=Math.max(1,...d.map(x=>x[1]));
  return `<div class="tw"><svg viewBox="0 0 ${d.length*90+20} 150" width="100%" style="max-width:${d.length*90+20}px" role="img" aria-label="Bar chart">${d.map((x,i)=>{const h=x[1]/m*90;return `<rect x="${i*90+20}" y="${110-h}" width="60" height="${h}" rx="4" fill="var(--pri)"/><text x="${i*90+50}" y="${104-h}" text-anchor="middle" font-size="13" fill="var(--tx)">${x[1]}</text><text x="${i*90+50}" y="130" text-anchor="middle" font-size="11" fill="var(--mut)">${esc(x[0].split(" ")[0])}</text>`}).join("")}</svg></div>`}
let q="",fs="";
function requests(){let v=visible().filter(r=>(!fs||r.status===fs)&&(!q||(r.title+r.description+(r.createdByName||"")).toLowerCase().includes(q.toLowerCase()))).sort((a,b)=>b.createdAt-a.createdAt);
  return `<div class="row" style="justify-content:space-between"><h2 style="flex:3">${isStaff()?"All requests":"My requests"}</h2><button class="btn" style="flex:1" onclick="go('form/new')">+ New request</button></div>
<div class="card"><div class="row"><input placeholder="Search…" aria-label="Search" value="${esc(q)}" oninput="q=this.value;rl()"><select aria-label="Filter status" onchange="fs=this.value;rl()"><option value="">All statuses</option>${STAT.map(s=>`<option ${fs===s?"selected":""}>${s}</option>`).join("")}</select></div></div><div id="rl">${tbl(v)}</div>`}
function rl(){const v=visible().filter(r=>(!fs||r.status===fs)&&(!q||(r.title+r.description+(r.createdByName||"")).toLowerCase().includes(q.toLowerCase()))).sort((a,b)=>b.createdAt-a.createdAt);$("#rl").innerHTML=tbl(v)}
function tbl(v){if(!v.length)return `<div class="card mut">No requests found.</div>`;
  return `<div class="card tw"><table><tr><th>Request</th><th>Category</th><th>Status</th><th>Filed</th><th></th></tr>${v.map(r=>`<tr class="clk" tabindex="0" onclick="go('form/${r.id}')" onkeydown="if(event.key==='Enter')go('form/${r.id}')"><td><b>${esc(r.title)}</b><br><span class="mut">${esc(r.createdByName)} · ${esc(r.location)}</span></td><td>${esc(r.category)}</td><td>${tag(r.status)}</td><td>${fmt(r.createdAt)}</td><td>${isStaff()&&["Pending","In Progress"].includes(r.status)?`<button class="btn sm ok" onkeydown="event.stopPropagation()" onclick="qs(event,'${r.id}','Completed')">✓ Complete</button><button class="btn sm bad" onkeydown="event.stopPropagation()" onclick="qs(event,'${r.id}','Rejected')">✕ Reject</button> `:""}<a href="#form/${r.id}">${canEdit(r)?"Edit":"View"}</a></td></tr>`).join("")}</table></div>`}
function canEdit(r){return isStaff()||(r.createdBy===uid&&r.status==="Pending")}
function form(id){const n=id==="new"||!id,r=n?{}:reqs.find(x=>x.id===id);
  if(!n&&!r)return `<div class="card">Request not found. <a href="#requests">Back</a></div>`;
  if(!n&&!isStaff()&&r.createdBy!==uid)return `<div class="card">Access denied.</div>`;
  const ed=n||canEdit(r),st=isStaff();
  return `<div class="card" style="max-width:640px;margin:auto"><h2>${n?"New request":ed?"Edit request":"Request details"}</h2>
<form onsubmit="return save(event,'${n?"":id}')" novalidate><fieldset style="border:0;padding:0;margin:0" ${ed?"":"disabled"}>
<label for="t">Title</label><input id="t" value="${esc(r.title)}"><div class="err" id="et"></div>
<label for="k">Category</label><select id="k">${CATS.map(c=>`<option ${r.category===c?"selected":""}>${c}</option>`).join("")}</select>
<label for="l">Location</label><input id="l" value="${esc(r.location||(me&&me.purok)||"")}"><div class="err" id="el"></div>
<label for="d">Description</label><textarea id="d" rows="4">${esc(r.description)}</textarea><div class="err" id="ed"></div>
</fieldset>
${st&&!n?`<label>Status (staff)</label><input type="hidden" id="s" value="${esc(r.status)}"><div class="chips" role="group" aria-label="Status">${STAT.map(s=>`<button type="button" class="chip ${s.replace(" ","-")} ${r.status===s?"on":""}" onclick="pick(this,'${s}')">${ICO[s]} ${s}</button>`).join("")}</div><label for="o">Staff notes</label><textarea id="o" rows="2">${esc(r.notes)}</textarea>`:(r.notes?`<p><b>Staff notes:</b> ${esc(r.notes)}</p>`:"")}
<div class="row" style="margin-top:16px">${ed?`<button class="btn">${n?"Submit request":"Save changes"}</button>`:""}${!n&&(isStaff()||ed)&&(role()==="admin"||r.createdBy===uid&&r.status==="Pending")?`<button type="button" class="btn bad" onclick="del('${id}')">Delete</button>`:""}<button type="button" class="btn sec" onclick="go('requests')">Back</button></div></form></div>`}
async function save(ev,id){ev.preventDefault();const v=i=>$("#"+i).value.trim(),E={};
  if(v("t").length<5)E.et="Title must be at least 5 characters.";
  else if(reqs.some(r=>r.id!==id&&r.createdBy===uid&&r.status==="Pending"&&r.title.toLowerCase()===v("t").toLowerCase()))E.et="You already have a pending request with this title.";
  if(!v("l"))E.el="Location is required.";
  if(v("d").length<10)E.ed="Please describe the issue (10+ characters).";
  ["et","el","ed"].forEach(k=>$("#"+k).textContent=E[k]||"");if(Object.keys(E).length)return false;
  const b={title:v("t"),category:v("k"),location:v("l"),description:v("d"),updatedAt:Date.now()};
  try{if(id){if($("#s")){b.status=$("#s").value;b.notes=v("o")}await db.doc("requests/"+id).update(b);setFlash("Request updated.")}
  else{await db.collection("requests").add({...b,status:"Pending",notes:"",createdBy:uid,createdByName:me.name,createdAt:Date.now()});setFlash("Request submitted successfully.")}
  go("requests")}catch(e){setFlash("Could not save: "+(e.message||"error"),1);render()}return false}
async function del(id){if(!confirm("Delete this request permanently?"))return;
  try{await db.doc("requests/"+id).delete();setFlash("Request deleted.");go("requests")}catch(e){setFlash("Could not delete: "+(e.message||"error"),1);render()}}
function reports(){const v=visible(),done=v.filter(r=>r.status==="Completed").length;
  return `<h2>Reports</h2><div class="card"><h3>Requests by category</h3>${donut(CATS.map(c=>[c,v.filter(r=>r.category===c).length]))}</div>
<div class="card"><h3>Summary</h3><p>Total: <b>${v.length}</b> · Completed: <b>${done}</b> · Resolution rate: <b>${v.length?Math.round(done/v.length*100):0}%</b></p></div>`}
function profile(){return `<h2>My profile</h2><div class="card" style="max-width:520px"><form onsubmit="return upd(event)" novalidate>
<label for="n">Full name</label><input id="n" value="${esc(me.name)}"><div class="err" id="en"></div>
<label for="c">Mobile</label><input id="c" value="${esc(me.contact)}"><div class="err" id="ec"></div>
<label for="p">Purok / Street</label><input id="p" value="${esc(me.purok)}"><div class="err" id="ep"></div>
<p class="mut">Email: ${esc(me.email)} · Role: <b>${esc(cap(me.role))}</b></p><button class="btn">Save profile</button></form></div>`}
async function upd(ev){ev.preventDefault();const v=i=>$("#"+i).value.trim(),E={};
  if(v("n").length<3)E.en="Enter your full name.";if(!/^09\d{9}$/.test(v("c")))E.ec="Use 11 digits starting with 09.";if(!v("p"))E.ep="Required.";
  ["en","ec","ep"].forEach(k=>$("#"+k).textContent=E[k]||"");if(Object.keys(E).length)return false;
  try{await db.doc("profiles/"+uid).update({name:v("n"),contact:v("c"),purok:v("p")});setFlash("Profile updated.");render()}catch(e){setFlash("Could not update profile.",1);render()}return false}
function users(){return `<h2>Manage users</h2>${acctForm()}<div class="card tw"><table><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>${profs.map(p=>`<tr><td>${esc(p.name)}</td><td>${esc(p.email)}</td><td>${p.id===uid?esc(cap(p.role))+" (you)":`<select aria-label="Role" onchange="setRole('${p.id}',this.value)">${["resident","staff","admin"].map(x=>`<option value="${x}" ${p.role===x?"selected":""}>${cap(x)}</option>`).join("")}</select>`}</td><td>${p.id===uid?"":`<button class="btn sec sm" onclick="switchTo('${p.id}')">Use</button> `}${p.id===realUid?"":`<button class="btn bad sm" onclick="delAcct('${p.id}')">Delete</button>`}</td></tr>`).join("")}</table></div>`}
async function setRole(id,r){try{await db.doc("profiles/"+id).update({role:r});setFlash("Role updated.");render()}catch(e){setFlash("Could not change role.",1);render()}}
function about(){return `<h2>About &amp; Help</h2><div class="card"><p>The Barangay Maligaya Online Service Request System lets residents file service requests and lets barangay officials and staff process them in one place.</p>
<details><summary>How do I submit a request?</summary><p>Register, open <b>Requests → New request</b>, fill in the form, and submit.</p></details>
<details><summary>What do the statuses mean?</summary><p>Pending: received. In Progress: being handled. Completed: done. Rejected: cannot be fulfilled (see staff notes).</p></details>
<details><summary>Can I edit my request?</summary><p>Yes, while it is still Pending. Staff can edit any request.</p></details>
<details><summary>User roles</summary><p><b>Resident</b> files and tracks requests. <b>Staff</b> process all requests. <b>Admin</b> also manages users. The first person to register becomes admin.</p></details></div>`}
const LOG=[
["1. App foundation","Build a barangay app.","Too vague: the result was a few static pages with no workflow and no data.","Build the Barangay Maligaya Online Service Request System with Resident, Staff and Admin roles. Pages: Home, Login, Register, Dashboard, Requests, Add/Edit Request, Reports, Profile, Help. Use one color scheme, a responsive layout and a footer.","Added the target users, roles, page list and design rules, which gave a consistent multi-page layout."],
["2. Database","Add a database.","Unclear which tables and fields to create, so the data was incomplete.","Create a profiles table (name, email, contact, purok, role) and a requests table (title, category, location, description, status, notes, createdBy, createdAt, updatedAt). Each request belongs to the user who created it. Do not use sample data.","Named the entities, fields and relationship, and banned sample data, so the app used real stored records."],
["3. Authentication and roles","Add login.","Pages stayed open to everyone and roles were not enforced.","Add registration, login, logout and a profile page. Protect Dashboard, Requests, Reports and Users. Residents see only their own requests, Staff see all and update status, Admin also manages user roles. The first registered user becomes Admin.","Defined exactly who can see and do what, plus the first-admin rule."],
["4. CRUD","Let users manage requests.","The first version could add requests but not edit or delete them.","Implement full CRUD on requests: create with a form, read in a searchable and filterable table, update through an edit form, and delete with a confirmation. Residents may edit or delete only their own Pending requests.","Listed all four operations and the ownership rule, which completed the Add, View, Edit, Delete workflow."],
["5. Dashboard and reports","Make a dashboard.","It showed placeholder numbers that did not change.","Dashboard: total requests, counts per status, a status bar chart, and the 5 most recent activities, all calculated from the database. Reports: requests per category and the resolution rate.","Tied every number to stored data and named the exact statistics and charts."],
["6. Validation and errors","Add validation.","Forms accepted bad data and gave no clear messages.","Validate required fields, email format, a mobile number starting with 09 and 11 digits, a password of 8+ characters with a letter and a number, matching password confirmation, and duplicate email or duplicate pending title. Show a message under each field plus success messages.","Listed each rule and where messages appear, so errors became specific and friendly."]];
function log(){return `<h2>Prompt Development Log</h2><p class="mut">Each prompt was refined after checking the result. Open an entry to see the weak version, the problem, and the improved prompt.</p>`+LOG.map(e=>`<details class="card"><summary>${esc(e[0])}</summary><p><b>Version 1:</b> ${esc(e[1])}</p><p><b>Problem:</b> ${esc(e[2])}</p><p><b>Improved prompt:</b> ${esc(e[3])}</p><p><b>Result:</b> ${esc(e[4])}</p></details>`).join("")}
function realAdmin(){const r=profs.find(p=>p.id===realUid);return !!(r&&r.role==="admin")}
function acctSel(){return `<select aria-label="Switch account" onchange="switchTo(this.value)" style="width:auto">${profs.map(p=>`<option value="${p.id}" ${p.id===uid?"selected":""}>${esc(p.name)} (${esc(cap(p.role))})</option>`).join("")}</select>`}
function switchTo(id){const t=profs.find(p=>p.id===id);if(!t)return;uid=id;me=t;try{localStorage.setItem("acct",id)}catch(e){}out=false;try{sessionStorage.removeItem("out")}catch(e){}setFlash("Now using account: "+t.name+" ("+cap(t.role)+").");go("dash")}
function acctForm(){return `<details class="card"><summary>+ Add new account</summary><form onsubmit="return addAcct(event)" novalidate>
<div class="fgrid"><div><label for="a_n">Full name</label><input id="a_n"><div class="err" id="ea_n"></div></div><div><label for="a_e">Email</label><input id="a_e" type="email"><div class="err" id="ea_e"></div></div></div>
<div class="fgrid"><div><label for="a_c">Mobile (09XXXXXXXXX)</label><input id="a_c" inputmode="numeric"><div class="err" id="ea_c"></div></div><div><label for="a_p">Purok / Street</label><input id="a_p"><div class="err" id="ea_p"></div></div></div>
<div class="fgrid"><div><label for="a_r">Role</label><select id="a_r"><option value="resident">Resident</option><option value="staff">Staff</option><option value="admin">Admin</option></select></div><div><label for="a_w">Password</label><input id="a_w" type="password"><div class="err" id="ea_w"></div></div><div><label for="a_w2">Confirm password</label><input id="a_w2" type="password"><div class="err" id="ea_w2"></div></div></div>
<button class="btn" style="margin-top:10px">Create account</button></form></details>`}
async function addAcct(ev){ev.preventDefault();const v=i=>$("#"+i).value.trim(),E={};
  if(v("a_n").length<3)E.a_n="Enter a full name (3+ characters).";
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("a_e")))E.a_e="Enter a valid email address.";
  else if(profs.some(p=>(p.email||"").toLowerCase()===v("a_e").toLowerCase()))E.a_e="This email is already registered.";
  if(!/^09\d{9}$/.test(v("a_c")))E.a_c="Use 11 digits starting with 09.";
  if(!v("a_p"))E.a_p="Required.";
  const w=$("#a_w").value;if(w.length<8||!/\d/.test(w)||!/[A-Za-z]/.test(w))E.a_w="8+ characters with a letter and a number.";
  if($("#a_w2").value!==w)E.a_w2="Passwords do not match.";
  ["a_n","a_e","a_c","a_p","a_w","a_w2"].forEach(k=>$("#e"+k).textContent=E[k]||"");if(Object.keys(E).length)return false;
  try{await db.collection("profiles").add({name:v("a_n"),email:v("a_e"),contact:v("a_c"),purok:v("a_p"),role:$("#a_r").value,managed:true,createdAt:Date.now()});setFlash("Account created for "+v("a_n")+". Use the account switcher or the Use button to sign in as them.");render()}catch(e){setFlash("Could not create account: "+(e.message||"error"),1);render()}return false}
async function delAcct(id){const t=profs.find(p=>p.id===id);if(!t||id===realUid||!confirm("Delete the account for "+t.name+"?"))return;
  try{await db.doc("profiles/"+id).delete();setFlash("Account deleted.");render()}catch(e){setFlash("Could not delete account.",1);render()}}
const COL=["#2dd4bf","#60a5fa","#fbbf24","#f87171","#a78bfa","#34d399","#fb923c","#f472b6","#94a3b8"];
function donut(d,cols){const P=cols||COL;window._d=d;const T=d.reduce((a,x)=>a+x[1],0),C=2*Math.PI*70,n=d.filter(y=>y[1]).length;let off=0;
  const segs=T?d.map((x,i)=>{if(!x[1])return"";const len=x[1]/T*C,g=n>1?3:0;const s=`<circle class="seg" data-i="${i}" cx="100" cy="100" r="70" fill="none" stroke="${P[i%P.length]}" stroke-width="28" stroke-dasharray="${Math.max(len-g,0.5)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 100 100)" style="animation-delay:${i*0.12}s" onmouseover="hl(${i})" onmouseout="hl(-1)"/>`;off+=len;return s}).join(""):`<circle cx="100" cy="100" r="70" fill="none" stroke="var(--bd)" stroke-width="28"/>`;
  return `<div class="dw"><svg viewBox="0 0 200 200" width="230" height="230" role="img" aria-label="Donut chart of requests by category">${segs}<text id="dc1" x="100" y="106" text-anchor="middle" font-size="30" font-weight="700" fill="var(--tx)">${T}</text><text id="dc2" x="100" y="126" text-anchor="middle" font-size="11" fill="var(--mut)">${T?"requests":"No data yet"}</text></svg><div class="lgs">${d.map((x,i)=>`<div class="lg" data-i="${i}" onmouseover="hl(${i})" onmouseout="hl(-1)"><i style="background:${P[i%P.length]}"></i><span>${esc(x[0])}</span><b>${x[1]}</b></div>`).join("")}</div></div>`}
function hl(i){const D=window._d||[],T=D.reduce((a,x)=>a+x[1],0);document.querySelectorAll(".seg").forEach(s=>{const k=+s.dataset.i;s.style.opacity=i<0||k===i?1:.25;s.setAttribute("stroke-width",k===i?34:28)});document.querySelectorAll(".lg").forEach(l=>{l.style.opacity=i<0||+l.dataset.i===i?1:.45});const a=$("#dc1"),b=$("#dc2");if(!a)return;if(i<0){a.textContent=T;b.textContent=T?"requests":"No data yet"}else{a.textContent=D[i][1];b.textContent=(T?Math.round(D[i][1]/T*100):0)+"% of requests"}}
const ICO={"Pending":"⏳","In Progress":"🔧","Completed":"✅","Rejected":"❌"};
function pick(b,s){$("#s").value=s;b.parentNode.querySelectorAll(".chip").forEach(x=>x.classList.toggle("on",x===b));const o=$("#o");if(o){o.placeholder=s==="Rejected"?"Reason for rejection (the resident will see this)":"";if(s==="Rejected")o.focus()}}
async function qs(ev,id,s){ev.stopPropagation();try{await db.doc("requests/"+id).update({status:s,updatedAt:Date.now()});setFlash("Request marked as "+s+"."+(s==="Rejected"?" Open it to add a reason.":""))}catch(e){setFlash("Could not update the status.",1)}render()}
window.addEventListener("hashchange",render);init();
