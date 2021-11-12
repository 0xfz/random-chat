"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var randomTextChatController_1 = require("./controllers/randomTextChatController");
var app = (0, express_1.default)();
var server = (0, http_1.createServer)(app);
var io = new socket_io_1.Server(server, {
    cors: {
        origin: "*"
    }
});
io.of("/textchat").on("connection", function (socket) {
    new randomTextChatController_1.randomTextChatController(socket);
});
server.listen(3000, function () {
    console.log("port 3000");
});
