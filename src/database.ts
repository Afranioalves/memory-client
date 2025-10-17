import { Column, TableSchema, ResponseMessage } from "./types/index";

class Database {
    private dbName: string;
    private dbVersion: number;
    private dbPromise: Promise<IDBDatabase>;
    private schemas: TableSchema = {};

    constructor(dbName: string, version: number = 1) {
        if (!dbName) throw new Error("database name is required");
        this.dbName = dbName;
        this.dbVersion = version;
        this.dbPromise = this.initDB();
    }

    private async initDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                console.info(`database ${this.dbName} started.`);
            };

            request.onsuccess = (event) =>
                resolve((event.target as IDBOpenDBRequest).result);

            request.onerror = (event) =>
                reject((event.target as IDBOpenDBRequest).error);
        });
    }

    async createTable(tableName: string, keyPath: string = "id", autoIncrement: boolean = true, columns: Column[] = []): Promise<ResponseMessage> {
        const db = await this.dbPromise;
        db.close();

        return new Promise((resolve, reject) => {
            const newVersion = this.dbVersion + 1;
            const request = indexedDB.open(this.dbName, newVersion);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(tableName)) {
                    const store = db.createObjectStore(tableName, { keyPath, autoIncrement });

                    columns.forEach((col) => {
                        if (typeof col === "string") {
                            store.createIndex(col, col, { unique: false });
                        } else if (typeof col === "object" && col.name) {
                            store.createIndex(col.name, col.name, { unique: !!col.unique });
                        }
                    });
                }
            };

            request.onsuccess = (event) => {
                this.dbVersion = newVersion;
                this.dbPromise = Promise.resolve((event.target as IDBOpenDBRequest).result);
                this.schemas[tableName] = columns.map((col) =>
                    typeof col === "string" ? col : col.name
                );

                resolve({
                    message: `Table ${tableName} created successfully.`,
                    status: 201,
                    schema: this.schemas[tableName],
                });
            };

            request.onerror = (event) => {
                reject({
                    message: `Error creating table ${tableName}.`,
                    status: 500,
                    error: (event.target as IDBOpenDBRequest).error,
                });
            };
        });
    }

    async create(tableName: string, data: Record<string, any>): Promise<ResponseMessage> {
        const db = await this.dbPromise;
        const schema = this.schemas[tableName];

        if (schema) {
            const invalid = Object.keys(data).filter((key) => !schema.includes(key));
            if (invalid.length)
                return {
                    message: `invalids keys: ${invalid.join(", ")}`,
                    status: 400,
                };
        }

        return new Promise((resolve, reject) => {
            const tx = db.transaction(tableName, "readwrite");
            const store = tx.objectStore(tableName);
            const req = store.add(data);

            req.onsuccess = () =>
                resolve({ message: "Record created successfully..", status: 201 });
            req.onerror = (event) =>
                reject({ 
                    message: "Failed to create the record", 
                    status: 500, 
                      error: (event.target as IDBRequest).error,
                });
        });
    }

    async selectOne<T = any>(tableName: string, index:string, value: IDBValidKey): Promise<T | ResponseMessage> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(tableName, "readonly");
            const store = tx.objectStore(tableName);
            const req = store.index(index).get(value);

            req.onsuccess = () => {
                if (req.result) resolve(req.result as T);
                else resolve({ message: "Record not found.", status: 404 });
            };

            req.onerror = () =>
                reject({ message: "Error to find record", status: 500 });
        });
    }

    async update(
        tableName: string,
        index:string,
        value: IDBValidKey,
        newData: Record<string, any>
    ): Promise<ResponseMessage> {
        const db = await this.dbPromise;
        const existing = await this.selectOne(tableName, index, value);
        if (!existing || (existing as ResponseMessage).status === 404)
            return { message: "Record not found.", status: 404 };

        const updated = { ...(existing as Record<string, any>), ...newData };

        return new Promise((resolve, reject) => {
            const tx = db.transaction(tableName, "readwrite");
            const store = tx.objectStore(tableName);
            const req = store.put(updated);

            req.onsuccess = () =>
                resolve({ message: "Data updated sucessfully", status: 200 });
            req.onerror = () =>
                reject({ message: "Error to update data", status: 500 });
        });
    }

    async delete(tableName: string, id: IDBValidKey): Promise<ResponseMessage> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(tableName, "readwrite");
            const store = tx.objectStore(tableName);
            const req = store.delete(id);

            req.onsuccess = () =>
                resolve({ message: "Record deleted sucessfully .", status: 200 });
            req.onerror = () =>
                reject({ message: "Error to delete data", status: 500 });
        });
    }

    async selectAll<T = any>(tableName: string): Promise<T[] | ResponseMessage> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(tableName, "readonly");
            const store = tx.objectStore(tableName);
            const req = store.getAll();

            req.onsuccess = () => resolve(req.result as T[]);
            req.onerror = () =>
                reject({ message: "Error to get data", status: 500 });
        });
    }
}

export default new Database('memoryClientDatabase');