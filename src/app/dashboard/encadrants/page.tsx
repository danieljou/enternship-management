import type { Metadata } from "next";

import { getEncadrants } from "./actions";
import { EncadrantsManager } from "./encadrants-manager";

export const metadata: Metadata = {
  title: "Encadrants - FUTURIX-iTech",
};

export default async function EncadrantsPage() {
  const data = await getEncadrants();

  return <EncadrantsManager data={data} />;
}
