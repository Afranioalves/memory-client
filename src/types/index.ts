export type Column =
string
    | {
        name: string;
        unique?: boolean;
    };

export interface TableSchema {
    [storeName: string]: string[];
}

export interface ResponseMessage {
    message: string;
    status: number;
    error?: any;
    schema?: string[];
}

export interface IColumn {
  name: string;
  unique: boolean;
  type: "string" | "number" | "boolean" | "object" | "array";
}