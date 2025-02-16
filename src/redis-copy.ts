import { logger } from "./logger";

export interface ISet {
    clientId: string;
    key: string;
    value: any;
    ttl?: number;
}

export interface IGet {
    clientId: string;
    key: string;
}

export interface IDelete {
    clientId: string;
    key: string;
}

class RedisCopy {
    private clientMapper: Map<string, Map<string, { value: any, expiresIn?: number }>>;

    constructor() {
        this.clientMapper = new Map();
    }

    public set(data: ISet): boolean {
        const { clientId, key, value, ttl } = data;
        const store = this.clientMapper.get(clientId);
        let expiresIn = ttl ? Date.now() + (ttl * 1000) : undefined;
        if(store) {
            store.set(key, { value, expiresIn });
        }
        else {
            let mapper = new Map();
            mapper.set(key, { value, expiresIn });
            this.clientMapper.set(clientId, mapper);
        }
        return true;
    }

    public get(data: IGet): any {
        const { clientId, key } = data;
        const store = this.clientMapper.get(clientId);
        if(store) {
            const entry = store.get(key);
            if(entry) {
                if(entry.expiresIn && (Date.now() > entry.expiresIn)) {
                    return undefined;
                }
                else {
                    return entry.value;
                }
            }
        }
        return undefined;
    }

    public delete(data: IDelete): boolean {
        const { clientId, key } = data;
        const store = this.clientMapper.get(clientId);
        if(store) {
            return store.delete(key);
        }
        return false;
    }

    public deleteClientMapper(clientId: string): boolean {
        return this.clientMapper.delete(clientId);
    }

    public deleteExpiredKeys() {
        for(let [clientId, store] of this.clientMapper) {
            for(let [key, entry] of store) {
                if(entry.expiresIn && Date.now()>entry.expiresIn) {
                    store.delete(key);
                }
            }
        }
    }
}

export const redisCopy = new RedisCopy();
setInterval(() => {
    redisCopy.deleteExpiredKeys();
}, 5000);