var socket = io.connect("http://localhost:3000/")
let userData;
let strangerData;
$("#welcome_container").hide()
$("#wating_room").hide()
$("#chat_room").hide()
$("#submit-btn").click(() => {
    let username = $("#username").val()
    let imageUrl = "https://avatars.dicebear.com/api/human/"+username+".svg"
    userData = {username : username, imageUrl : imageUrl}
    socket.emit("join-chat", userData)
    socket.on("callback-join-chat", (data) => {
        console.log(data)
        if(data.status == "ok"){
            $("#set_username_container").hide()
            $("#welcome_container").show()
            $("#usernameWelcome").text(userData.username)
            $("#myProfilePicture").attr("src", userData.imageUrl)
        }else{
            $("#error").text(data.msg)
        }
    })
    
})
$("#findSomeone").click(() => {
    $("#welcome_container").hide()
    $("#wating_room").show()
    socket.emit("find-someone", true)
})
socket.on("chat_start", (data) => {
    $("#wating_room").hide()
    $("#chat_room").show()
    $("#stranger_img").attr("src", data.imageUrl)
    $("#stranger_username").text(data.username)
})
socket.on("msg", (data)=>{
    console.log(data)

    console.log(data)
    $("#chat_container").append("<div class='stranger_msg_chat block mt-2'>"+data+"</div>")
})
socket.on("someone-leave", (data)=>{
    console.log(data)
    $("#chat_container").append("<div class='warning_msg_chat block mt-2'>"+data+"</div>")
})
$(".send-button").click(() => {
    let msg = $("#pesan").text()
    msg = msg.replace(/(<([^>]+)>)/gi, "")
    msg = msg.replace(/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/, "<a href='$&'>$&</a>")
    socket.emit("chat", msg)
    msg = msg.split("\n").join("<br>")
    $("#chat_container").append("<div class='my_msg_chat block mt-2'>"+msg+"</div>")
    $("#pesan").text("")
    
})

$("#skip").click(() => {
    let msg = $("#pesan").text()
    if(confirm("Are you sure u want to skip?")){
        socket.emit("skip", true)
        $("#chat_container").html("")
        $("#chat_room").hide()
        $("#wating_room").show()
    }


})