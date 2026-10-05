import "dotenv/config";
import http from "http";
import app from "./app";
import { prisma } from "./lib/prisma";
import config from "./config";
import { initSocket } from "./socket";

const PORT = config.PORT;

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully");

    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Migo API running on port ${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/docs`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
