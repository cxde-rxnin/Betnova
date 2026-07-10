// Stock photography placeholders (Unsplash) — swap for licensed brand photography during integration.
export const STOCK_IMAGES = {
  heroArena: "https://images.unsplash.com/photo-1504450758481-7338eba7524a",
  heroStadiumNight: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9",
  basketballNet: "https://images.unsplash.com/photo-1546519638-68e109498ffc",
  trackStart: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211",
} as const;

export function unsplashUrl(url: string, width: number, quality = 80) {
  return `${url}?auto=format&fit=crop&w=${width}&q=${quality}`;
}
