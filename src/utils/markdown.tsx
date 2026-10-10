import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface FormattedMessageProps {
  content: string;
  onMentionClick?: (handle: string) => void;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, onMentionClick }) => {
  // Split content by code blocks first
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {renderInlineAndBlocks(content.substring(lastIndex, match.index), onMentionClick)}
        </span>
      );
    }

    const language = match[1] || 'code';
    const code = match[2];
    parts.push(
      <CodeBlock key={`code-${match.index}`} language={language} code={code} />
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>
        {renderInlineAndBlocks(content.substring(lastIndex), onMentionClick)}
      </span>
    );
  }

  return <div className="space-y-1.5 leading-relaxed text-sm break-words">{parts}</div>;
};

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-lg overflow-hidden border border-slate-700/60 bg-slate-900/90 shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 text-xs text-slate-400 font-mono border-b border-slate-700/50">
        <span className="uppercase text-[10px] tracking-wider text-slate-300 font-semibold">
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-slate-200 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-700/50"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 text-xs font-mono overflow-x-auto text-slate-200 leading-normal">
        <code>{code}</code>
      </pre>
    </div>
  );
};

function renderInlineAndBlocks(
  text: string,
  onMentionClick?: (handle: string) => void
): React.ReactNode {
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    // Blockquote
    if (line.startsWith('> ')) {
      return (
        <blockquote
          key={lineIdx}
          className="border-l-2 border-indigo-400/70 pl-3 my-1 italic text-slate-300 text-xs"
        >
          {parseInlineText(line.slice(2), onMentionClick)}
        </blockquote>
      );
    }

    // Bullet item
    if (line.match(/^(\*|-)\s+/)) {
      const itemText = line.replace(/^(\*|-)\s+/, '');
      return (
        <div key={lineIdx} className="flex items-start gap-2 my-0.5 ml-2">
          <span className="text-indigo-400 mt-1 text-[8px]">•</span>
          <span>{parseInlineText(itemText, onMentionClick)}</span>
        </div>
      );
    }

    // Numbered item
    if (line.match(/^\d+\.\s+/)) {
      const numMatch = line.match(/^(\d+)\.\s+/);
      const num = numMatch ? numMatch[1] : '1';
      const itemText = line.replace(/^\d+\.\s+/, '');
      return (
        <div key={lineIdx} className="flex items-start gap-2 my-0.5 ml-2">
          <span className="text-indigo-400 text-xs font-medium">{num}.</span>
          <span>{parseInlineText(itemText, onMentionClick)}</span>
        </div>
      );
    }

    // Empty line creates break
    if (line.trim() === '') {
      return <div key={lineIdx} className="h-1.5" />;
    }

    return (
      <p key={lineIdx} className="my-0.5">
        {parseInlineText(line, onMentionClick)}
      </p>
    );
  });
}

function parseInlineText(
  text: string,
  onMentionClick?: (handle: string) => void
): React.ReactNode {
  // Regex to match:
  // 1. `inline code`
  // 2. **bold**
  // 3. *italic*
  // 4. @mention
  // 5. [link text](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|@\w+|\[[^\]]+\]\([^)]+\))/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="bg-slate-800/80 text-indigo-300 font-mono text-[12px] px-1.5 py-0.5 rounded border border-slate-700/50"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-200">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('@')) {
      const handle = token.slice(1);
      parts.push(
        <button
          key={match.index}
          onClick={() => onMentionClick?.(handle)}
          className="inline-flex items-center text-indigo-300 hover:text-indigo-200 bg-indigo-500/15 hover:bg-indigo-500/25 px-1.5 py-0.5 rounded font-medium text-xs transition-colors mx-0.5"
        >
          {token}
        </button>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline inline-flex items-center"
          >
            {linkMatch[1]}
          </a>
        );
      }
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}
