const seedTransactions = [
  {id:1,description:"SIMULATED · Enterprise hardware order",date:"2026-11-06",reference:"TEST-CR-261106",type:"credit",amount:120000},
  {id:2,description:"SIMULATED · Server equipment purchase",date:"2026-11-05",reference:"TEST-DR-261105",type:"debit",amount:18500},
  {id:3,description:"SIMULATED · Managed services contract",date:"2026-11-03",reference:"TEST-CR-261103",type:"credit",amount:85000},
  {id:4,description:"SIMULATED · Office lease and utilities",date:"2026-10-30",reference:"TEST-DR-261030",type:"debit",amount:12400},
  {id:5,description:"SIMULATED · Software licensing",date:"2026-10-27",reference:"TEST-CR-261027",type:"credit",amount:62500},
  {id:6,description:"SIMULATED · Network installation",date:"2026-10-23",reference:"TEST-DR-261023",type:"debit",amount:8990.50},
  {id:7,description:"SIMULATED · IT support retainer",date:"2026-10-19",reference:"TEST-CR-261019",type:"credit",amount:48000},
  {id:8,description:"SIMULATED · Equipment maintenance",date:"2026-10-15",reference:"TEST-DR-261015",type:"debit",amount:7200},
  {id:9,description:"SIMULATED · Cloud infrastructure services",date:"2026-10-12",reference:"TEST-CR-261012",type:"credit",amount:57000},
  {id:10,description:"SIMULATED · Computer peripherals",date:"2026-10-08",reference:"TEST-DR-261008",type:"debit",amount:6400},
  {id:11,description:"SIMULATED · Business systems project",date:"2026-09-29",reference:"TEST-CR-260929",type:"credit",amount:39500},
  {id:12,description:"SIMULATED · Logistics and delivery",date:"2026-09-25",reference:"TEST-DR-260925",type:"debit",amount:5200},
  {id:13,description:"SIMULATED · Annual support renewal",date:"2026-09-21",reference:"TEST-CR-260921",type:"credit",amount:36000},
  {id:14,description:"SIMULATED · Office operations",date:"2026-09-17",reference:"TEST-DR-260917",type:"debit",amount:4000},
  {id:15,description:"SIMULATED · Workstation supply",date:"2026-09-10",reference:"TEST-CR-260910",type:"credit",amount:32000},
  {id:16,description:"SIMULATED · Payment processing fees",date:"2026-09-04",reference:"TEST-DR-260904",type:"debit",amount:2253.52}
];
const currentBalanceBaseline = 415055.98;
const seedNetMovement = seedTransactions.reduce((sum,t)=>sum+(t.type==="credit"?t.amount:-t.amount),0);
const openingBalance = currentBalanceBaseline - seedNetMovement;
const storageKey = "quark-ledger-entries-v2";
let transactions = loadEntries();
const money = n => new Intl.NumberFormat("en-MY",{style:"currency",currency:"MYR"}).format(n);
const dateLabel = s => {const value=String(s).trim();let year,month,day;const iso=value.match(/^(\d{4})-(\d{2})-(\d{2})/);if(iso){year=Number(iso[1]);month=Number(iso[2]);day=Number(iso[3]);}else{const parsed=new Date(value);if(Number.isNaN(parsed.getTime()))return escapeHTML(value);year=parsed.getFullYear();month=parsed.getMonth()+1;day=parsed.getDate();}const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];return month>=1&&month<=12&&day>=1&&day<=31?`${String(day).padStart(2,"0")} ${months[month-1]} ${year}`:escapeHTML(value);};
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
  const balance=openingBalance+credits-debits;
  const balanceParts=new Intl.NumberFormat("en-MY",{minimumFractionDigits:2,maximumFractionDigits:2}).format(balance).split(".");
  document.querySelector("#balanceWhole").textContent=balanceParts[0];
  document.querySelector("#balanceCents").textContent="."+(balanceParts[1]||"00");
  document.querySelector("#creditsValue").textContent=money(credits).replace("MYR","RM");
  document.querySelector("#debitsValue").textContent=money(debits).replace("MYR","RM");
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
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
