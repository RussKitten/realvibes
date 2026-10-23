import type { Node } from '@xyflow/react';

export type GostNodeKind =
  | 'start-end'
  | 'process'
  | 'decision'
  | 'input-output'
  | 'predefined-process'
  | 'document'
  | 'data'
  | 'connector'
  | 'comment';

export interface GostNodeData {
  label: string;
  kind: GostNodeKind;
  [key: string]: unknown;
}

/** Узел схемы ГОСТ — то же, что Node<GostNodeData>, но коротко. */
export type GostNode = Node<GostNodeData>;

export type PageId = 'flow' | 'listing' | 'about';

export interface ListingSettings {
  fontFamily: string;
  fontSize: number;
  linesPerPage: number;
  language: string;
  caption: string;
  showLineNumbers: boolean;
  lineNumberColumnWidth: number;
  tableTitle: string;
}

export interface ListingLine {
  number: number;
  content: string;
}
