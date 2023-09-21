import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "./SocketProvider";
import { useNavigate } from "react-router-dom";
import logo from "./zoom-meeting-logo-transparent-png-21.png";
import { toast, Toaster } from "react-hot-toast";

const Lobby = () => {
  const [room, setRoom] = useState("");
  const [email, setEmail] = useState("");
  const socket = useSocket();
  const navigate = useNavigate();
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      console.log({ email, room });
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      console.log(`${email} to room  ${room}`);
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  const handeleLimit = () => {
    toast.error("2 Person are already connected Please join another room");
  };

  useEffect(() => {
    socket.on("user:limit", handeleLimit);
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
      socket.off("user:limit", handeleLimit);
    };
  }, [socket, handleJoinRoom]);

  return (
    <section className="bg-gray-300 dark:bg-gray-900">
      <Toaster position="top-center" reverseOrder={false}></Toaster>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a
          href="/"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <img className="w-20 h-12 mr-2" src={logo} alt="logo" />
          Akhr MEET
        </a>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Lobby
            </h1>

            <form className="space-y-6 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  htmlFor="email"
                >
                  Email Id
                </label>
                <input
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  htmlFor="room"
                >
                  Room No
                </label>
                <input
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="text"
                  id="room"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                />
              </div>
              <button className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Join
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Lobby;
