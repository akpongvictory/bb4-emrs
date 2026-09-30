import { createServer } from "node:http";

const PORT = Number(process.env.PORT) || 5000;

const server = createServer((req, res) => {
  if (req.url === "/api/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "bb4-emrs-server" }));
    return;
  }
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`BB4 EMRs server running on port ${PORT}`);
});