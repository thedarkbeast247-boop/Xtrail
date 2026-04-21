type IconProps = {
className?: string;
};

// Dirt Bike / Motocross
export function DirtBikeIcon({ className = "h-5 w-5" }: IconProps) {
return ( <svg viewBox="0 0 24 24" fill="currentColor" className={className}> <circle cx="6" cy="18" r="2.2" /> <circle cx="18" cy="18" r="2.2" /> <path d="M7 18l3.5-6h3l2.5 3" /> <path d="M10 12l-2-2H6" /> <path d="M14 12l2-2h2" /> </svg>
);
}

// Dual Sport (slightly different stance)
export function DualSportIcon({ className = "h-5 w-5" }: IconProps) {
return ( <svg viewBox="0 0 24 24" fill="currentColor" className={className}> <circle cx="6" cy="18" r="2.2" /> <circle cx="18" cy="18" r="2.2" /> <path d="M8 18l3-5h4l2 3" /> <path d="M9 13l-2-3H5" /> <path d="M15 13l2-2h2" /> </svg>
);
}

// ATV (quad)
export function AtvIcon({ className = "h-5 w-5" }: IconProps) {
return ( <svg viewBox="0 0 24 24" fill="currentColor" className={className}> <circle cx="7" cy="18" r="2.3" /> <circle cx="17" cy="18" r="2.3" /> <rect x="8" y="10" width="8" height="4" rx="1.5" /> <path d="M9 10l-1-2M15 10l1-2" /> </svg>
);
}

// SXS / UTV
export function SxsIcon({ className = "h-5 w-5" }: IconProps) {
return ( <svg viewBox="0 0 24 24" fill="currentColor" className={className}> <circle cx="7" cy="18" r="2.3" /> <circle cx="17" cy="18" r="2.3" /> <path d="M4 16l2-5h8l3 2h3v3H4z" /> <rect x="9" y="11" width="4" height="3" rx="1" /> </svg>
);
}

// 4x4 Off-road vehicle
export function FourByFourIcon({ className = "h-5 w-5" }: IconProps) {
return ( <svg viewBox="0 0 24 24" fill="currentColor" className={className}> <circle cx="7" cy="18" r="2.3" /> <circle cx="17" cy="18" r="2.3" /> <path d="M3 16v-4l2-3h10l3 2h3v5H3z" /> <rect x="7" y="9" width="4" height="3" rx="1" /> </svg>
);
}

// SUV
export function SuvIcon({ className = "h-5 w-5" }: IconProps) {
return ( <svg viewBox="0 0 24 24" fill="currentColor" className={className}> <circle cx="7" cy="18" r="2.3" /> <circle cx="17" cy="18" r="2.3" /> <path d="M3 16v-3l2-3h8l3 2h3v4H3z" /> <rect x="8" y="10" width="5" height="3" rx="1" /> </svg>
);
}
