import { Router } from "./core/router.js";
import { TezX } from "./core/server.js";
import { compileRegexRoute, regexMatchRoute } from "./utils/regexRouter.js";
export { Router } from "./core/router.js";
export { TezX } from "./core/server.js";
export { compileRegexRoute, regexMatchRoute };
export let version = "2.0.10";
export default {
    Router,
    regexMatchRoute, compileRegexRoute,
    TezX,
    version,
};
