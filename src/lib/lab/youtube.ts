/** Id de video de YouTube (misma regla que el schema de frontmatter). */
const YOUTUBE_VIDEO_ID_PATTERN = /^[\w-]{6,}$/;

export function isYouTubeVideoId(id: string): boolean {
  return YOUTUBE_VIDEO_ID_PATTERN.test(id);
}

/** URL de embed privacy-enhanced (`youtube-nocookie.com`). */
export function youtubeEmbedUrl(videoId: string): string {
  const id = videoId.trim();
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;
}

/** URL watch para abrir en YouTube (pestaña nueva). */
export function youtubeWatchUrl(videoId: string): string {
  const id = videoId.trim();
  return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
}
