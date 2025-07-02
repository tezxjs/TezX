import { Router } from "./core/router.js";
import { TezX } from "./core/server.js";
import { regexMatchRoute, compileRegexRoute } from "./utils/regexRouter.js";
export { Router } from "./core/router.js";
export { TezX } from "./core/server.js";
export { regexMatchRoute, compileRegexRoute };
export let version = "2.0.8";
export default {
    Router,
    regexMatchRoute, compileRegexRoute,
    TezX,
    version,
};
