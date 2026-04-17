import { useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';

const MONACO_OPTIONS = {
  fontSize: 14,
  fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
  fontLigatures: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  lineNumbers: 'on',
  renderLineHighlight: 'line',
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  smoothScrolling: true,
  tabSize: 4,
  wordWrap: 'off',
  automaticLayout: true,
  padding: { top: 12, bottom: 12 },
  scrollbar: {
    vertical: 'auto',
    horizontal: 'auto',
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
  },
  suggest: { showWords: false },
};

// Custom dark theme matching our zinc design system
const ACADEMY_THEME = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment',        foreground: '546e7a', fontStyle: 'italic' },
    { token: 'keyword',        foreground: 'c792ea' },
    { token: 'keyword.control', foreground: 'c792ea' },
    { token: 'string',         foreground: 'c3e88d' },
    { token: 'number',         foreground: 'f78c6c' },
    { token: 'delimiter',      foreground: '89ddff' },
    { token: 'operator',       foreground: '89ddff' },
    { token: 'type',           foreground: 'ffcb6b' },
    { token: 'identifier',     foreground: 'eeffff' },
    { token: 'function',       foreground: '82aaff' },
    { token: 'variable',       foreground: 'eeffff' },
    { token: 'constant',       foreground: 'f78c6c' },
    { token: 'tag',            foreground: 'f07178' },
    { token: 'attribute.name', foreground: 'ffcb6b' },
  ],
  colors: {
    'editor.background':                '#09090b',
    'editor.foreground':                '#eeffff',
    'editor.lineHighlightBackground':   '#18181b',
    'editor.selectionBackground':       '#6366f140',
    'editor.inactiveSelectionBackground': '#6366f120',
    'editorCursor.foreground':          '#6366f1',
    'editorLineNumber.foreground':      '#3f3f46',
    'editorLineNumber.activeForeground': '#a1a1aa',
    'editorIndentGuide.background':     '#27272a',
    'editorIndentGuide.activeBackground': '#3f3f46',
    'editor.selectionHighlightBackground': '#6366f120',
    'editorBracketMatch.background':    '#6366f130',
    'editorBracketMatch.border':        '#6366f150',
    'scrollbar.shadow':                 '#00000000',
    'scrollbarSlider.background':       '#52525b40',
    'scrollbarSlider.hoverBackground':  '#6366f180',
    'scrollbarSlider.activeBackground': '#6366f1',
  },
};

export default function MonacoEditor({ value, onChange, language = 'cpp', height = '100%' }) {
  const editorRef = useRef(null);

  const handleMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    // Define custom theme
    monaco.editor.defineTheme('academy-dark', ACADEMY_THEME);
    monaco.editor.setTheme('academy-dark');

    // Add Ctrl+Enter keybinding (handled at parent level, but this prevents default)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      // Dispatched event will be caught by parent
      window.dispatchEvent(new CustomEvent('editor:run'));
    });

    editor.focus();
  }, []);

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={onChange}
      onMount={handleMount}
      options={MONACO_OPTIONS}
      theme="vs-dark"
      loading={
        <div className="flex items-center justify-center h-full bg-surface-950">
          <div className="text-sm text-surface-500">Завантаження редактора...</div>
        </div>
      }
    />
  );
}
