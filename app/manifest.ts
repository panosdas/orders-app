import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Σύστημα Παραγγελιών",
    short_name: "Παραγγελίες",
    description: "Σύστημα διαχείρισης παραγγελιών εστιατορίου",
    start_url: "/waiter",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F5F5F5",
    theme_color: "#6DD3E3",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
