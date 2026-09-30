/**
 * Video URL helper utilities for embedding and previewing video links
 */

export interface VideoInfo {
  type: 'youtube' | 'drive' | 'vimeo' | 'loom' | 'direct' | 'other';
  embedUrl: string | null;
  thumbnailUrl: string | null;
  videoId: string | null;
}

export function parseVideoUrl(url: string): VideoInfo {
  if (!url || typeof url !== 'string') {
    return { type: 'other', embedUrl: null, thumbnailUrl: null, videoId: null };
  }

  const cleanUrl = url.trim();

  // YouTube standard and shorts
  // Matches: youtube.com/watch?v=xxx, youtu.be/xxx, youtube.com/shorts/xxx, youtube.com/embed/xxx
  const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  // Google Drive
  // Matches: drive.google.com/file/d/xxx/view, drive.google.com/open?id=xxx
  const driveMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i) ||
                     cleanUrl.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      type: 'drive',
      videoId: fileId,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      thumbnailUrl: null,
    };
  }

  // Vimeo
  const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
  if (vimeoMatch && vimeoMatch[3]) {
    const vimeoId = vimeoMatch[3];
    return {
      type: 'vimeo',
      videoId: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      thumbnailUrl: null,
    };
  }

  // Loom
  const loomMatch = cleanUrl.match(/loom\.com\/share\/([a-zA-Z0-9]+)/i);
  if (loomMatch && loomMatch[1]) {
    const loomId = loomMatch[1];
    return {
      type: 'loom',
      videoId: loomId,
      embedUrl: `https://www.loom.com/embed/${loomId}`,
      thumbnailUrl: null,
    };
  }

  // Direct MP4 / WebM
  if (cleanUrl.match(/\.(mp4|webm|ogg)($|\?)/i)) {
    return {
      type: 'direct',
      videoId: null,
      embedUrl: cleanUrl,
      thumbnailUrl: null,
    };
  }

  return {
    type: 'other',
    videoId: null,
    embedUrl: cleanUrl.startsWith('http') ? cleanUrl : null,
    thumbnailUrl: null,
  };
}
