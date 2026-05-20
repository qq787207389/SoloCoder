import type { KeyboardShortcut } from '@/types';

export class KeyboardManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private actionHandlers: Map<string, () => void> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    this.setupDefaultShortcuts();
    this.bindEvents();
  }

  private setupDefaultShortcuts(): void {
    const defaults: KeyboardShortcut[] = [
      { key: 'z', ctrlKey: true, action: 'undo', description: '撤销' },
      { key: 'y', ctrlKey: true, action: 'redo', description: '重做' },
      { key: 'z', ctrlKey: true, shiftKey: true, action: 'redo', description: '重做' },
      { key: 'c', ctrlKey: true, action: 'copy', description: '复制' },
      { key: 'v', ctrlKey: true, action: 'paste', description: '粘贴' },
      { key: 'd', ctrlKey: true, action: 'duplicate', description: '克隆' },
      { key: 'Backspace', action: 'delete', description: '删除' },
      { key: 'Delete', action: 'delete', description: '删除' },
      { key: 'a', ctrlKey: true, action: 'selectAll', description: '全选' },
      { key: 'Escape', action: 'deselect', description: '取消选择' },
      { key: 'g', ctrlKey: true, action: 'group', description: '编组' },
      { key: 'g', ctrlKey: true, shiftKey: true, action: 'ungroup', description: '取消编组' },
      { key: 'l', ctrlKey: true, action: 'lock', description: '锁定' },
      { key: 'l', ctrlKey: true, shiftKey: true, action: 'unlock', description: '解锁' },
      { key: 's', ctrlKey: true, action: 'save', description: '保存' },
      { key: 'e', ctrlKey: true, action: 'export', description: '导出' },
      { key: 'ArrowUp', action: 'moveUp', description: '上移' },
      { key: 'ArrowDown', action: 'moveDown', description: '下移' },
      { key: 'ArrowLeft', action: 'moveLeft', description: '左移' },
      { key: 'ArrowRight', action: 'moveRight', description: '右移' },
      { key: 'ArrowUp', shiftKey: true, action: 'moveUpLarge', description: '大幅上移' },
      { key: 'ArrowDown', shiftKey: true, action: 'moveDownLarge', description: '大幅下移' },
      { key: 'ArrowLeft', shiftKey: true, action: 'moveLeftLarge', description: '大幅左移' },
      { key: 'ArrowRight', shiftKey: true, action: 'moveRightLarge', description: '大幅右移' },
      { key: '[', ctrlKey: true, action: 'sendBackward', description: '后移一层' },
      { key: ']', ctrlKey: true, action: 'bringForward', description: '前移一层' },
      { key: '[', ctrlKey: true, shiftKey: true, action: 'sendToBack', description: '置于底层' },
      { key: ']', ctrlKey: true, shiftKey: true, action: 'bringToFront', description: '置于顶层' },
    ];

    defaults.forEach(shortcut => this.registerShortcut(shortcut));
  }

  private getShortcutKey(shortcut: Omit<KeyboardShortcut, 'action' | 'description'>): string {
    const parts: string[] = [];
    if (shortcut.ctrlKey) parts.push('ctrl');
    if (shortcut.shiftKey) parts.push('shift');
    if (shortcut.altKey) parts.push('alt');
    parts.push(shortcut.key.toLowerCase());
    return parts.join('+');
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.isEnabled) return;

    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      if (e.key !== 'Escape') return;
    }

    const shortcutKey = this.getShortcutKey({
      key: e.key,
      ctrlKey: e.ctrlKey || e.metaKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
    });

    const shortcut = this.shortcuts.get(shortcutKey);
    if (shortcut) {
      e.preventDefault();
      const handler = this.actionHandlers.get(shortcut.action);
      if (handler) handler();
    }
  }

  registerShortcut(shortcut: KeyboardShortcut): void {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  unregisterShortcut(shortcut: Omit<KeyboardShortcut, 'action' | 'description'>): void {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.delete(key);
  }

  on(action: string, handler: () => void): void {
    this.actionHandlers.set(action, handler);
  }

  off(action: string): void {
    this.actionHandlers.delete(action);
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    this.shortcuts.clear();
    this.actionHandlers.clear();
  }
}
