export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildEventSlug(name: string) {
  const base = slugify(name) || "evento";
  const suffix = Math.random().toString(36).slice(2, 8);

  return `${base}-${suffix}`;
}
