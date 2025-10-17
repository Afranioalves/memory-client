
class Memory {

  private dbName: string;
  private storeName: string
  private dbPromise: Promise<IDBDatabase>;
    
  constructor() {
    this.dbName = 'memoryDB';
    this.storeName = 'memories';
    this.dbPromise = this.initDB();
  }

  async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'name' });
        }
      };

      request.onsuccess = (event: Event) => resolve((event.target as IDBOpenDBRequest).result);
      request.onerror = (event: Event) => reject((event.target as IDBOpenDBRequest).error);
    });
  }

  async create(memoryName: string, memoryValue: any): Promise<{ message: string; status: number }> {
    const db = await this.dbPromise;
    const existing = await this.read(memoryName);
    if (existing && typeof existing === 'object' && !('status' in existing)) {
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

  async read(memoryName: string): Promise<any | { message: string; status: number }> {
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

  async delete(memoryName: string): Promise<{ message: string; status: number }> {
    const db = await this.dbPromise;
    const existing = await this.read(memoryName);
    if (existing && typeof existing === 'object' && 'status' in existing && existing.status === 404) {
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
