import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
const win = dom.window as any;
(global as any).window = win;
(global as any).document = win.document;
(global as any).HTMLCanvasElement = win.HTMLCanvasElement;
(global as any).Image = win.Image;
(global as any).requestAnimationFrame = (cb: any) => setTimeout(cb, 16);
(global as any).cancelAnimationFrame = clearTimeout;
try { (global as any).navigator = win.navigator; } catch {}
try { (global as any).HTMLElement = win.HTMLElement; } catch {}
try { (global as any).Element = win.Element; } catch {}
try { (global as any).XMLHttpRequest = win.XMLHttpRequest; } catch {}
