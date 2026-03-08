import { RefObject } from "react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  agentName: string;
  price: string;
  btnGradient: string;
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  isLoading,
  inputRef,
  agentName,
  price,
  btnGradient,
}: ChatInputProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSubmit();
      }
    }
  }

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="border-t border-glass-border p-4"
    >
      <div className="flex items-end gap-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={`Ask ${agentName} anything… (Enter to send, Shift+Enter for new line)`}
          disabled={isLoading}
          rows={1}
          className="glass-input flex-1 resize-none overflow-hidden rounded-2xl px-5 py-3.5 text-sm text-text-primary placeholder-text-tertiary outline-none"
          style={{ maxHeight: "120px" }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`press-scale shrink-0 rounded-2xl bg-gradient-to-r ${btnGradient} px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-40 disabled:hover:translate-y-0`}
        >
          Send ({price})
        </button>
      </div>
    </form>
  );
}
