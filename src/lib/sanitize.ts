import DOMPurify from "dompurify";

/**
 * Sanitizes user input and AI responses to prevent XSS attacks.
 * Uses DOMPurify to strip dangerous HTML/script tags.
 */
export function sanitizeText(text: string): string {
  if (typeof window === "undefined") {
    // Server-side: basic sanitization (remove script tags and event handlers)
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
      .replace(/javascript:/gi, "");
  }

  // Client-side: use DOMPurify for comprehensive sanitization
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [], // Strip all HTML tags, keep only text
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // Keep text content
  });
}

/**
 * Sanitizes text but allows basic formatting tags (for markdown-like content).
 * Use this if you want to preserve some formatting in AI responses.
 */
export function sanitizeWithFormatting(text: string): string {
  if (typeof window === "undefined") {
    // Server-side: basic sanitization
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  }

  // Client-side: allow safe formatting tags
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "code", "pre", "br", "p"],
    ALLOWED_ATTR: [],
  });
}
