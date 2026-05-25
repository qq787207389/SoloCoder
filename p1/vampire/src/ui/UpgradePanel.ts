
import { Upgrade } from '../types';

export class UpgradePanel {
  private container: HTMLDivElement;
  private title: HTMLDivElement;
  private optionsContainer: HTMLDivElement;
  private onSelect: ((upgrade: Upgrade) =&gt; void) | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    this.container.style.display = 'none';
    this.container.style.flexDirection = 'column';
    this.container.style.alignItems = 'center';
    this.container.style.justifyContent = 'center';
    this.container.style.zIndex = '100';
    this.container.style.fontFamily = 'Press Start 2P, Arial, sans-serif';

    this.title = document.createElement('div');
    this.title.style.color = '#9d4edd';
    this.title.style.fontSize = '28px';
    this.title.style.marginBottom = '40px';
    this.title.textContent = 'LEVEL UP!';

    this.optionsContainer = document.createElement('div');
    this.optionsContainer.style.display = 'flex';
    this.optionsContainer.style.gap = '30px';
    this.optionsContainer.style.flexWrap = 'wrap';
    this.optionsContainer.style.justifyContent = 'center';

    this.container.appendChild(this.title);
    this.container.appendChild(this.optionsContainer);
    document.getElementById('game-container')?.appendChild(this.container);
  }

  show(upgrades: Upgrade[], onSelect: (upgrade: Upgrade) =&gt; void): void {
    this.onSelect = onSelect;
    this.optionsContainer.innerHTML = '';

    upgrades.forEach((upgrade) =&gt; {
      const option = this.createOption(upgrade);
      this.optionsContainer.appendChild(option);
    });

    this.container.style.display = 'flex';
  }

  hide(): void {
    this.container.style.display = 'none';
    this.onSelect = null;
  }

  private createOption(upgrade: Upgrade): HTMLDivElement {
    const option = document.createElement('div');
    option.style.backgroundColor = '#1a1a2e';
    option.style.border = '3px solid #9d4edd';
    option.style.borderRadius = '10px';
    option.style.padding = '25px';
    option.style.width = '200px';
    option.style.cursor = 'pointer';
    option.style.transition = 'transform 0.2s, box-shadow 0.2s';
    option.style.pointerEvents = 'auto';

    const icon = document.createElement('div');
    icon.style.fontSize = '48px';
    icon.style.marginBottom = '15px';
    icon.style.textAlign = 'center';
    icon.textContent = upgrade.icon;

    const name = document.createElement('div');
    name.style.color = '#fff';
    name.style.fontSize = '14px';
    name.style.marginBottom = '10px';
    name.style.textAlign = 'center';
    name.textContent = upgrade.name;

    const desc = document.createElement('div');
    desc.style.color = '#aaa';
    desc.style.fontSize = '10px';
    desc.style.textAlign = 'center';
    desc.style.lineHeight = '1.5';
    desc.textContent = upgrade.description;

    option.appendChild(icon);
    option.appendChild(name);
    option.appendChild(desc);

    option.addEventListener('mouseenter', () =&gt; {
      option.style.transform = 'scale(1.05)';
      option.style.boxShadow = '0 0 20px rgba(157, 78, 221, 0.5)';
    });

    option.addEventListener('mouseleave', () =&gt; {
      option.style.transform = 'scale(1)';
      option.style.boxShadow = 'none';
    });

    option.addEventListener('click', () =&gt; {
      if (this.onSelect) {
        this.onSelect(upgrade);
      }
    });

    return option;
  }

  destroy(): void {
    this.container.remove();
  }
}
