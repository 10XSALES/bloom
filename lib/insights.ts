import {State, forecast, parse, iso, addDays} from './money';
export type Period='WTD'|'MTD'|'YTD';
export function insights(s:State,period:Period,now:string){
 const d=parse(now), y=d.getUTCFullYear(),m=d.getUTCMonth();
 const start=period==='YTD'?`${y}-01-01`:period==='MTD'?iso(new Date(Date.UTC(y,m,1,12))):addDays(now,-((d.getUTCDay()+6)%7));
 const end=period==='YTD'?`${y}-12-31`:period==='MTD'?iso(new Date(Date.UTC(y,m+1,0,12))):addDays(start,6);
 const saved=new Map<string,{date:string;balance:number}>();
 for(const r of s.reviews)if(r.date>=start&&r.date<=now&&!saved.has(r.date))saved.set(r.date,{date:r.date,balance:r.cash+r.savings});
 if(s.asOf>=start&&s.asOf<=now)saved.set(s.asOf,{date:s.asOf,balance:s.accounts.filter(a=>['spending','savings'].includes(a.kind)).reduce((n,a)=>n+a.balance,0)});
 const days=Math.round((+parse(end)-+parse(s.asOf))/86400000);
 const available=days>=0&&days<=366;
 const projected=available?forecast(s,days):null;
 const buckets=new Map<string,{date:string;income:number;spending:number;debt:number}>();
 const loanIds=new Set((s.loans??[]).map(l=>'loan-'+l.id));
 for(const e of projected?.events??[]){
  if(e.routine.kind==='transfer')continue;
  const key=period==='YTD'?e.date.slice(0,7)+'-01':e.date;
  const b=buckets.get(key)??{date:key,income:0,spending:0,debt:0};
  b[e.routine.kind==='income'?'income':loanIds.has(e.routine.id)?'debt':'spending']+=e.routine.amount;buckets.set(key,b);
 }
 return {start,end,available,history:[...saved.values()].sort((a,b)=>a.date.localeCompare(b.date)),points:projected?.points??[],flow:[...buckets.values()],stale:s.asOf<now};
}
