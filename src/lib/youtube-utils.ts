/**
 * Robust URL and Handle parser for YouTube inputs.
 * Handles full URLs, share links, handles with/without @, and channel IDs.
 */
export function cleanYouTubeInput(input: string): {
  type: 'handle' | 'channelId' | 'query';
  value: string;
} {
  let cleaned = input.trim();

  // Strip accidental leading @ if followed by http/url
  if (cleaned.startsWith('@http') || cleaned.startsWith('@www')) {
    cleaned = cleaned.replace(/^@+/, '');
  }

  // Remove query parameters like ?si=... or ?feature=shared
  try {
    if (cleaned.includes('youtube.com') || cleaned.includes('youtu.be')) {
      if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
        cleaned = 'https://' + cleaned;
      }
      const url = new URL(cleaned);
      const pathname = url.pathname;

      // Match: /@handle
      const handleMatch = pathname.match(/\/@([a-zA-Z0-9_.-]+)/);
      if (handleMatch) {
        return { type: 'handle', value: `@${handleMatch[1]}` };
      }

      // Match: /channel/UC...
      const channelMatch = pathname.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/);
      if (channelMatch) {
        return { type: 'channelId', value: channelMatch[1] };
      }

      // Match: /c/name or /user/name
      const customMatch = pathname.match(/\/(?:c|user)\/([a-zA-Z0-9_.-]+)/);
      if (customMatch) {
        return { type: 'query', value: customMatch[1] };
      }
    }
  } catch (err) {
    // If URL parsing fails, continue to string fallback
  }

  // Strip query string if present in raw text (e.g. @name?si=123)
  cleaned = cleaned.split(/[?#/]/)[0];

  // If it's a handle
  if (cleaned.startsWith('@')) {
    return { type: 'handle', value: cleaned };
  }

  // If it's a raw channel ID (UC followed by 22 chars)
  if (cleaned.startsWith('UC') && cleaned.length === 24) {
    return { type: 'channelId', value: cleaned };
  }

  // If it starts with common handle characters without @
  if (/^[a-zA-Z0-9_.-]+$/.test(cleaned)) {
    return { type: 'handle', value: `@${cleaned}` };
  }

  return { type: 'query', value: cleaned };
}
