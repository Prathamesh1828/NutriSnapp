"use client";

import { TrendingUp, TrendingDown, Minus, Bell, Lightbulb, Activity, ArrowRight, Plus } from "lucide-react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, ReferenceLine, Cell
} from "recharts";

// ── Mock data ─────────────────────────────────────────────────────────────────
const calorieData = [
    { day: "MON", val: 1750 }, { day: "TUE", val: 2100 }, { day: "WED", val: 1900 },
    { day: "THU", val: 2300 }, { day: "FRI", val: 1600 }, { day: "SAT", val: 2050 }, { day: "SUN", val: 1840 },
];
const proteinData = [
    { day: "MON", val: 110 }, { day: "TUE", val: 128 }, { day: "WED", val: 155 },
    { day: "THU", val: 168 }, { day: "FRI", val: 130 }, { day: "SAT", val: 142 }, { day: "SUN", val: 145 },
];
const TARGET_PROTEIN = 130;

const meals = [
    { icon: "🥑", name: "Avocado Toast w/ Egg", time: "08:15 AM", meal: "Breakfast", kcal: 420, protein: 18, bg: "bg-orange-500/20" },
    { icon: "🥗", name: "Grilled Chicken Salad", time: "12:45 PM", meal: "Lunch", kcal: 580, protein: 52, bg: "bg-emerald-500/20" },
    { icon: "🥤", name: "Protein Shake", time: "04:30 PM", meal: "Snack", kcal: 180, protein: 30, bg: "bg-blue-500/20" },
];

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, unit, trendLabel, trend, icon }: {
    label: string; value: string; unit: string;
    trendLabel?: string; trend?: "up" | "down" | "flat"; icon?: string;
}) {
    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
    const trendColor = trend === "up" ? "text-[#B8FF3C]" : trend === "down" ? "text-red-400" : "text-slate-400";

    return (
        <div className="relative bg-[#13131A] border border-white/6 rounded-2xl p-5 overflow-hidden flex flex-col justify-between min-h-[110px]">
            {icon && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-10 select-none pointer-events-none">
                    {icon}
                </div>
            )}
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">{label}</div>
            <div className="flex items-end gap-1.5">
                <span className="text-3xl font-black text-white leading-none">{value}</span>
                {unit && <span className="text-sm text-slate-500 mb-0.5 font-medium">{unit}</span>}
            </div>
            {trendLabel && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendColor}`}>
                    {trend && <TrendIcon size={12} />}
                    <span>{trendLabel}</span>
                </div>
            )}
        </div>
    );
}

// ── Water ring ────────────────────────────────────────────────────────────────
function WaterRing({ pct }: { pct: number }) {
    const r = 54, circ = 2 * Math.PI * r;
    return (
        <svg width={130} height={130} className="rotate-[-90deg]">
            <circle cx={65} cy={65} r={r} fill="none" stroke="#1e2a1e" strokeWidth={10} />
            <circle cx={65} cy={65} r={r} fill="none" stroke="#B8FF3C" strokeWidth={10}
                strokeDasharray={`${circ * pct / 100} ${circ}`} strokeLinecap="round" />
        </svg>
    );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ label, current, max, color, unit = "g" }: {
    label: string; current: number; max: number; color: string; unit?: string;
}) {
    return (
        <div className="mb-4 last:mb-0">
            <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">{label}</span>
                <span className="text-slate-500">{current}{unit} / {max}{unit}</span>
            </div>
            <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, (current / max) * 100)}%` }} />
            </div>
        </div>
    );
}

// ── Chart tooltip ─────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#1a1a24] border border-white/10 rounded-xl px-3 py-2 text-xs">
            <div className="text-slate-400 mb-1">{label}</div>
            <div className="text-white font-bold">{payload[0].value}{payload[0].dataKey === "val" ? " kcal" : "g"}</div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    return (
        <div className="space-y-5">

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="Calories" value="1,840" unit="kcal" trend="up" trendLabel="12% vs last week" icon="🔥" />
                <StatCard label="Protein" value="142" unit="grams" trend="down" trendLabel="5% vs goal" icon="💪" />
                <StatCard label="Weight" value="178.5" unit="lbs" trend="flat" trendLabel="Steady pace" icon="⚖️" />
                <StatCard label="Workouts" value="4 / 5" unit="" trendLabel="On track" trend="up" icon="🏋️" />
            </div>

            {/* Water + AI Focus + Reminder */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Water + Reminder stacked */}
                <div className="flex flex-col gap-4">
                    <div className="bg-[#13131A] border border-white/6 rounded-2xl p-5 flex flex-col items-center">
                        <div className="text-sm font-black text-white mb-4 self-start">Water Intake</div>
                        <div className="relative flex items-center justify-center mb-3">
                            <WaterRing pct={53} />
                            <div className="absolute text-center pointer-events-none">
                                <div className="text-2xl font-black text-white">53%</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Goal</div>
                            </div>
                        </div>
                        <div className="text-xs text-slate-400">
                            <span className="text-white font-bold">1,600ml</span> / 3,000ml
                        </div>
                    </div>

                    <div className="bg-[#B8FF3C]/10 border border-[#B8FF3C]/20 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#B8FF3C] rounded-xl flex items-center justify-center flex-shrink-0">
                            <Bell size={18} className="text-[#0A0A0F]" />
                        </div>
                        <div>
                            <div className="text-[10px] text-[#B8FF3C] font-black uppercase tracking-wider mb-0.5">Next Reminder</div>
                            <div className="text-white font-bold text-sm">Hydrate in 15 mins</div>
                        </div>
                    </div>
                </div>

                {/* AI Daily Focus */}
                <div className="sm:col-span-1 lg:col-span-2 bg-[#13131A] border border-white/6 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-base font-black text-white">AI Daily Focus</h2>
                        <div className="w-6 h-6 bg-[#B8FF3C]/20 rounded-lg flex items-center justify-center">
                            <Lightbulb size={12} className="text-[#B8FF3C]" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-5">Recommended targets based on your sleep &amp; activity</p>

                    <ProgressBar label="Fiber Intake" current={22} max={35} color="bg-orange-400" unit="g" />
                    <ProgressBar label="Saturated Fat Limit" current={14} max={20} color="bg-teal-400" unit="g" />
                    <ProgressBar label="Evening Recovery Focus" current={85} max={100} color="bg-purple-400" unit="%" />

                    <div className="mt-5 border-t border-white/5 pt-4">
                        <p className="text-slate-300 text-sm italic leading-relaxed">
                            <span className="text-[#B8FF3C] not-italic font-black">&ldquo;</span>
                            Alex, your protein intake is slightly lagging today. Aim for a high-protein snack post-workout to hit your recovery sweet spot.
                            <span className="text-[#B8FF3C] not-italic font-black">&rdquo;</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-[#13131A] border border-white/6 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <Activity size={15} className="text-[#B8FF3C]" />
                            <h2 className="text-sm font-black text-white">Weekly Summary</h2>
                        </div>
                        <p className="text-sm text-slate-400">
                            AI Insight:{" "}
                            <span className="text-[#B8FF3C] font-bold">You smashed your protein goal 5/7 days!</span>
                            {" "}Keep up the consistency.
                        </p>
                    </div>
                    <div className="flex gap-6 sm:gap-8 flex-shrink-0">
                        {[
                            { label: "Avg. Calories", value: "1,920", sub: "kcal", color: "text-white" },
                            { label: "Avg. Protein", value: "145g", sub: "daily", color: "text-[#B8FF3C]" },
                            { label: "Total Workouts", value: "4", sub: "sessions", color: "text-white" },
                        ].map(({ label, value, sub, color }) => (
                            <div key={label} className="text-center">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</div>
                                <div className={`text-xl font-black ${color}`}>{value}</div>
                                <div className="text-[10px] text-slate-500">{sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Calorie area chart */}
                <div className="bg-[#13131A] border border-white/6 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-white">Calorie Intake</h3>
                        <span className="text-xs text-slate-500">Last 7 Days</span>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={calorieData} margin={{ top: 5, right: 5, bottom: 0, left: -30 }}>
                            <defs>
                                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#B8FF3C" stopOpacity={0.35} />
                                    <stop offset="100%" stopColor="#B8FF3C" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} domain={[1400, 2500]} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="val" stroke="#B8FF3C" strokeWidth={2.5} fill="url(#calGrad)"
                                dot={{ fill: "#B8FF3C", r: 3, strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: "#B8FF3C" }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Protein bar chart */}
                <div className="bg-[#13131A] border border-white/6 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-white">Protein Consistency</h3>
                        <span className="text-xs text-slate-500">Last 7 Days</span>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={proteinData} margin={{ top: 5, right: 5, bottom: 0, left: -30 }} barCategoryGap="30%">
                            <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 200]} />
                            <Tooltip content={<ChartTooltip />} />
                            <ReferenceLine y={TARGET_PROTEIN} stroke="#64748b" strokeDasharray="4 3" strokeWidth={1}
                                label={{ value: `TARGET (${TARGET_PROTEIN}g)`, fill: "#64748b", fontSize: 9, position: "insideTopRight" }} />
                            <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                                {proteinData.map((entry, i) => (
                                    <Cell key={i} fill={entry.val >= TARGET_PROTEIN ? "#10b981" : "#134e3a"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Today's Meals */}
            <div className="bg-[#13131A] border border-white/6 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-black text-white">Today&apos;s Meals</h3>
                    <button className="text-xs text-[#B8FF3C] font-bold flex items-center gap-1 hover:text-[#d4ff6e] transition-colors">
                        View All <ArrowRight size={12} />
                    </button>
                </div>

                <div className="divide-y divide-white/5">
                    {meals.map((meal, i) => (
                        <div key={i} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                            <div className={`w-10 h-10 ${meal.bg} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>
                                {meal.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-white truncate">{meal.name}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">{meal.time} · {meal.meal}</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className="text-sm font-black text-white">{meal.kcal}</div>
                                <div className="text-[9px] text-slate-500 uppercase tracking-wider">kcal</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className="text-sm font-black text-[#B8FF3C]">{meal.protein}g</div>
                                <div className="text-[9px] text-slate-500 uppercase tracking-wider">protein</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                    <button className="w-full flex items-center justify-center gap-2 bg-[#0A0A0F] border border-white/10 text-white text-sm font-bold py-3 rounded-xl hover:bg-white/5 transition-colors">
                        <Plus size={15} /> Add New Log
                    </button>
                </div>
            </div>

        </div>
    );
}