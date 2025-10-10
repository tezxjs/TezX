import { TezXError } from "./core/error.js";
import { Router } from "./core/router.js";
import { TezX } from "./core/server.js";
export { Router, TezX, TezXError };
export let version = "3.0.14-beta.3";
export default {
    Router,
    TezX,
    version,
    TezXError,
};
