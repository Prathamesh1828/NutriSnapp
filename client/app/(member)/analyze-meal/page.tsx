"use client";

import { useState, useRef, useCallback } from "react";
import {
    Camera, Upload, X, Zap, CheckCircle, AlertCircle,
    Pencil, Save, Trash2, Sparkles, ScanLine, RefreshCw,
    Clock, ChevronDown, ChevronUp, Flame, History
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type MatchLevel = "HIGH MATCH" | "98% MATCH" | "MED MATCH" | "VERIFIED";
type AnalysisState = "idle" | "analyzing" | "done";
type ActiveView = "analyze" | "history";

interface DetectedItem {
    id: number;
    emoji: string;
    name: string;
    match: MatchLevel;
    portion: string;
    kcal: number;
    macroLabel: string;
    macroVal: string;
    macroColor: string;
}

interface LogEntry {
    id: string;
    imageUrl: string;
    timestamp: Date;
    mealLabel: string;
    totalKcal: number;
    protein: number;
    carbs: number;
    fat: number;
    items: DetectedItem[];
    notes: string;
}

// ── Mock detected items ───────────────────────────────────────────────────────
const MOCK_ITEMS: DetectedItem[] = [
    { id: 1, emoji: "🐟", name: "Grilled Salmon", match: "HIGH MATCH", portion: "180g Portioned", kcal: 374, macroLabel: "Protein", macroVal: "36g", macroColor: "text-[#B8FF3C]" },
    { id: 2, emoji: "🌾", name: "Organic Quinoa", match: "98% MATCH", portion: "150g Portioned", kcal: 222, macroLabel: "Carbs", macroVal: "39g", macroColor: "text-orange-400" },
    { id: 3, emoji: "🥑", name: "Hass Avocado", match: "MED MATCH", portion: "0.5 Fruit", kcal: 161, macroLabel: "Fat", macroVal: "15g", macroColor: "text-yellow-400" },
    { id: 4, emoji: "🥬", name: "Mixed Greens & Kale", match: "VERIFIED", portion: "2 Cups", kcal: 85, macroLabel: "Low Cal", macroVal: "", macroColor: "text-slate-400" },
];

const MATCH_STYLES: Record<MatchLevel, string> = {
    "HIGH MATCH": "bg-[#B8FF3C]/15 text-[#B8FF3C] border-[#B8FF3C]/30",
    "98% MATCH": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    "MED MATCH": "bg-orange-500/15 text-orange-400 border-orange-500/30",
    "VERIFIED": "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const MEAL_LABELS = ["Breakfast", "Morning Snack", "Lunch", "Afternoon Snack", "Dinner", "Evening Snack"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(d: Date) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDate(d: Date) {
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

// ── Shared input ──────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
            {children}
        </div>
    );
}
const inputCls = "bg-[#0A0A0F] border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#B8FF3C]/40 transition-all w-full";

// ── Scan overlay ──────────────────────────────────────────────────────────────
function ScanOverlay() {
    return (
        <div className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col items-center justify-center bg-black/55 backdrop-blur-sm z-10">
            <div className="relative w-44 h-44">
                {["top-0 left-0 border-t-2 border-l-2", "top-0 right-0 border-t-2 border-r-2", "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map((cls, i) => (
                    <div key={i} className={`absolute w-6 h-6 border-[#B8FF3C] ${cls}`} />
                ))}
                <div className="absolute left-0 right-0 h-0.5 bg-[#B8FF3C]/80 shadow-[0_0_8px_#B8FF3C] animate-scan" />
            </div>
            <div className="flex items-center gap-2 mt-5">
                <ScanLine size={15} className="text-[#B8FF3C] animate-pulse" />
                <span className="text-[#B8FF3C] text-sm font-bold">Analyzing meal…</span>
            </div>
            <style jsx>{`
        @keyframes scan { 0%{top:8%} 50%{top:82%} 100%{top:8%} }
        .animate-scan { animation: scan 1.8s ease-in-out infinite; position:absolute; }
      `}</style>
        </div>
    );
}

// ── Edit modal ────────────────────────────────────────────────────────────────
function EditModal({
    items, mealLabel, notes,
    onSave, onCancel,
}: {
    items: DetectedItem[];
    mealLabel: string;
    notes: string;
    onSave: (items: DetectedItem[], mealLabel: string, notes: string) => void;
    onCancel: () => void;
}) {
    const [localItems, setLocalItems] = useState<DetectedItem[]>(JSON.parse(JSON.stringify(items)));
    const [localLabel, setLocalLabel] = useState(mealLabel);
    const [localNotes, setLocalNotes] = useState(notes);

    const updatePortion = (id: number, val: string) =>
        setLocalItems(prev => prev.map(it => it.id === id ? { ...it, portion: val } : it));
    const updateKcal = (id: number, val: string) =>
        setLocalItems(prev => prev.map(it => it.id === id ? { ...it, kcal: parseInt(val) || 0 } : it));
    const removeItem = (id: number) =>
        setLocalItems(prev => prev.filter(it => it.id !== id));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#13131A] border border-white/10 rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                    <h2 className="text-sm font-black text-white">Edit Meal Details</h2>
                    <button onClick={onCancel} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Meal label */}
                    <Field label="Meal Type">
                        <div className="flex flex-wrap gap-2">
                            {MEAL_LABELS.map(l => (
                                <button key={l} onClick={() => setLocalLabel(l)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${localLabel === l ? "border-[#B8FF3C] bg-[#B8FF3C]/15 text-[#B8FF3C]" : "border-white/10 text-slate-400 hover:border-white/25"
                                        }`}>{l}</button>
                            ))}
                        </div>
                    </Field>

                    {/* Items */}
                    <Field label="Detected Items">
                        <div className="space-y-2">
                            {localItems.map(item => (
                                <div key={item.id} className="bg-[#0A0A0F] border border-white/5 rounded-xl p-3 flex items-center gap-3">
                                    <span className="text-lg flex-shrink-0">{item.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-white mb-1.5 truncate">{item.name}</div>
                                        <div className="flex gap-2">
                                            <input value={item.portion} onChange={e => updatePortion(item.id, e.target.value)}
                                                placeholder="Portion" className={`${inputCls} text-xs py-1.5 flex-1`} />
                                            <input value={item.kcal} onChange={e => updateKcal(item.id, e.target.value)}
                                                type="number" placeholder="kcal" className={`${inputCls} text-xs py-1.5 w-20`} />
                                        </div>
                                    </div>
                                    <button onClick={() => removeItem(item.id)} className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Field>

                    {/* Notes */}
                    <Field label="Notes (optional)">
                        <textarea value={localNotes} onChange={e => setLocalNotes(e.target.value)}
                            rows={2} placeholder="e.g. Post-workout lunch, added extra olive oil…"
                            className={`${inputCls} resize-none`} />
                    </Field>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-5 py-4 border-t border-white/5">
                    <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm font-bold hover:bg-white/5 transition-colors">
                        Cancel
                    </button>
                    <button onClick={() => onSave(localItems, localLabel, localNotes)}
                        className="flex-1 py-2.5 rounded-xl bg-[#B8FF3C] text-[#0A0A0F] text-sm font-black hover:bg-[#d4ff6e] transition-colors flex items-center justify-center gap-2">
                        <Save size={14} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Log history entry ─────────────────────────────────────────────────────────
function LogCard({ entry, onDelete }: { entry: LogEntry; onDelete: (id: string) => void }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-[#13131A] border border-white/6 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-4 p-4">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#1a1a24]">
                    <img src={entry.imageUrl} alt="meal" className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-black text-white">{entry.mealLabel}</span>
                        <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                            {formatDate(entry.timestamp)} · {formatTime(entry.timestamp)}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                        <span className="text-[#B8FF3C] font-black">{entry.totalKcal} kcal</span>
                        <span className="text-slate-500">P: <span className="text-slate-300">{entry.protein}g</span></span>
                        <span className="text-slate-500">C: <span className="text-slate-300">{entry.carbs}g</span></span>
                        <span className="text-slate-500">F: <span className="text-slate-300">{entry.fat}g</span></span>
                    </div>
                    {entry.notes && <p className="text-[11px] text-slate-500 mt-1 truncate italic">{entry.notes}</p>}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setExpanded(v => !v)}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button onClick={() => onDelete(entry.id)}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Expanded items */}
            {expanded && (
                <div className="border-t border-white/5 px-4 pb-4 pt-3 space-y-2">
                    {entry.items.map(item => (
                        <div key={item.id} className="flex items-center gap-3 text-xs">
                            <span className="text-base flex-shrink-0">{item.emoji}</span>
                            <span className="text-white font-medium flex-1">{item.name}</span>
                            <span className="text-slate-500">{item.portion}</span>
                            <span className="text-slate-300 font-bold w-14 text-right">{item.kcal} kcal</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AnalyzeMealPage() {
    const fileRef = useRef<HTMLInputElement>(null);
    const cameraRef = useRef<HTMLInputElement>(null);

    const [view, setView] = useState<ActiveView>("analyze");
    const [state, setState] = useState<AnalysisState>("idle");
    const [preview, setPreview] = useState<string | null>(null);
    const [items, setItems] = useState<DetectedItem[]>([]);
    const [mealLabel, setMealLabel] = useState("Lunch");
    const [notes, setNotes] = useState("");
    const [showEdit, setShowEdit] = useState(false);
    const [log, setLog] = useState<LogEntry[]>([]);
    const [savedBanner, setSavedBanner] = useState(false);

    // ── File handling ──────────────────────────────────────────────────────────
    const handleFile = useCallback((file: File) => {
        const url = URL.createObjectURL(file);
        setPreview(url);
        setState("analyzing");
        setView("analyze");
        setTimeout(() => {
            setItems(MOCK_ITEMS);
            setState("done");
        }, 2600);
    }, []);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f?.type.startsWith("image/")) handleFile(f);
    };

    // ── Actions ────────────────────────────────────────────────────────────────
    const reset = () => { setPreview(null); setState("idle"); setItems([]); setNotes(""); setMealLabel("Lunch"); };

    const handleSave = () => {
        if (!preview || !items.length) return;
        const entry: LogEntry = {
            id: crypto.randomUUID(),
            imageUrl: preview,
            timestamp: new Date(),
            mealLabel,
            totalKcal: items.reduce((s, i) => s + i.kcal, 0),
            protein: 45, carbs: 60, fat: 22,
            items: [...items],
            notes,
        };
        setLog(prev => [entry, ...prev]);
        setSavedBanner(true);
        setTimeout(() => setSavedBanner(false), 2500);
        reset();
        setView("history");
    };

    const handleDiscard = () => { reset(); };

    const handleEditSave = (newItems: DetectedItem[], newLabel: string, newNotes: string) => {
        setItems(newItems);
        setMealLabel(newLabel);
        setNotes(newNotes);
        setShowEdit(false);
    };

    const deleteLog = (id: string) => setLog(prev => prev.filter(e => e.id !== id));

    const totalKcal = items.reduce((s, i) => s + i.kcal, 0);

    return (
        <div className="space-y-5">
            {showEdit && (
                <EditModal items={items} mealLabel={mealLabel} notes={notes}
                    onSave={handleEditSave} onCancel={() => setShowEdit(false)} />
            )}

            {/* Saved banner */}
            {savedBanner && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#B8FF3C] text-[#0A0A0F] font-black text-sm px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-fade-in">
                    <CheckCircle size={15} /> Meal saved to log!
                </div>
            )}

            {/* ── Header ── */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white">Analyze Meal</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Upload or capture a photo for instant AI analysis</p>
                </div>

                {/* Tab toggle */}
                <div className="flex items-center bg-[#13131A] border border-white/8 rounded-xl p-1 gap-1">
                    <button onClick={() => setView("analyze")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === "analyze" ? "bg-[#B8FF3C] text-[#0A0A0F]" : "text-slate-400 hover:text-white"
                            }`}>
                        <Camera size={13} /> Analyze
                    </button>
                    <button onClick={() => setView("history")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === "history" ? "bg-[#B8FF3C] text-[#0A0A0F]" : "text-slate-400 hover:text-white"
                            }`}>
                        <History size={13} /> Log
                        {log.length > 0 && (
                            <span className={`text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ${view === "history" ? "bg-[#0A0A0F]/20 text-[#0A0A0F]" : "bg-[#B8FF3C]/20 text-[#B8FF3C]"
                                }`}>{log.length}</span>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Analyze view ── */}
            {view === "analyze" && (
                <>
                    {/* Idle */}
                    {state === "idle" && (
                        <div className="max-w-lg mx-auto space-y-4">
                            <div
                                onDrop={handleDrop}
                                onDragOver={e => e.preventDefault()}
                                onClick={() => fileRef.current?.click()}
                                className="cursor-pointer rounded-2xl border-2 border-dashed border-white/10 bg-[#13131A] hover:border-[#B8FF3C]/40 hover:bg-[#B8FF3C]/5 transition-all flex flex-col items-center justify-center py-14 px-6 text-center"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-[#B8FF3C]/10 flex items-center justify-center mb-4">
                                    <Upload size={28} className="text-[#B8FF3C]" />
                                </div>
                                <p className="text-white font-bold text-sm mb-1">Drag &amp; drop your meal photo</p>
                                <p className="text-slate-500 text-xs">PNG, JPG, WEBP up to 20MB</p>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-white/8" />
                                <span className="text-xs text-slate-500">or</span>
                                <div className="flex-1 h-px bg-white/8" />
                            </div>

                            <button onClick={() => cameraRef.current?.click()}
                                className="w-full flex items-center justify-center gap-3 bg-[#B8FF3C] text-[#0A0A0F] font-black py-3.5 rounded-2xl hover:bg-[#d4ff6e] transition-colors text-sm">
                                <Camera size={18} /> Take a Photo
                            </button>
                            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
                                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                        </div>
                    )}

                    {/* Analyzing / Done */}
                    {(state === "analyzing" || state === "done") && (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Left col */}
                                <div className="space-y-4">
                                    {/* Image */}
                                    <div className="relative bg-[#13131A] border border-white/6 rounded-2xl overflow-hidden aspect-[4/3]">
                                        {preview && <img src={preview} alt="Meal" className="w-full h-full object-cover" />}
                                        {state === "analyzing" && <ScanOverlay />}
                                        {state === "done" && (
                                            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#B8FF3C] text-[#0A0A0F] text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                                                <CheckCircle size={12} /> AI Analyzed
                                            </div>
                                        )}
                                        <button onClick={reset}
                                            className="absolute top-3 right-3 w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                                            <X size={13} />
                                        </button>
                                    </div>

                                    {/* Energy + macros */}
                                    {state === "done" ? (
                                        <>
                                            <div className="bg-[#13131A] border border-white/6 rounded-2xl p-5">
                                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Estimated Total Energy</div>
                                                <div className="flex items-end gap-2">
                                                    <span className="text-5xl font-black text-white leading-none">{totalKcal}</span>
                                                    <span className="text-[#B8FF3C] font-black text-lg mb-1">kcal</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { icon: "⚡", label: "PROTEIN", val: "45g", bg: "bg-[#B8FF3C]/10", border: "border-[#B8FF3C]/20", text: "text-[#B8FF3C]" },
                                                    { icon: "🔥", label: "CARBS", val: "60g", bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400" },
                                                    { icon: "💧", label: "FAT", val: "22g", bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400" },
                                                ].map(({ icon, label, val, bg, border, text }) => (
                                                    <div key={label} className={`${bg} border ${border} rounded-2xl p-3 sm:p-4 flex flex-col gap-1`}>
                                                        <span className="text-base">{icon}</span>
                                                        <div className={`text-[10px] font-black uppercase tracking-widest ${text}`}>{label}</div>
                                                        <div className="text-lg font-black text-white">{val}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Meal label selector */}
                                            <div className="bg-[#13131A] border border-white/6 rounded-2xl p-4">
                                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-3">Meal Type</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {MEAL_LABELS.map(l => (
                                                        <button key={l} onClick={() => setMealLabel(l)}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${mealLabel === l ? "border-[#B8FF3C] bg-[#B8FF3C]/15 text-[#B8FF3C]" : "border-white/10 text-slate-400 hover:border-white/25"
                                                                }`}>{l}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-[#13131A] border border-white/6 rounded-2xl p-5 animate-pulse space-y-3">
                                            <div className="h-3 bg-white/10 rounded-full w-1/3" />
                                            <div className="h-10 bg-white/10 rounded-xl w-1/2" />
                                            <div className="grid grid-cols-3 gap-3">
                                                {[0, 1, 2].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl" />)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right col */}
                                <div className="space-y-4">
                                    {/* Detected items */}
                                    <div className="bg-[#13131A] border border-white/6 rounded-2xl overflow-hidden">
                                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-[#B8FF3C]/15 rounded-lg flex items-center justify-center">
                                                    <Zap size={12} className="text-[#B8FF3C]" fill="currentColor" />
                                                </div>
                                                <h2 className="text-sm font-black text-white">Detected Items</h2>
                                            </div>
                                            {state === "done" && <span className="text-[10px] text-slate-500">{items.length} items identified</span>}
                                        </div>

                                        {state === "analyzing" ? (
                                            <div className="divide-y divide-white/5">
                                                {[0, 1, 2, 3].map(i => (
                                                    <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                                                        <div className="w-11 h-11 bg-white/8 rounded-xl flex-shrink-0" />
                                                        <div className="flex-1 space-y-2">
                                                            <div className="h-3 bg-white/10 rounded-full w-2/3" />
                                                            <div className="h-2.5 bg-white/5 rounded-full w-1/3" />
                                                        </div>
                                                        <div className="h-4 bg-white/10 rounded-full w-16" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-white/5">
                                                {items.map(item => (
                                                    <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
                                                        <div className="w-11 h-11 bg-[#1e2a1e] rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                                                            {item.emoji}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                                <span className="text-sm font-bold text-white">{item.name}</span>
                                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${MATCH_STYLES[item.match]}`}>
                                                                    {item.match}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-slate-500">{item.portion}</div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <div className="text-sm font-black text-white">{item.kcal} kcal</div>
                                                            <div className={`text-xs font-bold ${item.macroColor}`}>{item.macroVal} {item.macroLabel}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* AI Insights */}
                                    {state === "done" && (
                                        <div className="bg-[#0f1f12] border border-[#B8FF3C]/15 rounded-2xl p-5 relative overflow-hidden">
                                            <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
                                                <Sparkles size={40} className="text-[#B8FF3C]" />
                                            </div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Sparkles size={15} className="text-[#B8FF3C]" />
                                                <h3 className="text-sm font-black text-[#B8FF3C] italic">AI Nutritionist Insights</h3>
                                            </div>
                                            <ul className="space-y-3">
                                                {[
                                                    { icon: CheckCircle, color: "text-[#B8FF3C]", text: <>This meal hits <strong className="text-white">90% of your protein target</strong> for lunch. Excellent for muscle recovery.</> },
                                                    { icon: CheckCircle, color: "text-[#B8FF3C]", text: <>High in Omega-3 fatty acids from the grilled salmon. Good for joint inflammation.</> },
                                                    { icon: AlertCircle, color: "text-yellow-400", text: <>Consider reducing the quinoa portion if you&apos;re aiming for a lower-carb afternoon session.</> },
                                                ].map(({ icon: Icon, color, text }, i) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <Icon size={14} className={`${color} flex-shrink-0 mt-0.5`} />
                                                        <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bottom actions */}
                            {state === "done" && (
                                <div className="flex items-center justify-between pt-3 border-t border-white/5 gap-3 flex-wrap">
                                    <button onClick={handleDiscard}
                                        className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm font-bold transition-colors px-1">
                                        <Trash2 size={15} /> Discard
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setShowEdit(true)}
                                            className="flex items-center gap-2 bg-[#13131A] border border-white/10 text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-white/8 transition-colors">
                                            <Pencil size={14} /> Edit Details
                                        </button>
                                        <button onClick={handleSave}
                                            className="flex items-center gap-2 bg-[#B8FF3C] text-[#0A0A0F] text-sm font-black px-6 py-3 rounded-xl hover:bg-[#d4ff6e] transition-colors shadow-lg shadow-[#B8FF3C]/15">
                                            <Save size={14} /> Save to Log
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* ── History / Log view ── */}
            {view === "history" && (
                <div className="space-y-4">
                    {log.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-[#13131A] rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                                <History size={28} className="text-slate-600" />
                            </div>
                            <p className="text-white font-bold mb-1">No meals logged yet</p>
                            <p className="text-slate-500 text-sm mb-5">Analyze and save your first meal to see it here.</p>
                            <button onClick={() => setView("analyze")}
                                className="flex items-center gap-2 bg-[#B8FF3C] text-[#0A0A0F] font-black text-sm px-5 py-3 rounded-xl hover:bg-[#d4ff6e] transition-colors">
                                <Camera size={15} /> Analyze a Meal
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Summary strip */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: "Meals Logged", value: log.length, color: "text-white", unit: "" },
                                    { label: "Total Calories", value: log.reduce((s, e) => s + e.totalKcal, 0).toLocaleString(), color: "text-[#B8FF3C]", unit: "kcal" },
                                    { label: "Avg Protein", value: Math.round(log.reduce((s, e) => s + e.protein, 0) / log.length) + "g", color: "text-emerald-400", unit: "avg" },
                                ].map(({ label, value, color, unit }) => (
                                    <div key={label} className="bg-[#13131A] border border-white/6 rounded-2xl p-4 text-center">
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">{label}</div>
                                        <div className={`text-xl font-black ${color}`}>{value}</div>
                                        {unit && <div className="text-[10px] text-slate-600 mt-0.5">{unit}</div>}
                                    </div>
                                ))}
                            </div>

                            {/* Log cards */}
                            <div className="space-y-3">
                                {log.map(entry => (
                                    <LogCard key={entry.id} entry={entry} onDelete={deleteLog} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            <style jsx global>{`
        @keyframes fade-in { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }
        .animate-fade-in { animation: fade-in 0.3s ease forwards; }
      `}</style>
        </div>
    );
}