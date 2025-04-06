import { GlobalConfig } from "./config";
export class CommonHandler {
    notFound(callback) {
        GlobalConfig.notFound = callback;
        return this;
    }
    onError(callback) {
        GlobalConfig.onError = callback;
        return this;
    }
}
