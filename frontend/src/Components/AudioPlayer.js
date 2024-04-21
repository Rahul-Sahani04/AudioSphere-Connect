import React from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";



const Player = ({ ref, src, currentTime }) => (
  <AudioPlayer
    autoPlay
    src={src}
    ref={ref}
    onPlay={(e) => console.log("onPlay")}
    currentTime={currentTime || 0}
    // other props here
  />
);

export default Player;
