"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomTextChatController = void 0;
var uuid_1 = require("uuid");
var users = {};
var rooms = {};
var queue = [];
var randomTextChatController = /** @class */ (function () {
    function randomTextChatController(socket) {
        this.socket = socket;
        console.log("dieksekusi");
        this.main();
    }
    randomTextChatController.prototype.getCurrentRoom = function (socket) {
        if (socket === void 0) { socket = this.socket; }
        return users[socket.id].currentRoom;
    };
    randomTextChatController.prototype.getCurrentUsername = function (socket) {
        if (socket === void 0) { socket = this.socket; }
        return users[socket.id].username;
    };
    randomTextChatController.prototype.findNewPeers = function () {
        if (queue.length > 0) {
            this.socket.leave("waiting_room" + this.socket.id);
            var stranger = queue.pop();
            var room = (0, uuid_1.v4)();
            rooms[room] = [users[this.socket.id], users[stranger.id]];
            stranger.join(room);
            this.socket.join(room);
            stranger.emit("chat_start", users[this.socket.id]);
            this.socket.emit("chat_start", users[stranger.id]);
        }
        else {
            this.socket.join("waiting_room" + this.socket.id);
            queue.push(this.socket);
            console.log(queue);
        }
        console.log(users);
    };
    randomTextChatController.prototype.main = function () {
        var _this = this;
        this.socket.on("join-chat", function (data) {
            var usernames = Object.values(users).map(function (users) { return users.username; });
            _this.socket.join("homepage" + _this.socket.id);
            if (usernames.indexOf(data.username) < 0) {
                if (data.username && data.imageUrl) {
                    users[_this.socket.id] = { username: data.username, imageUrl: data.imageUrl, currentRoom: "" };
                    console.log({ username: data.username, imageUrl: data.imageUrl });
                    _this.socket.emit("callback-join-chat", { status: "ok", data: users[_this.socket.id] });
                }
            }
            else {
                console.log(users);
                _this.socket.emit("callback-join-chat", { status: "error", msg: "username sudah dipakai" });
            }
            console.log(users);
        });
        this.socket.on("find-someone", function () {
            _this.findNewPeers();
            console.log(rooms);
        });
        this.socket.on("chat", function (data) {
            var socketRoomID = _this.getCurrentRoom();
            _this.socket.broadcast.to(socketRoomID).emit("msg", data);
        });
        this.socket.on("skip", function (data) {
            var socketRoomID = _this.getCurrentRoom();
            var currentUsername = _this.getCurrentUsername();
            _this.socket.broadcast.to(socketRoomID).emit("someone-leave", currentUsername + " skipped you");
            _this.socket.leave(socketRoomID);
            _this.findNewPeers();
        });
        var currentSocket = this.socket;
        this.socket.on('disconnect', function () {
            console.log(currentSocket);
            if (users[currentSocket.id] != undefined) {
                var socketRoomID = _this.getCurrentRoom(currentSocket);
                var currentUsername = _this.getCurrentUsername(currentSocket);
                delete users[currentSocket.id];
                delete rooms[socketRoomID];
                _this.socket.broadcast.to(socketRoomID).emit("someone-leave", currentUsername + " disconnected");
                _this.socket.disconnect();
            }
        });
    };
    return randomTextChatController;
}());
exports.randomTextChatController = randomTextChatController;
