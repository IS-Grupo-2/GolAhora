// src/components/Can.jsx
import useRole from '../hooks/useRole';

export default function Can({ roles = [], children, fallback = null }) {
    const { can } = useRole();
    return can(...roles) ? <>{children}</> : fallback;
}
