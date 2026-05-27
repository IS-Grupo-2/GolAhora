// src/components/ui/EmptyState.jsx
import { useEffect } from 'react';

export default function EmptyState({ message = 'No hay datos disponibles.', icon = 'inbox' }) {
    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', color: 'var(--text-muted, #6b7280)', textAlign: 'center' }}>
            <i data-lucide={icon} style={{ width: '48px', height: '48px', marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ fontSize: '1.125rem', margin: 0 }}>{message}</p>
        </div>
    );
}