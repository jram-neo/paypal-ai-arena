import { createFileRoute } from "@tanstack/react-router";
import { Arena } from "@/components/arena/Arena";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agent Arena — AI shop-manager showdown" },
      { name: "description", content: "Three AI agents run the same simulated shop for a week. Compare revenue, compliance and decisions." },
      { property: "og:title", content: "Agent Arena — AI shop-manager showdown" },
      { property: "og:description", content: "Three AI agents run the same simulated shop for a week. Compare revenue, compliance and decisions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Arena,
});
