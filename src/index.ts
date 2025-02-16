import path = require("path");
require('dotenv').config({ path: '.env' });
import { PORT } from "./config";
import { logger } from "./logger";
import { redisCopy } from "./redis-copy";

const net = require('net');

const server = net.createServer((socket: any) => {
    const clientId: string = `${socket.remoteAddress}.${socket.remotePort}`
    logger.info(`client ${clientId} connected`);

    socket.on("data", (data: any) => {
        const commands = JSON.parse(data.toString().trim());
        const { action, key, value, ttl } = commands;

        try {
    
            if(action?.length && key?.length) {
    
                switch (action) {
                    case "SET":
                        // {"action":"SET", "key":"name", "value":"sarath"}
                        redisCopy.set({clientId, key, value, ttl});
                        socket.write("OK\n");
                        break;
    
                    case "GET":
                        // {"action":"GET", "key":"name"}   --> GET
                        const storedValue = redisCopy.get({clientId, key});
                        socket.write((storedValue ?? "NOT FOUND") + "\n");
                        break;
    
                    case "DELETE":
                        // {"action":"DELETE", "key":"name"}
                        const isDeleted = redisCopy.delete({clientId, key});
                        socket.write((isDeleted ? "OK" : "NOT FOUND") + "\n");
                        break;
                
                    default:
                        break;
                }
            }
            else {
                socket.write("INVALID COMMAND\n");
            }

        } catch (error: any) {
            logger.error(error);
            socket.write("ERROR\n");
        }
    })

    socket.on("end", () => {
        redisCopy.deleteClientMapper(clientId);
        logger.info(`client ${clientId} disconnected`);
    })
})

server.listen(PORT, () => {
    logger.info(`RedisCopy running on port: ${PORT}`);
})