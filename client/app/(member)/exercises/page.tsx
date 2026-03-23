'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
    fetchAllExerciseDB,
    buildNameMap,
    findMatch,
    type ExerciseDBItem,
} from '@/lib/exerciseDbMap';

// ── Types ──────────────────────────────────────────────────────────
interface MuscleInfo {
    id: number;
    name: string;
    name_en: string;
    is_front: boolean;
}

interface ExerciseImage {
    id: number;
    image: string;
    is_main: boolean;
}

interface ExerciseInfo {
    id: number;
    category: { id: number; name: string };
    muscles: { id: number; name_en: string }[];
    muscles_secondary: { id: number; name_en: string }[];
    equipment: { id: number; name: string }[];
    images: ExerciseImage[];
    translations: { name: string; description: string; language: number }[];
}

interface Category {
    id: number;
    name: string;
}

interface WgerListResponse<T> {
    count: number;
    next: string | null;
    results: T[];
}

// ── Proxy fetch ────────────────────────────────────────────────────
async function proxyFetch<T>(path: string): Promise<T> {
    const res = await fetch(`/api/wger?path=${encodeURIComponent(path)}`);
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
}

// ── Helpers ────────────────────────────────────────────────────────
function getEnglishName(ex: ExerciseInfo): string {
    return ex.translations?.find(t => t.language === 2)?.name || 'Unnamed Exercise';
}

function getEnglishDescription(ex: ExerciseInfo): string {
    const raw = ex.translations?.find(t => t.language === 2)?.description || '';
    return raw.replace(/<[^>]*>/g, '').trim();
}

function getWgerImage(ex: ExerciseInfo): string | null {
    if (!ex.images?.length) return null;
    return (ex.images.find(i => i.is_main) || ex.images[0])?.image || null;
}

// ── Theme colors matching NutriSnap ───────────────────────────────
// Background: #0f1117  Cards: #1a1d27  Border: #2a2d3a  Accent: #a3e635 (lime)
const THEME = {
    bg: '#0f1117',
    card: '#1a1d27',
    cardHover: '#1e2130',
    border: '#2a2d3a',
    borderHover: '#3a3d4a',
    text: '#ffffff',
    textMuted: '#6b7280',
    textDim: '#9ca3af',
    accent: '#a3e635',
    accentDim: 'rgba(163,230,53,0.15)',
};

// Category badge colors matching the screenshot style
const CAT_BADGE: Record<string, { bg: string; text: string; border: string }> = {
    Chest: { bg: 'rgba(59,130,246,0.2)', text: '#93c5fd', border: 'rgba(59,130,246,0.35)' },
    Back: { bg: 'rgba(16,185,129,0.2)', text: '#6ee7b7', border: 'rgba(16,185,129,0.35)' },
    Shoulders: { bg: 'rgba(99,102,241,0.2)', text: '#c4b5fd', border: 'rgba(99,102,241,0.35)' },
    Arms: { bg: 'rgba(168,85,247,0.2)', text: '#d8b4fe', border: 'rgba(168,85,247,0.35)' },
    Legs: { bg: 'rgba(234,179,8,0.2)', text: '#fde047', border: 'rgba(234,179,8,0.35)' },
    Abs: { bg: 'rgba(239,68,68,0.2)', text: '#fca5a5', border: 'rgba(239,68,68,0.35)' },
    Calves: { bg: 'rgba(6,182,212,0.2)', text: '#67e8f9', border: 'rgba(6,182,212,0.35)' },
    Cardio: { bg: 'rgba(249,115,22,0.2)', text: '#fdba74', border: 'rgba(249,115,22,0.35)' },
};
const DEFAULT_BADGE = { bg: 'rgba(148,163,184,0.15)', text: '#94a3b8', border: 'rgba(148,163,184,0.25)' };
const catBadge = (name: string) => CAT_BADGE[name] || DEFAULT_BADGE;

// ── Smart Image ────────────────────────────────────────────────────
function ExerciseImage({
    ex, gifUrl, muscleMap, size = 'card',
}: {
    ex: ExerciseInfo;
    gifUrl: string | null;
    muscleMap: Record<number, MuscleInfo>;
    size?: 'card' | 'modal';
}) {
    const wgerSrc = getWgerImage(ex);
    const chain = useRef<string[]>([]);

    const buildChain = useCallback(() => {
        chain.current = [
            `/exercises/${ex.id}.jpg`,
            `/exercises/${ex.id}.jpeg`,
            `/exercises/${ex.id}.png`,
            `/exercises/${ex.id}.webp`,
            ...(gifUrl ? [gifUrl] : []),
            ...(wgerSrc ? [wgerSrc] : []),
        ];
    }, [ex.id, gifUrl, wgerSrc]);

    const [idx, setIdx] = useState(0);
    const [failed, setFailed] = useState(false);

    useEffect(() => { buildChain(); setIdx(0); setFailed(false); }, [gifUrl, buildChain]);

    const src = chain.current[idx] ?? null;
    const isGif = src?.endsWith('.gif');

    if (!failed && src) {
        return (
            <img
                src={src}
                alt={getEnglishName(ex)}
                onError={() => {
                    if (idx + 1 < chain.current.length) setIdx(idx + 1);
                    else setFailed(true);
                }}
                style={{
                    width: '100%', height: '100%',
                    objectFit: isGif ? 'cover' : 'contain',
                    padding: isGif ? 0 : size === 'modal' ? 32 : 20,
                }}
            />
        );
    }

    // Muscle diagram fallback
    if (ex.muscles?.length > 0) {
        const BASE = 'https://wger.de/static/images/muscles';
        const frontMuscles = ex.muscles.filter(m => muscleMap[m.id]?.is_front !== false);
        const h = size === 'modal' ? 220 : 140;
        const w = size === 'modal' ? 100 : 65;
        return (
            <div style={{ position: 'relative', width: w, height: h }}>
                <img src={`${BASE}/muscular_system_front.svg`} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                {frontMuscles.map(m => (
                    <img key={m.id} src={`${BASE}/main/muscle-${m.id}.svg`} alt=""
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                ))}
            </div>
        );
    }

    return (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    );
}

// ── Muscle Diagram ─────────────────────────────────────────────────
function MuscleDiagram({ muscles, musclesSecondary, muscleMap }: {
    muscles: { id: number }[];
    musclesSecondary: { id: number }[];
    muscleMap: Record<number, MuscleInfo>;
}) {
    const BASE = 'https://wger.de/static/images/muscles';
    const pFront = muscles.filter(m => muscleMap[m.id]?.is_front !== false);
    const pBack = muscles.filter(m => muscleMap[m.id]?.is_front === false);
    const sFront = musclesSecondary.filter(m => muscleMap[m.id]?.is_front !== false);
    const sBack = musclesSecondary.filter(m => muscleMap[m.id]?.is_front === false);

    const side = (label: string, base: string, sec: { id: number }[], pri: { id: number }[]) => (
        <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
            <div style={{ position: 'relative', width: '100%', maxWidth: 130, margin: '0 auto', aspectRatio: '0.45' }}>
                <img src={base} alt={label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                {sec.map(m => <img key={`s${m.id}`} src={`${BASE}/secondary/muscle-${m.id}.svg`} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.6 }} />)}
                {pri.map(m => <img key={`p${m.id}`} src={`${BASE}/main/muscle-${m.id}.svg`} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />)}
            </div>
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                {side('Front', `${BASE}/muscular_system_front.svg`, sFront, pFront)}
                {side('Back', `${BASE}/muscular_system_back.svg`, sBack, pBack)}
            </div>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 16 }}>
                {[{ color: '#ef4444', label: 'Primary' }, { color: '#f97316', label: 'Secondary', op: 0.6 }].map(({ color, label, op }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: color, opacity: op ?? 1 }} />
                        <span style={{ fontSize: 12, color: THEME.textMuted }}>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Skeleton ───────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 16, overflow: 'hidden', animation: 'pulse 1.8s ease-in-out infinite' }}>
            <div style={{ height: 220, background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ padding: '16px 18px 20px' }}>
                <div style={{ height: 15, width: '65%', background: 'rgba(255,255,255,0.07)', borderRadius: 6, marginBottom: 10 }} />
                <div style={{ height: 12, width: '40%', background: 'rgba(255,255,255,0.04)', borderRadius: 6 }} />
            </div>
        </div>
    );
}

// ── Exercise Card ──────────────────────────────────────────────────
function ExerciseCard({ ex, gifUrl, muscleMap, onClick }: {
    ex: ExerciseInfo;
    gifUrl: string | null;
    muscleMap: Record<number, MuscleInfo>;
    onClick: () => void;
}) {
    const [hovered, setHovered] = useState(false);
    const name = getEnglishName(ex);
    const cat = ex.category?.name || '';
    const badge = catBadge(cat);
    const equipment = ex.equipment?.map(e => e.name).join(', ') || 'No equipment';
    const muscles = ex.muscles?.map(m => m.name_en).filter(Boolean).join(', ');

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? THEME.cardHover : THEME.card,
                border: `1px solid ${hovered ? THEME.borderHover : THEME.border}`,
                borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                transform: hovered ? 'translateY(-3px)' : 'none',
                boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
                transition: 'all 0.2s ease',
            }}
        >
            {/* Image */}
            <div style={{
                height: 220, position: 'relative', overflow: 'hidden',
                background: 'rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <ExerciseImage ex={ex} gifUrl={gifUrl} muscleMap={muscleMap} size="card" />

                {/* Category badge */}
                {cat && (
                    <span style={{
                        position: 'absolute', top: 12, left: 12,
                        background: badge.bg, color: badge.text,
                        border: `1px solid ${badge.border}`,
                        borderRadius: 8, padding: '4px 10px',
                        fontSize: 12, fontWeight: 700,
                        fontFamily: 'inherit', zIndex: 1,
                    }}>{cat}</span>
                )}

                {/* GIF badge */}
                {gifUrl && (
                    <span style={{
                        position: 'absolute', bottom: 10, right: 10,
                        background: 'rgba(163,230,53,0.15)',
                        color: THEME.accent,
                        border: '1px solid rgba(163,230,53,0.3)',
                        borderRadius: 6, padding: '2px 8px',
                        fontSize: 10, fontWeight: 800, letterSpacing: '0.05em',
                        zIndex: 1,
                    }}>GIF</span>
                )}
            </div>

            {/* Info */}
            <div style={{ padding: '16px 18px 20px' }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: THEME.text, marginBottom: 4, lineHeight: 1.3 }}>
                    {name}
                </div>
                <div style={{ fontSize: 13, color: THEME.textMuted, marginBottom: muscles ? 8 : 0 }}>
                    {equipment}
                </div>
                {muscles && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: badge.text, flexShrink: 0, marginTop: 4 }} />
                        <div style={{ fontSize: 12, color: badge.text, opacity: 0.9, lineHeight: 1.4 }}>
                            {muscles}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Modal ──────────────────────────────────────────────────────────
function ExerciseModal({ ex, gifUrl, dbItem, muscleMap, onClose }: {
    ex: ExerciseInfo;
    gifUrl: string | null;
    dbItem: ExerciseDBItem | null;
    muscleMap: Record<number, MuscleInfo>;
    onClose: () => void;
}) {
    const name = getEnglishName(ex);
    const description = getEnglishDescription(ex);
    const cat = ex.category?.name || '';
    const badge = catBadge(cat);
    const hasMuscles = (ex.muscles?.length || 0) + (ex.muscles_secondary?.length || 0) > 0;
    const instructions = dbItem?.instructions || [];

    useEffect(() => {
        const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', fn);
        document.body.style.overflow = 'hidden';
        return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
    }, [onClose]);

    return (
        <div onClick={onClose} style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px', animation: 'fadeIn 0.2s ease',
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                background: THEME.card,
                border: `1px solid ${THEME.border}`,
                borderRadius: 20, width: '100%', maxWidth: 720,
                maxHeight: '92vh', overflowY: 'auto',
                boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
                animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                display: 'flex', flexDirection: 'column',
            }}>

                {/* ── Top: GIF + Info side by side on desktop ── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.2fr)',
                    gap: 0,
                }}>
                    {/* Left: image/gif */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '20px 0 0 0',
                        minHeight: 320,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', overflow: 'hidden',
                        borderRight: `1px solid ${THEME.border}`,
                    }}>
                        <ExerciseImage ex={ex} gifUrl={gifUrl} muscleMap={muscleMap} size="modal" />
                        {gifUrl && (
                            <span style={{
                                position: 'absolute', bottom: 12, right: 12,
                                background: 'rgba(163,230,53,0.15)', color: THEME.accent,
                                border: '1px solid rgba(163,230,53,0.3)',
                                borderRadius: 6, padding: '3px 9px',
                                fontSize: 11, fontWeight: 800, letterSpacing: '0.05em',
                            }}>LIVE GIF</span>
                        )}
                    </div>

                    {/* Right: title + meta */}
                    <div style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Close */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            {cat && (
                                <span style={{
                                    background: badge.bg, color: badge.text,
                                    border: `1px solid ${badge.border}`,
                                    borderRadius: 8, padding: '5px 12px',
                                    fontSize: 12, fontWeight: 700,
                                }}>{cat}</span>
                            )}
                            <button onClick={onClose} style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: `1px solid ${THEME.border}`,
                                borderRadius: 8, width: 34, height: 34,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: THEME.textMuted, fontSize: 16,
                                transition: 'all 0.15s', flexShrink: 0,
                            }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = THEME.textMuted; }}
                            >✕</button>
                        </div>

                        {/* Name */}
                        <h2 style={{ fontSize: 26, fontWeight: 800, color: THEME.text, lineHeight: 1.2, margin: 0 }}>
                            {name}
                        </h2>

                        {/* Meta pills */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { icon: '🏋️', label: 'Equipment', value: ex.equipment?.map(e => e.name).join(', ') || 'None' },
                                { icon: '💪', label: 'Primary', value: ex.muscles?.map(m => m.name_en).join(', ') || 'N/A' },
                                { icon: '🔸', label: 'Secondary', value: ex.muscles_secondary?.map(m => m.name_en).join(', ') || 'None' },
                            ].map(({ icon, label, value }) => (
                                <div key={label} style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${THEME.border}`,
                                    borderRadius: 10, padding: '10px 14px',
                                    display: 'flex', gap: 10, alignItems: 'flex-start',
                                }}>
                                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                                    <div>
                                        <div style={{ fontSize: 10, color: THEME.textMuted, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                                        <div style={{ fontSize: 13, color: THEME.textDim, fontWeight: 500, lineHeight: 1.4 }}>{value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Bottom section ── */}
                <div style={{ padding: '0 28px 28px', borderTop: `1px solid ${THEME.border}`, display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 24 }}>

                    {/* Muscle diagram */}
                    {hasMuscles && (
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${THEME.border}`, borderRadius: 14, padding: '20px 16px' }}>
                            <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16 }}>
                                Muscle Map
                            </div>
                            <MuscleDiagram
                                muscles={ex.muscles || []}
                                musclesSecondary={ex.muscles_secondary || []}
                                muscleMap={muscleMap}
                            />
                        </div>
                    )}

                    {/* Instructions from ExerciseDB */}
                    {instructions.length > 0 && (
                        <div>
                            <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>
                                How to perform
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {instructions.map((step, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                        <div style={{
                                            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                                            background: THEME.accentDim,
                                            border: `1px solid rgba(163,230,53,0.25)`,
                                            color: THEME.accent,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 11, fontWeight: 800,
                                        }}>{i + 1}</div>
                                        <div style={{ fontSize: 14, color: THEME.textDim, lineHeight: 1.7, paddingTop: 3 }}>{step}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* wger description */}
                    {description && (
                        <div>
                            <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
                                About this exercise
                            </div>
                            <div style={{ fontSize: 14, color: THEME.textMuted, lineHeight: 1.75 }}>{description}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function ExerciseBrowserPage() {
    const [exercises, setExercises] = useState<ExerciseInfo[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [muscleMap, setMuscleMap] = useState<Record<number, MuscleInfo>>({});
    const [gifMap, setGifMap] = useState<Map<string, ExerciseDBItem>>(new Map());
    const [dbLoading, setDbLoading] = useState(true);
    const [selectedCat, setSelectedCat] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selected, setSelected] = useState<ExerciseInfo | null>(null);
    const offsetRef = useRef(0);
    const LIMIT = 20;

    useEffect(() => {
        fetchAllExerciseDB()
            .then(items => { setGifMap(buildNameMap(items)); setDbLoading(false); })
            .catch(() => setDbLoading(false));
    }, []);

    useEffect(() => {
        proxyFetch<WgerListResponse<MuscleInfo>>('/muscle/?format=json')
            .then(d => { const m: Record<number, MuscleInfo> = {}; d.results.forEach(x => { m[x.id] = x; }); setMuscleMap(m); })
            .catch(console.error);
        proxyFetch<WgerListResponse<Category>>('/exercisecategory/?format=json')
            .then(d => setCategories(d.results))
            .catch(console.error);
    }, []);

    const loadExercises = useCallback(async (reset: boolean) => {
        const off = reset ? 0 : offsetRef.current;
        if (reset) { setLoading(true); setExercises([]); } else setLoadingMore(true);
        try {
            let path = `/exerciseinfo/?format=json&language=2&limit=${LIMIT}&offset=${off}`;
            if (selectedCat) path += `&category=${selectedCat}`;
            const data = await proxyFetch<WgerListResponse<ExerciseInfo>>(path);
            setExercises(prev => reset ? data.results : [...prev, ...data.results]);
            offsetRef.current = off + LIMIT;
            setHasMore(!!data.next);
        } catch (err) { console.error(err); }
        finally { setLoading(false); setLoadingMore(false); }
    }, [selectedCat]);

    useEffect(() => { offsetRef.current = 0; loadExercises(true); }, [selectedCat]); // eslint-disable-line

    const filtered = search
        ? exercises.filter(ex => getEnglishName(ex).toLowerCase().includes(search.toLowerCase()))
        : exercises;

    const getGifUrl = (ex: ExerciseInfo) => gifMap.size > 0 ? findMatch(getEnglishName(ex), gifMap)?.gifUrl || null : null;
    const getDbItem = (ex: ExerciseInfo) => gifMap.size > 0 ? findMatch(getEnglishName(ex), gifMap) || null : null;

    return (
        <>
            <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        @keyframes pulse   { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes fadeIn  { from{opacity:0}to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1} }
        @keyframes cardIn  { from{transform:translateY(10px);opacity:0}to{transform:none;opacity:1} }
        .card-anim { animation: cardIn 0.28s ease both; }
        input::placeholder { color: #4b5563; }

        /* Responsive modal */
        @media (max-width: 600px) {
          .modal-grid { grid-template-columns: 1fr !important; }
          .modal-img  { border-radius: 20px 20px 0 0 !important; border-right: none !important; border-bottom: 1px solid #2a2d3a !important; min-height: 240px !important; }
        }
      `}</style>

            <div style={{ minHeight: '100vh', background: THEME.bg, color: THEME.text }}>

                {/* ── Header ── */}
                <div style={{ padding: '28px 28px 0', maxWidth: 1400, margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
                        <h1 style={{ fontSize: 32, fontWeight: 800, color: THEME.text, letterSpacing: '-0.02em' }}>
                            Exercise Library
                        </h1>
                        <span style={{ fontSize: 12, color: '#374151', fontWeight: 600, letterSpacing: '0.05em' }}>
                            WGER + EXERCISEDB
                        </span>
                        {dbLoading ? (
                            <span style={{ fontSize: 12, color: THEME.accent, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.accent, display: 'inline-block', animation: 'pulse 1s infinite' }} />
                                Loading GIFs...
                            </span>
                        ) : gifMap.size > 0 ? (
                            <span style={{ fontSize: 12, color: THEME.accent, fontWeight: 600 }}>✓ {gifMap.size} GIFs loaded</span>
                        ) : null}
                    </div>

                    {/* Search + filters */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
                        {/* Search */}
                        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 340 }}>
                            <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2.5">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text" placeholder="Search exercises..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                style={{
                                    width: '100%', background: THEME.card,
                                    border: `1px solid ${THEME.border}`,
                                    borderRadius: 10, outline: 'none',
                                    padding: '10px 14px 10px 36px',
                                    color: THEME.text, fontSize: 14,
                                    transition: 'border 0.2s',
                                }}
                                onFocus={e => (e.target.style.border = `1px solid rgba(163,230,53,0.4)`)}
                                onBlur={e => (e.target.style.border = `1px solid ${THEME.border}`)}
                            />
                        </div>

                        {/* Category pills */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {[{ id: null as number | null, name: 'All' }, ...categories].map(cat => {
                                const active = selectedCat === cat.id;
                                const b = cat.id ? catBadge(cat.name) : { bg: THEME.accentDim, text: THEME.accent, border: 'rgba(163,230,53,0.3)' };
                                return (
                                    <button key={cat.id ?? 'all'} onClick={() => setSelectedCat(cat.id ?? null)} style={{
                                        padding: '8px 16px', borderRadius: 10,
                                        border: `1px solid ${active ? b.border : THEME.border}`,
                                        background: active ? b.bg : THEME.card,
                                        color: active ? b.text : THEME.textMuted,
                                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                        transition: 'all 0.15s',
                                    }}
                                        onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.borderColor = THEME.borderHover; (e.currentTarget as HTMLElement).style.color = THEME.textDim; } }}
                                        onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.borderColor = THEME.border; (e.currentTarget as HTMLElement).style.color = THEME.textMuted; } }}
                                    >{cat.name}</button>
                                );
                            })}
                        </div>
                    </div>

                    {!loading && (
                        <div style={{ fontSize: 13, color: '#374151', marginBottom: 20, fontWeight: 500 }}>
                            {search ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"` : `${exercises.length} exercises loaded`}
                        </div>
                    )}
                </div>

                {/* ── Grid ── */}
                <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px 60px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {loading
                            ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
                            : filtered.map((ex, i) => (
                                <div key={ex.id} className="card-anim" style={{ animationDelay: `${(i % LIMIT) * 20}ms` }}>
                                    <ExerciseCard ex={ex} gifUrl={getGifUrl(ex)} muscleMap={muscleMap} onClick={() => setSelected(ex)} />
                                </div>
                            ))
                        }
                    </div>

                    {!loading && hasMore && !search && (
                        <div style={{ textAlign: 'center', marginTop: 40 }}>
                            <button
                                onClick={() => loadExercises(false)} disabled={loadingMore}
                                style={{
                                    padding: '12px 36px', background: THEME.card,
                                    border: `1px solid ${THEME.border}`,
                                    borderRadius: 10, color: THEME.textDim,
                                    fontSize: 14, fontWeight: 600,
                                    cursor: loadingMore ? 'not-allowed' : 'pointer',
                                    opacity: loadingMore ? 0.5 : 1, transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { if (!loadingMore) { (e.currentTarget as HTMLElement).style.borderColor = THEME.borderHover; (e.currentTarget as HTMLElement).style.color = THEME.text; } }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = THEME.border; (e.currentTarget as HTMLElement).style.color = THEME.textDim; }}
                            >{loadingMore ? 'Loading...' : 'Load more exercises'}</button>
                        </div>
                    )}

                    {!loading && filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🏋️</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: THEME.textMuted, marginBottom: 8 }}>No exercises found</div>
                            <div style={{ fontSize: 14, color: '#374151' }}>Try a different search or category</div>
                        </div>
                    )}
                </div>
            </div>

            {selected && (
                <ExerciseModal
                    ex={selected}
                    gifUrl={getGifUrl(selected)}
                    dbItem={getDbItem(selected)}
                    muscleMap={muscleMap}
                    onClose={() => setSelected(null)}
                />
            )}
        </>
    );
}