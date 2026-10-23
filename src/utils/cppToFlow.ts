import type { Node as TsNode } from 'web-tree-sitter';
import type { Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import type { GostNode, GostNodeData, GostNodeKind } from '../types';
import { GOST_BLOCK_SIZES } from '../gost/constants';

interface Ctx {
  nodes: GostNode[];
  edges: Edge[];
  nodeId: number;
  source: string;
}

const EDGE_STYLE = {
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed, color: '#000' },
  style: { stroke: '#000', strokeWidth: 1.5 },
  labelStyle: { fontSize: 11, fill: '#000' },
  labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
  labelBgPadding: [4, 2] as [number, number],
  labelBgBorderRadius: 4,
};

function text(node: TsNode, source: string): string {
  return source.slice(node.startIndex, node.endIndex).trim();
}

function createNode(ctx: Ctx, kind: GostNodeKind, label: string): GostNode {
  const size = GOST_BLOCK_SIZES[kind];
  const id = `cpp_${ctx.nodeId++}`;
  const data: GostNodeData = { label, kind };
  const node: GostNode = {
    id,
    type: 'gost',
    position: { x: 0, y: 0 },
    style: { width: size.width, height: size.height },
    data,
  };
  ctx.nodes.push(node);
  return node;
}

function addEdge(
  ctx: Ctx,
  source: string,
  target: string,
  label?: string,
  sourceHandle: 'bottom' | 'left' | 'right' = 'bottom',
  targetHandle: 'top' | 'left' | 'right' = 'top',
): void {
  ctx.edges.push({
    id: `e_${source}_${target}_${ctx.edges.length}`,
    source,
    target,
    sourceHandle,
    targetHandle,
    label,
    ...EDGE_STYLE,
  });
}

// ---------- Форматирование содержимого блоков ----------

function cleanCondition(input: string): string {
  let s = input.trim();
  if (s.startsWith('(') && s.endsWith(')')) {
    let depth = 0;
    let wrapped = true;
    for (let i = 0; i < s.length; i += 1) {
      if (s[i] === '(') depth += 1;
      else if (s[i] === ')') depth -= 1;
      if (depth === 0 && i < s.length - 1) {
        wrapped = false;
        break;
      }
    }
    if (wrapped) s = s.slice(1, -1).trim();
  }
  s = s.replace(/;$/, '').trim();
  return s;
}

function formatInput(raw: string): string {
  let m = raw.match(/cin\s*((?:>>\s*[^;]+)+);?/);
  if (m) {
    const vars = m[1]
      .split('>>')
      .map((v) => v.trim())
      .filter(Boolean)
      .join(', ');
    return `Ввод ${vars}`;
  }
  m = raw.match(/scanf\s*\(\s*"[^"]*"\s*,?\s*([^)]*)\)/);
  if (m) {
    const args = m[1]
      .split(',')
      .map((a) => a.trim().replace(/^&/, ''))
      .filter(Boolean)
      .join(', ');
    return args ? `Ввод ${args}` : 'Ввод';
  }
  m = raw.match(/getline\s*\(\s*cin\s*,\s*(\w+)\s*\)/);
  if (m) return `Ввод ${m[1]}`;
  return 'Ввод';
}

function formatOutput(raw: string): string {
  let m = raw.match(/cout\s*((?:<<\s*[^;]+)+);?/);
  if (m) {
    const parts = m[1]
      .split('<<')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    return parts.length > 0 ? `Вывод ${parts.join(', ')}` : 'Вывод';
  }
  m = raw.match(/printf\s*\(\s*"([^"]*)"\s*,?\s*([^)]*)\)/);
  if (m) {
    const fmt = m[1];
    const args = m[2]
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
    if (args.length === 0) return `Вывод "${fmt}"`;
    return `Вывод ${args.join(', ')}`;
  }
  m = raw.match(/puts\s*\(\s*"([^"]*)"\s*\)/);
  if (m) return `Вывод "${m[1]}"`;
  return 'Вывод';
}

// ---------- Обход тела функции ----------

interface FlowResult {
  entry: string;
  exits: string[];
}

function processStatement(ctx: Ctx, stmt: TsNode): FlowResult | null {
  const type = stmt.type;

  if (type === 'compound_statement') {
    const results: FlowResult[] = [];
    for (let i = 0; i < stmt.childCount; i += 1) {
      const child = stmt.child(i);
      if (!child || child.type === '{' || child.type === '}') continue;
      const r = processStatement(ctx, child);
      if (r) results.push(r);
    }
    if (results.length === 0) return null;
    for (let i = 0; i < results.length - 1; i += 1) {
      for (const ex of results[i].exits) addEdge(ctx, ex, results[i + 1].entry);
    }
    return { entry: results[0].entry, exits: results[results.length - 1].exits };
  }

  if (type === 'if_statement') {
    const cond = stmt.childForFieldName('condition');
    const thenBranch = stmt.childForFieldName('consequence');
    const elseBranch = stmt.childForFieldName('alternative');
    const condText = cond ? cleanCondition(text(cond, ctx.source)) : '?';
    const decision = createNode(ctx, 'decision', `Условие: ${condText}`);

    let thenFlow: FlowResult | null = null;
    if (thenBranch) {
      const r = processStatement(ctx, thenBranch);
      if (r) {
        addEdge(ctx, decision.id, r.entry, 'да');
        thenFlow = r;
      }
    }

    let elseFlow: FlowResult | null = null;
    if (elseBranch) {
      const r = processStatement(ctx, elseBranch);
      if (r) {
        addEdge(ctx, decision.id, r.entry, 'нет');
        elseFlow = r;
      }
    }

    const exits: string[] = [];
    if (thenFlow) exits.push(...thenFlow.exits);
    if (elseFlow) exits.push(...elseFlow.exits);
    if (!thenFlow && !elseFlow) exits.push(decision.id);
    else if (!thenFlow) exits.push(decision.id);
    else if (!elseFlow) addEdge(ctx, decision.id, decision.id, 'нет');

    return { entry: decision.id, exits };
  }

  if (type === 'while_statement') {
    const cond = stmt.childForFieldName('condition');
    const body = stmt.childForFieldName('body');
    const condText = cond ? cleanCondition(text(cond, ctx.source)) : '?';
    const decision = createNode(ctx, 'decision', `Условие: ${condText}`);
    let bodyFlow: FlowResult | null = null;
    if (body) {
      const r = processStatement(ctx, body);
      if (r) {
        addEdge(ctx, decision.id, r.entry, 'да');
        for (const ex of r.exits) addEdge(ctx, ex, decision.id);
        bodyFlow = r;
      }
    }
    if (!bodyFlow) addEdge(ctx, decision.id, decision.id, 'да');
    return { entry: decision.id, exits: [decision.id] };
  }

  if (type === 'for_statement') {
    const init = stmt.childForFieldName('initializer');
    const cond = stmt.childForFieldName('condition');
    const body = stmt.childForFieldName('body');
    const update = stmt.childForFieldName('update');

    let entry: string | null = null;
    if (init) {
      const initText = text(init, ctx.source);
      const n = createNode(ctx, 'process', initText);
      entry = n.id;
    }

    const condText = cond ? cleanCondition(text(cond, ctx.source)) : '?';
    const decision = createNode(ctx, 'decision', `Условие: ${condText}`);
    if (entry) addEdge(ctx, entry, decision.id);
    else entry = decision.id;

    let bodyFlow: FlowResult | null = null;
    if (body) {
      const r = processStatement(ctx, body);
      if (r) {
        addEdge(ctx, decision.id, r.entry, 'да');
        bodyFlow = r;
      }
    }

    if (update) {
      const upText = text(update, ctx.source);
      const upNode = createNode(ctx, 'process', upText);
      if (bodyFlow) {
        for (const ex of bodyFlow.exits) addEdge(ctx, ex, upNode.id);
      } else {
        addEdge(ctx, decision.id, upNode.id);
      }
      addEdge(ctx, upNode.id, decision.id);
    } else if (bodyFlow) {
      for (const ex of bodyFlow.exits) addEdge(ctx, ex, decision.id);
    }

    return { entry: entry ?? decision.id, exits: [decision.id] };
  }

  if (type === 'return_statement') {
    const value = stmt.namedChildCount > 0 ? text(stmt.namedChild(0)!, ctx.source) : 'return';
    const n = createNode(ctx, 'process', value ? `return ${value}` : 'return');
    return { entry: n.id, exits: [n.id] };
  }

  if (type === 'expression_statement') {
    const raw = text(stmt, ctx.source);
    const isOutput = /cout|printf|puts|std::print|println/.test(raw);
    const isInput = /cin|scanf|getline|std::scan/.test(raw);
    if (isInput) {
      const n = createNode(ctx, 'input-output', formatInput(raw));
      return { entry: n.id, exits: [n.id] };
    }
    if (isOutput) {
      const n = createNode(ctx, 'input-output', formatOutput(raw));
      return { entry: n.id, exits: [n.id] };
    }
    const callMatch = raw.match(/^([\w:]+)\s*\(/);
    if (callMatch && !/^return/.test(raw) && !/^\w+\s*=/.test(raw)) {
      const n = createNode(ctx, 'predefined-process', raw);
      return { entry: n.id, exits: [n.id] };
    }
    const n = createNode(ctx, 'process', raw);
    return { entry: n.id, exits: [n.id] };
  }

  if (type === 'declaration' || type === 'init_declarator') {
    const raw = text(stmt, ctx.source);
    const n = createNode(ctx, 'process', raw);
    return { entry: n.id, exits: [n.id] };
  }

  const raw = text(stmt, ctx.source);
  if (raw.length > 0 && raw.length < 80) {
    const n = createNode(ctx, 'process', raw);
    return { entry: n.id, exits: [n.id] };
  }
  return null;
}

export function cppAstToFlow(
  root: TsNode,
  source: string,
): { nodes: GostNode[]; edges: Edge[] } {
  const ctx: Ctx = { nodes: [], edges: [], nodeId: 1, source };

  const functions: TsNode[] = [];
  const stack: TsNode[] = [root];
  while (stack.length > 0) {
    const cur = stack.pop();
    if (!cur) continue;
    if (cur.type === 'function_definition') {
      functions.push(cur);
    } else {
      for (let i = 0; i < cur.childCount; i += 1) {
        const ch = cur.child(i);
        if (ch) stack.push(ch);
      }
    }
  }

  if (functions.length === 0) {
    throw new Error('В коде не найдено ни одной функции. Блок-схема строится по функциям.');
  }

  for (const fn of functions) {
    const declarator = fn.childForFieldName('declarator');
    const name = declarator ? text(declarator, source).split('(')[0].trim() : 'function';
    const body = fn.childForFieldName('body');

    const start = createNode(ctx, 'start-end', `Начало ${name}`);
    if (!body) {
      const end = createNode(ctx, 'start-end', 'Конец');
      addEdge(ctx, start.id, end.id);
      continue;
    }

    const bodyFlow = processStatement(ctx, body);
    if (bodyFlow) {
      addEdge(ctx, start.id, bodyFlow.entry);
      const end = createNode(ctx, 'start-end', 'Конец');
      for (const ex of bodyFlow.exits) addEdge(ctx, ex, end.id);
    } else {
      const end = createNode(ctx, 'start-end', 'Конец');
      addEdge(ctx, start.id, end.id);
    }
  }

  return { nodes: ctx.nodes, edges: ctx.edges };
}
