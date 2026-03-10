/**
 * LayerStorage - IndexedDB-based persistence for audio layers
 * 
 * Stores layer metadata and audio blobs in IndexedDB for persistence across page reloads.
 */

const DB_NAME = 'UnicornMusic';
const DB_VERSION = 1;
const STORE_NAME = 'layers';

class LayerStorage {
    constructor() {
        this.db = null;
        this.initPromise = null;
    }

    /**
     * Initialize the IndexedDB database
     */
    async init() {
        if (this.db) return this.db;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Failed to open IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('LayerStorage: IndexedDB initialized');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create layers object store if it doesn't exist
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                    console.log('LayerStorage: Created layers store');
                }
            };
        });

        return this.initPromise;
    }

    /**
     * Save a layer to IndexedDB
     * @param {Object} layer - Layer object with id, name, source, duration, muted, volume, blob, createdAt
     */
    async saveLayer(layer) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            // Store the essential data including the blob
            const layerData = {
                id: layer.id,
                name: layer.name,
                source: layer.source,
                duration: layer.duration,
                muted: layer.muted,
                volume: layer.volume,
                blob: layer.blob,
                createdAt: layer.createdAt
            };

            const request = store.put(layerData);

            request.onsuccess = () => {
                console.log(`LayerStorage: Saved layer ${layer.id}`);
                resolve();
            };

            request.onerror = () => {
                console.error('LayerStorage: Failed to save layer:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Load all layers from IndexedDB
     * @returns {Promise<Array>} Array of layer data objects
     */
    async loadAllLayers() {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const layers = request.result || [];
                console.log(`LayerStorage: Loaded ${layers.length} layers`);
                resolve(layers);
            };

            request.onerror = () => {
                console.error('LayerStorage: Failed to load layers:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Delete a layer from IndexedDB
     * @param {string} layerId 
     */
    async deleteLayer(layerId) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(layerId);

            request.onsuccess = () => {
                console.log(`LayerStorage: Deleted layer ${layerId}`);
                resolve();
            };

            request.onerror = () => {
                console.error('LayerStorage: Failed to delete layer:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Update a layer's metadata (volume, muted state, etc.)
     * @param {string} layerId
     * @param {Object} updates - Partial layer updates
     */
    async updateLayer(layerId, updates) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            // First get the existing layer
            const getRequest = store.get(layerId);

            getRequest.onsuccess = () => {
                const layer = getRequest.result;
                if (!layer) {
                    resolve(); // Layer doesn't exist, nothing to update
                    return;
                }

                // Merge updates
                const updatedLayer = { ...layer, ...updates };
                const putRequest = store.put(updatedLayer);

                putRequest.onsuccess = () => {
                    console.log(`LayerStorage: Updated layer ${layerId}`);
                    resolve();
                };

                putRequest.onerror = () => {
                    reject(putRequest.error);
                };
            };

            getRequest.onerror = () => {
                reject(getRequest.error);
            };
        });
    }

    /**
     * Clear all layers from IndexedDB
     */
    async clearAll() {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => {
                console.log('LayerStorage: Cleared all layers');
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }
}

export default new LayerStorage();
