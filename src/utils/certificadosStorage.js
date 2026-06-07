const DB_NAME = 'gol_ahora_certificados';
const DB_VERSION = 1;
const STORE_NAME = 'certificados';

function abrirDb() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error('El navegador no soporta almacenamiento de certificados.'));
            return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function guardarCertificadoLocal(id, contenido) {
    const db = await abrirDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        store.put({
            id,
            contenido,
            actualizadoEn: new Date().toISOString(),
        });

        tx.oncomplete = () => {
            db.close();
            resolve(true);
        };
        tx.onerror = () => {
            db.close();
            reject(tx.error);
        };
    });
}

export async function obtenerCertificadoLocal(id) {
    if (!id) return null;

    const db = await abrirDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
            db.close();
            resolve(request.result?.contenido || null);
        };
        request.onerror = () => {
            db.close();
            reject(request.error);
        };
    });
}
