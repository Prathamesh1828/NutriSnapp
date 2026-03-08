"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { ChevronsLeftRight } from "lucide-react";

interface BeforeAfterSliderProps {
    beforeImage: string | StaticImageData;  // path/URL or static import
    afterImage: string | StaticImageData;   // path/URL or static import
    beforeLabel?: string;
    afterLabel?: string;
    beforeAlt?: string;
    afterAlt?: string;
}

export function BeforeAfterSlider({
    beforeImage,
    afterImage,
    beforeLabel = "CURRENT 14% BF",
    afterLabel = "PROJECTED 11% BF",
    beforeAlt = "Before",
    afterAlt = "After",
}: BeforeAfterSliderProps) {
    const [slider, setSlider] = useState(50);

    return (
        <div className="relative h-[420px] rounded-2xl overflow-hidden border border-white/10 cursor-ew-resize select-none">

            {/* ── AFTER image (bottom layer, full width) ── */}
            <div className="absolute inset-0">
                <Image
                    src={afterImage}
                    alt={afterAlt}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                />
                {/* dark overlay so label is readable */}
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* ── BEFORE image (top layer, clipped by slider %) ── */}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${slider}%` }}
            >
                <div className="relative w-full h-full" style={{ width: `${100 / (slider / 100)}%` }}>
                    <Image
                        src={beforeImage}
                        alt={beforeAlt}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/20" />
                </div>
            </div>

            {/* ── Divider line ── */}
            <div
                className="absolute inset-y-0 w-px bg-white/60 pointer-events-none"
                style={{ left: `${slider}%` }}
            />

            {/* ── Handle ── */}
            <div
                className="absolute inset-y-0 flex items-center pointer-events-none"
                style={{ left: `calc(${slider}% - 20px)` }}
            >
                <div className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-900 ring-2 ring-white/30">
                    <ChevronsLeftRight size={16} />
                </div>
            </div>

            {/* ── Labels ── */}
            <div className="absolute bottom-4 left-4 bg-[#0A0A0F]/80 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm pointer-events-none">
                {beforeLabel}
            </div>
            <div className="absolute bottom-4 right-4 bg-[#B8FF3C] text-[#0A0A0F] text-xs font-bold px-3 py-1.5 rounded-lg pointer-events-none">
                {afterLabel}
            </div>

            {/* ── "Before" tag top-left, "After" tag top-right ── */}
            <div className="absolute top-4 left-4 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                BEFORE
            </div>
            <div className="absolute top-4 right-4 bg-[#B8FF3C]/90 text-[#0A0A0F] text-[10px] font-bold px-2 py-1 rounded pointer-events-none">
                AFTER
            </div>

            {/* ── Invisible range input (interaction layer) ── */}
            <input
                type="range"
                min={0}
                max={100}
                value={slider}
                onChange={e => setSlider(+e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
            />
        </div>
    );
}