import { useState } from "react";
import { Paper, IconButton, TextField, Box, Avatar, Fab } from "@mui/material";
import {
  MinimizeRounded,
  CloseRounded,
  MoreVert,
  Send,
  Message,
} from "@mui/icons-material";
import chatHeaderImage from "../assets/chat.jpg";

interface Message {
  text: string;
  isBot: boolean;
  image?: string;
}

export const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi there!", isBot: true },
    { text: "I'm the Support Bot! 🤖", isBot: true },
    { text: "I'm here to help answer your questions.", isBot: true },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, isBot: false }]);
      setInput("");
      // Add bot response logic here
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isOpen ? (
        <Paper
          elevation={3}
          className="fixed bottom-4 right-4 w-[380px] max-h-[600px] rounded-lg overflow-hidden"
        >
          {/* Header */}
          <Box className="bg-gray-200 text-white p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-black">Chat with us</h2>
            <div className="flex gap-2">
              <IconButton size="small" className="text-white">
                <MoreVert />
              </IconButton>
              <IconButton size="small" className="text-white">
                <MinimizeRounded />
              </IconButton>
              <IconButton
                size="small"
                className="text-white"
                onClick={toggleChat}
              >
                <CloseRounded />
              </IconButton>
            </div>
          </Box>

          {/* Messages */}
          <Box className="h-[400px] overflow-y-auto p-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 mb-4 ${
                  message.isBot ? "" : "justify-end"
                }`}
              >
                {message.isBot && (
                  <Avatar
                    className="bg-blue-600"
                    sx={{ width: 32, height: 32 }}
                  >
                    <img
                      src={chatHeaderImage}
                      alt="Chat Header"
                      className="h-full rounded-lg"
                    />
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 max-w-[70%] ${
                    message.isBot ? "bg-gray-200" : "bg-blue-600 text-white"
                  }`}
                >
                  {message.image ? (
                    <img
                      src={message.image}
                      alt="Chat Header"
                      className="w-full rounded-lg"
                    />
                  ) : (
                    message.text
                  )}
                </div>
              </div>
            ))}
          </Box>

          {/* Input */}
          <Box className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <TextField
                fullWidth
                placeholder="Ask your question here"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                variant="outlined"
                size="small"
              />
              <IconButton
                onClick={handleSend}
                color="primary"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Send />
              </IconButton>
            </div>
          </Box>
        </Paper>
      ) : (
        <div className="fixed bottom-4 right-4">
          <Fab
            color="primary"
            className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700"
            onClick={toggleChat}
          >
            <Message />
          </Fab>
        </div>
      )}
    </>
  );
};
