import { createElement } from 'react';
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const SOURCE_WIDTH = 360;
const SOURCE_HEIGHT = 121;
const CANVAS = 512;
const VERTICAL_PADDING = 22;
const VISIBLE_SOURCE_WIDTH = 110;

export async function GET(request: NextRequest) {
  const logoUrl = new URL('/assets/etos-id.png', request.url).toString();
  const renderedHeight = CANVAS - VERTICAL_PADDING * 2;
  const scale = renderedHeight / SOURCE_HEIGHT;
  const renderedWidth = Math.round(SOURCE_WIDTH * scale);
  const visibleWidth = Math.round(VISIBLE_SOURCE_WIDTH * scale);
  const horizontalPadding = Math.round((CANVAS - visibleWidth) / 2);

  const image = createElement(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent',
      },
    },
    createElement('img', {
      src: logoUrl,
      width: renderedWidth,
      height: renderedHeight,
      alt: 'Etos ID',
      style: {
        position: 'absolute',
        top: `${VERTICAL_PADDING}px`,
        right: `${horizontalPadding}px`,
        width: `${renderedWidth}px`,
        height: `${renderedHeight}px`,
        maxWidth: 'none',
      },
    }),
  );

  return new ImageResponse(image, {
    width: CANVAS,
    height: CANVAS,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
