import { SpotifySong } from "@/types/song";
const eventTypes = [
  { value: "wedding", label: "Wedding" },
  { value: "bar-mitzvah", label: "Bar Mitzvah" },
  { value: "party", label: "Party" },
  { value: "corporate", label: "Corporate Event" },
  { value: "birthday", label: "Birthday" },
]

async function getDynamicGenres(): Promise<{ value: string; label: string }[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/genres`);
  if (!res.ok) {
    throw new Error("Failed to fetch genres");
  }
  return await res.json();
}

export { eventTypes, getDynamicGenres };