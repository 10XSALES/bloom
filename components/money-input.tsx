'use client';
import { useLayoutEffect, useRef, useState, type InputHTMLAttributes } from 'react';
export function formatAmount(value:string){const raw=value.replace(/,/g,'');if(!/^-?\d*(\.\d{0,2})?$/.test(raw))return null;const [whole,decimal]=raw.split('.');return whole.replace(/\B(?=(\d{3})+(?!\d))/g,',')+(decimal!==undefined?'.'+decimal:'')}
export function MoneyInput({value,defaultValue,onChange,min,max,step,type,...props}:InputHTMLAttributes<HTMLInputElement>){
 const [local,setLocal]=useState(String(defaultValue??''));const ref=useRef<HTMLInputElement>(null);const caret=useRef<number|null>(null);const shown=formatAmount(String(value??local))??'';
 useLayoutEffect(()=>{const el=ref.current;if(!el)return;const raw=shown.replace(/,/g,'');const n=Number(raw);el.setCustomValidity(raw&&(!Number.isFinite(n)||raw==='-'||raw==='.'||(min!==undefined&&n<Number(min))||(max!==undefined&&n>Number(max)))?'Enter an amount within the allowed range.':'');if(caret.current!==null){el.setSelectionRange(caret.current,caret.current);caret.current=null}},[shown,min,max]);
 return <input {...props} ref={ref} type="text" inputMode="decimal" value={shown} onChange={e=>{const el=e.currentTarget;const before=el.value.slice(0,el.selectionStart??el.value.length).replace(/,/g,'').length;const next=formatAmount(el.value);if(next===null){el.value=shown;return}let index=0,count=0;while(index<next.length&&count<before){if(next[index]!==',')count++;index++}caret.current=index;setLocal(next);el.value=next;onChange?.(e)}}/>;
}
