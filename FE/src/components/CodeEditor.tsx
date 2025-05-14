import { useState } from "react";
import { Paper, IconButton, Box, Button } from "@mui/material";
import {
  MinimizeRounded,
  CloseRounded,
  PlayArrow,
  ContentCopy,
} from "@mui/icons-material";
import MonacoEditor from "@monaco-editor/react";

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  onSubmit?: (code: string) => void;
}

export const CodeEditor = ({
  initialCode = "// Write your code here",
  language = "javascript",
  onSubmit,
}: CodeEditorProps) => {
  const [code, setCode] = useState(initialCode);
  const [isOpen, setIsOpen] = useState(true);

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(code);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <Paper
      elevation={3}
      className="fixed bottom-4 right-4 w-[600px] max-h-[800px] rounded-lg overflow-hidden"
    >
      {/* Header */}
      <Box className="bg-gray-200 p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Code Editor</h2>
        <div className="flex gap-2">
          <IconButton size="small">
            <MinimizeRounded />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setIsOpen(!isOpen)}
          >
            <CloseRounded />
          </IconButton>
        </div>
      </Box>

      {/* Editor */}
      <Box className="h-[500px]">
        <MonacoEditor
          height="100%"
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
          }}
        />
      </Box>

      {/* Actions */}
      <Box className="p-4 bg-white border-t flex justify-between items-center">
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700"
        >
          Run Code
        </Button>
        <Button
          variant="outlined"
          startIcon={<ContentCopy />}
          onClick={handleCopy}
        >
          Copy Code
        </Button>
      </Box>
    </Paper>
  );
}; 