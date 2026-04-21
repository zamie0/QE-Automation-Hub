import { createRequestHandler } from "@tanstack/react-start/server";

export default createRequestHandler({
  build: async () => {
    const { router } = await import("../dist/server/server.js");
    return router;
  },
});