import { notFound } from "next/navigation";

// Catch-all under /manage/* that calls notFound() so unmatched URLs propagate
// to (manage)/not-found.tsx wrapped by ManageShell — keeps the manage sidebar
// visible instead of falling through to root global-not-found.tsx.
export default function ManageCatchAll() {
  notFound();
}
