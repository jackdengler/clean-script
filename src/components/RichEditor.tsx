import { useRef, useState } from 'react';
import { LexicalComposer, type InitialConfigType } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';
import {
  ListItemNode,
  ListNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';
import { CodeNode } from '@lexical/code';
import {
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  type EditorState,
} from 'lexical';

interface Props {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

const theme = {
  paragraph: 'editor-paragraph',
  list: {
    ul: 'editor-ul',
    ol: 'editor-ol',
    listitem: 'editor-li',
  },
  text: {
    bold: 'font-semibold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    code: 'font-mono',
  },
};

export function RichEditor({ value, onChange, placeholder }: Props) {
  const firstChangeSkipped = useRef(false);

  const initialConfig: InitialConfigType = {
    namespace: 'tab-editor',
    theme,
    onError(err) {
      console.error('Lexical error', err);
    },
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode],
    editorState: () => $convertFromMarkdownString(value, TRANSFORMERS),
  };

  function handleChange(state: EditorState) {
    if (!firstChangeSkipped.current) {
      firstChangeSkipped.current = true;
      return;
    }
    state.read(() => {
      const md = $convertToMarkdownString(TRANSFORMERS);
      onChange(md);
    });
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative pb-36">
        <RichTextPlugin
          contentEditable={<ContentEditable className="rich-editor" />}
          placeholder={
            <div className="pointer-events-none absolute top-3 left-4 text-neutral-400">
              {placeholder ?? 'Start typing…'}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <TabIndentationPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
      </div>
      <Toolbar />
    </LexicalComposer>
  );
}

function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [collapsed, setCollapsed] = useState(false);
  const btn = 'text-sm px-2.5 py-1.5 rounded-md bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300 transition-colors';

  // Sits above the fixed bottom nav (~44px) so it doesn't overlap nav links.
  const wrapperBase = 'fixed left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-neutral-200 px-3 py-2';
  const wrapperStyle = {
    bottom: 'calc(44px + env(safe-area-inset-bottom))',
    paddingBottom: '0.5rem',
  } as const;

  if (collapsed) {
    return (
      <div className={`${wrapperBase} flex justify-end`} style={wrapperStyle}>
        <button
          type="button"
          className={btn}
          aria-label="Show formatting toolbar"
          aria-expanded="false"
          onClick={() => setCollapsed(false)}
        >
          Aa ▴
        </button>
      </div>
    );
  }

  return (
    <div className={`${wrapperBase} flex flex-wrap items-center gap-1`} style={wrapperStyle}>
      <button
        type="button"
        className={`${btn} font-semibold`}
        aria-label="Bold"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      >
        B
      </button>
      <button
        type="button"
        className={`${btn} italic`}
        aria-label="Italic"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        I
      </button>
      <div className="w-px bg-neutral-200 mx-1 self-stretch" />
      <button
        type="button"
        className={btn}
        aria-label="Bulleted list"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
      >
        • List
      </button>
      <button
        type="button"
        className={btn}
        aria-label="Numbered list"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
      >
        1. List
      </button>
      <div className="w-px bg-neutral-200 mx-1 self-stretch" />
      <button
        type="button"
        className={btn}
        aria-label="Outdent"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}
      >
        ←
      </button>
      <button
        type="button"
        className={btn}
        aria-label="Indent"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}
      >
        →
      </button>
      <button
        type="button"
        className={`${btn} ml-auto`}
        aria-label="Hide formatting toolbar"
        aria-expanded="true"
        onClick={() => setCollapsed(true)}
      >
        ▾
      </button>
    </div>
  );
}
