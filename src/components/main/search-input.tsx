"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { Loader } from "lucide-react";
import type { Anime } from "@/lib/types/anime";

import { type DialogProps } from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "@/components/ui/command";

export function SearchInput({ ...props }: DialogProps) {
  const [search, setSearch] = useState("");
  const [value] = useDebounce(search, 1000);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery<Anime[]>({
    queryKey: ["search", value],
    queryFn: () => fetch(`/api/anime?query=${value}`).then((res) => res.json()),
    enabled: !!value,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback(() => {
    setOpen(false);
    // TODO: Add item to store
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12",
        )}
        onClick={() => setOpen(true)}
        type="button"
        {...props}
      >
        <span className="hidden lg:inline-flex">Search documentation...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type to search..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          {isLoading && (
            <CommandLoading>
              <div className="flex justify-center p-5">
                <Loader className="animate-spin" />
              </div>
            </CommandLoading>
          )}
          <CommandGroup heading="Anime">
            {data?.map((anime) => (
              <CommandItem key={anime.mal_id} onSelect={() => runCommand()}>
                {anime.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
