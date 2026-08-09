import { describe, expect, it } from "vitest";
import { isYouTubeVideoId, youtubeEmbedUrl, youtubeWatchUrl } from "./youtube";

describe("isYouTubeVideoId", () => {
  it("acepta ids típicos de YouTube", () => {
    expect(isYouTubeVideoId("rWGBVo9qDEg")).toBe(true);
    expect(isYouTubeVideoId("dQw4w9WgXcQ")).toBe(true);
  });

  it("rechaza cadenas cortas o con espacios", () => {
    expect(isYouTubeVideoId("abc")).toBe(false);
    expect(isYouTubeVideoId("bad id!!")).toBe(false);
  });
});

describe("youtubeEmbedUrl / youtubeWatchUrl", () => {
  it("construye embed nocookie y watch", () => {
    expect(youtubeEmbedUrl("rWGBVo9qDEg")).toBe(
      "https://www.youtube-nocookie.com/embed/rWGBVo9qDEg"
    );
    expect(youtubeWatchUrl("rWGBVo9qDEg")).toBe(
      "https://www.youtube.com/watch?v=rWGBVo9qDEg"
    );
  });
});
