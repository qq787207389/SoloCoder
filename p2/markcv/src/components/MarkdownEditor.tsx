import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { bracketMatching, foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { lintKeymap } from '@codemirror/lint';
import { EDITOR_TOOLS, CODEMIRROR_CONFIG } from '../constants';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        EditorView.lineWrapping,
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...lintKeymap,
          indentWithTab
        ]),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const content = update.state.doc.toString();
            onChange(content);
          }
        })
      ]
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value
        }
      });
    }
  }, [value]);

  const insertMarkdown = (prefix: string, suffix: string) => {
    if (!viewRef.current) return;
    
    const view = viewRef.current;
    const { selection } = view.state;
    const mainRange = selection.main;
    const selectedText = view.state.sliceDoc(mainRange.from, mainRange.to);
    
    view.dispatch({
      changes: {
        from: mainRange.from,
        to: mainRange.to,
        insert: prefix + selectedText + suffix
      },
      selection: {
        anchor: mainRange.from + prefix.length + selectedText.length
      }
    });
    
    view.focus();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap gap-1 p-2 bg-gray-100 border-b border-gray-200">
        {EDITOR_TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => insertMarkdown(tool.prefix, tool.suffix)}
            title={tool.title}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-medium"
          >
            {tool.label}
          </button>
        ))}
      </div>
      <div ref={editorRef} className="flex-1 overflow-hidden" />
    </div>
  );
};

export default MarkdownEditor;
