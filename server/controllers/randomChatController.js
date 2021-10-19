
const uuid = require("uuid")

let username  = []
let users = []
let rooms = []
let queue = []

class randomChatController{
    constructor(socket){
        this.socket = socket
        console.log("dieksekusi")
        this.main()
    }

    findNewPeers(){
        if(queue.length > 0){
            this.socket.leave("waiting_room" + this.socket.id)
            let stranger = queue.pop()
            let room = uuid.v4()
            rooms.push({socketID: this.socket.id, roomID: room});
            rooms.push({socketID: stranger.id, roomID: room});
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
        let currentSocketRoom;
        this.socket.on("join-chat", (data) => {
            this.socket.join("homepage" + this.socket.id)
            if(username.indexOf(data.username) < 0){
                if(data.username && data.imageUrl){
                    username.push(data.username)
                    users[this.socket.id] = {username: data.username, imageUrl: data.imageUrl}
                    console.log({username: data.username, imageUrl: data.imageUrl})
                    this.socket.emit("callback-join-chat", {status: "ok"})
                }
            }else{
                console.log(users)
                this.socket.emit("callback-join-chat", {status: "error", msg: "username sudah dipakai"})
            }
            console.log(users)
        })
        this.socket.on("find-someone", () => {
            this.findNewPeers(this.socket)
            console.log(rooms)
        })
    
        this.socket.on("chat", (data) => {
            console.log(data)
            currentSocketRoom = rooms.filter(room => room.socketID == this.socket.id)
            if(currentSocketRoom.length > 0){
                let socketRoomID = currentSocketRoom[0].roomID
                this.socket.broadcast.to(socketRoomID).emit("msg", data)
            }
    
        })
    
        this.socket.on("skip", (data) => {
            let currentSocketRoom = rooms.filter(room => room.socketID == this.socket.id)
            if(currentSocketRoom.length > 0){
                let socketRoomID = currentSocketRoom[0].roomID
                rooms.splice(rooms.map( (room) => {return room.roomID}).indexOf(socketRoomID), 1)
                this.socket.broadcast.to(socketRoomID).emit("someone-leave", users[this.socket.id].username+" skipped you")
                this.socket.leave(socketRoomID);
            }
            
            this.findNewPeers(this.socket)
        })

        let currentSocket = this.socket

        this.socket.on('disconnect', function() {
            console.log(currentSocket)
            let indexUsername = username.indexOf(users[currentSocket.id].username)
            if(indexUsername.length > 0){
                username.splice(indexUsername, 1)
                if(currentSocketRoom.length > 0){
                    socketRoomID = currentSocketRoom[0].roomID
                    this.socket.broadcast.to(socketRoomID).emit("someone-leave", users[this.socket.id].username+" disconnected")
                    let currentRoomIndex = rooms.indexOf(currentSocketRoom[0])
                    rooms.splice(currentRoomIndex, 1)
                    
                }
                console.log(username)
                delete users[currentSocket.id]
                queue.splice(queue.indexOf(currentSocket), 1) 
                this.socket.disconnect()   
            }
            console.log(rooms)
            console.log("ini dari anjay")
        });
        
    }
}

module.exports = (socket) => {
    new randomChatController(socket)
}