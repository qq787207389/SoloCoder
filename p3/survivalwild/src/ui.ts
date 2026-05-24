import { Player } from './player';
import { ITEM_INFO, BuildingType, BUILDING_INFO, WeatherType } from './types';

export class UISystem {
  private messages: { text: string; time: number }[] = [];
  private showCraftPanel: boolean = false;
  private buildMode: boolean = false;
  private selectedBuilding: BuildingType | null = null;

  updateStatus(player: Player): void {
    document.getElementById('healthBar')!.style.width = `${player.health}%`;
    document.getElementById('hungerBar')!.style.width = `${player.hunger}%`;
    document.getElementById('thirstBar')!.style.width = `${player.thirst}%`;
    document.getElementById('staminaBar')!.style.width = `${player.stamina}%`;
  }

  updateHotbar(player: Player): void {
    const hotbar = document.getElementById('hotbar')!;
    hotbar.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
      const slot = player.inventory.getSlot(i);
      const div = document.createElement('div');
      div.className = `hotbar-slot ${i === player.hotbarIndex ? 'active' : ''}`;
      div.innerHTML = `<span class="hotbar-key">${i + 1}</span>`;
      
      if (slot && slot.item) {
        const info = ITEM_INFO[slot.item];
        div.innerHTML += `<span class="inv-icon">${info.icon}</span>`;
        if (info.stackable && slot.count > 1) {
          div.innerHTML += `<span class="inv-count">${slot.count}</span>`;
        }
      }
      
      div.onclick = () => { player.hotbarIndex = i; };
      hotbar.appendChild(div);
    }
  }

  updateInventory(player: Player, show: boolean): void {
    const panel = document.getElementById('inventoryPanel')!;
    panel.innerHTML = '';
    
    if (!show) return;
    
    for (let i = 5; i < player.inventory.getSize(); i++) {
      const slot = player.inventory.getSlot(i);
      const div = document.createElement('div');
      div.className = `inv-slot ${i === player.hotbarIndex ? 'selected' : ''}`;
      
      if (slot && slot.item) {
        const info = ITEM_INFO[slot.item];
        div.innerHTML = `<span class="inv-icon">${info.icon}</span>`;
        if (info.stackable && slot.count > 1) {
          div.innerHTML += `<span class="inv-count">${slot.count}</span>`;
        }
      }
      
      div.onclick = () => { player.hotbarIndex = i; };
      panel.appendChild(div);
    }
  }

  updateCraftPanel(player: Player, nearbyBuildings: BuildingType[]): void {
    const panel = document.getElementById('craftPanel')!;
    panel.className = `panel ${this.showCraftPanel ? 'show' : ''}`;
    
    if (!this.showCraftPanel) return;
    
    const list = document.getElementById('recipeList')!;
    list.innerHTML = '';
    
    const recipes = player.inventory.getAvailableRecipes(nearbyBuildings);
    
    recipes.forEach(({ recipe, available }) => {
      const info = ITEM_INFO[recipe.result];
      const div = document.createElement('div');
      div.className = `recipe ${available ? 'available' : 'unavailable'}`;
      
      const ingredients = recipe.ingredients
        .map(i => `${ITEM_INFO[i.item].icon}x${i.count}`)
        .join(' + ');
      
      let requires = '';
      if (recipe.requires) {
        requires = `<br>需要: ${BUILDING_INFO[recipe.requires].name}`;
      }
      
      div.innerHTML = `
        <div class="recipe-name">${info.icon} ${info.name} x${recipe.resultCount}</div>
        <div class="recipe-ingredients">${ingredients}${requires}</div>
      `;
      
      if (available) {
        div.onclick = () => {
          player.inventory.craft(recipe, nearbyBuildings);
          this.addMessage(`合成了 ${info.name}!`);
        };
      }
      
      list.appendChild(div);
    });
  }

  updateBuildPanel(show: boolean): void {
    const panel = document.getElementById('buildMode')!;
    panel.className = `panel ${show ? 'show' : ''}`;
    
    if (!show) return;
    
    if (panel.children.length <= 1) {
      Object.entries(BUILDING_INFO).forEach(([type, info]) => {
        const div = document.createElement('div');
        div.className = `build-item ${this.selectedBuilding === type ? 'selected' : ''}`;
        
        const cost = info.cost
          .map(c => `${ITEM_INFO[c.item].icon}x${c.count}`)
          .join(' ');
        
        div.innerHTML = `${info.icon} ${info.name}<br><small>${cost}</small>`;
        
        div.onclick = () => {
          this.selectedBuilding = type as BuildingType;
          this.updateBuildPanel(true);
        };
        
        panel.appendChild(div);
      });
    }
  }

  updateTime(timeOfDay: number, day: number, weather: WeatherType): void {
    const timeIcon = document.getElementById('timeIcon')!;
    const weatherInfo = document.getElementById('weatherInfo')!;
    const dayInfo = document.getElementById('dayInfo')!;
    
    if (timeOfDay < 0.25 || timeOfDay > 0.85) {
      timeIcon.textContent = '🌙';
    } else if (timeOfDay < 0.3 || timeOfDay > 0.8) {
      timeIcon.textContent = '🌅';
    } else {
      timeIcon.textContent = '☀️';
    }
    
    const weatherNames: Record<WeatherType, string> = {
      [WeatherType.CLEAR]: '晴朗',
      [WeatherType.CLOUDY]: '多云',
      [WeatherType.RAIN]: '下雨',
      [WeatherType.STORM]: '暴风雨'
    };
    
    weatherInfo.textContent = weatherNames[weather];
    dayInfo.textContent = `第 ${day} 天`;
  }

  addMessage(text: string): void {
    this.messages.push({ text, time: Date.now() });
    if (this.messages.length > 5) {
      this.messages.shift();
    }
    
    const log = document.getElementById('messageLog')!;
    log.innerHTML = '';
    this.messages.forEach(m => {
      const div = document.createElement('div');
      div.className = 'message';
      div.textContent = m.text;
      log.appendChild(div);
    });
  }

  toggleCraftPanel(): boolean {
    this.showCraftPanel = !this.showCraftPanel;
    if (this.showCraftPanel) {
      this.buildMode = false;
    }
    return this.showCraftPanel;
  }

  toggleBuildMode(): boolean {
    this.buildMode = !this.buildMode;
    if (this.buildMode) {
      this.showCraftPanel = false;
    }
    return this.buildMode;
  }

  isBuildMode(): boolean {
    return this.buildMode;
  }

  getSelectedBuilding(): BuildingType | null {
    return this.selectedBuilding;
  }

  showGameOver(victory: boolean, day: number): void {
    const gameOver = document.getElementById('gameOver')!;
    const title = document.getElementById('endTitle')!;
    const message = document.getElementById('endMessage')!;
    
    gameOver.className = 'panel show';
    
    if (victory) {
      title.textContent = '🎉 胜利!';
      message.textContent = `恭喜! 你在第 ${day} 天成功逃离了荒岛!`;
    } else {
      title.textContent = '💀 游戏结束';
      message.textContent = `你在第 ${day} 天死在了荒岛上...`;
    }
  }
}
