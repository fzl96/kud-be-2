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
  CommandEmpty,
} from "@/components/ui/command";
import Image from "next/image";

export function SearchInput({ ...props }: DialogProps) {
  const [search, setSearch] = useState("");
  const [value] = useDebounce(search, 300);
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

  const runCommand = useCallback((anime: Anime) => {
    setOpen(false);
    // TODO: Add item to store
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative w-full justify-start rounded-[0.5rem] text-sm font-normal text-muted-foreground shadow-none sm:pr-12",
        )}
        onClick={() => setOpen(true)}
        type="button"
        {...props}
      >
        <span className="hidden lg:inline-flex">Search anime...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.6rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type to search..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList className="scrollbar py-2">
          {!isLoading && <CommandEmpty>Type to search</CommandEmpty>}
          {isLoading && (
            <CommandLoading>
              <div className="flex justify-center p-5">
                <Loader className="animate-spin" />
              </div>
            </CommandLoading>
          )}

          <CommandGroup>
            {data?.map((anime) => (
              <CommandItem
                key={anime.mal_id}
                onSelect={() => runCommand(anime)}
                className="group flex cursor-pointer items-start gap-2"
                value={anime.title}
              >
                <Item anime={anime} />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

function Item({ anime }: { anime: Anime }) {
  console.log(anime.aired);
  return (
    <>
      <div className="h-[80px] w-[100px] overflow-hidden rounded-sm transition-all duration-150 group-hover:h-[150px]">
        <Image
          src={anime.images.webp.image_url}
          alt={anime.title}
          width={100}
          height={80}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="max-w-80 space-y-1">
        <p className="group-hover:text-base group-hover:font-semibold">
          <span>{anime.title}</span>
          <span className="hidden font-normal group-hover:block">
            ({anime.type})
          </span>
        </p>
        <div className="group-hover:hidden">
          ({anime.type}, {anime.year ?? "?"})
        </div>
        <div className="hidden flex-col group-hover:flex">
          <span>Aired: {anime.aired.string}</span>
          <span>Score: {anime.score}</span>
          <span>Status: {anime.status}</span>
        </div>
      </div>
    </>
  );
}
