import { WeatherType } from './types';

export class WeatherSystem {
  private currentWeather: WeatherType;
  private weatherTimer: number;
  private weatherDuration: number;

  constructor() {
    this.currentWeather = WeatherType.CLEAR;
    this.weatherTimer = 0;
    this.weatherDuration = 60;
  }

  update(deltaTime: number): void {
    this.weatherTimer += deltaTime;

    if (this.weatherTimer >= this.weatherDuration) {
      this.weatherTimer = 0;
      this.weatherDuration = 30 + Math.random() * 90;
      this.changeWeather();
    }
  }

  private changeWeather(): void {
    const rand = Math.random();
    if (rand < 0.5) {
      this.currentWeather = WeatherType.CLEAR;
    } else if (rand < 0.75) {
      this.currentWeather = WeatherType.CLOUDY;
    } else if (rand < 0.9) {
      this.currentWeather = WeatherType.RAIN;
    } else {
      this.currentWeather = WeatherType.STORM;
    }
  }

  getWeather(): WeatherType {
    return this.currentWeather;
  }

  getTemperatureModifier(): number {
    switch (this.currentWeather) {
      case WeatherType.CLEAR: return 2;
      case WeatherType.CLOUDY: return 0;
      case WeatherType.RAIN: return -5;
      case WeatherType.STORM: return -10;
      default: return 0;
    }
  }

  getVisibilityModifier(): number {
    switch (this.currentWeather) {
      case WeatherType.CLEAR: return 1;
      case WeatherType.CLOUDY: return 0.9;
      case WeatherType.RAIN: return 0.7;
      case WeatherType.STORM: return 0.5;
      default: return 1;
    }
  }

  serialize(): any {
    return {
      currentWeather: this.currentWeather,
      weatherTimer: this.weatherTimer,
      weatherDuration: this.weatherDuration
    };
  }

  static deserialize(data: any): WeatherSystem {
    const system = new WeatherSystem();
    system.currentWeather = data.currentWeather;
    system.weatherTimer = data.weatherTimer;
    system.weatherDuration = data.weatherDuration;
    return system;
  }
}
