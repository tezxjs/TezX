import { Router } from "./core/router.js";
import { TezX } from "./core/server.js";
import { compileRegexRoute, regexMatchRoute } from "./utils/regexRouter.js";
export { compileRegexRoute, regexMatchRoute, Router, TezX };
export let version = "2.0.11";
export default {
    Router,
    regexMatchRoute,
    compileRegexRoute,
    TezX,
    version,
};
