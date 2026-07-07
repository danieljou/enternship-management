import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FUTURIX-iTech - Suivi des stagiaires",
    short_name: "FUTURIX-iTech",
    description: "Plateforme de suivi des stagiaires, établissements et filières.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#166534",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
