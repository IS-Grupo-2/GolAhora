// src/components/ui/LoadingSpinner.jsx
import { useEffect } from 'react';

export default function LoadingSpinner({ message = 'Cargando datos...' }) {
    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: 'var(--text-muted, #6b7280)' }}>
            <style>
                {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
            </style>
            <i 
                data-lucide="loader-2" 
                style={{ width: '40px', height: '40px', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} 
            />
            <p style={{ margin: 0, fontSize: '1.1rem' }}>{message}</p>
        </div>
    );
}