export const ICONS_URL =
  'https://raw.githubusercontent.com/sora-xor/polkaswap-token-whitelist-config/master/whitelist.json';

export const SVG_IMAGE_TYPE = 'data:image/svg+xml';
export const SVG_IMAGE_TYPE_UTF8 = 'data:image/svg+xml;charset=utf8';

export const PNG_IMAGE_TYPE = 'data:image/png;base64';

export const SVG_EXTENSION = '.svg';
export const PNG_EXTENSION = '.png';

export const IMAGE_EXTENSIONS = new Map([
  [SVG_IMAGE_TYPE, SVG_EXTENSION],
  [SVG_IMAGE_TYPE_UTF8, SVG_EXTENSION],
  [PNG_IMAGE_TYPE, PNG_EXTENSION],
]);

export const ICONS_STORAGE_PATH = `${process.env.STORAGE_PATH}/icons/`;
