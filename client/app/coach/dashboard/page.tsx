"use client";

// ── icons (inline SVGs to keep single-file) ──────────────────────────────────
const Icons = {
    Logo: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 2a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
    ),
    Dashboard: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" />
            <rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" />
        </svg>
    ),
    Clients: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <circle cx="9" cy="7" r="4" /><path d="M2 21v-2a7 7 0 0114 0v2" />
            <circle cx="19" cy="7" r="3" /><path d="M22 21v-2a5 5 0 00-3-4.6" />
        </svg>
    ),
    Programs: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <rect x="3" y="3" width="18" height="4" rx="1" /><rect x="3" y="10" width="18" height="4" rx="1" />
            <rect x="3" y="17" width="11" height="4" rx="1" />
        </svg>
    ),
    Analytics: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M3 21h18M5 21V10l7-7 7 7v11M9 21v-6h6v6" />
        </svg>
    ),
    Messages: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
        </svg>
    ),
    Settings: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
    ),
    Bell: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
        </svg>
    ),
    Search: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
    ),
    Users: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
    ),
    Bolt: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    ),
    Barbell: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M6.5 6.5h11M6.5 17.5h11M4 9v6M8 7v10M16 7v10M20 9v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
    ),
    Trophy: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M6 9H3.5a2.5 2.5 0 010-5H6M18 9h2.5a2.5 2.5 0 000-5H18M8 21h8M12 17v4M17 9A5 5 0 017 9V4h10v5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    ),
    Clock: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
    ),
    Check: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <path d="M20 6L9 17l-5-5" />
        </svg>
    ),
    UserPlus: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
        </svg>
    ),
    Fork: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M12 2a2 2 0 110 4 2 2 0 010-4zM12 6v4M8 8a2 2 0 11-1.73-3A5 5 0 0112 10a5 5 0 015.73-5A2 2 0 1118 8M8 8v6a4 4 0 008 0V8" />
        </svg>
    ),
    Dumbbell: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M6.5 6.5h11M6.5 17.5h11M4 9v6M8 7v10M16 7v10M20 9v6" strokeLinecap="round" />
        </svg>
    ),
    Target: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
        </svg>
    ),
    Msg: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
        </svg>
    ),
    Menu: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
    ),
    X: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            <path d="M18 6L6 18M6 6l12 12" />
        </svg>
    ),
};

// ── data ──────────────────────────────────────────────────────────────────────
const clients = [
    { name: "Sarah Jenkins", status: "Active", program: "Summer Shred 2.0", compliance: 92, statusColor: "text-[#B5FF4D] bg-[#B5FF4D]/10 border-[#B5FF4D]/30", barColor: "bg-[#B5FF4D]" },
    { name: "David Moore", status: "On Break", program: "Bulk Phase", compliance: 45, statusColor: "text-amber-400 bg-amber-400/10 border-amber-400/30", barColor: "bg-amber-400" },
    { name: "Jessica Alba", status: "Active", program: "Performance Pro", compliance: 98, statusColor: "text-[#B5FF4D] bg-[#B5FF4D]/10 border-[#B5FF4D]/30", barColor: "bg-[#B5FF4D]" },
];

const feed = [
    { user: "Sarah Jenkins", action: "logged a meal", time: "10 minutes ago", note: '"Post-workout smoothie with high-fiber grains…"', Icon: Icons.Fork, color: "bg-[#B5FF4D]/20 text-[#B5FF4D]" },
    { user: "Marcus Thorne", action: "completed workout", time: "45 minutes ago", note: null, Icon: Icons.Dumbbell, color: "bg-blue-500/20 text-blue-400" },
    { user: "Elena Rodriguez", action: "hit daily macro goal", time: "1 hour ago", note: null, Icon: Icons.Target, color: "bg-[#B5FF4D]/20 text-[#B5FF4D]" },
    { user: "New Client", action: "accepted invite", time: "3 hours ago", note: null, Icon: Icons.UserPlus, color: "bg-slate-500/20 text-slate-400" },
    { user: "David Moore", action: "sent a message", time: "Yesterday", note: null, Icon: Icons.Msg, color: "bg-slate-500/20 text-slate-400" },
];

const checkIns = [
    { name: "Liam Wilson", time: "Submitted 2h ago" },
    { name: "Emma Watson", time: "Submitted 5h ago" },
];

const topPrograms = [
    { name: "Summer Shred 2.0", users: 45 },
    { name: "Foundational Strength", users: 22 },
];

const statCards = [
    { label: "Total Clients", value: "142", change: "+12%", Icon: Icons.Users, positive: true },
    { label: "Active", value: "98", change: "+4%", Icon: Icons.Bolt, positive: true },
    { label: "Programs", value: "24", change: "Stable", Icon: Icons.Barbell, positive: null },
    { label: "Goal Success", value: "87%", change: "+2.4%", Icon: Icons.Trophy, positive: true },
];

// ── Avatar placeholder ────────────────────────────────────────────────────────
function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
    const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);
    const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-10 h-10 text-sm" };
    const hues = [220, 250, 200, 270, 180];
    const hue = hues[name.charCodeAt(0) % hues.length];
    return (
        <div
            className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
            style={{ background: `hsl(${hue},40%,38%)` }}
        >
            {initials}
        </div>
    );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function Bar({ value, color }: { value: number; color: string }) {
    return (
        <div className="flex items-center gap-2 min-w-[80px]">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
            </div>
            <span className="text-xs text-white/60 w-8 text-right">{value}%</span>
        </div>
    );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, change, Icon, positive }: typeof statCards[0]) {
    return (
        <div className="bg-[#1A2210] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 hover:border-[#B5FF4D]/20 transition-colors">
            <div className="flex items-start justify-between">
                <p className="text-xs text-white/40 uppercase tracking-widest font-medium">{label}</p>
                <div className="w-9 h-9 rounded-xl bg-[#B5FF4D]/10 flex items-center justify-center text-[#B5FF4D]">
                    <Icon />
                </div>
            </div>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-white tracking-tight">{value}</span>
                <span className={`text-xs font-semibold pb-1 ${positive === true ? "text-[#B5FF4D]" : positive === false ? "text-red-400" : "text-white/40"}`}>
                    {change}
                </span>
            </div>
        </div>
    );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function CoachDashboard() {
    return (
        <div className="space-y-5 animate-fade-in">
            {/* Stat cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                {statCards.map((c) => <StatCard key={c.label} {...c} />)}
            </div>

            {/* Middle row: Client Overview + Activity Feed */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
                {/* Client Overview */}
                <div className="bg-[#1A2210] border border-white/5 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-start justify-between mb-4 gap-3">
                        <div>
                            <h2 className="font-bold text-white text-base">Client Overview</h2>
                            <p className="text-xs text-white/40 mt-0.5">Monitor daily progress and engagement</p>
                        </div>
                        <button className="flex-shrink-0 flex items-center gap-2 bg-[#B5FF4D] hover:bg-[#c8ff6e] text-[#0F1A06] font-bold text-xs px-4 py-2 rounded-xl transition-colors">
                            <Icons.UserPlus />
                            <span>Invite</span>
                        </button>
                    </div>

                    {/* Table header */}
                    <div className="hidden sm:grid grid-cols-[1fr_100px_140px_100px] gap-2 px-2 mb-2">
                        {["CLIENT", "STATUS", "PROGRAM", "COMPLIANCE"].map((h) => (
                            <span key={h} className="text-[10px] text-white/30 uppercase tracking-widest font-medium">{h}</span>
                        ))}
                    </div>

                    <div className="space-y-2">
                        {clients.map((c) => (
                            <div
                                key={c.name}
                                className="grid grid-cols-1 sm:grid-cols-[1fr_100px_140px_100px] gap-2 items-center bg-white/3 hover:bg-white/6 rounded-xl px-2 py-3 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Avatar name={c.name} size="md" />
                                    <span className="font-semibold text-sm text-white">{c.name}</span>
                                </div>
                                <div>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${c.statusColor}`}>
                                        {c.status}
                                    </span>
                                </div>
                                <span className="text-sm text-white/60 hidden sm:block">{c.program}</span>
                                <div className="sm:block">
                                    <Bar value={c.compliance} color={c.barColor} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-[#1A2210] border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col">
                    <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-[#B5FF4D]/10 flex items-center justify-center text-[#B5FF4D] flex-shrink-0">
                                <Icons.Clock />
                            </div>
                            <h2 className="font-bold text-white text-base">Activity Feed</h2>
                        </div>

                        <div className="space-y-4">
                            {feed.map((item, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${item.color}`}>
                                        <item.Icon />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm text-white/80 leading-snug">
                                            <span className="font-semibold text-white">{item.user}</span>{" "}
                                            {item.action}
                                        </p>
                                        <p className="text-[11px] text-[#B5FF4D]/60 mt-0.5">{item.time}</p>
                                        {item.note && (
                                            <p className="mt-1.5 text-xs text-white/40 bg-white/5 rounded-lg px-3 py-2 border border-white/5 italic">
                                                {item.note}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="mt-4 w-full text-center text-xs text-white/30 hover:text-[#B5FF4D] transition-colors pt-3 border-t border-white/5">
                        View All Activity
                    </button>
                </div>
            </div>

            {/* Bottom row: Check-ins + Top Programs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Check-in Requests */}
                <div className="bg-[#1A2210] border border-white/5 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-[#B5FF4D]/10 flex items-center justify-center text-[#B5FF4D]">
                            <Icons.Check />
                        </div>
                        <h2 className="font-bold text-white text-base">Check-in Requests</h2>
                    </div>
                    <div className="space-y-3">
                        {checkIns.map((ci) => (
                            <div key={ci.name} className="flex items-center gap-3 bg-white/3 rounded-xl px-3 py-3">
                                <Avatar name={ci.name} size="md" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{ci.name}</p>
                                    <p className="text-[11px] text-white/40">{ci.time}</p>
                                </div>
                                <button className="text-[10px] font-bold bg-[#B5FF4D] text-[#0F1A06] px-3 py-1.5 rounded-lg hover:bg-[#c8ff6e] transition-colors flex-shrink-0">
                                    REVIEW
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Programs */}
                <div className="bg-[#1A2210] border border-white/5 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-[#B5FF4D]/10 flex items-center justify-center text-[#B5FF4D]">
                            <Icons.Trophy />
                        </div>
                        <h2 className="font-bold text-white text-base">Top Programs</h2>
                    </div>
                    <div className="space-y-4">
                        {topPrograms.map((p, i) => (
                            <div key={p.name}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-white/30 w-5">{String(i + 1).padStart(2, "0")}</span>
                                        <span className="text-sm font-bold text-white">{p.name}</span>
                                    </div>
                                    <span className="text-xs text-white/40">{p.users} users</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden ml-7">
                                    <div
                                        className="h-full bg-[#B5FF4D] rounded-full transition-all"
                                        style={{ width: `${(p.users / 50) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}