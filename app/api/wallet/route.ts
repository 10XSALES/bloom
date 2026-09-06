import { database } from '@/db/storage';
import { validState } from '@/lib/money';
export async function GET(){
 try{const row=await database().prepare('SELECT data, revision FROM wallet WHERE id = 1').first<{data:string;revision:number}>();
 return Response.json({state:row?JSON.parse(row.data):null,revision:row?.revision??0},{headers:{'Cache-Control':'no-store'}})}
 catch{return Response.json({error:'Your saved wallet could not be loaded. Please retry.'},{status:503})}
}
export async function PUT(request:Request){
 if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Invalid origin'},{status:403});
 try{
 const raw=await request.text();if(raw.length>500000)return Response.json({error:'Wallet is too large'},{status:413});
 const {state,revision}=JSON.parse(raw);
 if(!validState(state)||!Number.isInteger(revision)||revision<0)return Response.json({error:'Please check your entries.'},{status:400});
 const db=database();
 const result=revision===0
 ?await db.prepare('INSERT INTO wallet (id,data,revision) VALUES (1,?,1) ON CONFLICT(id) DO NOTHING').bind(JSON.stringify(state)).run()
 :await db.prepare('UPDATE wallet SET data = ?, revision = revision + 1 WHERE id = 1 AND revision = ?').bind(JSON.stringify(state),revision).run();
 if(!result.meta.changes)return Response.json({error:'This wallet changed in another tab. Reload before saving.'},{status:409});
 return Response.json({revision:revision+1});
 }catch{return Response.json({error:'Could not save your wallet. Your changes have not been saved; please retry.'},{status:503})}
}
