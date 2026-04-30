import { handleRequest } from "./interface/http/router.js";

export default {
    fetch(request, env) {
        return handleRequest(request, env);
    },
};
