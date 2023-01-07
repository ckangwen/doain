import { startServer } from "@charrue/vitest-service";
import { resolve } from "path";

import { BASE_URL } from "./__tests__/helper";

const SwaggerPath = resolve(__dirname, "./__tests__/swagger.json");

startServer(SwaggerPath, BASE_URL);
