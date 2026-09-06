import type { Loan } from './money';
export type Strategy='avalanche'|'snowball'|'minimum';
const cents=(n:number)=>Math.round(n*100)/100;
export function orderLoans(loans:Loan[],strategy:Strategy){
 return [...loans].filter(l=>l.balance>0).sort((a,b)=>strategy==='snowball'?a.balance-b.balance||b.apr-a.apr:b.apr-a.apr||a.balance-b.balance);
}
export function payoff(loans:Loan[],extra:number,strategy:Strategy='avalanche'){
 const active=loans.filter(l=>l.balance>0);
 if(!Number.isFinite(extra)||extra<0)throw Error('Extra payment must be zero or more.');
 let remaining=active.map(l=>({...l})),interest=0;
 const budget=cents(active.reduce((n,l)=>n+l.payment,0)+extra);
 const paidOff:{id:string;month:number}[]=[];
 const points=[{month:0,balance:cents(active.reduce((n,l)=>n+l.balance,0))}];
 for(let month=1;month<=600&&remaining.some(l=>l.balance>0);month++){
  for(const l of remaining)if(l.balance>0){const charge=cents(l.balance*l.apr/1200);l.balance=cents(l.balance+charge);interest=cents(interest+charge)}
  let available=budget;
  for(const l of remaining)if(l.balance>0){const paid=Math.min(l.payment,l.balance);l.balance=cents(l.balance-paid);available=cents(available-paid)}
  if(strategy!=='minimum')for(const l of orderLoans(remaining,strategy)){
   const paid=Math.min(available,l.balance);const target=remaining.find(x=>x.id===l.id)!;
   target.balance=cents(target.balance-paid);available=cents(available-paid);
   if(available<=0)break;
  }
  for(const l of remaining)if(l.balance===0&&!paidOff.some(p=>p.id===l.id))paidOff.push({id:l.id,month});
  const balance=cents(remaining.reduce((n,l)=>n+l.balance,0));
  points.push({month,balance});
 }
 const done=remaining.every(l=>l.balance===0);
 return {months:done?points.length-1:null,interest:done?interest:null,paidOff,points,budget};
}
