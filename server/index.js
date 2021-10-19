const app = require("express")()
const uuid = require("uuid")
const http = require("http").Server(app)
const randomChatController = require("./controllers/randomChatController")
const io = require("socket.io")(http, {
    cors: {
      origin: '*',
    }
})

app.get("/", (req, res) => {
    res.send("hello guys this is the api")
})

/*
{
    username : "kntl",
    imageUrl : ""
}

*/



io.on("connection", (socket) => {
    randomChatController(socket)

});



http.listen(3000, ()=>{
    console.log("port 3000")
})