import { IncomingMessage } from "node:http";

export class Request<T extends Record<string, any> = {}, Path extends string = any> extends IncomingMessage {


}