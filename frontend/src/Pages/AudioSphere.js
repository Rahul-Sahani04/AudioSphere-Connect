import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InputField from "../Components/InputField";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

function AudioSphere({ socket }) {
  const videoRef = useRef(null);
  const [videoId, setVideoId] = useState("");
  const [data, setData] = useState(null);
  const [CustomRoomId, setCustomRoomId] = useState("");
  const [messages, setMessages] = useState([]);
  const lastMessageRef = useRef(null);
  const { roomId } = useParams(); // Get roomId from URL params

  const [host, setHost] = useState(false);

  const navigate = useNavigate();
  const [userName, setUserName] = useState(localStorage.getItem("userName"));
  const [messageInput, setMessageInput] = useState("");

  const fetchVideoData = async (videoId) => {
    // Extract the videoId from the input field if the input field is a URL
    try {
      const getUrl = videoId;
      let NewVideoId;
      if (videoId.includes("youtube.com") || videoId.includes("youtu.be")) {
        const url = new URL(getUrl);
        const searchParams = new URLSearchParams(url.search);
        const videoId = searchParams.get("v");
        NewVideoId = videoId;
        setVideoId(videoId);
      }

      const response = await fetch(
        process.env.REACT_APP_API_URL + `/video/${NewVideoId}`
      );
      const data = await response.json();
      console.log(data);
      setData(data);
    } catch (error) {
      console.error("Failed to fetch video information:", error);
      return null;
    }
  };

  useEffect(() => {
    socket.on("isHost", () => {
      console.log("Im the host");
      setHost(true);
    });
  }, [socket]);

  useEffect(() => {
    let CustomRoomId = window.location.href.split("?").pop();

    setCustomRoomId(CustomRoomId);

    console.log(CustomRoomId);
    socket.emit(
      "joinRoom",
      CustomRoomId || "default",
      localStorage.getItem("userName") || "guest"
    ); // Join the specified room
  }, []);

  useEffect(() => {
    console.log("USERNAME: ", localStorage.getItem("userName"));

    if (!userName && userName !== "") {
      var Name = prompt("Please enter a username");
      console.log(Name);
      setUserName(Name);
      localStorage.setItem("userName", Name);
    }
    socket.emit("newUser", { userName, socketID: socket.id });

    socket.on("messageResponse", (data) => {
      // Handle the received message data
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on("roomJoined", (data) => {
      console.log(data.socketID + " joined the room");
      setMessages([...messages, data]);
      console.log("HOst mes: ", messages);
    });

    // Receive video id and fetch it
    socket.on("receiveVideo", (data) => {
      console.log("Received video id: ", data.videoId);
      setVideoId(data.videoId);
      fetchVideoData(data.videoId);
    });
  }, [socket, messages, roomId]);

  const sendVideoId = () => {
    socket.emit("sendVideo", {
      videoId,
      socketID: socket.id,
      roomId: CustomRoomId,
    });
  };

  useEffect(() => {

    const updateVideoPlaybackStatus = (status) => {
      socket.emit("updateVideoPlaybackStatus", status, CustomRoomId);
      // socket.emit("videoPlaybackStatus", status);
    };

    if (videoRef.current && videoRef.current.audio) {
      // Emit update video playback status event to the server
      console.log("Check Host: ", host);
      if (host) {
        console.log(videoRef.current.currentTime);
        const interval = setInterval(() => {
          console.log("Updating Playback Status: ", {
            currentTime: videoRef.current.audio.current.currentTime,
            volume: videoRef.current.audio.current.volume,
          });
          updateVideoPlaybackStatus({
            currentTime: videoRef.current.audio.current.currentTime,
            paused: videoRef.current.audio.current.paused,
            volume: videoRef.current.audio.current.volume,
          });
        }, 5000); // Interval set to 5 seconds

        // Clean up the interval to avoid memory leaks
        return () => clearInterval(interval);
      }

  


      socket.on("videoPlaybackStatus", (status) => {
        // Handle the received video playback status
        // Update the video playback status in the Plyr player
        videoRef.current.audio.current.currentTime = status.currentTime;
        videoRef.current.audio.current.volume = status.volume;
        if (!status.paused) {
          videoRef.current.audio.current.play();
        } else if (status.paused) {
          videoRef.current.audio.current.pause();
        }
      });
    }
  }, [host]);

  return (
    <div className="App">
      <div id="YoutubeContainer">
        <input
          type="text"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          id="videoID"
          placeholder="Enter video ID"
        />
        <button onClick={() => sendVideoId(videoId)}>Get Audio</button>
        <button onClick={() => console.log(videoRef.current.audio.current.currentTime)}>Get Time</button>
      </div>
      <AudioPlayer
        autoPlay
        src={data ? data[0].src : ""}
        ref={videoRef}
        // other props here
      />
      {/* Render the AudioPlayer component */}
    </div>
  );
}

export default AudioSphere;
