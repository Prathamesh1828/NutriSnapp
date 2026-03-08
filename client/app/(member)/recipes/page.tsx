"use client";

import { useState, useMemo } from "react";
import {
    Search, SlidersHorizontal, ChevronRight, ChevronLeft,
    FlaskConical, CalendarDays, BarChart3, Shuffle,
    Flame, Clock, Star, BookOpen, Filter, X
} from "lucide-react";

type Mode = "bulk" | "cut";
type FilterTag = "High Protein" | "Under 30 mins" | "Low Carb" | "Vegan" | "High Calorie";

interface Recipe {
    id: number;
    name: string;
    image: string;
    kcal: number;
    protein: number;
    carbs: number;
    fats: number;
    time: number;
    rating: number;
    tags: string[];
    modes: Mode[];
}

// ── All recipes — each tagged with which modes they suit ─────────────────────
const ALL_RECIPES: Recipe[] = [
    { id: 1, name: "Grilled Salmon Power Bowl", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80", kcal: 650, protein: 45, carbs: 32, fats: 18, time: 25, rating: 4.8, tags: ["High Protein", "Under 30 mins"], modes: ["bulk", "cut"] },
    { id: 2, name: "Mediterranean Hummus Toast", image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400&q=80", kcal: 420, protein: 12, carbs: 48, fats: 22, time: 10, rating: 4.5, tags: ["Vegan", "Under 30 mins"], modes: ["cut"] },
    { id: 3, name: "Beef Broccoli Stir-fry", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80", kcal: 780, protein: 52, carbs: 65, fats: 14, time: 20, rating: 4.7, tags: ["High Protein", "High Calorie"], modes: ["bulk"] },
    { id: 4, name: "Blueberry Protein Cakes", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80", kcal: 550, protein: 38, carbs: 42, fats: 10, time: 30, rating: 4.6, tags: ["High Protein", "Under 30 mins"], modes: ["bulk", "cut"] },
    { id: 5, name: "Chicken Caesar Wrap", image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&q=80", kcal: 490, protein: 40, carbs: 35, fats: 16, time: 15, rating: 4.4, tags: ["High Protein", "Under 30 mins"], modes: ["cut"] },
    { id: 6, name: "Avocado Egg White Omelette", image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&q=80", kcal: 320, protein: 28, carbs: 8, fats: 20, time: 12, rating: 4.3, tags: ["Low Carb", "Under 30 mins"], modes: ["cut"] },
    { id: 7, name: "Quinoa Veggie Buddha Bowl", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80", kcal: 480, protein: 18, carbs: 60, fats: 14, time: 35, rating: 4.5, tags: ["Vegan", "Low Carb"], modes: ["cut"] },
    { id: 8, name: "Turkey & Sweet Potato Mash", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80", kcal: 620, protein: 48, carbs: 52, fats: 12, time: 40, rating: 4.6, tags: ["High Protein", "High Calorie"], modes: ["bulk"] },
    { id: 9, name: "Peanut Butter Oat Bars", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80", kcal: 720, protein: 30, carbs: 80, fats: 28, time: 20, rating: 4.4, tags: ["High Calorie", "Under 30 mins"], modes: ["bulk"] },
    { id: 10, name: "Greek Yogurt Parfait", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80", kcal: 310, protein: 24, carbs: 38, fats: 6, time: 5, rating: 4.5, tags: ["High Protein", "Under 30 mins"], modes: ["cut"] },
    { id: 11, name: "Mass Gainer Smoothie", image: "https://images.unsplash.com/photo-1553530666-ba11a90bb5ae?w=400&q=80", kcal: 860, protein: 55, carbs: 90, fats: 20, time: 5, rating: 4.7, tags: ["High Protein", "High Calorie", "Under 30 mins"], modes: ["bulk"] },
    { id: 12, name: "Tuna Lettuce Wraps", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80", kcal: 280, protein: 35, carbs: 8, fats: 12, time: 10, rating: 4.3, tags: ["Low Carb", "High Protein", "Under 30 mins"], modes: ["cut"] },
];

const FILTER_TAGS: FilterTag[] = ["High Protein", "Under 30 mins", "Low Carb", "Vegan", "High Calorie"];
const PAGE_SIZE_DEFAULT = 4;

const TOOLS = [
    { icon: FlaskConical, label: "Ingredient Lookup" },
    { icon: CalendarDays, label: "Meal Planner" },
    { icon: BarChart3, label: "Diet Analysis" },
    { icon: Shuffle, label: "Meal Randomizer" },
];

// ── Mode-specific copy ────────────────────────────────────────────────────────
const MODE_META = {
    bulk: { label: "Bulk Mode", accentBg: "bg-orange-500", accentText: "text-orange-400", shadow: "shadow-orange-500/20", desc: "High-calorie meals to fuel muscle growth" },
    cut: { label: "Cut Mode", accentBg: "bg-[#B8FF3C]", accentText: "text-[#B8FF3C]", shadow: "shadow-[#B8FF3C]/20", desc: "Lean, high-protein meals for fat loss" },
};

// ── Recipe card ───────────────────────────────────────────────────────────────
function RecipeCard({ recipe }: { recipe: Recipe }) {
    return (
        <div className="bg-[#13131A] border border-white/6 rounded-2xl overflow-hidden hover:border-[#B8FF3C]/30 hover:shadow-xl hover:shadow-black/40 transition-all group cursor-pointer">
            <div className="relative overflow-hidden aspect-[4/3]">
                <img src={recipe.image} alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/65 backdrop-blur-sm text-white text-xs font-black px-2.5 py-1 rounded-full">
                    <Flame size={10} className="text-[#B8FF3C]" /> {recipe.kcal} kcal
                </div>
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/65 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-full">
                    <Clock size={9} className="text-slate-400" /> {recipe.time}m
                </div>
            </div>
            <div className="p-3.5">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{recipe.name}</h3>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] text-slate-400 font-medium">{recipe.rating}</span>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                    {[
                        { val: `${recipe.protein}G`, label: "PROTEIN", color: "text-[#B8FF3C]" },
                        { val: `${recipe.carbs}G`, label: "CARBS", color: "text-orange-400" },
                        { val: `${recipe.fats}G`, label: "FATS", color: "text-yellow-400" },
                    ].map(({ val, label, color }) => (
                        <div key={label} className="bg-[#0A0A0F] rounded-xl py-2 text-center border border-white/5">
                            <div className={`text-xs font-black ${color}`}>{val}</div>
                            <div className="text-[9px] text-slate-600 uppercase tracking-wider font-bold mt-0.5">{label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function RecipesPage() {
    const [mode, setMode] = useState<Mode>("bulk");
    const [search, setSearch] = useState("");
    const [activeFilters, setActiveFilters] = useState<FilterTag[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [viewAll, setViewAll] = useState(false);

    const meta = MODE_META[mode];

    const toggleFilter = (tag: FilterTag) =>
        setActiveFilters(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

    // Filter by mode first, then search + tags
    const filtered = useMemo(() => {
        return ALL_RECIPES.filter(r => {
            const matchMode = r.modes.includes(mode);
            const matchSearch = search === "" || r.name.toLowerCase().includes(search.toLowerCase());
            const matchTags = activeFilters.length === 0 || activeFilters.every(f => r.tags.includes(f));
            return matchMode && matchSearch && matchTags;
        });
    }, [mode, search, activeFilters]);

    // Show 4 in default, all when viewAll
    const displayed = viewAll ? filtered : filtered.slice(0, PAGE_SIZE_DEFAULT);

    // Reset viewAll when mode/filters change
    const handleModeChange = (m: Mode) => { setMode(m); setViewAll(false); setActiveFilters([]); };
    const handleToggleFilter = (t: FilterTag) => { toggleFilter(t); setViewAll(false); };

    return (
        <div className="space-y-5 sm:space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white">Recipes &amp; Nutrition Tools</h1>
                    <p className={`text-xs mt-0.5 font-medium ${meta.accentText}`}>{meta.desc}</p>
                </div>
                {/* Desktop search */}
                <div className="hidden sm:flex items-center gap-2 bg-[#13131A] border border-white/8 rounded-xl px-3 py-2 w-56">
                    <Search size={14} className="text-slate-500 flex-shrink-0" />
                    <input value={search} onChange={e => { setSearch(e.target.value); setViewAll(true); }}
                        placeholder="Search recipes…"
                        className="bg-transparent text-white text-xs placeholder-slate-600 outline-none flex-1 min-w-0" />
                    {search && <button onClick={() => setSearch("")}><X size={12} className="text-slate-500 hover:text-white" /></button>}
                </div>
            </div>

            {/* Mobile search */}
            <div className="flex sm:hidden items-center gap-2 bg-[#13131A] border border-white/8 rounded-xl px-3 py-2.5">
                <Search size={14} className="text-slate-500 flex-shrink-0" />
                <input value={search} onChange={e => { setSearch(e.target.value); setViewAll(true); }}
                    placeholder="Search recipes…"
                    className="bg-transparent text-white text-sm placeholder-slate-600 outline-none flex-1" />
                {search && <button onClick={() => setSearch("")}><X size={14} className="text-slate-500" /></button>}
            </div>

            {/* Mode toggle */}
            <div className="flex justify-center">
                <div className="inline-flex bg-[#13131A] border border-white/8 rounded-2xl p-1 gap-1">
                    {(["bulk", "cut"] as Mode[]).map(m => {
                        const active = mode === m;
                        const mm = MODE_META[m];
                        return (
                            <button key={m} onClick={() => handleModeChange(m)}
                                className={`px-7 sm:px-12 py-2.5 rounded-xl text-sm font-black transition-all ${active ? `${mm.accentBg} ${m === "cut" ? "text-[#0A0A0F]" : "text-white"} shadow-lg ${mm.shadow}` : "text-slate-400 hover:text-white"
                                    }`}>
                                {mm.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Mode badge */}
            <div className={`flex items-center justify-center gap-2 text-xs font-bold ${meta.accentText}`}>
                <span className={`w-2 h-2 rounded-full ${meta.accentBg} animate-pulse`} />
                {mode === "bulk" ? `Showing high-calorie bulk meals · ${filtered.length} recipes` : `Showing lean cut meals · ${filtered.length} recipes`}
            </div>

            {/* Tool shortcuts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TOOLS.map(({ icon: Icon, label }) => (
                    <button key={label}
                        className="bg-[#13131A] border border-white/6 rounded-2xl p-4 flex flex-col items-center gap-2.5 hover:border-[#B8FF3C]/25 hover:bg-[#B8FF3C]/5 transition-all group">
                        <div className="w-10 h-10 bg-[#B8FF3C]/10 rounded-xl flex items-center justify-center group-hover:bg-[#B8FF3C]/20 transition-colors">
                            <Icon size={18} className="text-[#B8FF3C]" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-center leading-tight group-hover:text-white transition-colors">
                            {label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Recommended section */}
            <div>
                {/* Section header */}
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <h2 className="text-base font-black text-white">Recommended for your Goal</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Desktop filter chips */}
                        <div className="hidden sm:flex items-center gap-2 flex-wrap">
                            {FILTER_TAGS.map(tag => (
                                <button key={tag} onClick={() => handleToggleFilter(tag)}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${activeFilters.includes(tag)
                                        ? "border-[#B8FF3C] bg-[#B8FF3C]/15 text-[#B8FF3C]"
                                        : "border-white/10 text-slate-400 hover:border-white/25 hover:text-white"
                                        }`}>{tag}</button>
                            ))}
                        </div>
                        {/* Mobile filter toggle */}
                        <button onClick={() => setShowFilters(v => !v)}
                            className={`sm:hidden flex items-center gap-1.5 text-xs font-bold border px-3 py-1.5 rounded-full transition-colors ${activeFilters.length > 0 ? "border-[#B8FF3C] text-[#B8FF3C] bg-[#B8FF3C]/10" : "border-white/10 text-slate-400"
                                }`}>
                            <Filter size={12} /> Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
                        </button>
                        {/* View All / Show Less */}
                        {filtered.length > PAGE_SIZE_DEFAULT && (
                            <button onClick={() => setViewAll(v => !v)}
                                className="text-xs text-[#B8FF3C] font-bold flex items-center gap-1 hover:text-[#d4ff6e] transition-colors">
                                {viewAll ? (
                                    <><ChevronLeft size={13} /> Show Less</>
                                ) : (
                                    <>View All ({filtered.length}) <ChevronRight size={13} /></>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile filter chips dropdown */}
                {showFilters && (
                    <div className="sm:hidden flex flex-wrap gap-2 mb-3 p-3 bg-[#13131A] border border-white/6 rounded-xl">
                        {FILTER_TAGS.map(tag => (
                            <button key={tag} onClick={() => handleToggleFilter(tag)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${activeFilters.includes(tag)
                                    ? "border-[#B8FF3C] bg-[#B8FF3C]/15 text-[#B8FF3C]"
                                    : "border-white/10 text-slate-400"
                                    }`}>{tag}</button>
                        ))}
                        {activeFilters.length > 0 && (
                            <button onClick={() => setActiveFilters([])} className="text-xs text-red-400 font-bold px-3 py-1.5">Clear all</button>
                        )}
                    </div>
                )}

                {/* Active filters summary */}
                {activeFilters.length > 0 && (
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Active:</span>
                        {activeFilters.map(f => (
                            <span key={f} onClick={() => handleToggleFilter(f)}
                                className="flex items-center gap-1 text-[10px] text-[#B8FF3C] bg-[#B8FF3C]/10 border border-[#B8FF3C]/25 px-2 py-1 rounded-full cursor-pointer hover:bg-[#B8FF3C]/20 transition-colors font-bold">
                                {f} <X size={9} />
                            </span>
                        ))}
                        <button onClick={() => setActiveFilters([])} className="text-[10px] text-slate-500 hover:text-red-400 transition-colors font-bold">
                            Clear all
                        </button>
                    </div>
                )}

                {/* Recipe grid */}
                {displayed.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {displayed.map(r => <RecipeCard key={r.id} recipe={r} />)}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-[#13131A] border border-white/6 rounded-2xl">
                        <BookOpen size={32} className="text-slate-600 mb-3" />
                        <p className="text-white font-bold mb-1">No recipes match your filters</p>
                        <p className="text-slate-500 text-sm">Try removing some filters or switching modes.</p>
                        <div className="flex gap-2 mt-4">
                            {activeFilters.length > 0 && (
                                <button onClick={() => setActiveFilters([])}
                                    className="text-xs text-[#B8FF3C] font-bold border border-[#B8FF3C]/30 px-4 py-2 rounded-xl hover:bg-[#B8FF3C]/10 transition-colors">
                                    Clear filters
                                </button>
                            )}
                            <button onClick={() => handleModeChange(mode === "bulk" ? "cut" : "bulk")}
                                className="text-xs text-slate-400 font-bold border border-white/10 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors">
                                Switch to {mode === "bulk" ? "Cut" : "Bulk"} Mode
                            </button>
                        </div>
                    </div>
                )}

                {/* View all / show less — bottom button for mobile convenience */}
                {filtered.length > PAGE_SIZE_DEFAULT && (
                    <button onClick={() => setViewAll(v => !v)}
                        className="w-full mt-4 flex items-center justify-center gap-2 bg-[#13131A] border border-white/8 text-slate-400 text-sm font-bold py-3 rounded-xl hover:text-white hover:border-white/15 transition-all">
                        {viewAll ? <><ChevronLeft size={15} /> Show Less</> : <>View All {filtered.length} Recipes <ChevronRight size={15} /></>}
                    </button>
                )}
            </div>

            {/* Bottom stats bar */}
            <div className="bg-[#13131A] border border-white/6 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-6 sm:gap-10 flex-wrap">
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Recipes Available</div>
                        <div className="text-2xl font-black text-white">14,208</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Weekly Plan Progress</div>
                        <div className="text-2xl font-black text-[#B8FF3C]">82%</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Current Mode</div>
                        <div className={`text-2xl font-black capitalize ${meta.accentText}`}>{mode}</div>
                    </div>
                </div>
                <button className="flex items-center gap-2 bg-[#0A0A0F] border border-white/10 text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-white/5 transition-colors self-stretch sm:self-auto justify-center">
                    <SlidersHorizontal size={15} /> Advanced Filter
                </button>
            </div>
        </div>
    );
}