import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table/kit';
import { useEffect, forwardRef, useImperativeHandle, useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export interface RichTextEditorRef {
  insertImage: (url: string) => void;
}

interface SlashCommand {
  title: string;
  description: string;
  icon: string;
  command: () => void;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({ content, onChange, placeholder }, ref) => {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [slashSearchQuery, setSlashSearchQuery] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || '記事本文を入力してください... / でコマンド',
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            href: {
              default: null,
              parseHTML: element => element.getAttribute('data-href'),
              renderHTML: attributes => {
                if (!attributes.href) {
                  return {};
                }
                return {
                  'data-href': attributes.href,
                };
              },
            },
          };
        },
      }).configure({
        inline: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
      TableKit.configure({
        table: {
          resizable: true,
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      // Markdownとして出力
      const markdown = editorToMarkdown(editor.getHTML());
      onChange(markdown);

      // スラッシュメニューのチェック
      checkForSlashCommand(editor);
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[400px] p-4',
        style: 'line-height: 1.6;',
      },
      // URLやMarkdownを貼り付けた時の処理
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain');
        if (!text) return false;

        // 画像URLの正規表現パターン
        const imageUrlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;

        if (imageUrlPattern.test(text.trim())) {
          event.preventDefault();
          editor?.chain().focus().setImage({ src: text.trim() }).run();
          return true;
        }

        // Markdown形式を含むテキストの場合（見出し、リスト、太字など）
        const hasMarkdownSyntax = /^(#{1,3}\s|[-*]\s|\*\*|##)/m.test(text);

        if (hasMarkdownSyntax) {
          event.preventDefault();
          const html = markdownToHTML(text);
          editor?.commands.insertContent(html);
          return true;
        }

        return false;
      },
      handleKeyDown: (view, event) => {
        if (showSlashMenu) {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelectedCommandIndex((prev) =>
              Math.min(prev + 1, getFilteredCommands().length - 1)
            );
            return true;
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelectedCommandIndex((prev) => Math.max(prev - 1, 0));
            return true;
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            executeSelectedCommand();
            return true;
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            setShowSlashMenu(false);
            return true;
          }
        }
        return false;
      },
    },
  });

  const checkForSlashCommand = (editor: any) => {
    if (!editor) return;

    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;
    const textBefore = $from.parent.textContent.substring(0, $from.parentOffset);

    // スラッシュの検出
    const slashMatch = textBefore.match(/\/([a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]*)$/);

    if (slashMatch) {
      setSlashSearchQuery(slashMatch[1] || '');
      setShowSlashMenu(true);
      setSelectedCommandIndex(0);

      // カーソル位置を取得
      const coords = editor.view.coordsAtPos($from.pos);
      setSlashMenuPosition({
        top: coords.bottom + 5,
        left: coords.left,
      });
    } else {
      setShowSlashMenu(false);
    }
  };

  const getSlashCommands = (): SlashCommand[] => {
    if (!editor) return [];

    return [
      {
        title: '表',
        description: '3x3の表を挿入',
        icon: '📊',
        command: () => {
          removeSlashText();
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        },
      },
    ];
  };

  const getFilteredCommands = (): SlashCommand[] => {
    const commands = getSlashCommands();
    if (!slashSearchQuery) return commands;

    return commands.filter(cmd =>
      cmd.title.toLowerCase().includes(slashSearchQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(slashSearchQuery.toLowerCase())
    );
  };

  const removeSlashText = () => {
    if (!editor) return;

    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;
    const textBefore = $from.parent.textContent.substring(0, $from.parentOffset);
    const slashMatch = textBefore.match(/\/([a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]*)$/);

    if (slashMatch) {
      const from = $from.pos - slashMatch[0].length;
      const to = $from.pos;
      editor.chain().focus().deleteRange({ from, to }).run();
    }

    setShowSlashMenu(false);
  };

  const executeSelectedCommand = () => {
    const commands = getFilteredCommands();
    if (commands[selectedCommandIndex]) {
      commands[selectedCommandIndex].command();
    }
  };

  // 外部からcontentが変更された時の処理
  useEffect(() => {
    if (!editor) return;

    const currentHTML = editor.getHTML();
    const currentMarkdown = editorToMarkdown(currentHTML);
    const newHTML = markdownToHTML(content);

    // HTMLが異なる場合のみ更新
    // Markdownではなく、HTMLレベルで比較することで、より正確に判定
    if (currentHTML.trim() !== newHTML.trim() && content.trim() !== currentMarkdown.trim()) {
      // 無限ループを防ぐため、フラグを立てる
      editor.commands.setContent(newHTML, false);
    }
  }, [content, editor]);

  // 外部から画像を挿入できるようにする
  useImperativeHandle(ref, () => ({
    insertImage: (url: string) => {
      if (editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  }));

  if (!editor) {
    return null;
  }

  // ツールバーを外部コンテナにレンダリング
  useEffect(() => {
    const container = document.getElementById('editor-toolbar-container');
    if (!container || !editor) return;

    const renderToolbar = () => {
      container.innerHTML = '';

      const toolbar = document.createElement('div');
      toolbar.className = 'flex flex-wrap gap-1';

      const buttons = [
        { label: '太字', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
        { label: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
        { label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
        { label: 'H3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
        { label: '箇条書き', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
        { label: '番号付き', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
        {
          label: '画像リンク設定',
          action: () => {
            const url = prompt('リンク先URLを入力してください:');
            if (url) {
              editor.chain().focus().updateAttributes('image', { href: url }).run();
            }
          },
          disabled: !editor.isActive('image'),
          color: 'bg-green-100'
        },
        { label: '表を挿入', action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), active: false, color: 'bg-blue-100' },
        { label: '列追加(左)', action: () => editor.chain().focus().addColumnBefore().run(), disabled: !editor.can().addColumnBefore() },
        { label: '列追加(右)', action: () => editor.chain().focus().addColumnAfter().run(), disabled: !editor.can().addColumnAfter() },
        { label: '列削除', action: () => editor.chain().focus().deleteColumn().run(), disabled: !editor.can().deleteColumn() },
        { label: '行追加(上)', action: () => editor.chain().focus().addRowBefore().run(), disabled: !editor.can().addRowBefore() },
        { label: '行追加(下)', action: () => editor.chain().focus().addRowAfter().run(), disabled: !editor.can().addRowAfter() },
        { label: '行削除', action: () => editor.chain().focus().deleteRow().run(), disabled: !editor.can().deleteRow() },
        { label: '表を削除', action: () => editor.chain().focus().deleteTable().run(), disabled: !editor.can().deleteTable(), color: 'bg-red-100' },
      ];

      buttons.forEach(({ label, action, active, disabled, color }) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.onclick = action;
        button.disabled = !!disabled;
        button.className = `px-3 py-1 text-sm rounded hover:bg-gray-200 ${active ? 'bg-gray-300 font-bold' : ''} ${disabled ? 'opacity-30' : ''} ${color || ''}`;
        toolbar.appendChild(button);
      });

      container.appendChild(toolbar);
    };

    renderToolbar();

    const updateListener = () => renderToolbar();
    editor.on('update', updateListener);
    editor.on('selectionUpdate', updateListener);

    return () => {
      editor.off('update', updateListener);
      editor.off('selectionUpdate', updateListener);
      container.innerHTML = '';
    };
  }, [editor]);

  const filteredCommands = getFilteredCommands();

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white relative">
      {/* エディタ本体 */}
      <EditorContent editor={editor} className="tiptap-editor" />

      {/* スラッシュコマンドメニュー */}
      {showSlashMenu && filteredCommands.length > 0 && (
        <div
          className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-50 overflow-hidden"
          style={{
            top: `${slashMenuPosition.top}px`,
            left: `${slashMenuPosition.left}px`,
            width: '280px',
            maxHeight: '400px',
          }}
        >
          <div className="overflow-y-auto max-h-[400px]">
            {filteredCommands.map((command, index) => (
              <button
                key={command.title}
                type="button"
                onClick={() => {
                  setSelectedCommandIndex(index);
                  executeSelectedCommand();
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 flex items-start gap-3 transition-colors ${
                  index === selectedCommandIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                }`}
              >
                <span className="text-xl mt-0.5">{command.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{command.title}</div>
                  <div className="text-xs text-gray-500">{command.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* カスタムスタイル - contentRenderer.tsと完全一致 */}
      <style>{`
        /* 見出しスタイル */
        .tiptap-editor .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin: 0;
          line-height: 1.3;
          margin-top: 1.5em;
          margin-bottom: 0.75em;
        }
        .tiptap-editor .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: #d11a68;
          border-bottom: 2px solid #d11a68;
          padding-bottom: 0.5rem;
          line-height: 1.3;
          margin-top: 1.5em;
          margin-bottom: 0.75em;
        }
        .tiptap-editor .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          line-height: 1.3;
          margin-top: 1.25em;
          margin-bottom: 0.75em;
        }

        /* 段落 */
        .tiptap-editor .ProseMirror p {
          margin: 0;
          line-height: 1.6;
        }

        /* 段落間のスペース（連続する段落のみ） */
        .tiptap-editor .ProseMirror p + p {
          margin-top: 1em;
        }

        /* 太字・斜体 */
        .tiptap-editor .ProseMirror strong {
          font-weight: bold;
        }
        .tiptap-editor .ProseMirror em {
          font-style: italic;
        }

        /* リスト - contentRenderer.tsと同じデザイン */
        .tiptap-editor .ProseMirror ul,
        .tiptap-editor .ProseMirror ol {
          margin: 0;
          padding: 0;
          list-style: none;
          margin-top: 1em;
          margin-bottom: 1em;
        }
        .tiptap-editor .ProseMirror ul li {
          position: relative;
          padding-left: 20px;
          margin-bottom: 8px;
          line-height: 1.6;
        }
        .tiptap-editor .ProseMirror ul li::before {
          content: "•";
          position: absolute;
          left: 0;
          top: 0;
          color: #e91e63;
          font-weight: bold;
        }
        .tiptap-editor .ProseMirror ol {
          counter-reset: item;
        }
        .tiptap-editor .ProseMirror ol li {
          position: relative;
          padding-left: 28px;
          margin-bottom: 8px;
          line-height: 1.6;
          counter-increment: item;
        }
        .tiptap-editor .ProseMirror ol li::before {
          content: counter(item);
          position: absolute;
          left: 0;
          top: 0;
          color: #e91e63;
          font-weight: bold;
          background: #fce4ec;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        /* 引用 */
        .tiptap-editor .ProseMirror blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1em;
          margin-left: 0;
          margin-right: 0;
          margin-top: 1em;
          margin-bottom: 1em;
          color: #6b7280;
        }

        /* コードブロック */
        .tiptap-editor .ProseMirror pre {
          background: #1f2937;
          color: #f9fafb;
          padding: 1em;
          border-radius: 0.5em;
          margin-top: 1em;
          margin-bottom: 1em;
          overflow-x: auto;
        }
        .tiptap-editor .ProseMirror code {
          background: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-family: monospace;
          font-size: 0.9em;
        }
        .tiptap-editor .ProseMirror pre code {
          background: none;
          padding: 0;
          color: inherit;
        }

        /* 画像 */
        .tiptap-editor .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5em;
          margin-top: 1em;
          margin-bottom: 1em;
        }

        /* 罫線 */
        .tiptap-editor .ProseMirror hr {
          border: none;
          height: 3px;
          background: linear-gradient(to right, #e5e5e5, #999, #e5e5e5);
          margin: 24px 0;
          border-radius: 2px;
        }

        /* リンク */
        .tiptap-editor .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }

        /* 表のスタイル */
        .tiptap-editor .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 1em 0;
          overflow: hidden;
        }

        .tiptap-editor .ProseMirror td,
        .tiptap-editor .ProseMirror th {
          min-width: 1em;
          border: 2px solid #e5e7eb;
          padding: 8px 12px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }

        .tiptap-editor .ProseMirror th {
          font-weight: bold;
          text-align: left;
          background-color: #f3f4f6;
        }

        .tiptap-editor .ProseMirror .selectedCell {
          background-color: #dbeafe;
        }

        /* プレースホルダー */
        .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

// HTMLをMarkdownに変換（簡易版）
function editorToMarkdown(html: string): string {
  let markdown = html;

  // 画像（最初に処理して保護、リンクがあればそれも保存）
  markdown = markdown.replace(/<img([^>]*)src="([^"]*)"([^>]*)\/?>/g, (match, before, src, after) => {
    const hrefMatch = (before + after).match(/data-href="([^"]*)"/);
    if (hrefMatch) {
      return `[![](${src})](${hrefMatch[1]})`;
    }
    return `![](${src})`;
  });

  // 表（HTMLのまま保存 - プレースホルダーで保護、前後の改行も保持）
  const tables: string[] = [];
  markdown = markdown.replace(/<table[^>]*>.*?<\/table>/gs, (match) => {
    tables.push(match);
    return `\n__TABLE_${tables.length - 1}__\n`;
  });

  // リスト（段落処理より先に処理）
  markdown = markdown.replace(/<ul>(.*?)<\/ul>/gs, (match, content) => {
    const items = content.replace(/<li>(.*?)<\/li>/g, '- $1\n');
    return '\n' + items + '\n';
  });
  markdown = markdown.replace(/<ol>(.*?)<\/ol>/gs, (match, content) => {
    let counter = 1;
    const items = content.replace(/<li>(.*?)<\/li>/g, () => `${counter++}. $1\n`);
    return '\n' + items + '\n';
  });

  // 見出し
  markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n');
  markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n');
  markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n');

  // 段落
  markdown = markdown.replace(/<p>(.*?)<\/p>/g, '$1\n\n');

  // 太字・斜体
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
  markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');

  // 引用
  markdown = markdown.replace(/<blockquote>(.*?)<\/blockquote>/gs, (match, content) => {
    return content.split('\n').map((line: string) => `> ${line}`).join('\n') + '\n';
  });

  // コードブロック
  markdown = markdown.replace(/<pre><code>(.*?)<\/code><\/pre>/gs, '```\n$1\n```\n');

  // HTMLタグを削除
  markdown = markdown.replace(/<[^>]+>/g, '');

  // 表のプレースホルダーを元に戻す
  tables.forEach((table, index) => {
    markdown = markdown.replace(`__TABLE_${index}__`, table);
  });

  // 余分な改行を削除
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

  return markdown;
}

// MarkdownをHTMLに変換（簡易版）
function markdownToHTML(markdown: string): string {
  let html = markdown;

  // 表（HTMLのまま保存されているのでプレースホルダーで保護）
  const tables: string[] = [];
  html = html.replace(/<table[^>]*>.*?<\/table>/gs, (match) => {
    tables.push(match);
    return `\n__TABLE_${tables.length - 1}__\n`;
  });

  // リンク付き画像（先に処理）
  html = html.replace(/\[!\[\]\(([^)]+)\)\]\(([^)]+)\)/g, '<img src="$1" data-href="$2">');

  // 通常の画像
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">');

  // 見出し
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // コードブロック
  html = html.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');

  // 箇条書きリスト（改善版：連続する行をまとめる）
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  let listItems: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isListItem = /^-\s+(.+)$/.test(line);
    const isTablePlaceholder = /^__TABLE_\d+__$/.test(line.trim());
    // 表の前後の空行かどうかチェック
    const prevLine = i > 0 ? lines[i - 1] : '';
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
    const isAroundTable = /^__TABLE_\d+__$/.test(prevLine.trim()) || /^__TABLE_\d+__$/.test(nextLine.trim());

    if (isTablePlaceholder) {
      // 表のプレースホルダーはそのまま保持
      if (inList && listItems.length > 0) {
        processedLines.push(`<ul>${listItems.join('')}</ul>`);
        listItems = [];
        inList = false;
      }
      processedLines.push(line);
    } else if (isListItem) {
      const match = line.match(/^-\s+(.+)$/);
      if (match) {
        listItems.push(`<li>${match[1]}</li>`);
        inList = true;
      }
    } else {
      if (inList && listItems.length > 0) {
        processedLines.push(`<ul>${listItems.join('')}</ul>`);
        listItems = [];
        inList = false;
      }
      // 空行は表の前後以外ではスキップ
      if (line.trim() !== '' || isAroundTable) {
        processedLines.push(line);
      }
    }
  }

  // 最後のリストを処理
  if (inList && listItems.length > 0) {
    processedLines.push(`<ul>${listItems.join('')}</ul>`);
  }

  html = processedLines.join('\n');

  // 太字・斜体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // 引用
  html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');

  // 段落（リストや見出し以外、画像と表プレースホルダーも除外）
  html = html.replace(/^(?!<[huol\/img]|<blockquote|<pre|```|__TABLE_)(.*?)$/gm, (match, p1) => {
    // 空行や既にタグで囲まれている行はスキップ
    if (p1.trim() === '' || p1.startsWith('<')) return '';
    return `<p>${p1}</p>`;
  });

  // 表のプレースホルダーを元に戻す
  tables.forEach((table, index) => {
    html = html.replace(`__TABLE_${index}__`, table);
  });

  // 余分な改行を削除
  html = html.replace(/\n{2,}/g, '\n').trim();

  return html;
}

export default RichTextEditor;
