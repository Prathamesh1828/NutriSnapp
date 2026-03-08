"use client";

import { useState, useRef } from "react";
import {
    Sparkles, Printer, Share2, Plus, X, ChevronDown, ChevronUp,
    Dumbbell, Loader2, Check, GripVertical, Trash2, PenLine
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Equipment = string;

interface Exercise {
    id: string;
    name: string;
    sets: number | string;
    reps: string;
    rest: string;
}

interface WorkoutDay {
    id: string;
    title: string;
    focus: string;
    exercises: Exercise[];
    active: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const PRESET_EQUIPMENT: Equipment[] = ["Barbell", "Dumbbells", "Kettlebells", "Resistance Bands", "Bodyweight", "Cable Machine", "Smith Machine", "Pull-up Bar"];

const DEFAULT_PLAN: WorkoutDay[] = [
    {
        id: "d1", title: "Day 1: Push Focus", focus: "Chest, Shoulders, Triceps", active: true,
        exercises: [
            { id: "e1", name: "Barbell Bench Press", sets: 4, reps: "8-10", rest: "120s" },
            { id: "e2", name: "Dumbbell OHP", sets: 3, reps: "10-12", rest: "90s" },
            { id: "e3", name: "Incline DB Flyes", sets: 3, reps: "12-15", rest: "60s" },
        ]
    },
    {
        id: "d2", title: "Day 2: Pull Focus", focus: "Back, Biceps, Rear Delts", active: false,
        exercises: [
            { id: "e4", name: "Deadlift", sets: 3, reps: "5", rest: "180s" },
            { id: "e5", name: "Lat Pulldowns", sets: 3, reps: "10-12", rest: "90s" },
            { id: "e6", name: "Seated Cable Rows", sets: 3, reps: "10-12", rest: "90s" },
        ]
    },
];

const AI_PLANS: Record<number, WorkoutDay[]> = {
    3: [
        {
            id: "a1", title: "Day 1: Upper Body", focus: "Chest, Back, Shoulders", active: true,
            exercises: [
                { id: "ae1", name: "Barbell Bench Press", sets: 4, reps: "8-10", rest: "120s" },
                { id: "ae2", name: "Bent Over Rows", sets: 4, reps: "8-10", rest: "120s" },
                { id: "ae3", name: "Overhead Press", sets: 3, reps: "10-12", rest: "90s" },
            ]
        },
        {
            id: "a2", title: "Day 2: Lower Body", focus: "Quads, Hamstrings, Glutes", active: false,
            exercises: [
                { id: "ae4", name: "Back Squat", sets: 4, reps: "6-8", rest: "180s" },
                { id: "ae5", name: "Romanian Deadlift", sets: 3, reps: "10-12", rest: "120s" },
                { id: "ae6", name: "Leg Press", sets: 3, reps: "12-15", rest: "90s" },
            ]
        },
        {
            id: "a3", title: "Day 3: Full Body", focus: "Compound Movements", active: false,
            exercises: [
                { id: "ae7", name: "Deadlift", sets: 3, reps: "5", rest: "180s" },
                { id: "ae8", name: "Pull-ups", sets: 3, reps: "8-10", rest: "90s" },
                { id: "ae9", name: "Dumbbell Lunges", sets: 3, reps: "12/leg", rest: "60s" },
            ]
        },
    ],
    4: DEFAULT_PLAN.concat([
        {
            id: "a4", title: "Day 3: Legs", focus: "Quads, Hamstrings, Glutes", active: false,
            exercises: [
                { id: "ae10", name: "Back Squat", sets: 4, reps: "6-8", rest: "180s" },
                { id: "ae11", name: "Leg Curl", sets: 3, reps: "12-15", rest: "60s" },
                { id: "ae12", name: "Calf Raises", sets: 4, reps: "15-20", rest: "45s" },
            ]
        },
        {
            id: "a5", title: "Day 4: Arms & Core", focus: "Biceps, Triceps, Abs", active: false,
            exercises: [
                { id: "ae13", name: "Barbell Curls", sets: 3, reps: "10-12", rest: "60s" },
                { id: "ae14", name: "Tricep Dips", sets: 3, reps: "12-15", rest: "60s" },
                { id: "ae15", name: "Cable Crunches", sets: 3, reps: "15-20", rest: "45s" },
            ]
        },
    ]),
    5: [
        {
            id: "b1", title: "Day 1: Chest", focus: "Pectorals, Triceps", active: true,
            exercises: [
                { id: "be1", name: "Flat Bench Press", sets: 4, reps: "8-10", rest: "120s" },
                { id: "be2", name: "Incline DB Press", sets: 3, reps: "10-12", rest: "90s" },
                { id: "be3", name: "Cable Flyes", sets: 3, reps: "12-15", rest: "60s" },
            ]
        },
        {
            id: "b2", title: "Day 2: Back", focus: "Lats, Traps, Rhomboids", active: false,
            exercises: [
                { id: "be4", name: "Deadlift", sets: 3, reps: "5", rest: "180s" },
                { id: "be5", name: "Pull-ups", sets: 4, reps: "8-10", rest: "90s" },
                { id: "be6", name: "T-Bar Rows", sets: 3, reps: "10-12", rest: "90s" },
            ]
        },
        {
            id: "b3", title: "Day 3: Shoulders", focus: "Anterior, Lateral, Posterior Delts", active: false,
            exercises: [
                { id: "be7", name: "Seated DB Press", sets: 4, reps: "10-12", rest: "90s" },
                { id: "be8", name: "Lateral Raises", sets: 4, reps: "15-20", rest: "45s" },
                { id: "be9", name: "Face Pulls", sets: 3, reps: "15-20", rest: "45s" },
            ]
        },
        {
            id: "b4", title: "Day 4: Legs", focus: "Quads, Hamstrings, Glutes", active: false,
            exercises: [
                { id: "be10", name: "Back Squat", sets: 4, reps: "6-8", rest: "180s" },
                { id: "be11", name: "Romanian Deadlift", sets: 3, reps: "10-12", rest: "120s" },
                { id: "be12", name: "Leg Press", sets: 3, reps: "12-15", rest: "90s" },
            ]
        },
        {
            id: "b5", title: "Day 5: Arms", focus: "Biceps, Triceps, Core", active: false,
            exercises: [
                { id: "be13", name: "Barbell Curls", sets: 4, reps: "10-12", rest: "60s" },
                { id: "be14", name: "Skull Crushers", sets: 4, reps: "10-12", rest: "60s" },
                { id: "be15", name: "Hanging Leg Raises", sets: 3, reps: "15", rest: "45s" },
            ]
        },
    ],
    6: [
        {
            id: "c1", title: "Day 1: Push A", focus: "Chest Heavy, Shoulders, Tris", active: true,
            exercises: [{ id: "ce1", name: "Barbell Bench Press", sets: 5, reps: "5", rest: "180s" }, { id: "ce2", name: "OHP", sets: 4, reps: "8-10", rest: "90s" }, { id: "ce3", name: "Tricep Pushdown", sets: 3, reps: "12-15", rest: "60s" }]
        },
        {
            id: "c2", title: "Day 2: Pull A", focus: "Back Heavy, Biceps", active: false,
            exercises: [{ id: "ce4", name: "Deadlift", sets: 5, reps: "5", rest: "180s" }, { id: "ce5", name: "Barbell Rows", sets: 4, reps: "8-10", rest: "90s" }, { id: "ce6", name: "Face Pulls", sets: 3, reps: "15", rest: "45s" }]
        },
        {
            id: "c3", title: "Day 3: Legs A", focus: "Quad Dominant", active: false,
            exercises: [{ id: "ce7", name: "Back Squat", sets: 5, reps: "5", rest: "180s" }, { id: "ce8", name: "Leg Press", sets: 4, reps: "10-12", rest: "90s" }, { id: "ce9", name: "Walking Lunges", sets: 3, reps: "12/leg", rest: "60s" }]
        },
        {
            id: "c4", title: "Day 4: Push B", focus: "Chest Volume, Triceps", active: false,
            exercises: [{ id: "ce10", name: "Incline DB Press", sets: 4, reps: "10-12", rest: "90s" }, { id: "ce11", name: "Cable Flyes", sets: 3, reps: "15", rest: "60s" }, { id: "ce12", name: "Dips", sets: 3, reps: "12-15", rest: "60s" }]
        },
        {
            id: "c5", title: "Day 5: Pull B", focus: "Back Width, Biceps", active: false,
            exercises: [{ id: "ce13", name: "Pull-ups", sets: 4, reps: "8-10", rest: "90s" }, { id: "ce14", name: "Seated Cable Rows", sets: 4, reps: "10-12", rest: "90s" }, { id: "ce15", name: "DB Curls", sets: 3, reps: "12-15", rest: "60s" }]
        },
        {
            id: "c6", title: "Day 6: Legs B", focus: "Hip Dominant", active: false,
            exercises: [{ id: "ce16", name: "Romanian Deadlift", sets: 4, reps: "8-10", rest: "120s" }, { id: "ce17", name: "Leg Curl", sets: 4, reps: "12-15", rest: "60s" }, { id: "ce18", name: "Calf Raises", sets: 5, reps: "15-20", rest: "45s" }]
        },
    ],
    7: [
        {
            id: "d1x", title: "Day 1: Push", focus: "Chest, Shoulders, Triceps", active: true,
            exercises: [{ id: "de1", name: "Bench Press", sets: 4, reps: "8-10", rest: "120s" }, { id: "de2", name: "DB OHP", sets: 3, reps: "10-12", rest: "90s" }, { id: "de3", name: "Lateral Raises", sets: 3, reps: "15-20", rest: "45s" }]
        },
        {
            id: "d2x", title: "Day 2: Pull", focus: "Back, Biceps", active: false,
            exercises: [{ id: "de4", name: "Deadlift", sets: 3, reps: "5", rest: "180s" }, { id: "de5", name: "Pull-ups", sets: 4, reps: "8-10", rest: "90s" }, { id: "de6", name: "Hammer Curls", sets: 3, reps: "12-15", rest: "60s" }]
        },
        {
            id: "d3x", title: "Day 3: Legs", focus: "Full Leg Day", active: false,
            exercises: [{ id: "de7", name: "Squat", sets: 4, reps: "6-8", rest: "180s" }, { id: "de8", name: "Romanian DL", sets: 3, reps: "10-12", rest: "120s" }, { id: "de9", name: "Leg Curl", sets: 3, reps: "12-15", rest: "60s" }]
        },
        {
            id: "d4x", title: "Day 4: Upper", focus: "Chest & Back", active: false,
            exercises: [{ id: "de10", name: "Incline Press", sets: 3, reps: "10-12", rest: "90s" }, { id: "de11", name: "Cable Rows", sets: 3, reps: "10-12", rest: "90s" }, { id: "de12", name: "Face Pulls", sets: 3, reps: "15", rest: "45s" }]
        },
        {
            id: "d5x", title: "Day 5: Arms", focus: "Biceps, Triceps", active: false,
            exercises: [{ id: "de13", name: "Barbell Curls", sets: 4, reps: "10-12", rest: "60s" }, { id: "de14", name: "Skull Crushers", sets: 4, reps: "10-12", rest: "60s" }, { id: "de15", name: "Cable Curls", sets: 3, reps: "15", rest: "45s" }]
        },
        {
            id: "d6x", title: "Day 6: Conditioning", focus: "Full Body Circuit", active: false,
            exercises: [{ id: "de16", name: "Kettlebell Swings", sets: 4, reps: "20", rest: "45s" }, { id: "de17", name: "Box Jumps", sets: 3, reps: "10", rest: "60s" }, { id: "de18", name: "Battle Ropes", sets: 3, reps: "30s", rest: "60s" }]
        },
        {
            id: "d7x", title: "Day 7: Active Recovery", focus: "Mobility, Core", active: false,
            exercises: [{ id: "de19", name: "Foam Rolling", sets: 1, reps: "10 min", rest: "-" }, { id: "de20", name: "Yoga Flow", sets: 1, reps: "15 min", rest: "-" }, { id: "de21", name: "Plank Holds", sets: 3, reps: "60s", rest: "45s" }]
        },
    ],
};

function uid() { return Math.random().toString(36).slice(2, 9); }

// ── Exercise row (editable) ───────────────────────────────────────────────────
function ExerciseRow({ ex, onChange, onDelete }: {
    ex: Exercise;
    onChange: (updated: Exercise) => void;
    onDelete: () => void;
}) {
    const inp = "bg-transparent border-b border-white/10 focus:border-[#B8FF3C]/50 outline-none text-white text-xs text-center w-full transition-colors py-0.5";
    return (
        <tr className="border-b border-white/5 hover:bg-white/3 group transition-colors">
            <td className="py-3 pr-3">
                <input value={ex.name} onChange={e => onChange({ ...ex, name: e.target.value })}
                    className="bg-transparent border-b border-white/10 focus:border-[#B8FF3C]/50 outline-none text-white text-sm w-full transition-colors py-0.5" />
            </td>
            <td className="py-3 px-2 w-14"><input value={ex.sets} onChange={e => onChange({ ...ex, sets: e.target.value })} className={inp} /></td>
            <td className="py-3 px-2 w-16"><input value={ex.reps} onChange={e => onChange({ ...ex, reps: e.target.value })} className={inp} /></td>
            <td className="py-3 pl-2 w-16">
                <div className="flex items-center justify-between gap-1">
                    <input value={ex.rest} onChange={e => onChange({ ...ex, rest: e.target.value })}
                        className="bg-transparent border-b border-white/10 focus:border-[#B8FF3C]/50 outline-none text-slate-400 text-xs text-center w-full transition-colors py-0.5" />
                    <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-400 flex-shrink-0">
                        <X size={13} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ── Day card ──────────────────────────────────────────────────────────────────
function DayCard({ day, onUpdate, onDelete }: {
    day: WorkoutDay;
    onUpdate: (updated: WorkoutDay) => void;
    onDelete: () => void;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);

    const updateEx = (id: string, updated: Exercise) =>
        onUpdate({ ...day, exercises: day.exercises.map(e => e.id === id ? updated : e) });
    const deleteEx = (id: string) =>
        onUpdate({ ...day, exercises: day.exercises.filter(e => e.id !== id) });
    const addEx = () =>
        onUpdate({ ...day, exercises: [...day.exercises, { id: uid(), name: "New Exercise", sets: 3, reps: "10-12", rest: "60s" }] });

    return (
        <div className={`bg-[#13131A] border rounded-2xl overflow-hidden transition-colors ${day.active ? "border-[#B8FF3C]/40" : "border-white/6"}`}>
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${day.active ? "bg-[#B8FF3C]" : "bg-slate-600"}`} />
                    <div className="flex-1 min-w-0">
                        {editingTitle ? (
                            <div className="flex gap-2">
                                <input autoFocus value={day.title} onChange={e => onUpdate({ ...day, title: e.target.value })}
                                    onBlur={() => setEditingTitle(false)}
                                    className="bg-[#0A0A0F] border border-[#B8FF3C]/30 rounded-lg px-2 py-1 text-white text-sm font-bold outline-none flex-1" />
                                <input value={day.focus} onChange={e => onUpdate({ ...day, focus: e.target.value })}
                                    placeholder="Focus muscles…"
                                    className="bg-[#0A0A0F] border border-white/10 rounded-lg px-2 py-1 text-slate-400 text-xs outline-none flex-1" />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setEditingTitle(true)}>
                                <span className="text-sm font-black text-white">{day.title}</span>
                                <PenLine size={12} className="text-slate-600 hover:text-slate-400 transition-colors" />
                            </div>
                        )}
                        {!editingTitle && <div className="text-[10px] text-slate-500 mt-0.5">{day.focus}</div>}
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => onUpdate({ ...day, active: !day.active })}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${day.active ? "border-[#B8FF3C]/40 text-[#B8FF3C] bg-[#B8FF3C]/10" : "border-white/10 text-slate-500 hover:border-white/20"}`}>
                        {day.active ? "Active" : "Set Active"}
                    </button>
                    <button onClick={() => setCollapsed(v => !v)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                        {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                    </button>
                    <button onClick={onDelete} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>

            {/* Exercises table */}
            {!collapsed && (
                <div className="px-5 pb-4">
                    <table className="w-full mt-2">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-[10px] text-slate-600 uppercase tracking-wider font-black text-left py-2 pr-3">Exercise</th>
                                <th className="text-[10px] text-slate-600 uppercase tracking-wider font-black text-center py-2 px-2 w-14">Sets</th>
                                <th className="text-[10px] text-slate-600 uppercase tracking-wider font-black text-center py-2 px-2 w-16">Reps</th>
                                <th className="text-[10px] text-slate-600 uppercase tracking-wider font-black text-center py-2 pl-2 w-16">Rest</th>
                            </tr>
                        </thead>
                        <tbody>
                            {day.exercises.map(ex => (
                                <ExerciseRow key={ex.id} ex={ex} onChange={u => updateEx(ex.id, u)} onDelete={() => deleteEx(ex.id)} />
                            ))}
                        </tbody>
                    </table>
                    <button onClick={addEx} className="mt-3 flex items-center gap-1.5 text-xs text-[#B8FF3C] font-bold hover:text-[#d4ff6e] transition-colors">
                        <Plus size={13} /> Add Exercise
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WorkoutPlannerPage() {
    const [frequency, setFrequency] = useState(4);
    const [equipment, setEquipment] = useState<Equipment[]>(["Barbell", "Dumbbells", "Bodyweight"]);
    const [customEq, setCustomEq] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [plan, setPlan] = useState<WorkoutDay[]>(DEFAULT_PLAN);
    const [planName, setPlanName] = useState("Hypertrophy Blueprint");
    const [editingName, setEditingName] = useState(false);
    const [generated, setGenerated] = useState(true);
    const printRef = useRef<HTMLDivElement>(null);

    const toggleEquipment = (eq: Equipment) =>
        setEquipment(prev => prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]);

    const addCustomEquipment = () => {
        const val = customEq.trim();
        if (val && !equipment.includes(val)) {
            setEquipment(prev => [...prev, val]);
        }
        setCustomEq("");
        setShowCustomInput(false);
    };

    const handleGenerate = () => {
        if (equipment.length === 0) return;
        setGenerating(true);
        setTimeout(() => {
            const days = frequency >= 3 && frequency <= 7 ? AI_PLANS[frequency] ?? DEFAULT_PLAN : DEFAULT_PLAN;
            // Deep clone to avoid shared references
            const cloned: WorkoutDay[] = JSON.parse(JSON.stringify(days));
            // Give fresh IDs
            cloned.forEach(d => {
                d.id = uid();
                d.exercises.forEach(e => { e.id = uid(); });
            });
            setPlan(cloned);
            setGenerated(true);
            setGenerating(false);
            // Pick plan name based on frequency
            const names: Record<number, string> = { 3: "Foundation Blueprint", 4: "Hypertrophy Blueprint", 5: "Advanced PPL Split", 6: "Push-Pull-Legs 6-Day", 7: "Elite 7-Day Program" };
            setPlanName(names[frequency] ?? "Custom AI Plan");
        }, 2200);
    };

    const updateDay = (id: string, updated: WorkoutDay) =>
        setPlan(prev => prev.map(d => d.id === id ? updated : d));
    const deleteDay = (id: string) =>
        setPlan(prev => prev.filter(d => d.id !== id));
    const addDay = () =>
        setPlan(prev => [...prev, { id: uid(), title: `Day ${prev.length + 1}: New Day`, focus: "Edit focus", active: false, exercises: [{ id: uid(), name: "New Exercise", sets: 3, reps: "10-12", rest: "60s" }] }]);

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;
        const win = window.open("", "_blank", "width=900,height=700");
        if (!win) return;
        win.document.write(`
      <html><head><title>${planName}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, sans-serif; background: #fff; color: #111; padding: 32px; }
        h1 { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
        .sub { color: #666; font-size: 13px; margin-bottom: 24px; }
        .day { border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 20px; overflow: hidden; }
        .day-header { background: #f9fafb; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; }
        .day-title { font-weight: 800; font-size: 15px; }
        .day-focus { color: #666; font-size: 12px; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #999; padding: 10px 16px 8px; border-bottom: 1px solid #f0f0f0; }
        td { padding: 10px 16px; font-size: 13px; border-bottom: 1px solid #f9fafb; }
        tr:last-child td { border-bottom: none; }
        .rest { color: #999; }
        .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #999; }
        @media print { body { padding: 16px; } }
      </style></head><body>
      <h1>${planName}</h1>
      <div class="sub">${frequency}-Day Program · ${equipment.join(", ")}</div>
      ${plan.map(day => `
        <div class="day">
          <div class="day-header">
            <div class="day-title">${day.title}</div>
            <div class="day-focus">${day.focus}</div>
          </div>
          <table>
            <tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Rest</th></tr>
            ${day.exercises.map(ex => `<tr><td>${ex.name}</td><td>${ex.sets}</td><td>${ex.reps}</td><td class="rest">${ex.rest}</td></tr>`).join("")}
          </table>
        </div>
      `).join("")}
      <div class="footer">Generated by MacroSnap AI · ${new Date().toLocaleDateString()}</div>
      </body></html>
    `);
        win.document.close();
        win.onload = () => { win.print(); };
    };

    const level = frequency <= 3 ? "Beginner" : frequency <= 5 ? "Intermediate" : "Advanced";

    return (
        <div className="space-y-5 sm:space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white">Workout Planner</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Configure your training and generate an AI-powered plan</p>
                </div>
            </div>

            {/* Config card */}
            <div className="bg-[#13131A] border border-white/6 rounded-2xl p-5 sm:p-6 space-y-6">

                {/* Training frequency */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Training Frequency</div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-white">{frequency}</span>
                            <span className="text-slate-500 text-sm">Days</span>
                        </div>
                    </div>
                    {/* Slider */}
                    <div className="relative">
                        <input type="range" min={3} max={7} value={frequency} onChange={e => setFrequency(Number(e.target.value))}
                            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#B8FF3C]"
                            style={{ background: `linear-gradient(to right, #B8FF3C ${((frequency - 3) / 4) * 100}%, #1e2a1e ${((frequency - 3) / 4) * 100}%)` }} />
                        <div className="flex justify-between mt-2">
                            {[3, 4, 5, 6, 7].map(n => (
                                <button key={n} onClick={() => setFrequency(n)}
                                    className={`text-[10px] font-bold transition-colors ${frequency === n ? "text-[#B8FF3C]" : "text-slate-600 hover:text-slate-400"}`}>
                                    {n}d
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Equipment selection */}
                <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-3">Equipment Selection</div>
                    <div className="flex flex-wrap gap-2">
                        {PRESET_EQUIPMENT.map(eq => (
                            <button key={eq} onClick={() => toggleEquipment(eq)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${equipment.includes(eq)
                                        ? "border-[#B8FF3C] bg-[#B8FF3C]/15 text-[#B8FF3C]"
                                        : "border-white/10 text-slate-400 hover:border-white/25 hover:text-white"
                                    }`}>{eq}</button>
                        ))}
                        {/* Custom equipment tags */}
                        {equipment.filter(e => !PRESET_EQUIPMENT.includes(e)).map(eq => (
                            <span key={eq} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border border-[#B8FF3C] bg-[#B8FF3C]/15 text-[#B8FF3C]">
                                {eq}
                                <button onClick={() => setEquipment(prev => prev.filter(e => e !== eq))}><X size={11} /></button>
                            </span>
                        ))}
                        {/* Add custom */}
                        {showCustomInput ? (
                            <div className="flex items-center gap-2">
                                <input autoFocus value={customEq} onChange={e => setCustomEq(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") addCustomEquipment(); if (e.key === "Escape") setShowCustomInput(false); }}
                                    placeholder="e.g. TRX Bands"
                                    className="bg-[#0A0A0F] border border-white/15 rounded-full px-3 py-1.5 text-white text-xs outline-none focus:border-[#B8FF3C]/40 w-32" />
                                <button onClick={addCustomEquipment} className="w-6 h-6 bg-[#B8FF3C] rounded-full flex items-center justify-center">
                                    <Check size={12} className="text-[#0A0A0F]" />
                                </button>
                                <button onClick={() => setShowCustomInput(false)} className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center">
                                    <X size={12} className="text-slate-400" />
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setShowCustomInput(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-dashed border-white/15 text-slate-500 hover:text-white hover:border-white/30 transition-all">
                                <Plus size={11} /> Add Custom
                            </button>
                        )}
                    </div>
                    {equipment.length === 0 && (
                        <p className="text-red-400 text-xs mt-2 font-medium">Select at least one equipment type</p>
                    )}
                </div>

                {/* Generate button */}
                <button onClick={handleGenerate} disabled={generating || equipment.length === 0}
                    className={`w-full sm:w-auto sm:min-w-[220px] flex items-center justify-center gap-3 py-3.5 px-8 rounded-2xl text-sm font-black transition-all ${generating || equipment.length === 0
                            ? "bg-[#B8FF3C]/30 text-[#0A0A0F]/50 cursor-not-allowed"
                            : "bg-[#B8FF3C] text-[#0A0A0F] hover:bg-[#d4ff6e] shadow-lg shadow-[#B8FF3C]/20 active:scale-95"
                        }`}>
                    {generating ? <><Loader2 size={16} className="animate-spin" /> Generating Plan…</> : <><Sparkles size={16} /> Generate AI Plan</>}
                </button>
            </div>

            {/* Plan output */}
            {generated && (
                <div ref={printRef}>
                    {/* Plan header */}
                    <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                        <div>
                            {editingName ? (
                                <input autoFocus value={planName} onChange={e => setPlanName(e.target.value)}
                                    onBlur={() => setEditingName(false)}
                                    onKeyDown={e => e.key === "Enter" && setEditingName(false)}
                                    className="bg-[#13131A] border border-[#B8FF3C]/30 rounded-xl px-3 py-2 text-white text-xl font-black outline-none w-72" />
                            ) : (
                                <h2 className="text-2xl sm:text-3xl font-black text-white cursor-pointer hover:text-slate-200 flex items-center gap-2"
                                    onClick={() => setEditingName(true)}>
                                    {planName}
                                    <PenLine size={16} className="text-slate-600 hover:text-slate-400" />
                                </h2>
                            )}
                            <p className="text-slate-500 text-sm mt-1">
                                {frequency}-Week Structured Program
                                <span className="text-slate-600"> · </span>
                                <span className="text-slate-400">{level}</span>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handlePrint}
                                className="w-10 h-10 bg-[#13131A] border border-white/8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all">
                                <Printer size={16} />
                            </button>
                            <button onClick={() => {
                                const text = `${planName}\n${frequency}-Day Program\n\n${plan.map(d => `${d.title}\n${d.exercises.map(e => `  ${e.name}: ${e.sets}×${e.reps} rest ${e.rest}`).join("\n")}`).join("\n\n")}`;
                                navigator.clipboard.writeText(text).then(() => alert("Plan copied to clipboard!"));
                            }}
                                className="w-10 h-10 bg-[#13131A] border border-white/8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all">
                                <Share2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Day cards grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {plan.map(day => (
                            <DayCard key={day.id} day={day}
                                onUpdate={updated => updateDay(day.id, updated)}
                                onDelete={() => deleteDay(day.id)} />
                        ))}
                        {/* Add day */}
                        <button onClick={addDay}
                            className="border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-white hover:border-white/25 transition-all py-12 sm:py-0 sm:min-h-[180px]">
                            <Plus size={18} /> Add Day
                        </button>
                    </div>

                    {/* Coach notes */}
                    <div className="mt-4 bg-[#0c1f12] border border-[#B8FF3C]/15 rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute right-5 top-5 opacity-8 pointer-events-none">
                            <Sparkles size={56} className="text-[#B8FF3C]" />
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-[#B8FF3C]/15 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Dumbbell size={18} className="text-[#B8FF3C]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white mb-2">Coach Notes</h3>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    To maximize hypertrophy with this split, focus on a controlled negative (eccentric) phase for every rep. Ensure you&apos;re increasing weight by 2–5% each week to maintain progressive overload. For &apos;Push Day&apos;, prioritize the bench press as your primary compound movement. Hydrate with 500ml of water 30 mins before the session.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
                        <span>© {new Date().getFullYear()} MacroSnap AI. Generated for User #8129.</span>
                        <div className="flex gap-4">
                            <button className="hover:text-slate-400 transition-colors">Privacy Policy</button>
                            <button className="hover:text-slate-400 transition-colors">Terms of Service</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}