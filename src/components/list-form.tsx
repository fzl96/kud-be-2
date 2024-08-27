"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchInput } from "@/components/main/search-input";

export function ListForm({ className }: { className?: string }) {
  return (
    <form className={cn("grid w-full items-start gap-6", className)}>
      <fieldset className="grid gap-6 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">Settings</legend>
        <div className="grid gap-3">
          <Label htmlFor="ani-search">Search Anime</Label>
          {/* <CommandMenu /> */}
          <SearchInput />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="model">Model</Label>
          <Select>
            <SelectTrigger
              id="model"
              className="items-start [&_[data-description]]:hidden"
            >
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="genesis">
                <div className="flex items-start gap-3 text-muted-foreground">
                  <div className="grid gap-0.5">
                    <p>
                      Neural{" "}
                      <span className="font-medium text-foreground">
                        Genesis
                      </span>
                    </p>
                    <p className="text-xs" data-description>
                      Our fastest model for general use cases.
                    </p>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="explorer">
                <div className="flex items-start gap-3 text-muted-foreground">
                  <div className="grid gap-0.5">
                    <p>
                      Neural{" "}
                      <span className="font-medium text-foreground">
                        Explorer
                      </span>
                    </p>
                    <p className="text-xs" data-description>
                      Performance and speed for efficiency.
                    </p>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="quantum">
                <div className="flex items-start gap-3 text-muted-foreground">
                  <div className="grid gap-0.5">
                    <p>
                      Neural{" "}
                      <span className="font-medium text-foreground">
                        Quantum
                      </span>
                    </p>
                    <p className="text-xs" data-description>
                      The most powerful model for complex computations.
                    </p>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="temperature">Temperature</Label>
          <Input id="temperature" type="number" placeholder="0.4" />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="top-p">Top P</Label>
          <Input id="top-p" type="number" placeholder="0.7" />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="top-k">Top K</Label>
          <Input id="top-k" type="number" placeholder="0.0" />
        </div>
      </fieldset>
      <fieldset className="grid gap-6 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">Messages</legend>
        <div className="grid gap-3">
          <Label htmlFor="role">Role</Label>
          <Select defaultValue="system">
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="assistant">Assistant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </fieldset>
    </form>
  );
}
