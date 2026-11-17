"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity, ArrowUpRight, CalendarDays, Check, CheckCircle2, Circle,
  Clock3, Flame, LayoutDashboard, ListTodo, Menu, MessageSquareText,
  Plus, Sparkles, Target, Trash2, TrendingUp, X, Zap
} from "lucide-react";

type Area = "Work" | "Personal Brand" | "Career" | "Learning" | "Health" | "Personal";
type Priority = "High" | "Medium" | "Low";
type Task = { id: string; title: string; area: Area; time: string; priority: Priority; done: boolean };
type Block = { id: string; start: string; end: string; title: string; detail: string; area: Area };
type Goal = { id: string; title: string; area: Area; done: boolean };
type Planner = { tasks: Task[]; blocks: Block[]; goals: Goal[]; habits: string[]; habitDone: Record<string, boolean>; notes: string; savedDate: string };

const areas: Area[] = ["Work", "Personal Brand", "Career", "Learning", "Health", "Personal"];
const areaClass: Record<Area, string> = { Work: "work", "Personal Brand": "brand", Career: "career", Learning: "learning", Health: "health", Personal: "personal" };
const initialTasks: Task[] = [
  { id: "t1", title: "Review workshop performance, qualified leads and conversion", area: "Work", time: "09:30", priority: "High", done: false },
  { id: "t2", title: "Follow up with priority workshops and CR team", area: "Work", time: "11:00", priority: "High", done: false },
  { id: "t3", title: "Review operations, service quality and escalations", area: "Work", time: "15:00", priority: "Medium", done: false },
  { id: "t4", title: "Create or publish one personal-brand post", area: "Personal Brand", time: "19:00", priority: "High", done: false },
  { id: "t5", title: "Study performance marketing / growth marketing", area: "Career", time: "20:00", priority: "Medium", done: false },
  { id: "t6", title: "Practice coding or an AI workflow for 30 minutes", area: "Learning", time: "20:45", priority: "Low", done: false }
];
const initialBlocks: Block[] = [
  { id: "b1", start: "06:45", end: "07:15", title: "Morning reset", detail: "Get ready, hydrate and choose today's top three", area: "Personal" },
  { id: "b2", start: "07:15", end: "08:15", title: "Personal growth", detail: "Learning, reading or light exercise", area: "Learning" },
  { id: "b3", start: "08:15", end: "09:30", title: "Preparation & commute", detail: "Travel and review the day's priorities", area: "Personal" },
  { id: "b4", start: "09:30", end: "13:30", title: "Work focus — network operations", detail: "Workshops, lead acceptance and CR coordination", area: "Work" },
  { id: "b5", start: "13:30", end: "14:00", title: "Lunch & reset", detail: "Take a proper break away from the screen", area: "Personal" },
  { id: "b6", start: "14:00", end: "18:30", title: "Work execution & reporting", detail: "Follow-ups, conversion, quality and escalations", area: "Work" },
  { id: "b7", start: "19:00", end: "19:45", title: "Personal brand", detail: "Create, publish and engage with your audience", area: "Personal Brand" },
  { id: "b8", start: "20:00", end: "21:00", title: "Career & skill building", detail: "Digital marketing, coding or AI tools", area: "Career" },
  { id: "b9", start: "21:00", end: "21:20", title: "Daily review", detail: "Capture wins and choose tomorrow's first move", area: "Personal" }
];
const initialPlanner: Planner = {
  tasks: initialTasks,
  blocks: initialBlocks,
  goals: [
    { id: "g1", title: "Build a stronger digital marketing portfolio", area: "Career", done: false },
    { id: "g2", title: "Publish three useful personal-brand posts", area: "Personal Brand", done: false },
    { id: "g3", title: "Complete five focused learning sessions", area: "Learning", done: false },
    { id: "g4", title: "Improve workshop conversion and service quality", area: "Work", done: false }
  ],
  habits: ["30 minutes of focused learning", "Move or exercise", "Create or engage with useful content", "Plan tomorrow before logging off"],
  habitDone: {}, notes: "", savedDate: ""
};
const localDateKey = () => { const d = new Date(); return [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-"); };
const formatDate = () => new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
const uid = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now() + Math.random());

export default function Home() {
  const [data, setData] = useState<Planner>(initialPlanner);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("Overview");
  const [filter, setFilter] = useState<"All" | Area>("All");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [blockModal, setBlockModal] = useState(false);
  const [goalModal, setGoalModal] = useState(false);
  const [task, setTask] = useState({ title: "", area: "Work" as Area, time: "18:00", priority: "Medium" as Priority });
  const [block, setBlock] = useState({ title: "", detail: "", start: "18:00", end: "19:00", area: "Personal" as Area });
  const [goal, setGoal] = useState({ title: "", area: "Career" as Area });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rakshit-daily-os-v1");
      if (raw) {
        const saved = JSON.parse(raw) as Planner;
        const today = localDateKey();
        if (saved.savedDate && saved.savedDate !== today) {
          saved.tasks = (saved.tasks || initialTasks).map(t => ({ ...t, done: false }));
          saved.habitDone = {};
          saved.notes = "";
        }
        setData({ ...initialPlanner, ...saved, savedDate: today });
      } else setData({ ...initialPlanner, savedDate: localDateKey() });
    } catch {
      setData({ ...initialPlanner, savedDate: localDateKey() });
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("rakshit-daily-os-v1", JSON.stringify({ ...data, savedDate: localDateKey() }));
  }, [data, ready]);

  const sortedBlocks = useMemo(() => [...data.blocks].sort((a,b) => a.start.localeCompare(b.start)), [data.blocks]);
  const completed = data.tasks.filter(t => t.done).length;
  const pending = data.tasks.length - completed;
  const progress = data.tasks.length ? Math.round(completed / data.tasks.length * 100) : 0;
  const highPriority = data.tasks.filter(t => !t.done && t.priority === "High").length;
  const habitsDone = data.habits.filter(h => data.habitDone[h]).length;
  const visibleTasks = data.tasks.filter(t => filter === "All" || t.area === filter);

  function update(patch: Partial<Planner>) { setData(old => ({ ...old, ...patch })); }
  function toggleTask(id: string) { update({ tasks: data.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) }); }
  function removeTask(id: string) { update({ tasks: data.tasks.filter(t => t.id !== id) }); }
  function removeBlock(id: string) { update({ blocks: data.blocks.filter(b => b.id !== id) }); }
  function toggleGoal(id: string) { update({ goals: data.goals.map(g => g.id === id ? { ...g, done: !g.done } : g) }); }
  function addTask(e: FormEvent) {
    e.preventDefault(); if (!task.title.trim()) return;
    update({ tasks: [...data.tasks, { id: uid(), ...task, title: task.title.trim(), done: false }] });
    setTask({ title: "", area: "Work", time: "18:00", priority: "Medium" }); setTaskModal(false);
  }
  function addBlock(e: FormEvent) {
    e.preventDefault(); if (!block.title.trim()) return;
    update({ blocks: [...data.blocks, { id: uid(), ...block, title: block.title.trim(), detail: block.detail.trim() || "Custom focus block" }] });
    setBlock({ title: "", detail: "", start: "18:00", end: "19:00", area: "Personal" }); setBlockModal(false);
  }
  function addGoal(e: FormEvent) {
    e.preventDefault(); if (!goal.title.trim()) return;
    update({ goals: [...data.goals, { id: uid(), title: goal.title.trim(), area: goal.area, done: false }] });
    setGoal({ title: "", area: "Career" }); setGoalModal(false);
  }
  function navigate(next: string) { setTab(next); setMobileOpen(false); }

  return <main className="app-shell">
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="brand-lockup"><div className="brand-mark">R<span>.</span></div><div><strong>RAKSHIT<span> OS</span></strong><small>PERSONAL OPERATING SYSTEM</small></div></div>
      <div className="side-label">WORKSPACE</div>
      <nav>{[{label:"Overview",icon:LayoutDashboard},{label:"My Schedule",icon:CalendarDays},{label:"Tasks",icon:ListTodo},{label:"Goals",icon:Target},{label:"Reflection",icon:MessageSquareText}].map(item => <button key={item.label} className={tab===item.label?"nav-item active":"nav-item"} onClick={()=>navigate(item.label)}><item.icon size={17}/>{item.label}</button>)}</nav>
      <div className="side-label focus-label">FOCUS AREAS</div>
      <div className="area-nav">{areas.map(a=><button key={a} onClick={()=>{setFilter(a);navigate("Tasks");}}><i className={`area-dot ${areaClass[a]}`}/>{a}</button>)}</div>
      <div className="sidebar-bottom"><div className="focus-card"><Sparkles size={16}/><strong>Small steps. Compounding results.</strong><p>Consistency beats intensity. Protect your focus every day.</p></div><div className="profile-mini"><div className="avatar">R</div><div><strong>Rakshit Tiwari</strong><small>Builder mode <span>●</span></small></div></div></div>
    </aside>

    <section className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={()=>setMobileOpen(v=>!v)} aria-label="Toggle menu"><Menu size={20}/></button><div className="breadcrumb">Workspace <span>/</span> <b>{tab}</b></div><div className="top-actions"><span className="date-pill"><CalendarDays size={15}/>{formatDate()}</span><span className="avatar small-avatar">R</span></div></header>
      <div className="content">
        <div className="welcome-row"><div><div className="eyebrow"><span className="live-dot"/> YOUR DAILY CONTROL CENTRE</div><h1>{tab==="Overview"?"Make today count, Rakshit.":tab}</h1><p className="subhead">{tab==="Overview"?"Build your career, grow your brand, and stay in control of your day.":"A clear plan turns ambition into consistent execution."}</p></div><button className="primary-btn" onClick={()=>setTaskModal(true)}><Plus size={17}/> Add task</button></div>

        {tab==="Overview" && <>
          <div className="stats-grid">
            <Stat icon={<CheckCircle2 size={17}/>} label="Tasks completed" value={String(completed)} suffix={` / ${data.tasks.length}`} foot={`${progress}% of today's tasks`} progress={progress}/>
            <Stat icon={<Clock3 size={17}/>} label="Still to do" value={String(pending)} suffix=" tasks" foot="Keep your next action visible"/>
            <Stat icon={<Zap size={17}/>} label="High priority" value={String(highPriority)} suffix=" open" foot="Handle important work first"/>
            <Stat icon={<Flame size={17}/>} label="Habits today" value={String(habitsDone)} suffix={` / ${data.habits.length}`} foot="Consistency creates momentum"/>
          </div>
          <div className="dashboard-grid">
            <section className="panel"><div className="panel-head"><div><span className="section-kicker">YOUR DAY, DESIGNED</span><h2>Today's schedule</h2></div><button className="text-btn" onClick={()=>navigate("My Schedule")}>Full schedule <ArrowUpRight size={14}/></button></div><Timeline blocks={sortedBlocks.slice(0,6)} onDelete={removeBlock}/><button className="add-inline" onClick={()=>setBlockModal(true)}><Plus size={15}/> Add time block</button></section>
            <section className="panel"><div className="panel-head"><div><span className="section-kicker">FOCUS ON WHAT MATTERS</span><h2>Priority tasks</h2></div><button className="text-btn" onClick={()=>navigate("Tasks")}>View all <ArrowUpRight size={14}/></button></div><div className="task-list">{data.tasks.filter(t=>!t.done).sort((a,b)=>["High","Medium","Low"].indexOf(a.priority)-["High","Medium","Low"].indexOf(b.priority)).slice(0,5).map(t=><TaskRow key={t.id} task={t} onToggle={toggleTask} onDelete={removeTask}/>)}</div>{pending===0&&<div className="empty-state"><CheckCircle2 size={20}/> Your task list is clear. Nice work.</div>}</section>
          </div>
          <div className="lower-grid">
            <section className="panel"><div className="panel-head"><div><span className="section-kicker">THIS WEEK</span><h2>Goals that move you forward</h2></div><Target className="muted-icon" size={18}/></div>{data.goals.map(g=><GoalRow key={g.id} goal={g} onToggle={toggleGoal}/>)}<button className="add-inline" onClick={()=>setGoalModal(true)}><Plus size={15}/> Add weekly goal</button></section>
            <section className="panel"><div className="panel-head"><div><span className="section-kicker">DAILY SYSTEM</span><h2>Keep the promises</h2></div><Activity className="muted-icon" size={18}/></div>{data.habits.map(h=><label className="habit-row" key={h}><input type="checkbox" checked={!!data.habitDone[h]} onChange={e=>update({habitDone:{...data.habitDone,[h]:e.target.checked}})}/><span>{h}</span></label>)}<button className="add-inline" onClick={()=>{const name=window.prompt("New daily habit");if(name?.trim()&&!data.habits.includes(name.trim()))update({habits:[...data.habits,name.trim()]});}}><Plus size={15}/> Add habit</button></section>
          </div>
        </>}

        {tab==="My Schedule" && <section className="panel full-panel"><div className="panel-head"><div><span className="section-kicker">TIME BLOCKING</span><h2>Design your day</h2></div><button className="primary-btn compact" onClick={()=>setBlockModal(true)}><Plus size={16}/> Add block</button></div><div className="full-timeline">{sortedBlocks.map(b=><div className="schedule-card" key={b.id}><div className="schedule-time">{b.start}<small>to {b.end}</small></div><div className={`schedule-accent ${areaClass[b.area]}`}/><div className="schedule-info"><strong>{b.title}</strong><p>{b.detail}</p><span className={`area-tag ${areaClass[b.area]}`}>{b.area}</span></div><button className="icon-btn" onClick={()=>removeBlock(b.id)} aria-label="Delete block"><Trash2 size={16}/></button></div>)}</div></section>}

        {tab==="Tasks" && <section className="panel full-panel"><div className="panel-head"><div><span className="section-kicker">EXECUTION BOARD</span><h2>All your tasks</h2></div><button className="primary-btn compact" onClick={()=>setTaskModal(true)}><Plus size={16}/> Add task</button></div><div className="filter-row"><button className={filter==="All"?"filter active-filter":"filter"} onClick={()=>setFilter("All")}>All areas</button>{areas.map(a=><button key={a} className={filter===a?"filter active-filter":"filter"} onClick={()=>setFilter(a)}>{a}</button>)}</div><div className="task-list expanded">{visibleTasks.map(t=><TaskRow key={t.id} task={t} onToggle={toggleTask} onDelete={removeTask}/>)}</div>{visibleTasks.length===0&&<div className="empty-state">No tasks in this area yet. Add one to get started.</div>}</section>}

        {tab==="Goals" && <section className="panel full-panel"><div className="panel-head"><div><span className="section-kicker">DIRECTION & OUTCOMES</span><h2>Weekly goals</h2></div><button className="primary-btn compact" onClick={()=>setGoalModal(true)}><Plus size={16}/> Add goal</button></div>{data.goals.map(g=><GoalRow key={g.id} goal={g} onToggle={toggleGoal}/>)}</section>}

        {tab==="Reflection" && <section className="panel full-panel reflection"><div className="panel-head"><div><span className="section-kicker">CLOSE THE LOOP</span><h2>Daily reflection</h2></div><MessageSquareText className="muted-icon"/></div><label htmlFor="notes">What went well? What needs attention tomorrow?</label><textarea id="notes" value={data.notes} onChange={e=>update({notes:e.target.value})} placeholder="Capture wins, blockers, lessons and tomorrow's first move..."/><div className="reflection-tip"><Sparkles size={16}/> End each day with one lesson and one clear next action.</div></section>}
      </div>
      <footer>RAKSHIT OS <span>·</span> Designed for focus, built for consistency.</footer>
    </section>

    {taskModal&&<Modal title="New task" kicker="ADD TO YOUR EXECUTION LIST" onClose={()=>setTaskModal(false)}><form onSubmit={addTask}><label>Task name<input autoFocus value={task.title} onChange={e=>setTask({...task,title:e.target.value})} placeholder="What needs to get done?" required/></label><div className="form-grid"><label>Area<select value={task.area} onChange={e=>setTask({...task,area:e.target.value as Area})}>{areas.map(a=><option key={a}>{a}</option>)}</select></label><label>Time<input type="time" value={task.time} onChange={e=>setTask({...task,time:e.target.value})}/></label><label>Priority<select value={task.priority} onChange={e=>setTask({...task,priority:e.target.value as Priority})}><option>High</option><option>Medium</option><option>Low</option></select></label></div><button className="primary-btn submit-btn" type="submit"><Plus size={16}/> Save task</button></form></Modal>}
    {blockModal&&<Modal title="New time block" kicker="MAKE TIME FOR IT" onClose={()=>setBlockModal(false)}><form onSubmit={addBlock}><label>Block title<input autoFocus value={block.title} onChange={e=>setBlock({...block,title:e.target.value})} placeholder="e.g. Content creation" required/></label><label>Details<input value={block.detail} onChange={e=>setBlock({...block,detail:e.target.value})} placeholder="What will you focus on?"/></label><div className="form-grid"><label>Start<input type="time" value={block.start} onChange={e=>setBlock({...block,start:e.target.value})}/></label><label>End<input type="time" value={block.end} onChange={e=>setBlock({...block,end:e.target.value})}/></label><label>Area<select value={block.area} onChange={e=>setBlock({...block,area:e.target.value as Area})}>{areas.map(a=><option key={a}>{a}</option>)}</select></label></div><button className="primary-btn submit-btn" type="submit"><Plus size={16}/> Save block</button></form></Modal>}
    {goalModal&&<Modal title="New weekly goal" kicker="SET A CLEAR OUTCOME" onClose={()=>setGoalModal(false)}><form onSubmit={addGoal}><label>Goal<input autoFocus value={goal.title} onChange={e=>setGoal({...goal,title:e.target.value})} placeholder="What outcome matters this week?" required/></label><label>Area<select value={goal.area} onChange={e=>setGoal({...goal,area:e.target.value as Area})}>{areas.map(a=><option key={a}>{a}</option>)}</select></label><button className="primary-btn submit-btn" type="submit"><Plus size={16}/> Save goal</button></form></Modal>}
  </main>;
}

function Stat({icon,label,value,suffix,foot,progress}:{icon:ReactNode;label:string;value:string;suffix:string;foot:string;progress?:number}) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span>{icon}</div><div className="stat-number">{value}<small>{suffix}</small></div>{progress!==undefined&&<div className="progress-track"><i style={{width:`${progress}%`}}/></div>}<div className="stat-foot">{foot}</div></div>;
}
function Timeline({blocks,onDelete}:{blocks:Block[];onDelete:(id:string)=>void}) {
  return <div className="timeline">{blocks.map(b=><div className="time-row" key={b.id}><div className="time-label">{b.start}</div><div className={`timeline-bar ${areaClass[b.area]}`}/><div className="time-content"><strong>{b.title}</strong><small>{b.detail}</small></div><button className="icon-btn delete-soft" title="Delete time block" onClick={()=>onDelete(b.id)}><X size={14}/></button></div>)}</div>;
}
function TaskRow({task,onToggle,onDelete}:{task:Task;onToggle:(id:string)=>void;onDelete:(id:string)=>void}) {
  return <div className={`task-row ${task.done?"task-complete":""}`}><button className="check-btn" onClick={()=>onToggle(task.id)} aria-label={task.done?"Mark incomplete":"Complete task"}>{task.done?<Check size={15}/>:<Circle size={17}/>}</button><div className="task-main"><strong>{task.title}</strong><div className="task-meta"><span className={`area-tag ${areaClass[task.area]}`}>{task.area}</span><span><Clock3 size={12}/>{task.time}</span><span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span></div></div><button className="icon-btn task-delete" onClick={()=>onDelete(task.id)} aria-label="Delete task"><Trash2 size={15}/></button></div>;
}
function GoalRow({goal,onToggle}:{goal:Goal;onToggle:(id:string)=>void}) {
  return <button className={`goal-row ${goal.done?"goal-done":""}`} onClick={()=>onToggle(goal.id)}><span className="goal-check">{goal.done&&<Check size={13}/>}</span><span>{goal.title}</span><em className={`area-tag ${areaClass[goal.area]}`}>{goal.area}</em></button>;
}
function Modal({title,kicker,onClose,children}:{title:string;kicker:string;onClose:()=>void;children:ReactNode}) {
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section className="modal"><div className="modal-head"><div><span className="section-kicker">{kicker}</span><h2>{title}</h2></div><button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X/></button></div>{children}</section></div>;
}
