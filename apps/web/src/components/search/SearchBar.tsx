import { Loader2, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isFetching?: boolean;
}

export function SearchBar({ value, onChange, isFetching }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebouncedValue(localValue, 300);
  const lastEmittedRef = useRef(value);

  useEffect(() => {
    if (value === lastEmittedRef.current) {
      return;
    }

    lastEmittedRef.current = value;
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue === lastEmittedRef.current) {
      return;
    }

    lastEmittedRef.current = debouncedValue;
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={localValue}
        onChange={(event) => setLocalValue(event.target.value)}
        placeholder="Search by name, skills, or summary..."
        className="pl-10"
        aria-label="Search profiles"
        autoComplete="off"
      />
      {isFetching ? (
        <Loader2
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
