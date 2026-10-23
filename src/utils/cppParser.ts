import { Parser, Language, type Node as TsNode } from 'web-tree-sitter';

let initPromise: Promise<void> | null = null;
let cppLanguage: Language | null = null;

function wasmUrl(name: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}wasm/${name}`;
}

/**
 * Инициализация WASM-парсера tree-sitter для C++.
 *
 * Требует наличия ДВУХ файлов в public/wasm/:
 *   1. tree-sitter.wasm        — runtime-движок (из пакета web-tree-sitter);
 *   2. tree-sitter-cpp.wasm    — грамматика C++ (из @2h2d/tree-sitter-wasms).
 *
 * locateFile сообщает Emscripten, откуда брать runtime-файл (tree-sitter.wasm).
 * Грамматика загружается отдельно через Language.load().
 */
export async function initCppParser(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await Parser.init({
      locateFile: (scriptName: string) => wasmUrl(scriptName),
    });
    cppLanguage = await Language.load(wasmUrl('tree-sitter-cpp.wasm'));
  })();

  try {
    await initPromise;
  } catch (e) {
    // Сбрасываем промис, чтобы следующая попытка могла повторить инициализацию
    initPromise = null;
    cppLanguage = null;
    throw new Error(
      'Не удалось загрузить парсер C++. Убедитесь, что в public/wasm/ лежат ' +
        'два файла: tree-sitter.wasm (runtime из пакета web-tree-sitter) и ' +
        'tree-sitter-cpp.wasm (грамматика из @2h2d/tree-sitter-wasms). ' +
        'Исходная ошибка: ' +
        (e instanceof Error ? e.message : String(e)),
    );
  }
}

export function parseCpp(code: string): TsNode {
  if (!cppLanguage) {
    throw new Error('Парсер C++ не инициализирован. Вызовите initCppParser().');
  }
  const parser = new Parser();
  parser.setLanguage(cppLanguage);
  const tree = parser.parse(code);
  if (!tree) {
    throw new Error('Не удалось разобрать код C++.');
  }
  return tree.rootNode;
}

export function getNodeText(node: TsNode, source: string): string {
  return source.slice(node.startIndex, node.endIndex);
}

export function findFunctionDefinitions(root: TsNode): TsNode[] {
  const result: TsNode[] = [];
  const stack: TsNode[] = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    if (current.type === 'function_definition') {
      result.push(current);
    } else {
      for (let i = 0; i < current.childCount; i += 1) {
        const child = current.child(i);
        if (child) stack.push(child);
      }
    }
  }
  return result;
}
