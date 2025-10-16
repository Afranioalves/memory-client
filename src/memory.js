
class Memory {
    
  constructor() {
    this.dbName = 'memoryDB';
    this.storeName = 'memories';
    this.dbPromise = this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'name' });
        }
      };

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async create(memoryName, memoryValue) {
    const db = await this.dbPromise;
    const existing = await this.read(memoryName);
    if (existing && !existing.status) {
      return { message: `Memory ${memoryName} already exists.`, status: 409 };
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.put({ name: memoryName, value: memoryValue });

      req.onsuccess = () => resolve({ message: `Memory ${memoryName} created successfully.`, status: 201 });
      req.onerror = () => reject({ message: `Error creating memory ${memoryName}.`, status: 500 });
    });
  }

  async read(memoryName) {
    const db = await this.dbPromise;
    return new Promise((resolve) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.get(memoryName);

      req.onsuccess = () => {
        if (req.result) resolve(req.result.value);
        else resolve({ message: `Memory ${memoryName} does not exist.`, status: 404 });
      };

      req.onerror = () => resolve({ message: `Error reading memory ${memoryName}.`, status: 500 });
    });
  }

  async delete(memoryName) {
    const db = await this.dbPromise;
    const existing = await this.read(memoryName);
    if (existing && existing.status === 404) {
      return { message: `Memory ${memoryName} does not exist.`, status: 404 };
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.delete(memoryName);

      req.onsuccess = () => resolve({ message: `Memory ${memoryName} deleted successfully.`, status: 200 });
      req.onerror = () => reject({ message: `Error deleting memory ${memoryName}.`, status: 500 });
    });
  }
}

export default new Memory();
