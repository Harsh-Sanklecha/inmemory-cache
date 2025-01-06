import * as net from 'net';

interface CacheConfig {
    host?: string;
    port?: number;
    connectTimeout?: number;
}

class CustomRedisClient {
    private socket: net.Socket
    private host: string
    private port: number
    private connectionTimeout: number

    constructor(config: CacheConfig = {}) {
        this.host = config.host || 'localhost'
        this.port = config.port || 6379
        this.connectionTimeout = config.connectTimeout || 5000

        this.socket = new net.Socket()
    }
}