import { FormEvent, RefObject } from "react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
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
  return (
    <form onSubmit={onSubmit} className="border-t border-glass-border p-4">
      <div className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask ${agentName} anything...`}
          disabled={isLoading}
          className="glass-input flex-1 rounded-2xl px-5 py-3.5 text-sm text-text-primary placeholder-text-tertiary outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`press-scale rounded-2xl bg-gradient-to-r ${btnGradient} px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-40 disabled:hover:translate-y-0`}
        >
          Send ({price})
        </button>
      </div>
    </form>
  );
}
