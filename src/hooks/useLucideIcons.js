// src/hooks/useLucideIcons.js
import { useEffect } from 'react';

export default function useLucideIcons(deps = []) {
    useEffect(() => {
        const raf = requestAnimationFrame(() => {
            if (typeof window !== 'undefined' && window.lucide) {
                window.lucide.createIcons();
            }
        });
        return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}