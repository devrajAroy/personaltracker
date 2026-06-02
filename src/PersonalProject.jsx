import { useState, useEffect } from "react";

const APP_KEY = "supertracker_v1";
const NOTES_KEY = "supertracker_notes_v1";
const HABITS_KEY = "supertracker_habits_v1";

const MOTIVATION_QUOTES = [
  { text: "Small steps every day turn big goals into real progress.", author: "Pasko" },
  { text: "Consistency beats intensity when intensity fades.", author: "Pasko" },
  { text: "What you repeat tomorrow starts with what you do today.", author: "Pasko" },
  { text: "Progress is proof that your effort is working, even when it feels slow.", author: "Pasko" },
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: "Daily focus", text: "You have 3 tasks left to finish your current streak.", time: "5m ago", tone: "info" },
  { id: 2, title: "Habit reminder", text: "A 10-minute review session is due before dinner.", time: "30m ago", tone: "warning" },
  { id: 3, title: "Goal update", text: "Your study tracker is 72% complete this week.", time: "1h ago", tone: "success" },
];

const INITIAL_HABITS = [
  { id: 1, name: "Morning planning", done: 4, target: 5, streak: 9 },
  { id: 2, name: "Hydration check", done: 3, target: 4, streak: 6 },
  { id: 3, name: "Evening review", done: 2, target: 3, streak: 7 },
];

const PALETTE = ["#e8c547","#4fc3f7","#81c784","#f06292","#ce93d8","#ffab76","#51cf66","#74c0fc","#ffd43b","#ff6b6b","#a78bfa","#34d399","#fb8c00","#26c6da"];
const ICONS = ["📚","💪","🏋️","🥗","🏃","🧠","💊","😴","🚴","🧘","🏊","⚽","🎯","🔥","💼","🎸","✈️","💰","🖥️","🎨","📝","🏆","🌱","⚡"];

const INIT_TRACKERS = [
  {
    id: "study", name: "Study", icon: "📚", color: "#e8c547",
    sections: [
      { id:"stochastic", name:"Stochastic Calculus", color:"#e8c547",
        items:[{id:"s1",name:"Shreve Vol I — Stochastic Calculus for Finance",done:false},{id:"s2",name:"Shreve Vol II — Continuous Time Models",done:false},{id:"s3",name:"MIT OCW 18.675 Theory of Probability",done:false}]},
      { id:"python", name:"Python Quant Stack", color:"#4fc3f7",
        items:[{id:"p1",name:"NumPy & Linear Algebra in code",done:false},{id:"p2",name:"Pandas — Data & Time Series",done:false},{id:"p3",name:"SciPy & Statsmodels",done:false},{id:"p4",name:"Scikit-learn ML models",done:false},{id:"p5",name:"Python for Data Analysis — McKinney",done:false},{id:"p6",name:"Build: Pairs Trading Backtest Project",done:false}]},
      { id:"statistics", name:"Statistics & Probability", color:"#81c784",
        items:[{id:"st1",name:"All of Statistics — Wasserman",done:false},{id:"st2",name:"MIT OCW 18.650 Statistics for Applications",done:false}]},
      { id:"ml", name:"Machine Learning Foundations", color:"#f06292",
        items:[{id:"m1",name:"Stanford CS229 — Andrew Ng (YouTube)",done:false},{id:"m2",name:"Pattern Recognition & ML — Bishop",done:false}]},
      { id:"linalg", name:"Linear Algebra", color:"#ce93d8",
        items:[{id:"l1",name:"MIT OCW 18.06 — Gilbert Strang",done:false}]},
      { id:"cpp", name:"C++ Basics", color:"#ffab76",
        items:[{id:"c1",name:"C++ Primer — Lippman (Ch. 1–8)",done:false}]},
    ]
  },
  {
    id: "health", name: "Health", icon: "💪", color: "#ff6b6b",
    sections: [
      { id:"gym", name:"Gym Training", color:"#ff6b6b",
        items:[{id:"g1",name:"Set a weekly training split (Push/Pull/Legs)",done:false},{id:"g2",name:"Learn compound lifts: Squat, Bench, Deadlift, OHP",done:false},{id:"g3",name:"Understand progressive overload",done:false},{id:"g4",name:"Hit gym 3x per week consistently",done:false},{id:"g5",name:"Film & review form on main lifts",done:false}]},
      { id:"diet", name:"Diet & Nutrition", color:"#51cf66",
        items:[{id:"d1",name:"Calculate TDEE & set calorie target",done:false},{id:"d2",name:"Hit protein target daily (0.8–1g per lb bodyweight)",done:false},{id:"d3",name:"Start weekly meal prepping",done:false},{id:"d4",name:"Track food with MyFitnessPal for 30 days",done:false},{id:"d5",name:"Drink 2–3L of water daily",done:false},{id:"d6",name:"80% whole foods, minimise ultra-processed",done:false}]},
      { id:"cardio", name:"Cardio & Recovery", color:"#74c0fc",
        items:[{id:"c1",name:"10,000 steps per day average",done:false},{id:"c2",name:"2x cardio sessions per week (run, cycle, swim)",done:false},{id:"c3",name:"7–9 hours sleep consistently",done:false},{id:"c4",name:"10 min stretching or mobility post-workout",done:false}]},
      { id:"mindset", name:"Habits & Mindset", color:"#ffd43b",
        items:[{id:"ms1",name:"Block gym time in calendar like a meeting",done:false},{id:"ms2",name:"Take monthly progress photos",done:false},{id:"ms3",name:"Track weight weekly (same time, same conditions)",done:false},{id:"ms4",name:"Plan at least 1–2 full rest days per week",done:false}]},
    ]
  }
];

function load(key, fallback) { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; } }
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,5); }
function calcProg(items) { if (!items?.length) return 0; return Math.round(items.filter(i => i.done).length / items.length * 100); }
function totalProg(sections) {
  const all = sections.flatMap(s => s.items);
  if (!all.length) return 0;
  return Math.round(all.filter(i => i.done).length / all.length * 100);
}

function ProgressRing({ pct, color, size=60, stroke=4 }) {
  const r = size/2 - stroke; const circ = 2*Math.PI*r;
  return (
    <div style={{position:"relative",width:size,height:size}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{transition:"stroke-dashoffset 0.5s ease"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:size*0.21,fontWeight:600,color}}>{pct}%</span>
      </div>
    </div>
  );
}

function Modal({ title, accent, onClose, children }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:"#1a1a24",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:24,width:"100%",maxWidth:440,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.6)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{fontSize:14,fontWeight:700,color:"#fff",fontFamily:"'Syne',sans-serif",letterSpacing:"-0.01em"}}>{title}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",color:"#ccc",cursor:"pointer",fontSize:14,width:28,height:28,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{marginBottom:14}}>
      {label && <div style={{fontSize:10,color:"#aaa",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6,fontFamily:"'DM Mono',monospace"}}>{label}</div>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.14)",color:"#fff",padding:"10px 13px",borderRadius:7,fontFamily:"'DM Mono',monospace",fontSize:12,width:"100%",outline:"none",transition:"border-color 0.2s"}}
        onFocus={e=>e.target.style.borderColor="rgba(255,255,255,0.35)"}
        onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.14)"}/>
    </div>
  );
}

function ColorPicker({ value, onChange }) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:10,color:"#aaa",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8,fontFamily:"'DM Mono',monospace"}}>Colour</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
        {PALETTE.map(c=>(
          <div key={c} onClick={()=>onChange(c)} style={{width:22,height:22,borderRadius:5,background:c,cursor:"pointer",border:value===c?"2.5px solid #fff":"2.5px solid transparent",transform:value===c?"scale(1.2)":"scale(1)",transition:"all 0.15s"}}/>
        ))}
      </div>
    </div>
  );
}

function IconPicker({ value, onChange }) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:10,color:"#aaa",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8,fontFamily:"'DM Mono',monospace"}}>Icon</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {ICONS.map(ic=>(
          <div key={ic} onClick={()=>onChange(ic)} style={{width:34,height:34,borderRadius:7,background:value===ic?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.05)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,border:value===ic?"1px solid rgba(255,255,255,0.4)":"1px solid rgba(255,255,255,0.08)",transition:"all 0.15s"}}>
            {ic}
          </div>
        ))}
      </div>
    </div>
  );
}

function SubmitBtn({ onClick, color, children }) {
  return (
    <button onClick={onClick} style={{width:"100%",padding:"11px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:600,letterSpacing:"0.06em",marginTop:6,background:color,color:"#0a0a0f",transition:"opacity 0.2s"}}
      onMouseEnter={e=>e.target.style.opacity="0.85"} onMouseLeave={e=>e.target.style.opacity="1"}>
      {children}
    </button>
  );
}

export default function App() {
  const [trackers, setTrackers] = useState(() => load(APP_KEY, INIT_TRACKERS));
  const [activeTracker, setActiveTracker] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [notes, setNotes] = useState(() => load(NOTES_KEY, []));
  const [noteText, setNoteText] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [modal, setModal] = useState(null); // "addTracker"|"editTracker"|"addSection"|"addItem"
  const [modalCtx, setModalCtx] = useState({});
  const [form, setForm] = useState({});
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosInstallHint, setShowIosInstallHint] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [viewMode, setViewMode] = useState("dashboard");
  const [motivationQuote, setMotivationQuote] = useState(() =>
    MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)]
  );
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [habits, setHabits] = useState(() => load(HABITS_KEY, INITIAL_HABITS));

  useEffect(() => { save(APP_KEY, trackers); }, [trackers]);
  useEffect(() => { save(NOTES_KEY, notes); }, [notes]);
  useEffect(() => { save(HABITS_KEY, habits); }, [habits]);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent) || (window.navigator.platform?.includes("MacIntel") && window.navigator.maxTouchPoints > 1);
    const mediaQuery = typeof window.matchMedia === "function" ? window.matchMedia('(display-mode: standalone)') : null;
    const standalone = Boolean(mediaQuery?.matches || window.navigator.standalone === true);
    setIsIos(ios);
    setIsStandalone(standalone);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (ios && !standalone) {
      setShowIosInstallHint(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installAvailable = Boolean(deferredPrompt) || (isIos && !isStandalone);
  const showInstallBanner = Boolean(deferredPrompt && !isIos && !isStandalone);
  const showIosInstallBanner = isIos && !isStandalone && showIosInstallHint;

  const pickQuote = () => {
    const next = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
    setMotivationQuote(next);
  };

  const promptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    if (isIos && !isStandalone) {
      setShowIosInstallHint(true);
      return;
    }
    alert("Install is not available right now. Please open this site in a supported browser or use Add to Home Screen on iOS.");
  };

  const tracker = trackers[activeTracker] || trackers[0];
  const accent = tracker?.color || "#e8c547";

  // helpers
  const closeModal = () => { setModal(null); setModalCtx({}); setForm({}); };
  const setF = (k,v) => setForm(f=>({...f,[k]:v}));

  // tracker-level CRUD
  const addTracker = () => {
    if (!form.name?.trim()) return;
    const t = { id:uid(), name:form.name.trim(), icon:form.icon||"🎯", color:form.color||PALETTE[0], sections:[] };
    setTrackers(p=>[...p, t]);
    setActiveTracker(trackers.length);
    closeModal();
  };
  const deleteTracker = (idx) => {
    setTrackers(p=>p.filter((_,i)=>i!==idx));
    setActiveTracker(0);
  };

  // section-level CRUD
  const addSection = () => {
    if (!form.name?.trim()) return;
    const s = { id:uid(), name:form.name.trim(), color:form.color||accent, items:[] };
    setTrackers(p=>p.map((t,i)=> i===activeTracker ? {...t, sections:[...t.sections, s]} : t));
    closeModal();
  };
  const deleteSection = (sId) =>
    setTrackers(p=>p.map((t,i)=> i===activeTracker ? {...t, sections:t.sections.filter(s=>s.id!==sId)} : t));

  // item-level CRUD
  const addItem = () => {
    if (!form.name?.trim()) return;
    const item = { id:uid(), name:form.name.trim(), done:false, dueDate: form.dueDate || "" };
    setTrackers(p=>p.map((t,i)=> i===activeTracker ? {...t, sections:t.sections.map(s=> s.id===modalCtx.sectionId ? {...s, items:[...s.items, item]} : s)} : t));
    closeModal();
  };
  const toggleItem = (sId, iId) =>
    setTrackers(p=>p.map((t,i)=> i===activeTracker ? {...t, sections:t.sections.map(s=> s.id===sId ? {...s, items:s.items.map(it=> it.id===iId?{...it,done:!it.done}:it)} : s)} : t));
  const deleteItem = (sId, iId) =>
    setTrackers(p=>p.map((t,i)=> i===activeTracker ? {...t, sections:t.sections.map(s=> s.id===sId ? {...s, items:s.items.filter(it=>it.id!==iId)} : s)} : t));

  const addNote = () => {
    if (!noteText.trim()) return;
    setNotes(p=>[{id:Date.now(),text:noteText.trim(),date:new Date().toLocaleDateString(),tracker:tracker.name,color:accent},...p]);
    setNoteText("");
  };

  const toggleHabit = (habitId) => {
    setHabits(p => p.map(h => h.id === habitId ? { ...h, done: Math.min(h.done + 1, h.target) } : h));
  };

  const upcomingDeadlines = trackers
    .flatMap((trackerItem) => trackerItem.sections.flatMap((section) =>
      section.items
        .filter((item) => item.dueDate)
        .map((item) => {
          const dayMs = 24 * 60 * 60 * 1000;
          const diff = Math.max(0, Math.ceil((new Date(item.dueDate) - new Date()) / dayMs));
          return { ...item, trackerName: trackerItem.name, sectionName: section.name, daysLeft: diff };
        })
    ))
    .filter((item) => item.daysLeft <= 14)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const consistencyScore = habits.length
    ? Math.round((habits.reduce((sum, h) => sum + (h.done / h.target), 0) / habits.length) * 100)
    : 0;

  const overall = totalProg(tracker?.sections||[]);
  const doneCt = (tracker?.sections||[]).flatMap(s=>s.items).filter(i=>i.done).length;
  const totalCt = (tracker?.sections||[]).flatMap(s=>s.items).length;
  const overviewCards = [
    { label: "Trackers", value: trackers.length, accent: accent },
    { label: "Completed", value: doneCt, accent: "#81c784" },
    { label: "Open tasks", value: Math.max(totalCt - doneCt, 0), accent: "#74c0fc" },
    { label: "Completion", value: `${overall}%`, accent: accent },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#12121c",fontFamily:"'DM Mono','Fira Code','Courier New',monospace",color:"#e8e8e8",paddingTop:"24px",paddingBottom:"24px",position:"relative"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:#12121c;}
        ::-webkit-scrollbar-thumb{background:#333;border-radius:3px;}
        .tracker-tab{display:flex;align-items:center;gap:7px;padding:7px 14px;border-radius:8px;cursor:pointer;border:1px solid transparent;transition:all 0.18s;font-family:inherit;font-size:12px;background:none;color:#999;white-space:nowrap;}
        .tracker-tab:hover{background:rgba(255,255,255,0.06);color:#ddd;}
        .tracker-tab.active{color:#fff;font-weight:500;}
        .card{border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;margin-bottom:10px;transition:border-color 0.2s;}
        .card:hover{border-color:rgba(255,255,255,0.14);}
        .card-hdr{display:flex;align-items:center;gap:12px;padding:14px 16px;cursor:pointer;background:rgba(255,255,255,0.03);transition:background 0.15s;}
        .card-hdr:hover{background:rgba(255,255,255,0.055);}
        .item-row{display:flex;align-items:flex-start;gap:10px;padding:10px 16px 10px 46px;border-top:1px solid rgba(255,255,255,0.04);transition:background 0.12s;cursor:pointer;}
        .item-row:hover{background:rgba(255,255,255,0.025);}
        .item-row.done-item{opacity:0.4;}
        .cb{width:16px;height:16px;border-radius:4px;border:1.5px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;transition:all 0.18s;}
        .pbar{height:3px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden;flex:1;}
        .pfill{height:100%;border-radius:2px;transition:width 0.4s ease;}
        .ctrl-btn{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:#ddd;padding:5px 11px;border-radius:6px;cursor:pointer;font-family:inherit;font-size:11px;transition:all 0.18s;letter-spacing:0.04em;}
        .ctrl-btn:hover{background:rgba(255,255,255,0.12);color:#fff;}
        .ctrl-btn.danger:hover{background:rgba(255,80,80,0.15);border-color:rgba(255,80,80,0.3);color:#ff6b6b;}
        .ctrl-btn.active-edit{background:rgba(255,170,0,0.15);border-color:rgba(255,170,0,0.3);color:#ffaa00;}
        .ghost-btn{width:100%;padding:12px;border:1.5px dashed rgba(255,255,255,0.12);border-radius:9px;background:none;color:#888;cursor:pointer;font-family:inherit;font-size:11px;letter-spacing:0.08em;margin-top:6px;transition:all 0.2s;}
        .ghost-btn:hover{border-color:rgba(255,255,255,0.3);color:#ddd;background:rgba(255,255,255,0.03);}
        .note-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px 14px;display:flex;justify-content:space-between;gap:10px;}
        .del-x{background:none;border:none;color:rgba(255,255,255,0.2);cursor:pointer;font-size:12px;padding:0 3px;transition:color 0.2s;flex-shrink:0;}
        .del-x:hover{color:rgba(255,80,80,0.7);}
        .badge{font-size:9px;padding:2px 7px;border-radius:4px;border:1px solid;letter-spacing:0.1em;opacity:0.8;text-transform:uppercase;font-weight:500;}
        textarea{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.14);color:#eee;padding:10px 13px;border-radius:7px;font-family:inherit;font-size:12px;width:100%;resize:none;outline:none;transition:border-color 0.2s;}
        textarea:focus{border-color:rgba(255,255,255,0.35);}
        textarea::placeholder{color:rgba(255,255,255,0.3);}
        input::placeholder{color:rgba(255,255,255,0.3);}
      `}</style>

      {/* MODALS */}
      {modal === "addTracker" && (
        <Modal title="New Tracker" accent={form.color||PALETTE[0]} onClose={closeModal}>
          <FInput label="Tracker Name" value={form.name||""} onChange={v=>setF("name",v)} placeholder="e.g. Finance, Language, Career..."/>
          <IconPicker value={form.icon||"🎯"} onChange={v=>setF("icon",v)}/>
          <ColorPicker value={form.color||PALETTE[0]} onChange={v=>setF("color",v)}/>
          <SubmitBtn onClick={addTracker} color={form.color||PALETTE[0]}>Create Tracker</SubmitBtn>
        </Modal>
      )}
      {modal === "addSection" && (
        <Modal title={`New Section in "${tracker.name}"`} accent={accent} onClose={closeModal}>
          <FInput label="Section Name" value={form.name||""} onChange={v=>setF("name",v)} placeholder="e.g. Books, Exercises..."/>
          <ColorPicker value={form.color||accent} onChange={v=>setF("color",v)}/>
          <SubmitBtn onClick={addSection} color={form.color||accent}>Add Section</SubmitBtn>
        </Modal>
      )}
      {modal === "addItem" && (
        <Modal title="New Item" accent={accent} onClose={closeModal}>
          <FInput label="Item Name" value={form.name||""} onChange={v=>setF("name",v)} placeholder="e.g. Read chapter 3..."/>
          <FInput label="Due date" type="date" value={form.dueDate||""} onChange={v=>setF("dueDate",v)} placeholder="Select a deadline"/>
          <SubmitBtn onClick={addItem} color={accent}>Add Item</SubmitBtn>
        </Modal>
      )}

      {/* HEADER */}
      {showInstallBanner && (
        <div style={{padding:"12px 16px",background:"rgba(59,130,246,0.12)",borderBottom:"1px solid rgba(59,130,246,0.18)",display:"flex",alignItems:"center",gap:10,justifyContent:"space-between"}}>
          <div style={{fontSize:12,color:"#e8f2ff",lineHeight:1.4}}>
            Install Pasko for faster access and offline use.
          </div>
          <button onClick={promptInstall} className="ctrl-btn" style={{padding:"7px 10px",fontSize:11,background:"#3b82f6",color:"#0a0a0f",borderColor:"transparent"}}>Install</button>
        </div>
      )}
      {showIosInstallBanner && (
        <div style={{padding:"12px 16px",background:"rgba(255,255,255,0.08)",borderBottom:"1px solid rgba(255,255,255,0.14)",display:"flex",alignItems:"center",gap:10,justifyContent:"space-between"}}>
          <div style={{fontSize:12,color:"#f0f0f0",lineHeight:1.4}}>
            Install Pasko on iOS: tap Share → Add to Home Screen.
          </div>
          <button onClick={()=>setShowIosInstallHint(false)} className="ctrl-btn" style={{padding:"7px 10px",fontSize:11}}>Dismiss</button>
        </div>
      )}
      <div style={{borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"22px 24px 0",background:"#12121c",position:"sticky",top:0,zIndex:50}}>
        <div style={{maxWidth:800,margin:"0 auto"}}>

          {/* Top row */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{fontSize:9,letterSpacing:"0.2em",color:"rgba(255,255,255,0.3)",marginBottom:5,textTransform:"uppercase"}}>Sep 2026 Prep</div>
              <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,letterSpacing:"-0.02em",color:"#fff",lineHeight:1}}>{viewMode === "dashboard" ? "Pasko Dashboard" : `${tracker.name} Tracker`}</h1>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <ProgressRing pct={overall} color={accent} size={58} stroke={4}/>
              <div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:"0.12em",textTransform:"uppercase"}}>Progress</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginTop:2}}>{doneCt} / {totalCt} done</div>
              </div>
            </div>
          </div>

          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,marginBottom:12,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:260,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:6}}>Daily motivation</div>
              <div style={{fontSize:12,color:"#f4f4f5",lineHeight:1.5}}>{motivationQuote.text}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginTop:8}}>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.45)"}}>— {motivationQuote.author}</span>
                <button className="ctrl-btn" onClick={pickQuote} style={{padding:"7px 10px",fontSize:10}}>New quote</button>
              </div>
            </div>
          </div>

          {/* Tracker tabs row */}
          {viewMode === "trackers" && (
            <>
              <div style={{display:"flex",gap:4,alignItems:"center",overflowX:"auto",paddingBottom:0}}>
                <div style={{display:"flex",gap:3,flex:1,overflowX:"auto"}}>
                  {trackers.map((t,idx)=>(
                    <div key={t.id} style={{position:"relative",flexShrink:0}}>
                      <button className={`tracker-tab ${idx===activeTracker?"active":""}`}
                        style={{borderColor:idx===activeTracker?`${t.color}55`:"transparent",background:idx===activeTracker?`${t.color}14`:"none",color:idx===activeTracker?t.color:"#888"}}
                        onClick={()=>{setActiveTracker(idx);setExpanded(null);setEditMode(false);}}>
                        <span>{t.icon}</span>
                        <span>{t.name}</span>
                        {idx===activeTracker && <span style={{fontSize:9,color:t.color,opacity:0.7}}>{totalProg(t.sections)}%</span>}
                      </button>
                      {editMode && idx===activeTracker && trackers.length>1 && (
                        <button onClick={()=>deleteTracker(idx)} className="del-x"
                          style={{position:"absolute",top:-5,right:-5,background:"rgba(255,60,60,0.8)",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",border:"none",cursor:"pointer",padding:0}}>✕</button>
                      )}
                    </div>
                  ))}
                  <button className="tracker-tab" onClick={()=>{setModal("addTracker");setForm({color:PALETTE[0],icon:"🎯"});}}
                    style={{color:"rgba(255,255,255,0.35)",fontSize:11}}>+ New</button>
                </div>

                {/* Right controls */}
                <div style={{display:"flex",gap:5,flexShrink:0,paddingLeft:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
                  <button className={`ctrl-btn ${viewMode === "dashboard" ? "active-edit" : ""}`} onClick={()=>{setViewMode("dashboard"); setExpanded(null);}}>
                    Dashboard
                  </button>
                  <button className={`ctrl-btn ${viewMode === "trackers" ? "active-edit" : ""}`} onClick={()=>{setViewMode("trackers"); setExpanded(null);}}>
                    Trackers
                  </button>
                  {viewMode === "trackers" && (
                    <button className={`ctrl-btn ${editMode?"active-edit":""}`} onClick={()=>setEditMode(e=>!e)}>
                      {editMode?"✓ Done":"✏️ Edit"}
                    </button>
                  )}
                  <button className={`ctrl-btn ${showNotes?"active-edit":""}`} onClick={()=>setShowNotes(s=>!s)}>Notes</button>
                </div>
              </div>

              {/* Active tracker underline */}
              <div style={{height:2,background:`linear-gradient(90deg, ${accent}88, transparent)`,borderRadius:2,marginTop:0}}/>
            </>
          )}
        </div>
      </div>

      {/* BODY */}
      <div style={{maxWidth:800,margin:"0 auto",padding:"22px 24px"}}>
        {viewMode === "dashboard" ? (
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:10,marginBottom:18}}>
              <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"14px 14px"}}>
                <div style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:8}}>Dashboard overview</div>
                <div style={{fontSize:12,color:"#f4f4f5",lineHeight:1.55}}>Start here to review progress, open your tracker workspace, and stay focused on what matters next.</div>
                <button className="ctrl-btn" onClick={()=>setViewMode("trackers")} style={{marginTop:10,padding:"8px 10px",fontSize:10,background:"rgba(129,199,132,0.12)",borderColor:"rgba(129,199,132,0.25)",color:"#b9f5bf"}}>Open trackers</button>
              </div>
              <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"14px 14px"}}>
                <div style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:8}}>Notifications</div>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {notifications.length===0 ? <div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>No new notifications.</div> : notifications.map(item => (
                    <button key={item.id} onClick={()=>setNotifications(p=>p.filter(n=>n.id!==item.id))} style={{textAlign:"left",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"9px 10px",color:"#f4f4f5",cursor:"pointer"}}>
                      <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center"}}>
                        <strong style={{fontSize:11}}>{item.title}</strong>
                        <span style={{fontSize:9,color:"rgba(255,255,255,0.45)"}}>{item.time}</span>
                      </div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.72)",marginTop:4}}>{item.text}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",gap:10,marginBottom:18}}>
              {overviewCards.map(card => (
                <div key={card.label} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"12px 13px"}}>
                  <div style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)"}}>{card.label}</div>
                  <div style={{fontSize:18,fontWeight:700,color:"#fff",marginTop:6}}>{card.value}</div>
                  <div style={{height:3,borderRadius:999,background:card.accent,marginTop:8,opacity:0.9}}/>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:10,marginBottom:18}}>
              <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"14px 14px"}}>
                <div style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:8}}>Countdown deadlines</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {upcomingDeadlines.length === 0 ? (
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>No deadlines are coming up in the next 14 days.</div>
                  ) : upcomingDeadlines.map(item => (
                    <div key={`${item.trackerName}-${item.sectionName}-${item.id}`} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"10px 10px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center",marginBottom:4}}>
                        <strong style={{fontSize:11,color:"#f4f4f5"}}>{item.name}</strong>
                        <span style={{fontSize:9,color:"#81c784"}}>{item.daysLeft} day{item.daysLeft === 1 ? "" : "s"} left</span>
                      </div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.72)",marginBottom:4}}>{item.trackerName} • {item.sectionName}</div>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.45)"}}>{new Date(item.dueDate).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"14px 14px"}}>
                <div style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:8}}>Habit consistency</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:2}}>
                    <strong style={{fontSize:11,color:"#f4f4f5"}}>Weekly consistency</strong>
                    <span style={{fontSize:10,color:"#74c0fc"}}>{consistencyScore}%</span>
                  </div>
                  {habits.map(habit => {
                    const pct = Math.min(100, Math.round((habit.done / habit.target) * 100));
                    return (
                      <button key={habit.id} onClick={() => toggleHabit(habit.id)} style={{textAlign:"left",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"10px 10px",cursor:"pointer",color:"#f4f4f5"}}>
                        <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center",marginBottom:4}}>
                          <strong style={{fontSize:11}}>{habit.name}</strong>
                          <span style={{fontSize:9,color:"#ffd43b"}}>🔥 {habit.streak} day streak</span>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div className="pbar"><div className="pfill" style={{width:`${pct}%`,background:"linear-gradient(90deg, #81c784, #74c0fc)"}}/></div>
                          <span style={{fontSize:10,color:"rgba(255,255,255,0.55)",minWidth:34,textAlign:"right"}}>{habit.done}/{habit.target}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:12,flexWrap:"wrap"}}>
              <button className="ctrl-btn" onClick={()=>setViewMode("dashboard")} style={{padding:"8px 10px",fontSize:10,background:"rgba(255,255,255,0.06)",borderColor:"rgba(255,255,255,0.12)"}}>← Back to dashboard</button>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.45)"}}>Trackers workspace</span>
            </div>

        {/* Notes */}
        {showNotes && (
          <div style={{marginBottom:20,padding:16,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10}}>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:12}}>Notes</div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <textarea rows={2} placeholder="Add a note, insight, or reminder..." value={noteText}
                onChange={e=>setNoteText(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();addNote();}}}/>
              <button onClick={addNote} style={{background:accent,color:"#0a0a0f",border:"none",padding:"10px 16px",borderRadius:7,fontFamily:"inherit",fontSize:11,fontWeight:600,cursor:"pointer",alignSelf:"flex-end",whiteSpace:"nowrap"}}>Add</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {notes.length===0 && <div style={{fontSize:11,color:"rgba(255,255,255,0.25)"}}>No notes yet.</div>}
              {notes.map(n=>(
                <div key={n.id} className="note-card">
                  <div>
                    <div style={{fontSize:12,color:"#ddd",lineHeight:1.55}}>{n.text}</div>
                    <div style={{display:"flex",gap:8,marginTop:5,alignItems:"center"}}>
                      <span style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>{n.date}</span>
                      <span style={{fontSize:9,padding:"1px 7px",borderRadius:4,background:`${n.color}18`,color:n.color,border:`1px solid ${n.color}33`}}>{n.tracker}</span>
                    </div>
                  </div>
                  <button className="del-x" onClick={()=>setNotes(p=>p.filter(x=>x.id!==n.id))}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit banner */}
        {editMode && (
          <div style={{marginBottom:14,padding:"9px 14px",background:"rgba(255,170,0,0.08)",border:"1px solid rgba(255,170,0,0.2)",borderRadius:7,display:"flex",alignItems:"center",gap:8}}>
            <span>✏️</span>
            <span style={{fontSize:11,color:"#ffcc44"}}>Edit mode — add or remove sections, items, and trackers. Tap ✓ Done when finished.</span>
          </div>
        )}

        {/* SECTIONS */}
        {(tracker?.sections||[]).map(section => {
          const prog = calcProg(section.items);
          const isExp = expanded===section.id;
          return (
            <div key={section.id} className="card">
              <div className="card-hdr" onClick={()=>!editMode&&setExpanded(isExp?null:section.id)}>
                {/* colour dot */}
                <div style={{width:10,height:10,borderRadius:"50%",background:section.color,flexShrink:0,boxShadow:`0 0 8px ${section.color}66`}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                    <span style={{fontSize:13,fontWeight:500,color:"#f0f0f0"}}>{section.name}</span>
                    <span className="badge" style={{color:section.color,borderColor:`${section.color}44`}}>
                      {section.items.filter(i=>i.done).length}/{section.items.length}
                    </span>
                    {editMode && <span style={{fontSize:9,padding:"2px 7px",borderRadius:4,background:"rgba(255,170,0,0.12)",border:"1px solid rgba(255,170,0,0.25)",color:"#ffaa00"}}>editing</span>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div className="pbar"><div className="pfill" style={{width:`${prog}%`,background:section.color}}/></div>
                    <span style={{fontSize:10,color:"rgba(255,255,255,0.45)",minWidth:28,textAlign:"right"}}>{prog}%</span>
                  </div>
                </div>
                {editMode ? (
                  <div style={{display:"flex",gap:5}} onClick={e=>e.stopPropagation()}>
                    <button className="ctrl-btn" style={{fontSize:10}} onClick={()=>{setModal("addItem");setModalCtx({sectionId:section.id});setForm({});}}>+ Item</button>
                    <button className="ctrl-btn danger" style={{fontSize:10}} onClick={()=>deleteSection(section.id)}>🗑 Del</button>
                  </div>
                ) : (
                  <span style={{fontSize:11,color:"rgba(255,255,255,0.25)",transform:isExp?"rotate(90deg)":"none",transition:"transform 0.2s"}}>▶</span>
                )}
              </div>

              {/* Items */}
              {(isExp||editMode) && section.items.map(item=>(
                <div key={item.id} className={`item-row ${item.done?"done-item":""}`}
                  onClick={()=>!editMode&&toggleItem(section.id,item.id)}>
                  <div className="cb"
                    style={{borderColor:item.done?section.color:"rgba(255,255,255,0.2)",background:item.done?section.color:"transparent"}}
                    onClick={e=>{e.stopPropagation();toggleItem(section.id,item.id);}}>
                    {item.done&&<svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="#0a0a0f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{fontSize:12,color:item.done?"rgba(255,255,255,0.3)":"#ddd",textDecoration:item.done?"line-through":"none",lineHeight:1.5,flex:1}}>
                    {item.name}
                    {item.dueDate && (
                      <span style={{display:"inline-flex",marginLeft:8,fontSize:9,padding:"2px 6px",borderRadius:999,background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.08)"}}>
                        Due {new Date(item.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </span>
                  {editMode && (
                    <div style={{display:"flex",alignItems:"center",gap:6}} onClick={e=>e.stopPropagation()}>
                      <input
                        type="date"
                        value={item.dueDate || ""}
                        onChange={(e) => {
                          setTrackers((prev) => prev.map((trackerItem, trackerIndex) => trackerIndex === activeTracker ?
                            { ...trackerItem, sections: trackerItem.sections.map((sec) => sec.id === section.id ?
                              { ...sec, items: sec.items.map((entry) => entry.id === item.id ? { ...entry, dueDate: e.target.value } : entry) } : sec) } : trackerItem));
                        }}
                        style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,color:"#fff",padding:"4px 6px",fontSize:10,fontFamily:"inherit"}}
                      />
                      <button className="del-x" onClick={e=>{e.stopPropagation();deleteItem(section.id,item.id);}}>✕</button>
                    </div>
                  )}
                </div>
              ))}

              {/* Empty state */}
              {(isExp||editMode) && section.items.length===0 && (
                <div style={{padding:"14px 16px 14px 46px",borderTop:"1px solid rgba(255,255,255,0.04)",fontSize:11,color:"rgba(255,255,255,0.25)"}}>
                  No items yet — {editMode?"click \"+ Item\" to add one.":"switch to edit mode to add items."}
                </div>
              )}
            </div>
          );
        })}

        {/* Add section button */}
        {editMode && (
          <button className="ghost-btn" onClick={()=>{setModal("addSection");setForm({color:accent});}}>
            + Add New Section to "{tracker.name}"
          </button>
        )}

        {/* Empty tracker state */}
        {!editMode && tracker?.sections?.length===0 && (
          <div style={{textAlign:"center",padding:"48px 24px",color:"rgba(255,255,255,0.3)"}}>
            <div style={{fontSize:32,marginBottom:12}}>{tracker.icon}</div>
            <div style={{fontSize:13,marginBottom:6,color:"rgba(255,255,255,0.5)"}}>No sections yet</div>
            <div style={{fontSize:11}}>Tap ✏️ Edit to add your first section.</div>
          </div>
        )}

        {/* Footer mini summary */}
        {(tracker?.sections||[]).length > 0 && (
          <div style={{marginTop:24,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.05)",display:"flex",flexWrap:"wrap",gap:12}}>
            {(tracker?.sections||[]).map(s=>{
              const p=calcProg(s.items);
              return (
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:p===100?s.color:"rgba(255,255,255,0.1)",border:`1px solid ${s.color}55`,transition:"background 0.3s"}}/>
                  <span style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>{s.name.split(" ")[0]}</span>
                  <span style={{fontSize:9,color:p>0?s.color:"rgba(255,255,255,0.2)"}}>{p}%</span>
                </div>
              );
            })}
          </div>
        )}
          </>
        )}
      </div>

    </div>
  );
}
