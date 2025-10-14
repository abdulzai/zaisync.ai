'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Calendar, Mail, Beaker, Lock } from 'lucide-react';

type ThreadMessage = { from: string; time: string; body: string };
enum Tabs { Dashboard='Dashboard', Inbox='Inbox', Approvals='Approvals', Calendar='Calendar', Settings='Settings' }

export default function Page(){
  const [showTests, setShowTests] = useState(false);
  const [approvalItem, setApprovalItem] = useState<null | { title: string; preview?: string; tier?: number; provider?: 'google'|'microsoft'; thread?: ThreadMessage[] }>(null);
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Dashboard);
  const [toasts, setToasts] = useState<Array<{ id:number; message:string }>>([]);
  const [audit, setAudit] = useState<Array<{ time:string; actor:string; action:string; object:string }>>([]);
  const [connections, setConnections] = useState<{ google:boolean; microsoft:boolean }>({ google:false, microsoft:false });

  useEffect(()=>{ fetch('/api/connections').then(r=>r.json()).then(d=>setConnections(d)).catch(()=>{}); },[]);

  const inboxMock: ThreadMessage[] = [
    { from: 'Courtney @ Intersect', time: '9:12 AM', body: 'Following up on the ROCC network doc. Can you confirm HA pair cutover window?' },
    { from: 'You', time: '9:20 AM', body: 'We can do Thursday 10–12 PT. Aurora will send the calendar placeholders.' },
    { from: 'Courtney @ Intersect', time: '9:28 AM', body: 'Perfect. Please include Bree.' },
    { from: 'Bree @ DESRI', time: '10:05 AM', body: "Please attach the latest vendor remote-access template for tomorrow's review." },
    { from: 'Leo (OT)', time: '10:17 AM', body: 'RTAC firmware 2.9.0 passes lab checks; staging for site push pending your approval.' },
    { from: 'Kellie', time: '10:41 AM', body: 'Can you summarize the MSSP monthly highlights in 5 bullets for exec slides?' }
  ];

  const pushToast=(m:string)=>{ const id=Date.now(); setToasts(t=>[...t,{id,message:m}]); setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000); };
  const addAudit=(e:{actor?:string; action:string; object:string})=>{ const time=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); setAudit(l=>[{time,actor:e.actor||'Aurora',action:e.action,object:e.object},...l].slice(0,14)); };
  const makeContextDraft=(thread:ThreadMessage[])=>{ const last=thread[thread.length-1]; const bullets=['Proposed window: Thu 10–12 PT (30m buffer).','Will include Bree and attach ROCC diagram.','Follow-up set for 48h if no response.']; return `Hi ${last?.from?.split(' ')[0] || 'team'},\n\n${last?.body || 'Following up as discussed.'}\n\nContext:\n- ${bullets.join('\n- ')}\n\nBest,\nAdib`; };

  async function approveAndSend(payload:{ title:string; draft?:string; tier?:number; provider:'google'|'microsoft' }){
    const r = await fetch('/api/approve', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if(!r.ok){ const e=await r.json().catch(()=>({error:'unknown'})); throw new Error(e.error||'failed'); }
    return r.json();
  }

  return (<>
    <div className="min-h-screen bg-[#F9FAFB] text-[#1C1E22] p-6 space-y-8 font-[Inter]">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold bg-gradient-to-r from-[#3A8DFF] via-[#B499FF] to-[#4BE1A0] text-transparent bg-clip-text">Aurora EA Dashboard</h1>
        <div className="flex gap-3">
          <Button variant="outline" className="border-[#E2E6EA] text-[#1C1E22]" onClick={()=>setShowTests(v=>!v)}><Beaker className="w-4 h-4 mr-2" /> {showTests?'Hide':'Show'} Test Cases</Button>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-2xl border border-[#E2E6EA] bg-white">
        <Lock className="w-4 h-4 text-[#1C1E22]" />
        <p className="text-sm"><span className="font-medium">Org Policy:</span> All outbound actions require human approval. No auto-send is enabled.</p>
      </div>

      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border border-[#E2E6EA] rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
        {[Tabs.Dashboard, Tabs.Inbox, Tabs.Approvals, Tabs.Calendar, Tabs.Settings].map((label)=>(
          <Button key={label} onClick={()=>setActiveTab(label)} variant={activeTab===label?undefined:'outline'} className={`${activeTab===label?'bg-[#3A8DFF] text-white':'border-[#E2E6EA] text-[#1C1E22]'} rounded-xl`}>{label}</Button>
        ))}
      </nav>

      {activeTab===Tabs.Dashboard && (<>
        <div className="grid md:grid-cols-4 gap-4">
          <MetricCard label="Time Saved Today" value="1h 42m"><Sparkline values={[2,4,3,5,6,5,7]} /></MetricCard>
          <MetricCard label="Auto-Send Rate" value="0% (policy)"><Sparkline values={[0,0,0,0,0,0,0]} /></MetricCard>
          <MetricCard label="Approval Latency" value="12m avg"><Sparkline values={[8,7,6,6,5,4,3]} /></MetricCard>
          <MetricCard label="SLA Hit Rate" value="94%"><Sparkline values={[5,6,6,7,8,8,9]} /></MetricCard>
        </div>

        <Card className="rounded-2xl shadow-sm border border-[#E2E6EA]">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">☀️ Morning Brief</h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3"><CheckCircle className="text-[#4BE1A0]"/> 3 urgent messages summarized</li>
              <li className="flex items-center gap-3"><Calendar className="text-[#3A8DFF]"/> 2 meetings require confirmation</li>
              <li className="flex items-center gap-3"><Mail className="text-[#B499FF]"/> 5 drafted replies ready for approval</li>
            </ul>
            <div className="mt-5 flex gap-3">
              <Button className="bg-[#4BE1A0] hover:bg-[#3FC98F] text-white" onClick={()=>setApprovalItem({ title:'Review drafts', tier:1, thread: inboxMock, provider: connections.google?'google':'microsoft' })}>Review Drafts</Button>
              <Button variant="outline" className="border-[#E2E6EA] text-[#1C1E22]">View All</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-[#E2E6EA]">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">🗂️ Approval Queue</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 rounded-xl border border-[#E2E6EA] bg-white">
                <div><p className="font-medium">Client follow-up email to Intersect Power</p><p className="text-sm text-[#6A737C]">Draft confidence: 93% • Tier 1 • Approval required</p></div>
                <div className="flex gap-2">
                  <Button className="bg-[#3A8DFF] text-white" onClick={()=>setApprovalItem({ title:'Client follow-up email to Intersect Power', tier:1, thread: inboxMock, provider: connections.google?'google':'microsoft' })}>Approve</Button>
                  <Button variant="outline" className="text-[#1C1E22]" onClick={()=>setApprovalItem({ title:'Client follow-up email to Intersect Power', tier:1, thread: inboxMock, provider: connections.google?'google':'microsoft' })}>Edit</Button>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 rounded-xl border border-[#E2E6EA] bg-[#FFF6F5]">
                <div className="flex items-center gap-2"><span className="text-[#FF7A72]">▲</span><div><p className="font-medium">External contract reply (Tier 3 risk)</p><p className="text-sm text-[#6A737C]">Tier 3 • Manual review required</p></div></div>
                <Button className="bg-[#FF7A72] text-white" onClick={()=>setApprovalItem({ title:'External contract reply', tier:3, provider: connections.microsoft?'microsoft':'google', thread: inboxMock, preview:'Attached is the redline you requested. Please review the indemnity clause changes.' })}>Flag</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <AuditLog entries={audit} />
      </>)}

      {activeTab===Tabs.Inbox && (
        <Card className="rounded-2xl shadow-sm border border-[#E2E6EA]">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-3">
              <div className="border-r border-[#E2E6EA] p-4 space-y-3">
                {["Intersect Power — HA cutover","DESRI — Cyber Review agenda","Vendor — RTAC firmware","AEP — Vendor remote-access template","MSSP — Monthly report bullets","DESRI — Firewall maintenance window"].map(t=>(
                  <button key={t} className="w-full text-left p-3 rounded-xl hover:bg-[#F3F6FF]"><p className="font-medium">{t}</p><p className="text-xs text-[#6A737C] truncate">AI summary: key decisions pending, 2 action items</p></button>
                ))}
              </div>
              <div className="md:col-span-2 p-4">
                <h3 className="text-lg font-semibold mb-2">AI Summary</h3>
                <ul className="list-disc pl-5 text-sm space-y-1 text-[#1C1E22]"><li>Schedule HA pair cutover (Thu 10–12 PT); add Bree</li><li>Attach ROCC network diagram; confirm rollback</li><li>Follow-up in 48h if no reply</li></ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button className="bg-[#3A8DFF] text-white" onClick={()=>setApprovalItem({ title:'Send follow-up to Intersect', tier:1, provider: connections.google?'google':'microsoft', thread: inboxMock, preview:'Hi Courtney — Confirming Thu 10–12 PT for HA cutover. I\'ll include Bree and attach the diagram. Thanks!' })}>Draft Reply</Button>
                  <Button variant="outline" className="border-[#E2E6EA]" onClick={()=>setApprovalItem({ title:'Propose calendar slots', tier:1, provider: connections.microsoft?'microsoft':'google', thread: inboxMock, preview:'Proposing Thu 10–12 PT. Adding 30m buffer and Meet link. Let me know if another time is better.' })}>Propose Slots</Button>
                  <Button variant="outline" className="border-[#E2E6EA]" onClick={()=>setApprovalItem({ title:'Compose with context', tier:2, provider: connections.google?'google':'microsoft', thread: inboxMock, preview: makeContextDraft(inboxMock) })}>Compose with Context</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab===Tabs.Settings && (
        <Card className="rounded-2xl shadow-sm border border-[#E2E6EA]">
          <CardContent className="p-6 space-y-6">
            <div className="p-4 rounded-xl border border-[#E2E6EA] bg-white">
              <p className="font-medium mb-3">Connections</p>
              <div className="flex flex-wrap gap-3 items-center">
                <a href="/api/oauth/google/authorize"><Button variant="outline" className="border-[#E2E6EA]">{connections.google ? 'Reconnect Gmail' : 'Connect Gmail'}</Button></a>
                <span className="text-xs px-2 py-1 rounded-full border border-[#E2E6EA] bg-white">Gmail: {connections.google ? 'Connected' : 'Not connected'}</span>
                <a href="/api/oauth/ms/authorize"><Button variant="outline" className="border-[#E2E6EA]">{connections.microsoft ? 'Reconnect Outlook' : 'Connect Outlook'}</Button></a>
                <span className="text-xs px-2 py-1 rounded-full border border-[#E2E6EA] bg-white">Outlook: {connections.microsoft ? 'Connected' : 'Not connected'}</span>
              </div>
              <p className="text-xs text-[#6A737C] mt-2">We only create drafts; auto-send remains disabled.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {showTests && <SparklineTestPanel />}
    </div>

    <Toasts items={toasts} />

    {approvalItem && (
      <ApprovalModal item={approvalItem} onClose={()=>setApprovalItem(null)} onApprove={async ()=>{
        try { const provider = approvalItem.provider || (connections.google ? 'google':'microsoft'); const res = await approveAndSend({ title: approvalItem.title, draft: approvalItem.preview, tier: approvalItem.tier, provider }); addAudit({ action:'Approved & Sent', object: approvalItem.title }); const id = (res as any)?.id ? ` (Draft ID: ${(res as any).id})` : ''; pushToast('Approved & sent'+id); } catch(e:any){ addAudit({ action:'Approve failed', object: approvalItem.title }); pushToast('Send failed — please retry'); } finally { setApprovalItem(null); }
      }} />
    )}
  </>);
}

function Toasts({ items }:{ items:{ id:number; message:string }[] }){ return (<div className="fixed bottom-4 right-4 z-50 space-y-2">{items.map(t=>(<div key={t.id} className="px-4 py-2 rounded-xl shadow-md border border-[#E2E6EA] bg-white text-sm">{t.message}</div>))}</div>); }
function AuditLog({ entries }:{ entries:{ time:string; actor:string; action:string; object:string }[] }){ return (<Card className="rounded-2xl shadow-sm border border-[#E2E6EA]"><CardContent className="p-6"><h3 className="text-lg font-semibold mb-2">Audit Log</h3><div className="divide-y divide-[#E2E6EA]">{entries.length===0 && <p className="text-sm text-[#6A737C]">No actions yet.</p>}{entries.map((e,i)=>(<div key={i} className="py-2 flex items-center justify-between text-sm"><span className="text-[#6A737C]">{e.time}</span><span className="font-medium">{e.actor}</span><span>{e.action}</span><span className="truncate max-w-[50%] text-[#6A737C]">{e.object}</span></div>))}</div></CardContent></Card>); }
function MetricCard({ label, value, children }:{ label:string; value:string; children?:React.ReactNode }){ return (<Card className="rounded-2xl shadow-sm border border-[#E2E6EA]"><CardContent className="p-5"><p className="text-sm text-[#6A737C]">{label}</p><h3 className="text-2xl font-semibold">{value}</h3>{children}</CardContent></Card>); }
function Sparkline({ values = [0], stroke = '#3A8DFF' }:{ values?:number[]; stroke?:string }){ const s = Array.isArray(values)&&values.length>0?values:[0]; const min=Math.min(...s), max=Math.max(...s); const range=max-min||1; const points=s.map((v,i)=>{ const x=(i/Math.max(1,s.length-1))*100; const y=100-((v-min)/range)*100; return `${x},${y}`; }).join(' '); return (<svg viewBox="0 0 100 30" className="w-full h-10 mt-2"><polyline fill="none" stroke={stroke} strokeWidth="2" points={points} /></svg>); }
function SparklineTestPanel(){ const cases=[{label:'Typical Zigzag',values:[2,4,3,5,6,5,7]},{label:'Empty Array (flat)',values:[]},{label:'Single Value',values:[5]},{label:'Flat Series',values:[3,3,3,3,3]},{label:'Increasing',values:[1,2,3,4,5,6]},{label:'Large Range',values:[1,50,2,80,3,120]},{label:'Negative Values',values:[-5,-3,0,2,-1,4]}]; return (<Card className="rounded-2xl shadow-sm border border-[#E2E6EA]"><CardContent className="p-6"><h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Beaker className="w-5 h-5"/> Sparkline Test Cases</h3><p className="text-sm text-[#6A737C] mb-4">Visual checks for edge cases.</p><div className="grid md:grid-cols-3 gap-4">{cases.map(c=>(<Card key={c.label} className="rounded-xl border border-[#E2E6EA]"><CardContent className="p-4"><p className="text-sm text-[#6A737C] mb-1">{c.label}</p><Sparkline values={c.values as number[]} /></CardContent></Card>))}</div></CardContent></Card>); }
function ApprovalModal({ item, onClose, onApprove }:{ item:{ title:string; preview?:string; tier?:number; provider?:'google'|'microsoft'; thread?:ThreadMessage[] }, onClose:()=>void, onApprove:()=>void }){ return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/30" onClick={onClose} /><div className="relative w-full max-w-5xl bg-white rounded-2xl border border-[#E2E6EA] shadow-xl"><div className="p-6 space-y-4"><div className="flex items-start justify-between"><div><h3 className="text-xl font-semibold">Approve Action</h3><p className="text-sm text-[#6A737C]">{item.title}</p></div><div className="text-xs text-[#6A737C] text-right"><div>Tier: {item.tier ?? '—'}</div></div></div><div className="grid md:grid-cols-2 gap-4"><div className="border border-[#E2E6EA] rounded-xl p-3 h-72 overflow-auto bg-[#F9FAFB]"><p className="text-sm font-medium mb-2">Thread Context</p><div className="space-y-3">{(item.thread||[]).map((m,idx)=>(<div key={idx} className="bg-white rounded-lg p-3 border border-[#E2E6EA]"><div className="text-xs text-[#6A737C] mb-1">{m.from} • {m.time}</div><div className="text-sm whitespace-pre-wrap">{m.body}</div></div>))}{(!item.thread||item.thread.length===0)&&(<p className="text-xs text-[#6A737C]">No thread context supplied.</p>)}</div></div><div className="border border-[#E2E6EA] rounded-xl p-3 h-72 flex flex-col"><p className="text-sm font-medium mb-2">Draft Preview</p><textarea defaultValue={item.preview} className="w-full flex-1 p-3 border border-[#E2E6EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A8DFF] bg-[#FFFFFF]" /></div></div><div className="flex items-center justify-between"><div className="text-xs text-[#6A737C]">All sends require approval per org policy.</div><div className="flex gap-2"><Button variant="outline" className="border-[#E2E6EA]" onClick={onClose}>Cancel</Button><Button className="bg-[#3A8DFF] text-white" onClick={onApprove}>Approve & Send</Button></div></div></div></div></div>); }
