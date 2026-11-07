const seedTransactions = [
  {id:1,description:"Enterprise hardware order",date:"2026-11-06",reference:"QC-CR-261106",type:"credit",amount:120000},
  {id:2,description:"Server equipment purchase",date:"2026-11-05",reference:"QC-DR-261105",type:"debit",amount:18500},
  {id:3,description:"Managed services contract",date:"2026-11-03",reference:"QC-CR-261103",type:"credit",amount:85000},
  {id:4,description:"Office lease and utilities",date:"2026-10-30",reference:"QC-DR-261030",type:"debit",amount:12400},
  {id:5,description:"Software licensing",date:"2026-10-27",reference:"QC-CR-261027",type:"credit",amount:62500},
  {id:6,description:"Network installation",date:"2026-10-23",reference:"QC-DR-261023",type:"debit",amount:8990.50},
  {id:7,description:"IT support retainer",date:"2026-10-19",reference:"QC-CR-261019",type:"credit",amount:48000},
  {id:8,description:"Equipment maintenance",date:"2026-10-15",reference:"QC-DR-261015",type:"debit",amount:7200},
  {id:9,description:"Cloud infrastructure services",date:"2026-10-12",reference:"QC-CR-261012",type:"credit",amount:57000},
  {id:10,description:"Computer peripherals",date:"2026-10-08",reference:"QC-DR-261008",type:"debit",amount:6400},
  {id:11,description:"Business systems project",date:"2026-09-29",reference:"QC-CR-260929",type:"credit",amount:39500},
  {id:12,description:"Logistics and delivery",date:"2026-09-25",reference:"QC-DR-260925",type:"debit",amount:5200},
  {id:13,description:"Annual support renewal",date:"2026-09-21",reference:"QC-CR-260921",type:"credit",amount:36000},
  {id:14,description:"Office operations",date:"2026-09-17",reference:"QC-DR-260917",type:"debit",amount:4000},
  {id:15,description:"Workstation supply",date:"2026-09-10",reference:"QC-CR-260910",type:"credit",amount:32000},
  {id:16,description:"Payment processing fees",date:"2026-09-04",reference:"QC-DR-260904",type:"debit",amount:2253.52}
];
const openingBalance = 0;
const storageKey = "quark-ledger-entries-v2";
let transactions = loadEntries();
const money = n => new Intl.NumberFormat("en-MY",{style:"currency",currency:"MYR"}).format(n);
const dateLabel = s => {const value=String(s).trim();const iso=value.match(/^(\\d{4})-(\\d{2})-(\\d{2})/);if(!iso)return value;const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];return `${iso[3]} ${months[Number(iso[2])-1]} ${iso[1]}`;};
function loadEntries(){try{const saved=localStorage.getItem(storageKey);return saved?JSON.parse(saved):seedTransactions;}catch{return seedTransactions;}}
function render(){
  const query=document.querySelector("#searchInput").value.trim().toLowerCase();
  const filter=document.querySelector("#typeFilter").value;
  const visible=transactions.filter(t=>(filter==="all"||t.type===filter)&&[t.description,t.reference,t.date].some(v=>v.toLowerCase().includes(query))).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
  document.querySelector("#transactionRows").innerHTML=visible.map(t=>`<tr><td>${escapeHTML(t.description)}</td><td>${dateLabel(t.date)}</td><td class="ref">${escapeHTML(t.reference)}</td><td><span class="type-tag ${t.type}">${t.type.toUpperCase()}</span></td><td class="amount ${t.type==="credit"?"positive":"negative"}">${t.type==="credit"?"+":"−"}${money(t.amount).replace("MYR","RM")}</td></tr>`).join("");
  document.querySelector("#emptyState").hidden=visible.length>0;
  document.querySelector("#entryCount").textContent=`Showing ${visible.length} of ${transactions.length} entries`;
  const credits=transactions.filter(t=>t.type==="credit").reduce((s,t)=>s+t.amount,0);
  const debits=transactions.filter(t=>t.type==="debit").reduce((s,t)=>s+t.amount,0);
  const balance=openingBalance+credits-debits;
  const parts=new Intl.NumberFormat("en-MY",{minimumFractionDigits:2,maximumFractionDigits:2}).format(balance).split(".");
  document.querySelector("#balanceWhole").textContent=parts[0];
  document.querySelector("#balanceCents").textContent="."+(parts[1]||"00");
  document.querySelector("#creditsValue").textContent=money(credits).replace("MYR","RM");
  document.querySelector("#debitsValue").textContent=money(debits).replace("MYR","RM");
  renderSnapshot(credits,debits,balance);
}
function renderSnapshot(credits,debits,balance){
  const fmt=n=>money(n).replace("MYR","RM");
  const months=[["2026-09","Sep"],["2026-10","Oct"],["2026-11","Nov"]];
  const monthly=months.map(([key,label])=>{
    const entries=transactions.filter(t=>t.date.startsWith(key));
    const incoming=entries.filter(t=>t.type==="credit").reduce((s,t)=>s+t.amount,0);
    const outgoing=entries.filter(t=>t.type==="debit").reduce((s,t)=>s+t.amount,0);
    return {label,incoming,outgoing,net:incoming-outgoing,count:entries.length};
  });
  const max=Math.max(1,...monthly.flatMap(m=>[m.incoming,m.outgoing]));
  document.querySelector("#snapshotNet").textContent=fmt(balance-openingBalance);
  document.querySelector("#snapshotCount").textContent=transactions.length;
  document.querySelector("#snapshotOpening").textContent=fmt(openingBalance);
  document.querySelector("#snapshotCredits").textContent=fmt(credits);
  document.querySelector("#snapshotDebits").textContent=fmt(debits);
  document.querySelector("#snapshotClosing").textContent=fmt(balance);
  const largestCredit=transactions.filter(t=>t.type==="credit").reduce((a,t)=>!a||t.amount>a.amount?t:a,null);
  const largestDebit=transactions.filter(t=>t.type==="debit").reduce((a,t)=>!a||t.amount>a.amount?t:a,null);
  document.querySelector("#snapshotLargestCredit").textContent=largestCredit?fmt(largestCredit.amount):fmt(0);
  document.querySelector("#snapshotLargestDebit").textContent=largestDebit?fmt(largestDebit.amount):fmt(0);
  document.querySelector("#snapshotBars").innerHTML=monthly.map(m=>`<div class="bar-group"><i class="bar income" style="height:${m.incoming/max*100}%" title="Credits: ${fmt(m.incoming)}"></i><i class="bar expense" style="height:${m.outgoing/max*100}%" title="Debits: ${fmt(m.outgoing)}"></i></div>`).join("");
  document.querySelector("#snapshotMonths").innerHTML=monthly.map(m=>`<span>${m.label}</span>`).join("");
  document.querySelector("#monthlyRows").innerHTML=monthly.map(m=>`<div class="monthly-row"><span>${m.label} <small>${m.count} entries</small></span><b class="monthly-credit">${fmt(m.incoming)}</b><b class="monthly-debit">${fmt(m.outgoing)}</b><b class="monthly-net">${fmt(m.net)}</b></div>`).join("");
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
document.querySelector("#searchInput").addEventListener("input",render);
document.querySelector("#typeFilter").addEventListener("change",render);
document.querySelector("#exportBtn").addEventListener("click",()=>{
  const rows=[["Description","Date","Reference","Type","Amount (MYR)"],...transactions.map(t=>[t.description,t.date,t.reference,t.type,t.amount])];
  const csv=rows.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\\r\\n");
  const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="quark-computer-ledger.csv";a.click();URL.revokeObjectURL(url);
});
document.querySelector("#year").textContent=new Date().getFullYear();
render();
if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
