import { toBlob, toPng, toSvg } from 'html-to-image';
import { getNodesBounds, getViewportForBounds, type Node } from '@xyflow/react';
import type { GostNodeData } from '../types';

interface ExportOptions {
  width: number;
  height: number;
  style: {
    width: string;
    height: string;
    transform: string;
  };
  pixelRatio: number;
}

function getViewportElement(): HTMLElement {
  const el = document.querySelector('.react-flow__viewport');
  if (!el || !(el instanceof HTMLElement)) {
    throw new Error('Не найден viewport схемы. Откройте редактор блок-схемы.');
  }
  return el;
}

function buildOptions(
  nodes: Node<GostNodeData>[],
  pixelRatio: number,
): ExportOptions {
  if (nodes.length === 0) {
    throw new Error('Холст пуст — добавьте хотя бы один блок.');
  }
  const padding = 50;
  const bounds = getNodesBounds(nodes);
  const width = Math.max(1, Math.ceil(bounds.width + padding * 2));
  const height = Math.max(1, Math.ceil(bounds.height + padding * 2));
  const viewport = getViewportForBounds(bounds, width, height, 0.1, 4, 0.1);
  return {
    width,
    height,
    pixelRatio,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    },
  };
}

export async function exportToPng(nodes: Node<GostNodeData>[]): Promise<string> {
  const opts = buildOptions(nodes, 2);
  return toPng(getViewportElement(), {
    backgroundColor: '#ffffff',
    width: opts.width * opts.pixelRatio,
    height: opts.height * opts.pixelRatio,
    style: opts.style,
    pixelRatio: opts.pixelRatio,
  });
}

export async function exportToSvg(nodes: Node<GostNodeData>[]): Promise<string> {
  const opts = buildOptions(nodes, 1);
  return toSvg(getViewportElement(), {
    backgroundColor: '#ffffff',
    width: opts.width,
    height: opts.height,
    style: opts.style,
  });
}

export async function copyToClipboard(nodes: Node<GostNodeData>[]): Promise<void> {
  const opts = buildOptions(nodes, 2);
  const blob = await toBlob(getViewportElement(), {
    backgroundColor: '#ffffff',
    width: opts.width * opts.pixelRatio,
    height: opts.height * opts.pixelRatio,
    style: opts.style,
    pixelRatio: opts.pixelRatio,
  });
  if (!blob) {
    throw new Error('Не удалось создать PNG для буфера обмена.');
  }
  if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
    throw new Error('Браузер не поддерживает копирование изображений в буфер.');
  }
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
