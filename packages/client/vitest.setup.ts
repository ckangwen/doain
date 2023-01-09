import { startServer } from "@charrue/vitest-service";
import { resolve } from "path";

import { BASE_URL } from "./tests/helper";

const SwaggerPath = resolve(__dirname, "./tests/swagger.json");

startServer(SwaggerPath, BASE_URL);
