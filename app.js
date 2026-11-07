const seedTransactions = [
  {id:1,description:"Client payment · Project Alpha",date:"2026-11-06",reference:"QC-CR-2606",type:"credit",amount:285000},
  {id:2,description:"Hardware procurement",date:"2026-11-05",reference:"QC-DR-2605",type:"debit",amount:8240},
  {id:3,description:"Managed services revenue",date:"2026-11-03",reference:"QC-CR-2604",type:"credit",amount:93500},
  {id:4,description:"Office and utilities",date:"2026-11-01",reference:"QC-DR-2603",type:"debit",amount:3204.02},
  {id:5,description:"Support contract renewal",date:"2026-10-29",reference:"QC-CR-2602",type:"credit",amount:50000}
];
const initialBalance = 415055.98;
const storageKey = "quark-ledger-entries-v1";
let transactions = loadEntries();
const money = n => new Intl.NumberFormat("en-MY",{style:"currency",currency:"MYR"}).format(n);
const dateLabel = s => new Date(s+"T00:00:00").toLocaleDateString("en-MY",{day:"2-digit",month:"short",year:"numeric"});
function loadEntries(){try{const saved=localStorage.getItem(storageKey);return saved?JSON.parse(saved):seedTransactions;}catch{return seedTransactions;}}
function saveEntries(){try{localStorage.setItem(storageKey,JSON.stringify(transactions));}catch{}}
function render(){
  const query=document.querySelector("#searchInput").value.trim().toLowerCase();
  const filter=document.querySelector("#typeFilter").value;
  const visible=transactions.filter(t=>(filter==="all"||t.type===filter)&&[t.description,t.reference,t.date].some(v=>v.toLowerCase().includes(query))).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
  document.querySelector("#transactionRows").innerHTML=visible.map(t=>`<tr><td>${escapeHTML(t.description)}</td><td>${dateLabel(t.date)}</td><td class="ref">${escapeHTML(t.reference)}</td><td><span class="type-tag ${t.type}">${t.type.toUpperCase()}</span></td><td class="amount ${t.type==="credit"?"positive":"negative"}">${t.type==="credit"?"+":"−"}${money(t.amount).replace("MYR","RM")}</td></tr>`).join("");
  document.querySelector("#emptyState").hidden=visible.length>0;
  document.querySelector("#entryCount").textContent=`Showing ${visible.length} of ${transactions.length} entries`;
  const credits=transactions.filter(t=>t.type==="credit").reduce((s,t)=>s+t.amount,0);
  const debits=transactions.filter(t=>t.type==="debit").reduce((s,t)=>s+t.amount,0);
  document.querySelector("#creditsValue").textContent=money(credits).replace("MYR","RM");
  document.querySelector("#debitsValue").textContent=money(debits).replace("MYR","RM");
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
const dialog=document.querySelector("#entryDialog");
document.querySelector("#addTransactionBtn").addEventListener("click",()=>{const f=document.querySelector("#entryForm");f.reset();f.elements.date.value=new Date().toISOString().slice(0,10);dialog.showModal();});
document.querySelector("#closeDialog").addEventListener("click",()=>dialog.close());
document.querySelector("#cancelDialog").addEventListener("click",()=>dialog.close());
document.querySelector("#entryForm").addEventListener("submit",e=>{
  e.preventDefault();const f=e.currentTarget;const data=new FormData(f);const amount=Number(data.get("amount"));
  if(!Number.isFinite(amount)||amount<=0)return;
  const type=data.get("type");transactions.push({id:Date.now(),description:data.get("description").trim(),date:data.get("date"),reference:"QC-"+(type==="credit"?"CR":"DR")+"-"+String(Date.now()).slice(-6),type,amount});
  saveEntries();render();dialog.close();
});
document.querySelector("#searchInput").addEventListener("input",render);
document.querySelector("#typeFilter").addEventListener("change",render);
document.querySelector("#exportBtn").addEventListener("click",()=>{
  const rows=[["Description","Date","Reference","Type","Amount (MYR)"],...transactions.map(t=>[t.description,t.date,t.reference,t.type,t.amount])];
  const csv=rows.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\r\n");
  const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="quark-computer-ledger.csv";a.click();URL.revokeObjectURL(url);
});
document.querySelector("#year").textContent=new Date().getFullYear();
render();
if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
