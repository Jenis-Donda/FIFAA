import React from "react";
import Image from "next/image";

// Types for the rich text structure
type Mark = {
  type: "bold" | "italic" | "underline" | "code";
};

type TextNode = {
  nodeType: "text";
  value: string;
  marks: Mark[];
  data: Record<string, unknown>;
};

type HyperlinkNode = {
  nodeType: "hyperlink";
  data: {
    uri: string;
  };
  content: RichTextNode[];
};

type EmbeddedEntryBlock = {
  nodeType: "embedded-entry-block";
  content: [];
  data: {
    target: {
      bynderImage?: Array<{
        src: string;
        alt?: string;
        description?: string;
        width: number;
        height: number;
        transformBaseUrl?: string;
      }>;
      url?: string;
      title?: string;
      sys?: {
        contentType?: {
          systemProperties?: {
            id: string;
          };
        };
      };
    };
  };
};

type RichTextNode =
  | TextNode
  | HyperlinkNode
  | {
      nodeType: "paragraph" | "heading-2" | "heading-3" | "heading-4" | "heading-5" | "heading-6" | "unordered-list" | "ordered-list" | "list-item" | "hr" | "blockquote";
      content?: RichTextNode[];
      data: Record<string, unknown>;
    }
  | EmbeddedEntryBlock;

type RichTextDocument = {
  nodeType: "document";
  content: RichTextNode[];
  data: Record<string, unknown>;
};

/**
 * Render text node with marks (bold, italic, etc.)
 */
function renderTextNode(node: TextNode): React.ReactElement {
  let content: React.ReactNode = node.value;

  // Apply marks in order
  if (node.marks) {
    node.marks.forEach((mark) => {
      switch (mark.type) {
        case "bold":
          content = <strong key={Math.random()}>{content}</strong>;
          break;
        case "italic":
          content = <em key={Math.random()}>{content}</em>;
          break;
        case "underline":
          content = <u key={Math.random()}>{content}</u>;
          break;
        case "code":
          content = <code key={Math.random()}>{content}</code>;
          break;
      }
    });
  }

  return <span key={Math.random()}>{content}</span>;
}

/**
 * Render hyperlink node - Convert to plain text (no links)
 */
function renderHyperlinkNode(node: HyperlinkNode): React.ReactElement {
  // Just render the content as plain text, no link
  const content = node.content.map((child, index) => renderRichTextNode(child, index));
  return <span key={Math.random()}>{content}</span>;
}

/**
 * Render embedded entry block (images, videos, social media)
 */
function renderEmbeddedEntryBlock(node: EmbeddedEntryBlock): React.ReactElement | null {
  const { target } = node.data;

  // Handle images
  if (target.bynderImage && target.bynderImage.length > 0) {
    const image = target.bynderImage[0];
    const imageSrc = image.transformBaseUrl || image.src;
    const imageAlt = image.alt || target.title || "Article image";
    const imageDescription = image.description || "";

    return (
      <figure key={Math.random()} className="my-8">
        <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            unoptimized
          />
        </div>
        {imageDescription && (
          <figcaption className="mt-3 text-sm text-content-secondary italic">
            {imageDescription}
          </figcaption>
        )}
      </figure>
    );
  }

  // Handle social media posts (Twitter/X, etc.) - Render as plain text, no link
  if (target.url && target.sys?.contentType?.systemProperties?.id === "socialMediaPost") {
    // Just render as plain text, no link
    return null; // Remove social media posts entirely, or you could render title if available
  }

  // Handle videos
  if (target.sys?.contentType?.systemProperties?.id === "video") {
    return (
      <div key={Math.random()} className="my-6 p-4 bg-surface-200 rounded-lg">
        <p className="text-content-secondary">
          Video: {target.title || "Video content"}
        </p>
      </div>
    );
  }

  return null;
}

/**
 * Recursively render rich text nodes
 */
function renderRichTextNode(node: RichTextNode, index: number = 0): React.ReactElement | null {
  switch (node.nodeType) {
    case "text":
      return renderTextNode(node as TextNode);

    case "hyperlink":
      // Convert hyperlink to plain text (no link functionality)
      return renderHyperlinkNode(node as HyperlinkNode);

    case "paragraph":
      const paragraphContent = (node.content || []).map((child, idx) =>
        renderRichTextNode(child, idx)
      );
      return (
        <p key={index} className="mb-4 text-base lg:text-lg text-content-secondary leading-relaxed">
          {paragraphContent}
        </p>
      );

    case "heading-2":
      const h2Content = (node.content || []).map((child, idx) =>
        renderRichTextNode(child, idx)
      );
      return (
        <h2 key={index} className="text-2xl lg:text-3xl font-bold text-navy-950 mt-8 mb-4">
          {h2Content}
        </h2>
      );

    case "heading-3":
      const h3Content = (node.content || []).map((child, idx) =>
        renderRichTextNode(child, idx)
      );
      return (
        <h3 key={index} className="text-xl lg:text-2xl font-bold text-navy-950 mt-6 mb-3">
          {h3Content}
        </h3>
      );

    case "heading-4":
      const h4Content = (node.content || []).map((child, idx) =>
        renderRichTextNode(child, idx)
      );
      return (
        <h4 key={index} className="text-lg lg:text-xl font-bold text-navy-950 mt-5 mb-2">
          {h4Content}
        </h4>
      );

    case "unordered-list":
      const ulContent = (node.content || []).map((child, idx) =>
        renderRichTextNode(child, idx)
      );
      return (
        <ul key={index} className="mb-4 pl-6 list-disc space-y-2">
          {ulContent}
        </ul>
      );

    case "ordered-list":
      const olContent = (node.content || []).map((child, idx) =>
        renderRichTextNode(child, idx)
      );
      return (
        <ol key={index} className="mb-4 pl-6 list-decimal space-y-2">
          {olContent}
        </ol>
      );

    case "list-item":
      const liContent = (node.content || []).map((child, idx) =>
        renderRichTextNode(child, idx)
      );
      return (
        <li key={index} className="mb-2 text-base lg:text-lg text-content-secondary leading-relaxed">
          {liContent}
        </li>
      );

    case "blockquote":
      const blockquoteContent = (node.content || []).map((child, idx) =>
        renderRichTextNode(child, idx)
      );
      return (
        <blockquote
          key={index}
          className="border-l-4 border-brand-blue pl-4 italic my-6 text-content-secondary"
        >
          {blockquoteContent}
        </blockquote>
      );

    case "hr":
      return <hr key={index} className="my-8 border-t border-gray-300" />;

    case "embedded-entry-block":
      return renderEmbeddedEntryBlock(node as EmbeddedEntryBlock);

    default:
      // Fallback for unknown node types
      if ("content" in node && Array.isArray(node.content)) {
        const fallbackContent = node.content.map((child, idx) =>
          renderRichTextNode(child, idx)
        );
        return <div key={index}>{fallbackContent}</div>;
      }
      return null;
  }
}

/**
 * Parse and render rich text document
 */
export function parseRichText(richtext: RichTextDocument | null | undefined): React.ReactElement | null {
  if (!richtext || !richtext.content || !Array.isArray(richtext.content)) {
    return null;
  }

  return (
    <div className="rich-text-content">
      {richtext.content.map((node, index) => renderRichTextNode(node, index))}
    </div>
  );
}

