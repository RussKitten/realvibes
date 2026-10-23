import CodeMirror from '@uiw/react-codemirror';

interface ListingEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
}

/**
 * Редактор листинга.
 *
 * Намеренно НЕ импортирует @codemirror/lang-javascript и другие
 * языковые грамматики: пакеты подсветки — опциональны, и их отсутствие
 * ломало сборку. Базовый редактор (@uiw/react-codemirror) уже включает
 * номера строк, скобки, отступы, поиск — этого достаточно для
 * форматирования листинга перед экспортом в .docx.
 *
 * Если нужна подсветка синтаксиса, выполните:
 *   npm i @codemirror/lang-javascript@^6.2.2
 * и добавьте в extensions: javascript({ typescript: true, jsx: true }).
 */
export function ListingEditor({ code, language, onChange }: ListingEditorProps): JSX.Element {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-gray-300 bg-white px-3 py-1.5 text-[11px] text-gray-500">
        <span>Редактор кода ({language})</span>
        <span>{code.split('\n').length} строк</span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <CodeMirror
          value={code}
          height="100%"
          theme="light"
          onChange={onChange}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: false,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
            tabSize: 4,
            highlightSelectionMatches: false,
          }}
          style={{
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 13,
            height: '100%',
          }}
        />
      </div>
    </div>
  );
}
