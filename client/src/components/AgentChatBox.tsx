import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot } from "lucide-react";

export default function AgentChatBox() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      console.log("Sending to agent:", message);
      //todo: remove mock functionality - integrate with actual agent
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="p-4 bg-primary/5 border-primary/20">
      <div className="flex gap-3 items-center">
        <div className="flex items-center gap-2 text-primary">
          <Bot className="h-5 w-5" />
          <span className="font-medium text-sm">AI Assistant</span>
        </div>
        <div className="flex-1 flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your tasks..."
            className="flex-1"
            data-testid="input-agent-message"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            data-testid="button-send-agent"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
