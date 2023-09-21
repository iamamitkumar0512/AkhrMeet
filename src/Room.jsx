import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "./SocketProvider";
import ReactPlayer from "react-player";
import webrtc from "./webrtc";
import logo from "./zoom-meeting-logo-transparent-png-21.png";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const Room = () => {
  const socket = useSocket();
  const navigate = useNavigate();

  const [remoteUserSocketId, setRemoteUserSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  // const [remoteUserSocketId1, setRemoteUserSocketId1] = useState(null);

  const handelUserJoined = useCallback((data) => {
    const { email, id, userNo } = data;
    console.log(userNo);
    setRemoteUserSocketId(id);
    console.log(`${email} joined with id ${id} ${userNo} in this room`);
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

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteUserSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await webrtc.getAnswer(offer);
      console.log(ans);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    console.log("abc");
    console.log(myStream);
    for (const track of myStream.getTracks()) {
      webrtc.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      webrtc.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await webrtc.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteUserSocketId });
  }, [remoteUserSocketId, socket]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handelDisconnectedCall = () => {
    console.log("disconnected");
    toast.error("User disconnected Redirectng to Home page");
    setTimeout(() => {
      navigate("/");
    }, 5000);
  };
  useEffect(() => {
    webrtc.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      webrtc.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await webrtc.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await webrtc.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    webrtc.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handelUserJoined);
    socket.on("incoming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("user:dissconected", handelDisconnectedCall);

    return () => {
      socket.off("user:joined", handelUserJoined);
      socket.off("incoming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("user:dissconected", handelDisconnectedCall);
    };
  }, [
    socket,
    handelUserJoined,
    handleIncommingCall,
    handelDisconnectedCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <section className="bg-gray-300 dark:bg-gray-900 p-8">
      <Toaster position="top-center" reverseOrder={false}></Toaster>
      <div className="flex flex-col items-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a
          href="/"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <img className="w-20 h-12 mr-2" src={logo} alt="logo" />
          Akhr MEET
        </a>
        <div className="w-full h-full bg-white rounded-lg shadow dark:border xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Room
          </h1>
          <h3 className="text-md m-2 leading-tight tracking-tight text-gray-900 md:text-xl dark:text-white">
            {remoteUserSocketId ? "Connected" : "No one in call"}
          </h3>
          {remoteUserSocketId && (
            <button
              className="m-4 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={handleCallUser}
            >
              CALL
            </button>
          )}
          <div className="w-full flex flex-row justify-around p-6 bg-gray-100 rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700">
            {myStream && (
              <div className="">
                <h1 className="text-lg font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Your Video
                </h1>
                <ReactPlayer
                  playing
                  // muted
                  height="300px"
                  width="500px"
                  url={myStream}
                />
              </div>
            )}
            {remoteStream && (
              <div>
                <h1 className="text-lg font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Other's Video
                </h1>
                <ReactPlayer
                  playing
                  // muted
                  height="300px"
                  width="500px"
                  url={remoteStream}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Room;
