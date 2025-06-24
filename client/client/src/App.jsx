import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on('message', (data) => {
      setChat((prev) => [...prev, data]);
    });
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('message', message);
      setMessage('');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Real-Time Chat</h2>
      <form onSubmit={sendMessage}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
        />
        <button type="submit">Send</button>
      </form>
      <ul>
        {chat.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
