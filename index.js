
const ytdl = require("ytdl-core");
const cors = require("cors");
const app = require("express")();
const PORT = 8000;

app.use(cors()); // Enable CORS for all routes

const { Socket } = require("socket.io");
const { stat } = require("fs");
const http = require("http").Server(app);
const socketIO = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

let users = [];
let rooms = [];
let roomId = 1;
socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("message", (data) => {
    socketIO.emit("messageResponse", data);
  });

  socket.on("typing", (data) => socket.broadcast.emit("typingResponse", data));

  socket.on("notTyping", (data) =>
    socket.broadcast.emit("notTypingResponse", data)
  );

  socket.on("newUser", (data) => {
    // Add the socket ID to the user object
    data.socketID = socket.id;
    users.push(data);
    socket.join("room-" + roomId);
    rooms.push("room-" + roomId);
    socketIO.sockets.in("room-" + roomId).emit("newUserResponse", users);
    // Emit the current video playback status to the new user
    // socket.emit("videoPlaybackStatus", getCurrentVideoPlaybackStatus());
  });

  socket.on("getCurrentRooms", () => {
    socket.emit("currentRooms", rooms);
  });

  // Receve the video id and send it to the room
  socket.on("sendVideo", (data) => {
    console.log("🚀: sendVideo -> data", data);
    socketIO.sockets.in(data.roomId).emit("receiveVideo", { videoId: data.videoId });
  });

  socket.on("createRoom", (customRoomId, userName) => {
    roomId++;
    let newRoom = "room-" + customRoomId || roomId;
    console.log("new room: ", newRoom, userName);
    rooms.push([newRoom, userName]);
    socket.join(newRoom);
    socket.emit("roomCreated", newRoom);
  });

  // Check if the room is empty for more than 10 seconds and delete it from the rooms array
  // setInterval(() => {
  //   rooms.forEach((room, index) => {
  //     const roomId = room[0];
  //     const roomUsers = users.filter((user) => user.roomId === roomId);
  //     if (roomUsers.length === 0) {
  //       const roomIndex = rooms.findIndex((r) => r[0] === roomId);
  //       rooms.splice(roomIndex, 1);
  //       console.log(`Room ${roomId} has been deleted.`);
  //     }
  //   });
  // }, 10000);

  socket.on("joinRoom", (customRoomId, userName) => {
    console.log("rooms ", rooms);
    console.log("custom id ", customRoomId);
    console.log("user ", userName);

    let UserRoomId = "room-" + customRoomId.split("=").pop().toLocaleLowerCase();

    if (!rooms.find((room) => room[0] === UserRoomId)) {
      console.log("room does not exist");
      return;
    } else {
      console.log("room exists");
    }
    const room = rooms.find((room) => room[0] === UserRoomId);
    console.log("Match Room IDS: ", room, socket.id);
    if (room && room[1] == userName) {
      // User matches the id in the roomId of rooms array
      console.log("User matches the id in the roomId");
      socket.emit("isHost", true);
    } else {
      console.log("User does not match the id in the roomId");
    }
    console.log("join room: ", customRoomId);
    socket.join(customRoomId);
    
    socketIO.sockets.in(customRoomId).emit("roomJoined", {text: "has joined the session.", name: userName, socketID: socket.id, roomJoinMsg: true,});
    // Emit the current video playback status to the user who joined the room
    // socket.emit("videoPlaybackStatus", getCurrentVideoPlaybackStatus());
  });

  socket.on("updateVideoPlaybackStatus", (status, roomId) => {
    console.log("🚀: updateVideoPlaybackStatus -> status", status);
    // Update the video playback status
    updateVideoPlaybackStatus(status, socket, roomId);
    // Broadcast the updated video playback status to all users in the room
    socketIO.sockets.in(roomId).emit("videoPlaybackStatus", status);
    socketIO.sockets.in(roomId).emit("videoPlaybackStatusUpdated", status);
  });

  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
    users = users.filter((user) => user.socketID !== socket.id);
    socketIO.emit("newUserResponse", users);
    socket.disconnect();
  });
});

function updateVideoPlaybackStatus(status, socket, roomId) {
  socketIO.sockets.in(roomId).emit("videoPlaybackStatus", status);

  // status.currentTime = HostStatus.currentTime ;
  // status.isPlaying = HostStatus.isPlaying;
  // status.volume = HostStatus.volume;
  // status.paused = HostStatus.paused;
}

function getUserRoom(socketId) {
  // Implement logic to get the room ID of a user based on their socket ID
  // Return the room ID
  // Example implementation:
  const user = users.find((user) => user.socketID === socketId);
  if (user) {
    return user.roomId;
  }
  return null;
}


app.get('/api/video/:videoID', async (req, res) => {
    const videoID = req.params.videoID;

    try {
        const info = await ytdl.getInfo(videoID);
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

        const formattedFormats = audioFormats.map((format, index) => ({
            index,
            mimeType: format.mimeType,
            itag: format.itag,
            quality: format.quality,
            audioQuality: format.audioQuality,
            src: format.url,
        }));

        res.json(formattedFormats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch video information' });
    }
});

app.get('/api/', async (req, res) => {
    res.json("Welcome to the API 🎉");
});

http.listen(PORT, () => {
    console.log(`API server is running on port ${PORT}`);
});
