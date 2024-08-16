import { Settings, Share } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { ListForm } from "@/components/list-form";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
      <h1 className="text-xl font-semibold">Mulberry</h1>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Settings className="size-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>Configuration</DrawerTitle>
            <DrawerDescription>
              Configure the settings for the model and messages.
            </DrawerDescription>
          </DrawerHeader>
          <ListForm className="overlflow-auto p-4 pt-0" />
        </DrawerContent>
      </Drawer>
      <div className="ml-auto flex items-center gap-2">
        <ModeToggle />
        {/* TODO: make share button functional */}
        <Button variant="outline" className="ml-auto gap-1.5 text-sm">
          <Share className="h-4 w-4" />
          Share
        </Button>
      </div>
    </header>
  );
}
