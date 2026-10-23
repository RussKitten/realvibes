import type { GostNodeKind } from '../types';

export interface GostBlockSpec {
  kind: GostNodeKind;
  labelRu: string;
  gostCode: string;
  tooltip: string;
  defaultWidth: number;
  defaultHeight: number;
}

export const GOST_BLOCKS: Record<GostNodeKind, GostBlockSpec> = {
  'start-end': {
    kind: 'start-end',
    labelRu: 'Начало / Конец',
    gostCode: '1.1.1',
    tooltip: 'Терминатор (овал) — начало или конец алгоритма. ГОСТ 19.701-90, символ 1.1.1.',
    defaultWidth: 140,
    defaultHeight: 60,
  },
  process: {
    kind: 'process',
    labelRu: 'Процесс',
    gostCode: '1.2.1',
    tooltip: 'Прямоугольник — выполнение операции или последовательности операций. ГОСТ 19.701-90, символ 1.2.1.',
    defaultWidth: 180,
    defaultHeight: 60,
  },
  decision: {
    kind: 'decision',
    labelRu: 'Решение',
    gostCode: '1.3.1',
    tooltip: 'Ромб — принятие решения (проверка условия). ГОСТ 19.701-90, символ 1.3.1.',
    defaultWidth: 160,
    defaultHeight: 100,
  },
  'input-output': {
    kind: 'input-output',
    labelRu: 'Ввод / Вывод',
    gostCode: '1.1.3',
    tooltip: 'Параллелограмм — ввод/вывод данных в общем виде. ГОСТ 19.701-90, символ 1.1.3.',
    defaultWidth: 180,
    defaultHeight: 60,
  },
  'predefined-process': {
    kind: 'predefined-process',
    labelRu: 'Предопределённый процесс',
    gostCode: '1.2.2',
    tooltip: 'Прямоугольник с двойными вертикальными линиями — вызов подпрограммы/модуля. ГОСТ 19.701-90, символ 1.2.2.',
    defaultWidth: 200,
    defaultHeight: 60,
  },
  document: {
    kind: 'document',
    labelRu: 'Документ',
    gostCode: '1.1.5',
    tooltip: 'Прямоугольник с волнистой нижней гранью — ввод/вывод документа на бумаге. ГОСТ 19.701-90, символ 1.1.5.',
    defaultWidth: 180,
    defaultHeight: 80,
  },
  data: {
    kind: 'data',
    labelRu: 'Данные',
    gostCode: '1.1.4',
    tooltip: 'Параллелограмм (с обратным наклоном) — ввод/вывод данных. ГОСТ 19.701-90, символ 1.1.4.',
    defaultWidth: 180,
    defaultHeight: 60,
  },
  connector: {
    kind: 'connector',
    labelRu: 'Соединитель',
    gostCode: '1.4.1',
    tooltip: 'Круг — соединение линий потоков, разрыв линий. ГОСТ 19.701-90, символ 1.4.1.',
    defaultWidth: 70,
    defaultHeight: 70,
  },
  comment: {
    kind: 'comment',
    labelRu: 'Комментарий',
    gostCode: '1.5.1',
    tooltip: 'Прямоугольник с разомкнутой левой гранью (пунктиром) — пояснение. ГОСТ 19.701-90, символ 1.5.1.',
    defaultWidth: 200,
    defaultHeight: 70,
  },
};

const BLOCK_KINDS = Object.keys(GOST_BLOCKS) as GostNodeKind[];

/** Размеры по умолчанию для каждого типа блока. */
export const GOST_BLOCK_SIZES: Record<GostNodeKind, { width: number; height: number }> =
  Object.fromEntries(
    BLOCK_KINDS.map((kind) => [
      kind,
      { width: GOST_BLOCKS[kind].defaultWidth, height: GOST_BLOCKS[kind].defaultHeight },
    ]),
  ) as Record<GostNodeKind, { width: number; height: number }>;

/** Текстовые описания блоков (tooltip). */
export const GOST_BLOCK_DESCRIPTIONS: Record<GostNodeKind, string> = Object.fromEntries(
  BLOCK_KINDS.map((kind) => [kind, GOST_BLOCKS[kind].tooltip]),
) as Record<GostNodeKind, string>;

export const GOST_COLORS = {
  stroke: '#000000',
  fill: '#ffffff',
  fillAlt: '#f2f2f2',
} as const;

export const GOST_SIZES_TABLE: Array<{
  kind: GostNodeKind;
  labelRu: string;
  gostCode: string;
  dimensions: string;
}> = [
  { kind: 'start-end', labelRu: 'Начало / Конец', gostCode: '1.1.1', dimensions: 'a = 10 мм, b = 1.5a (овал)' },
  { kind: 'process', labelRu: 'Процесс', gostCode: '1.2.1', dimensions: '20 мм × 1.5a' },
  { kind: 'decision', labelRu: 'Решение', gostCode: '1.3.1', dimensions: '20 мм × 20 мм (ромб)' },
  { kind: 'input-output', labelRu: 'Ввод / Вывод', gostCode: '1.1.3', dimensions: '20 мм × 1.5a (параллелограмм)' },
  { kind: 'predefined-process', labelRu: 'Предопределённый процесс', gostCode: '1.2.2', dimensions: '20 мм × 1.5a + двойные линии' },
  { kind: 'document', labelRu: 'Документ', gostCode: '1.1.5', dimensions: '20 мм × 1.5a, волнистый низ' },
  { kind: 'data', labelRu: 'Данные', gostCode: '1.1.4', dimensions: '20 мм × 1.5a (параллелограмм)' },
  { kind: 'connector', labelRu: 'Соединитель', gostCode: '1.4.1', dimensions: 'd = 10 мм (круг)' },
  { kind: 'comment', labelRu: 'Комментарий', gostCode: '1.5.1', dimensions: 'произвольный, разомкнутая левая грань' },
];
