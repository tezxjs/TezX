import { ServerResponse } from "node:http";

export class Response extends ServerResponse {
    json(data: any, statusCode: number = 200) {
        const body = JSON.stringify(data);

        this.writeHead(statusCode, {
            "Content-Type": "application/json",
        });

        this.end(body);
    }

    send(data: any, statusCode: number = 200) {
        this.writeHead(statusCode, {
            "Content-Type": "text/plain",
        });

        this.end(typeof data === "string" ? data : String(data));
    }
}