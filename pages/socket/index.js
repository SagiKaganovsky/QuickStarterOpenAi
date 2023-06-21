import { useEffect, useState } from "react";
import io from "socket.io-client";
import Typewriter from "typewriter-effect";
let socket;

const Socket = () => {
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const socketInitializer = async () => {
    await fetch("/api/socket");
    socket = io();

    socket.on("connect", () => {
      console.log("connected");
      console.log(socket.id);
      setConnected(socket.connected);
    });

    socket.on("disconnect", () => {
      console.log(socket.connected); // false
      setConnected(socket.connected);
    });

    socket.on("receive-message", (msg) => {
      console.log(msg);
      setInput(() => {
        return msg;
      });
    });
  };
  useEffect(() => {
    socketInitializer();
    return () => {
      socket.disconnect();
    };
  }, []);

  const onChangeHandler = (e) => {
    setInput(e.target.value);
  };

  const sendHandler = () => {
    socket.emit("send-message", input);
  };
  const disconnectHandler = () => {
    socket.disconnect();
  };
  const connectHandler = () => {
    socket.connect();
  };
  return (
    <>
      <div>
        <p style={{ color: connected ? "green" : "red" }}>
          {connected ? "connected" : "disconnected"}
        </p>
      </div>
      <input placeholder="Type something" onChange={onChangeHandler} />
      <button onClick={sendHandler}>Send</button>
      <div style={{ color: "white" }}>
        {input && (
          <Typewriter
            component={"p"}
            options={{
              strings: input,
              autoStart: true,
              pauseFor: 600
            }}
          />
        )}
      </div>
      {connected ? (
        <button onClick={disconnectHandler}>Disconnect</button>
      ) : (
        <button onClick={connectHandler}>Connect</button>
      )}
    </>
  );
};

export default Socket;
