import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App  from "./App";

import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import socketIO from "socket.io-client"
import ChatHome from "./Pages/Home";
import AudioSphere from "./Pages/AudioSphere";

let socketId = localStorage.getItem("socketId");

if (!socketId) {
  socketId = Math.random().toString(36).substring(8);
  localStorage.setItem("socketId", socketId);
}

const socket = socketIO.connect(process.env.REACT_APP_API_SOCKET_URL, {
  query: { socketId },
});

function ErrorBoundary({ error }) {

  return (
    <div className="h-full w-full relative top-1/2 left-1/2 transform -translate-x-1/2 translate-y-3/4">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-semibold text-red-500">404</h1>
        <p className="mb-4 text-lg text-gray-600">Oops! Looks like you're lost.</p>
        <div className="animate-bounce">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            ></path>
          </svg>
        </div>
        <p className="mt-4 text-gray-600 text-base ">
          Let's get you back{" "}
          <a href="/" className="text-blue-500">
            home
          </a>
          .
        </p>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorBoundary />,
  },

  {
    path: "/home",
    element: <ChatHome socket={socket} />,
  },
  {
    path: "/audiosphere",
    element: <AudioSphere  socket={socket} />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
