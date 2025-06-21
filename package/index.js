import { Router } from "express";
import { TezX } from "./core/server.js";
import { useParams } from "./utils/params.js";
export { Router } from "./core/router.js";
export { TezX } from "./core/server.js";
export { useParams };
export let version = "2.0.5";
export default {
    Router,
    TezX,
    useParams,
    version,
};
