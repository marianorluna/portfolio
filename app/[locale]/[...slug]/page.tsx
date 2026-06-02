import { notFound } from "next/navigation";

/** Rutas bajo /{locale}/* sin página definida → 404 localizado. */
export default function LocaleCatchAllPage() {
  notFound();
}
