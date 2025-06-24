import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [inputName, setInputName] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    socket.on("user_list", (users) => {
      setUsers(users);
    });

    socket.on("user_joined", ({ username }) => {
      console.log(`${username} joined`);
    });

    socket.on("user_left", ({ username }) => {
      console.log(`${username} left`);
    });

    socket.on("typing_users", (typingList) => {
      setTypingUsers(typingList);
    });

    // Fetch past messages
    fetch("http://localhost:5000/api/messages")
      .then((res) => res.json())
      .then((data) => setChat(data));

    return () => socket.disconnect();
  }, []);

  const joinChat = () => {
    if (inputName.trim()) {
      setUsername(inputName);
      socket.emit("user_join", inputName);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("send_message", { message });
      setMessage("");
      socket.emit("typing", false);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", !!e.target.value.trim());
  };

  return (
    <div style={{ padding: "2rem" }}>
      {!username ? (
        <div>
          <h2>Enter Your Username</h2>
          <input
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="Username"
          />
          <button onClick={joinChat}>Join</button>
        </div>
      ) : (
        <div>
          <h2>Welcome {username}</h2>
          <p>Users Online: {users.length}</p>

          <form onSubmit={sendMessage}>
            <input
              value={message}
              onChange={handleTyping}
              placeholder="Type message..."
            />
            <button type="submit">Send</button>
          </form>

          {typingUsers.length > 0 && (
            <p>
              {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing...
            </p>
          )}

          <ul>
            {chat.map((msg) => (
              <li key={msg.id}>
                <strong>{msg.sender}:</strong> {msg.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
