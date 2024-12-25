import { WebSocketServer } from "ws";
import { GamaeManager } from "./GameManager.js";


const wss = new WebSocketServer({ port: 8080 });


const gameManager = new GamaeManager();

wss.on("connection", function connection(ws) {
  gameManager.addUser(ws);

  ws.on("dissconnect", () => gameManager.removeUser(ws));
});


