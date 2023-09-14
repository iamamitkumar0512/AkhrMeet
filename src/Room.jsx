import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "./SocketProvider";
import ReactPlayer from "react-player";
import webrtc from "./webrtc";

const Room = () => {
  const socket = useSocket();

  const [remoteUserSocketId, setRemoteUserSocketId] = useState(null);
  const [myStream, setMyStream] = useState();

  const handelUserJoined = useCallback((data) => {
    const { email, id } = data;
    setRemoteUserSocketId(id);
    console.log(`${email} joined with id ${id}`);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await webrtc.getOffer();
    console.log(offer);
    socket.emit("user:call", { to: remoteUserSocketId, offer });
    setMyStream(stream);
  }, [remoteUserSocketId, socket]);

  const handleIncommingCall = useCallback(async ({ from, offer }) => {
    setRemoteUserSocketId(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    console.log(`Incoming Call`, from, offer);
    // socket.emit("call:accepted", { to: from, ans });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handelUserJoined);
    socket.on("incoming:call", handleIncommingCall);

    return () => {
      socket.off("user:joined", handelUserJoined);
    };
  }, [socket, handelUserJoined, handleIncommingCall]);

  return (
    <div>
      <h1>Room</h1>
      <h3>{remoteUserSocketId ? "Connected" : "No one in call"}</h3>
      {remoteUserSocketId && <button onClick={handleCallUser}>CALL</button>}
      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            muted
            height="200px"
            width="300px"
            url={myStream}
          />
        </>
      )}
    </div>
  );
};

export default Room;
