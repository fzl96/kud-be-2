import { type Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { ListForm } from "@/components/list-form";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Share Your Favorite Anime",
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Header />
      <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          className="relative hidden flex-col items-start gap-8 md:flex"
          x-chunk="dashboard-03-chunk-0"
        >
          <ListForm />
        </div>
        <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
          <Badge variant="outline" className="absolute right-3 top-3">
            Output
          </Badge>
          <div className="flex-1" />

          {/* TODO: add the image component */}
        </div>
      </main>
    </div>
  );
}
