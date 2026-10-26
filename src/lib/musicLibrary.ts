/** Tiny IndexedDB store so uploaded songs survive a page refresh. */

export type StoredTrack = { id: string; title: string; blob: Blob };

const DB_NAME = "love-music";
const STORE = "tracks";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      return reject(new Error("IndexedDB is not supported"));
    }
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

export async function listStoredTracks(): Promise<StoredTrack[]> {
  try {
    if (typeof indexedDB === "undefined") return [];
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result as StoredTrack[]);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function addStoredTracks(files: File[]): Promise<StoredTrack[]> {
  const db = await openDb();
  const added: StoredTrack[] = files.map((f) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: f.name.replace(/\.[^.]+$/, ""),
    blob: f,
  }));
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    added.forEach((t) => tx.objectStore(STORE).put(t));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return added;
}

export async function removeStoredTrack(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
