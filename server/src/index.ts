
import express from "express";
import {createServer} from 'http';
import {Server, Socket} from 'socket.io'
import {randomTextChatController} from './controllers/randomTextChatController'

const app = express()
const server = createServer(app)

const io = new Server(server, {
    cors: {
        origin:"*"
    }
})

io.of("/textchat").on("connection", (socket: Socket) => {
    new randomTextChatController(socket)
})

server.listen(3000, ()=>{
    console.log("port 3000")
})