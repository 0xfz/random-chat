
import { v4 as uuid } from 'uuid'
import {Socket} from 'socket.io'
interface userObjectType {
    [key: string]: {
        username: string, 
        imageUrl: string, 
        currentRoom: string
    }
}

interface roomObjectType {
    [key: string]: object[]
}

let users: userObjectType = {}
let rooms:  roomObjectType = {}
let queue: Socket[] = []

class randomTextChatController{
    socket: Socket
    constructor(socket: Socket){
        this.socket = socket
        console.log("dieksekusi")
        this.main()
    }
    getCurrentRoom(socket: Socket = this.socket){
        return users[socket.id].currentRoom
    }
    getCurrentUsername(socket: Socket = this.socket){
        return users[socket.id].username
    }
    findNewPeers(){
        if(queue.length > 0){
            this.socket.leave("waiting_room" + this.socket.id)
            let stranger: Socket = queue.pop()!
            let room: string = uuid()
            rooms[room] = [users[this.socket.id], users[stranger.id]]
            stranger.join(room)
            this.socket.join(room)
    
            stranger.emit("chat_start", users[this.socket.id])
            this.socket.emit("chat_start", users[stranger.id])
        }else{
            this.socket.join("waiting_room" + this.socket.id)
            queue.push(this.socket)
            console.log(queue)
        }
        console.log(users)
    }

    main(){
        this.socket.on("join-chat", (data) => {
            let usernames: string[] = Object.values(users).map(users => users.username)
            this.socket.join("homepage" + this.socket.id)
            if(usernames.indexOf(data.username) < 0){
                if(data.username && data.imageUrl){
                    users[this.socket.id] = {username: data.username, imageUrl: data.imageUrl, currentRoom: ""}
                    console.log({username: data.username, imageUrl: data.imageUrl})
                    this.socket.emit("callback-join-chat", {status: "ok", data: users[this.socket.id]})
                }
            }else{
                console.log(users)
                this.socket.emit("callback-join-chat", {status: "error", msg: "username sudah dipakai"})
            }
            console.log(users)
        })
        this.socket.on("find-someone", () => {
            this.findNewPeers()
            console.log(rooms)
        })
    
        this.socket.on("chat", (data) => {
            let socketRoomID = this.getCurrentRoom()
            this.socket.broadcast.to(socketRoomID).emit("msg", data)
    
        })
    
        this.socket.on("skip", (data) => {
            let socketRoomID = this.getCurrentRoom()
            let currentUsername = this.getCurrentUsername()
            this.socket.broadcast.to(socketRoomID).emit("someone-leave", currentUsername+" skipped you")
            this.socket.leave(socketRoomID);
            this.findNewPeers()
        })

        let currentSocket: Socket = this.socket

        this.socket.on('disconnect', () => {
            console.log(currentSocket)
            if(users[currentSocket.id] != undefined){
                let socketRoomID = this.getCurrentRoom(currentSocket)
                let currentUsername = this.getCurrentUsername(currentSocket)
                delete users[currentSocket.id]
                delete rooms[socketRoomID]
                this.socket.broadcast.to(socketRoomID).emit("someone-leave", currentUsername+" disconnected")
                this.socket.disconnect()
            }

        });
        
    }
}

export  { randomTextChatController }