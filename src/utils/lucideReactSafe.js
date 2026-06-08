function toPascalCase(name) {
    return String(name || '')
        .split('-')
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

function setAttributes(element, attrs = {}) {
    Object.entries(attrs).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        element.setAttribute(key, String(value));
    });
}

function appendIconNode(parent, node) {
    if (!Array.isArray(node)) return;

    const [tag, attrs, children] = node;
    const child = document.createElementNS('http://www.w3.org/2000/svg', tag);
    setAttributes(child, attrs);

    if (Array.isArray(children)) {
        children.forEach(grandChild => appendIconNode(child, grandChild));
    }

    parent.appendChild(child);
}

function renderIconInsideElement(element, iconNode, attrs = {}) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    setAttributes(svg, {
        xmlns: 'http://www.w3.org/2000/svg',
        width: element.style.width || attrs.width || 24,
        height: element.style.height || attrs.height || 24,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        ...attrs,
    });

    iconNode.forEach(node => appendIconNode(svg, node));
    element.replaceChildren(svg);
    element.dataset.lucideRendered = element.dataset.lucide;
}

function hasRenderedIcon(element, iconName) {
    return element.dataset.lucideRendered === iconName && Boolean(element.querySelector('svg'));
}

function installLucideRefreshObserver(lucide) {
    if (typeof document === 'undefined' || window.__lucideReactSafeObserver) return;

    const observe = () => {
        if (!document.body || window.__lucideReactSafeObserver) return;

        let frameId = null;
        const scheduleRefresh = () => {
            if (frameId !== null) return;
            frameId = window.requestAnimationFrame(() => {
                frameId = null;
                lucide.createIcons();
            });
        };

        const observer = new MutationObserver((mutations) => {
            const shouldRefresh = mutations.some(mutation =>
                mutation.type === 'childList' ||
                mutation.attributeName === 'data-lucide'
            );
            if (shouldRefresh) scheduleRefresh();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-lucide'],
        });

        window.__lucideReactSafeObserver = observer;
    };

    if (document.body) {
        observe();
    } else {
        document.addEventListener('DOMContentLoaded', observe, { once: true });
    }
}

export function patchLucideForReact() {
    if (typeof window === 'undefined') return;

    if (!window.lucide) {
        window.__lucideReactSafeRetries = window.__lucideReactSafeRetries || 0;
        if (window.__lucideReactSafeRetries < 80) {
            window.__lucideReactSafeRetries += 1;
            window.setTimeout(patchLucideForReact, 50);
        }

        if (window.__lucideReactSafeWaiting) return;

        let pendingLucide;
        Object.defineProperty(window, 'lucide', {
            configurable: true,
            get() {
                return pendingLucide;
            },
            set(value) {
                pendingLucide = value;
                delete window.lucide;
                window.lucide = value;
                patchLucideForReact();
            },
        });
        window.__lucideReactSafeWaiting = true;
        return;
    }

    if (window.lucide.__reactSafePatch) return;
    window.__lucideReactSafeRetries = 0;

    const lucide = window.lucide;
    const originalCreateIcons = typeof lucide.createIcons === 'function'
        ? lucide.createIcons.bind(lucide)
        : null;

    lucide.createIcons = (options = {}) => {
        const nameAttr = options.nameAttr || 'data-lucide';
        const attrs = options.attrs || {};
        const icons = options.icons || lucide.icons || {};

        if (!icons || typeof document === 'undefined') {
            return originalCreateIcons?.(options);
        }

        document.querySelectorAll(`[${nameAttr}]`).forEach(element => {
            const iconName = element.getAttribute(nameAttr);
            if (!iconName || hasRenderedIcon(element, iconName)) return;

            const iconNode = icons[toPascalCase(iconName)] || icons[iconName];
            if (!iconNode) return;

            renderIconInsideElement(element, iconNode, attrs);
        });
    };

    lucide.__reactSafePatch = true;
    installLucideRefreshObserver(lucide);
    lucide.createIcons();
}
