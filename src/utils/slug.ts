export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .replace(/-+/g, "-");
}

export function deslugify(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())
    .trim();
}

export default slugify;
