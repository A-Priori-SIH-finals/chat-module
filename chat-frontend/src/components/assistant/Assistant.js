import React, { useState, useEffect } from "react";
import axios from "axios";
import socket from "../../socket";
import "./Assistant.css";
import { Fab, Avatar } from "@mui/material";
import Chatbox from "../Chatbox/Chatbox"; // Assuming the component's actual name is Chatbox

const Assistant = ({ user, chat, setChat }) => {
  // Speech Recognition initialization
  let recognizer;
  if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    recognizer = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  } else {
    console.error('Speech recognition not supported');
    // Handle unsupported speech recognition
  }

  const [activate, setActivate] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isNyraSpeaking, setIsNyraSpeaking] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let utterance = new SpeechSynthesisUtterance(); // Define utterance here

    recognizer.onstart = () => {
      console.log("Started Listening...");
    };
    recognizer.onend = () => {
      console.log("Stopped Listening...");
    };
    recognizer.onresult = (e) => {
      setIsListening(false);
      const message = e.results[0][0].transcript;
      const url = `http://localhost:8000/api/send-message/${user._id}`;
      socket.emit("sendMessage", { userId: user._id, message });
      const newMessage = { isAdmin: false, content: message };
      axios
        .post(url, newMessage)
        .then((response) => {
          setMessage("");
          console.log(response, "response");
        })
        .catch((error) => {
          console.log(error, "Error");
        });
      setChat((messages) => [...messages, newMessage]);
    };

    window.speechSynthesis.onvoiceschanged = () => {
      const voices = window.speechSynthesis.getVoices();
      utterance.voice = voices[12];
    };
    utterance.onstart = () => {
      setIsNyraSpeaking(true);
    };
    utterance.onend = () => {
      setIsNyraSpeaking(false);
    };
  }, [user, setChat]);

  useEffect(() => {
    if (isListening) recognizer.start();
    else recognizer.stop();
  }, [isListening]);

  const handlemessageSubmit = (e) => {
    e.preventDefault();
    const url = `http://localhost:8000/api/send-message/${user._id}`;
    socket.emit("sendMessage", { userId: user._id, message });
    const newMessage = { isAdmin: false, content: message };
    axios
      .post(url, newMessage)
      .then((response) => {
        setMessage("");
        console.log(response, "response");
      })
      .catch((error) => {
        console.log(error, "Error");
      });
    setChat((messages) => [...messages, newMessage]);
  };

  return (
    <div className="assistant">
      <Fab
        className="assistant__toggle"
        onClick={() => setActivate((activate) => !activate)}
        tabIndex={0}
      >
        <Avatar
          src={"https://avatars.dicebear.com/api/avataaars/2.svg"}
          alt=""
        />
      </Fab>
      <Chatbox
        user={user}
        message={message}
        setMessage={setMessage}
        isListening={isListening}
        setIsListening={setIsListening}
        isNyraSpeaking={isNyraSpeaking}
        setActivate={setActivate}
        messages={chat}
        handlemessageSubmit={handlemessageSubmit}
        style={
          activate
            ? { width: "300px", height: "400px" }
            : { width: "0px", height: "0px" }
        }
      />
    </div>
  );
};

export default Assistant;
