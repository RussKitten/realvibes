import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type IBorderOptions,
} from 'docx';
import type { ListingSettings } from '../types';
import { paginateLines, splitCodeToLines } from './splitCodeToLines';

const CM_TO_TWIPS = 567;
const MAX_IMAGE_WIDTH_PX = 600;

const BORDER: IBorderOptions = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: '000000',
};

const CELL_BORDERS = {
  top: BORDER,
  bottom: BORDER,
  left: BORDER,
  right: BORDER,
};

function getPngSize(dataUrl: string): { width: number; height: number } | null {
  try {
    const base64 = dataUrl.split(',')[1] ?? '';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47) {
      return null;
    }
    const width =
      ((bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19]) >>> 0;
    const height =
      ((bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23]) >>> 0;
    if (width === 0 || height === 0) return null;
    return { width, height };
  } catch {
    return null;
  }
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] ?? '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function buildListingTable(
  settings: ListingSettings,
  lines: { number: number; content: string }[],
  isFirstChunk: boolean,
): Table {
  const numberColWidth = Math.max(1, Math.round(settings.lineNumberColumnWidth * CM_TO_TWIPS));
  const fontSizeHalfPoints = Math.max(16, Math.round(settings.fontSize * 2));

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        borders: CELL_BORDERS,
        width: { size: numberColWidth, type: WidthType.DXA },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0, line: 240 },
            children: [
              new TextRun({
                text: '№',
                bold: true,
                font: settings.fontFamily,
                size: fontSizeHalfPoints,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        borders: CELL_BORDERS,
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 0, after: 0, line: 240 },
            children: [
              new TextRun({
                text: settings.tableTitle || 'Код',
                bold: true,
                font: settings.fontFamily,
                size: fontSizeHalfPoints,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const dataRows = lines.map(
    (line) =>
      new TableRow({
        children: [
          new TableCell({
            borders: CELL_BORDERS,
            width: { size: numberColWidth, type: WidthType.DXA },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0, line: 240 },
                children: [
                  new TextRun({
                    text: settings.showLineNumbers ? String(line.number) : '',
                    font: settings.fontFamily,
                    size: fontSizeHalfPoints,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: CELL_BORDERS,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { before: 0, after: 0, line: 240 },
                children: [
                  new TextRun({
                    text: line.content.length > 0 ? line.content : ' ',
                    font: settings.fontFamily,
                    size: fontSizeHalfPoints,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: isFirstChunk ? [headerRow, ...dataRows] : dataRows,
  });
}

export async function buildListingDocument(
  settings: ListingSettings,
  code: string,
  schemaPng: string | null,
): Promise<Blob> {
  const lines = splitCodeToLines(code);
  if (lines.length === 0) {
    throw new Error('Код листинга пуст.');
  }
  const pages = paginateLines(lines, settings.linesPerPage);
  const children: (Paragraph | Table)[] = [];

  if (schemaPng) {
    const size = getPngSize(schemaPng);
    let imageWidth = MAX_IMAGE_WIDTH_PX;
    let imageHeight = 400;
    if (size) {
      const scale = Math.min(1, MAX_IMAGE_WIDTH_PX / size.width);
      imageWidth = Math.max(1, Math.round(size.width * scale));
      imageHeight = Math.max(1, Math.round(size.height * scale));
    }
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new ImageRun({
            type: 'png',
            data: dataUrlToUint8Array(schemaPng),
            transformation: { width: imageWidth, height: imageHeight },
          }),
        ],
      }),
    );
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: 'Рисунок 1 — Блок-схема алгоритма',
            font: 'Times New Roman',
            size: 24,
          }),
        ],
      }),
    );
    children.push(
      new Paragraph({
        pageBreakBefore: true,
        children: [new TextRun({ text: '' })],
      }),
    );
  }

  const baseCaption = settings.caption.trim() || 'Листинг';
  pages.forEach((chunk, idx) => {
    const captionText = idx === 0 ? baseCaption : `${baseCaption} (продолжение)`;
    children.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: idx === 0 ? 0 : 240, after: 120 },
        children: [
          new TextRun({
            text: captionText,
            font: 'Times New Roman',
            size: 24,
          }),
        ],
      }),
    );
    children.push(buildListingTable(settings, chunk, idx === 0));
  });

  const doc = new Document({
    creator: 'flowchart-gost',
    title: baseCaption,
    description: 'Документ, сформированный редактором ГОСТ 19.701-90',
    styles: {
      default: {
        document: {
          run: {
            font: settings.fontFamily,
            size: Math.max(16, Math.round(settings.fontSize * 2)),
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: Math.round(2 * CM_TO_TWIPS),
              bottom: Math.round(2 * CM_TO_TWIPS),
              left: Math.round(2 * CM_TO_TWIPS),
              right: Math.round(2 * CM_TO_TWIPS),
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

export function getDefaultSettings(): ListingSettings {
  return {
    fontFamily: 'Courier New',
    fontSize: 10,
    linesPerPage: 50,
    language: 'TypeScript',
    caption: 'Листинг 1 — Пример программы',
    showLineNumbers: true,
    lineNumberColumnWidth: 1.5,
    tableTitle: 'Код',
  };
}
