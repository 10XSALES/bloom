export type Account={id:string;name:string;kind:'spending'|'savings'|'investment'|'retirement';balance:number};
export type Routine={id:string;name:string;kind:'income'|'expense'|'transfer';amount:number;frequency:'once'|'weekly'|'biweekly'|'monthly'|'semimonthly'|'quarterly'|'yearly';source?:string;includeForecast?:boolean;date:string;accountId:string;toId?:string};
export type Goal={id:string;title:string;why:string;target:number;accountId:string;deadline:string;imageUrl?:string;tone:number};
export type Review={id:string;date:string;cash:number;savings:number;note:string};
export type Loan={debtType?:'loan'|'credit_card';id:string;name:string;balance:number;apr:number;payment:number;dueDay:number;accountId:string};
export type State={profile?:'student'|'general';currency:string;asOf:string;accounts:Account[];routines:Routine[];goals:Goal[];reviews:Review[];loans?:Loan[];debtExtra?:number};
export const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
export const parse=(s:string)=>new Date(s+'T12:00:00Z');
export const iso=(d:Date)=>d.toISOString().slice(0,10);
export const addDays=(s:string,n:number)=>{const d=parse(s);d.setUTCDate(d.getUTCDate()+n);return iso(d)};
export const dayLabel=(s:string)=>parse(s).toLocaleDateString('en',{month:'short',day:'numeric',timeZone:'UTC'});
export const total=(s:State,kind:string)=>s.accounts.filter(a=>a.kind===kind).reduce((n,a)=>n+a.balance,0);
export function occurs(r:Routine,date:string){
 if(date<r.date)return false;
 const diff=Math.round((+parse(date)-+parse(r.date))/86400000);
 if(r.frequency==='once')return date===r.date;
 if(r.frequency==='weekly')return diff%7===0;
 if(r.frequency==='biweekly')return diff%14===0;
 const d=parse(date),anchor=parse(r.date),last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();
 const months=(d.getUTCFullYear()-anchor.getUTCFullYear())*12+d.getUTCMonth()-anchor.getUTCMonth();
 if(r.frequency==='quarterly'&&months%3!==0)return false;
 if(r.frequency==='yearly'&&months%12!==0)return false;
 if(r.frequency==='semimonthly')return d.getUTCDate()===15||d.getUTCDate()===last;
 return d.getUTCDate()===Math.min(anchor.getUTCDate(),last);
}
export function forecast(s:State,days:number){
 const balances=Object.fromEntries(s.accounts.map(a=>[a.id,a.balance]));
 const loanBalances=Object.fromEntries((s.loans??[]).map(l=>[l.id,l.balance]));
 const points=[{date:s.asOf,cash:total(s,'spending'),savings:total(s,'savings')}];
 const events:{date:string;routine:Routine}[]=[];
 for(let i=1;i<=days;i++){
  const date=addDays(s.asOf,i);
  for(const r of s.routines)if(r.includeForecast!==false&&occurs(r,date)&&r.accountId in balances){
   balances[r.accountId]=Math.round((balances[r.accountId]+(r.kind==='income'?r.amount:-r.amount))*100)/100;
   if(r.kind==='transfer'&&r.toId&&r.toId in balances)balances[r.toId]=Math.round((balances[r.toId]+r.amount)*100)/100;
   events.push({date,routine:r});
  }
  for(const l of s.loans??[]){
   const d=parse(date),last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();
   if(d.getUTCDate()===Math.min(l.dueDay,last)&&loanBalances[l.id]>0&&l.accountId in balances){
    loanBalances[l.id]=Math.round(loanBalances[l.id]*(1+l.apr/1200)*100)/100;
    const paid=Math.min(l.payment,loanBalances[l.id]);
    loanBalances[l.id]=Math.round((loanBalances[l.id]-paid)*100)/100;
    balances[l.accountId]=Math.round((balances[l.accountId]-paid)*100)/100;
    events.push({date,routine:{id:'loan-'+l.id,name:l.name+' · loan payment',kind:'expense',amount:paid,frequency:'monthly',date,accountId:l.accountId}});
   }
  }
  const sum=(kind:string)=>s.accounts.filter(a=>a.kind===kind).reduce((n,a)=>n+balances[a.id],0);
  points.push({date,cash:sum('spending'),savings:sum('savings')});
 }
 return {points,events};
}
export function sample():State{
 const date=today();
 return {currency:'PHP',asOf:date,accounts:[{id:'cash',name:'Everyday wallet',kind:'spending',balance:24500},{id:'rainy',name:'Emergency savings',kind:'savings',balance:45000},{id:'travel',name:'Travel fund',kind:'savings',balance:18000},{id:'studio',name:'Studio fund',kind:'savings',balance:5000}],routines:[
 {id:'salary',name:'Salary',kind:'income',amount:30000,frequency:'semimonthly',date,accountId:'cash'},
 {id:'rent',name:'Rent',kind:'expense',amount:14000,frequency:'monthly',date:addDays(date,7),accountId:'cash'},
 {id:'groceries',name:'Groceries & everyday',kind:'expense',amount:3500,frequency:'weekly',date:addDays(date,2),accountId:'cash'},
 {id:'utilities',name:'Utilities & internet',kind:'expense',amount:4200,frequency:'monthly',date:addDays(date,10),accountId:'cash'},
 {id:'saving',name:'Emergency fund top-up',kind:'transfer',amount:5000,frequency:'semimonthly',date,accountId:'cash',toId:'rainy'}
 ],goals:[{id:'g1',title:'Room to breathe',why:'Build a cushion for life’s surprises.',target:100000,accountId:'rainy',deadline:addDays(date,240),tone:0},{id:'g2',title:'A change of scenery',why:'Two weeks of discovery in Japan.',target:80000,accountId:'travel',deadline:addDays(date,300),tone:1},{id:'g3',title:'Create something of my own',why:'A space to turn ideas into something real.',target:50000,accountId:'studio',deadline:addDays(date,365),tone:2}],reviews:[]};
}
export function validState(s:any):s is State{
 if(!s||(s.profile!==undefined&&!['student','general'].includes(s.profile))||!['PHP','USD','EUR','GBP'].includes(s.currency)||!validDate(s.asOf))return false;
 if(!['accounts','routines','goals','reviews'].every(k=>Array.isArray(s[k])&&s[k].length<=500))return false;
 const text=(x:any)=>typeof x==='string'&&x.length<=500;
 const money=(n:any)=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=1e12;
 const ids=new Set<string>();
 for(const a of s.accounts){if(!text(a.id)||ids.has(a.id)||!text(a.name)||!a.name.trim()||!['spending','savings','investment','retirement'].includes(a.kind)||!money(a.balance))return false;ids.add(a.id)}
 for(const r of s.routines)if((r.source!==undefined&&!text(r.source))||(r.includeForecast!==undefined&&typeof r.includeForecast!=='boolean')||!text(r.id)||!text(r.name)||!r.name.trim()||!['income','expense','transfer'].includes(r.kind)||!money(r.amount)||r.amount<=0||!['once','weekly','biweekly','monthly','semimonthly','quarterly','yearly'].includes(r.frequency)||!validDate(r.date)||!ids.has(r.accountId)||(r.kind==='transfer'&&(!ids.has(r.toId)||r.toId===r.accountId)))return false;
 for(const g of s.goals)if(!text(g.id)||!text(g.title)||!g.title.trim()||!text(g.why)||!money(g.target)||g.target<=0||!ids.has(g.accountId)||!validDate(g.deadline)||(g.imageUrl!==undefined&&(typeof g.imageUrl!=='string'||g.imageUrl.length>2000||(g.imageUrl!==''&&!g.imageUrl.toLowerCase().startsWith('https://'))))||![0,1,2].includes(g.tone))return false;
 for(const r of s.reviews)if(!text(r.id)||!validDate(r.date)||!money(r.cash)||!money(r.savings)||!text(r.note))return false;
 if(s.loans!==undefined){
  if(!Array.isArray(s.loans)||s.loans.length>50)return false;
  const loanIds=new Set<string>();
  for(const l of s.loans){
   if((l.debtType!==undefined&&!['loan','credit_card'].includes(l.debtType))||!text(l.id)||loanIds.has(l.id)||!text(l.name)||!l.name.trim()||!money(l.balance)||l.balance<0||!money(l.apr)||l.apr<0||l.apr>100||!money(l.payment)||l.payment<=0||!Number.isInteger(l.dueDay)||l.dueDay<1||l.dueDay>31||!s.accounts.some((a:any)=>a.id===l.accountId&&a.kind==='spending'))return false;
   loanIds.add(l.id);
  }
 }
 if(s.debtExtra!==undefined&&(!money(s.debtExtra)||s.debtExtra<0))return false;
 return true;
}
export function validDate(v:any){return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(+parse(v))&&iso(parse(v))===v}
