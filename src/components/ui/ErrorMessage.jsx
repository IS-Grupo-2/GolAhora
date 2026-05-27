// src/components/ui/ErrorMessage.jsx
import { useEffect } from 'react';

export default function ErrorMessage({ message }) {
    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', margin: '1rem 0', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', border: '1px solid #f87171' }}>
            <i data-lucide="alert-triangle" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontWeight: '500' }}>{message}</p>
        </div>
    );
}