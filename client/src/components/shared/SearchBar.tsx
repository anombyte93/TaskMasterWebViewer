import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  className = "",
}) => {
  // Internal state for immediate UI updates
  const [internalValue, setInternalValue] = React.useState(value);

  // Sync internal value when external value changes
  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounced onChange callback
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [internalValue, debounceMs, onChange, value]);

  const handleClear = () => {
    setInternalValue("");
    onChange("");
  };

  return (
    <div className={cn("relative", className)}>
      {/* Search Icon */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

      {/* Input Field - 44px height for touch accessibility (WCAG 2.5.5) */}
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex h-11 w-full rounded-lg border border-input bg-background",
          "pl-10 pr-12 py-2 text-sm",
          "transition-colors",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      />

      {/* Clear Button - 44x44px touch target */}
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            "absolute right-1 top-1/2 -translate-y-1/2",
            "min-h-[44px] min-w-[44px] flex items-center justify-center",
            "text-muted-foreground hover:text-foreground",
            "transition-colors cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
          )}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

SearchBar.displayName = "SearchBar";
