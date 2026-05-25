import { BuildingType, BuildingCategory } from '../types';

export interface BuildingConfig {
  type: BuildingType;
  category: BuildingCategory;
  name: string;
  cost: number;
  maxPopulation: number;
  maxJobs: number;
  taxRate: number;
  maintenanceCost: number;
  minLevel: number;
  maxLevel: number;
  landValueBonus: number;
  pollution: number;
  satisfactionBonus: number;
  policeCoverage: number;
  fireCoverage: number;
  healthCoverage: number;
  educationCoverage: number;
  width: number;
  height: number;
  colors: {
    base: string;
    roof: string;
    accent: string;
  };
}

export const BUILDING_CONFIGS: Record<BuildingType, BuildingConfig> = {
  [BuildingType.HOUSE_LOW]: {
    type: BuildingType.HOUSE_LOW,
    category: BuildingCategory.RESIDENTIAL,
    name: '小木屋',
    cost: 0,
    maxPopulation: 4,
    maxJobs: 0,
    taxRate: 10,
    maintenanceCost: 0,
    minLevel: 1,
    maxLevel: 1,
    landValueBonus: 1,
    pollution: 0,
    satisfactionBonus: 0,
    policeCoverage: 0,
    fireCoverage: 0,
    healthCoverage: 0,
    educationCoverage: 0,
    width: 1,
    height: 1,
    colors: {
      base: '#8B7355',
      roof: '#A0522D',
      accent: '#DEB887'
    }
  },
  [BuildingType.HOUSE_MED]: {
    type: BuildingType.HOUSE_MED,
    category: BuildingCategory.RESIDENTIAL,
    name: '住宅',
    cost: 0,
    maxPopulation: 8,
    maxJobs: 0,
    taxRate: 15,
    maintenanceCost: 0,
    minLevel: 2,
    maxLevel: 2,
    landValueBonus: 2,
    pollution: 0,
    satisfactionBonus: 0,
    policeCoverage: 0,
    fireCoverage: 0,
    healthCoverage: 0,
    educationCoverage: 0,
    width: 1,
    height: 1,
    colors: {
      base: '#CD853F',
      roof: '#8B4513',
      accent: '#F5DEB3'
    }
  },
  [BuildingType.APARTMENT]: {
    type: BuildingType.APARTMENT,
    category: BuildingCategory.RESIDENTIAL,
    name: '公寓楼',
    cost: 0,
    maxPopulation: 20,
    maxJobs: 0,
    taxRate: 25,
    maintenanceCost: 0,
    minLevel: 3,
    maxLevel: 3,
    landValueBonus: 3,
    pollution: 1,
    satisfactionBonus: 0,
    policeCoverage: 0,
    fireCoverage: 0,
    healthCoverage: 0,
    educationCoverage: 0,
    width: 1,
    height: 1,
    colors: {
      base: '#708090',
      roof: '#2F4F4F',
      accent: '#B0C4DE'
    }
  },
  [BuildingType.SHOP_SMALL]: {
    type: BuildingType.SHOP_SMALL,
    category: BuildingCategory.COMMERCIAL,
    name: '小店',
    cost: 0,
    maxPopulation: 0,
    maxJobs: 2,
    taxRate: 20,
    maintenanceCost: 0,
    minLevel: 1,
    maxLevel: 1,
    landValueBonus: 2,
    pollution: 0,
    satisfactionBonus: 1,
    policeCoverage: 0,
    fireCoverage: 0,
    healthCoverage: 0,
    educationCoverage: 0,
    width: 1,
    height: 1,
    colors: {
      base: '#DC143C',
      roof: '#8B0000',
      accent: '#FFD700'
    }
  },
  [BuildingType.SHOP_LARGE]: {
    type: BuildingType.SHOP_LARGE,
    category: BuildingCategory.COMMERCIAL,
    name: '商场',
    cost: 0,
    maxPopulation: 0,
    maxJobs: 10,
    taxRate: 40,
    maintenanceCost: 0,
    minLevel: 2,
    maxLevel: 2,
    landValueBonus: 4,
    pollution: 1,
    satisfactionBonus: 3,
    policeCoverage: 0,
    fireCoverage: 0,
    healthCoverage: 0,
    educationCoverage: 0,
    width: 1,
    height: 1,
    colors: {
      base: '#4169E1',
      roof: '#000080',
      accent: '#87CEEB'
    }
  },
  [BuildingType.OFFICE]: {
    type: BuildingType.OFFICE,
    category: BuildingCategory.COMMERCIAL,
    name: '写字楼',
    cost: 0,
    maxPopulation: 0,
    maxJobs: 30,
    taxRate: 60,
    maintenanceCost: 0,
    minLevel: 3,
    maxLevel: 3,
    landValueBonus: 5,
    pollution: 2,
    satisfactionBonus: 2,
    policeCoverage: 0,
    fireCoverage: 0,
    healthCoverage: 0,
    educationCoverage: 0,
    width: 1,
    height: 1,
    colors: {
      base: '#483D8B',
      roof: '#191970',
      accent: '#E6E6FA'
    }
  },
  [BuildingType.FACTORY_SMALL]: {
    type: BuildingType.FACTORY_SMALL,
    category: BuildingCategory.INDUSTRIAL,
    name: '小工厂',
    cost: 0,
    maxPopulation: 0,
    maxJobs: 8,
    taxRate: 30,
    maintenanceCost: 0,
    minLevel: 1,
    maxLevel: 1,
    landValueBonus: -2,
    pollution: 5,
    satisfactionBonus: -1,
    policeCoverage: 0,
    fireCoverage: 0,
    healthCoverage: 0,
    educationCoverage: 0,
    width: 1,
    height: 1,
    colors: {
      base: '#696969',
      roof: '#2F4F4F',
      accent: '#A9A9A9'
    }
  },
  [BuildingType.FACTORY_LARGE]: {
    type: BuildingType.FACTORY_LARGE,
    category: BuildingCategory.INDUSTRIAL,
    name: '大工厂',
    cost: 0,
    maxPopulation: 0,
    maxJobs: 25,
    taxRate: 80,
    maintenanceCost: 0,
    minLevel: 2,
    maxLevel: 2,
    landValueBonus: -4,
    pollution: 10,
    satisfactionBonus: -3,
    policeCoverage: 0,
    fireCoverage: 0,
    healthCoverage: 0,
    educationCoverage: 0,
    width: 1,
    height: 1,
    colors: {
      base: '#556B2F',
      roof: '#2F4F4F',
      accent: '#808000'
    }
  },
  [BuildingType.POLICE]: {
    type: BuildingType.POLICE,
    category: BuildingCategory.PUBLIC_SERVICE,
    name: '警察局',
    cost: 5000,
    maxPopulation: 0,
    maxJobs: 10,
    taxRate: 0,
    maintenanceCost: 100,
    minLevel: 1,
    maxLevel: 1,
    landValueBonus: 3,
    pollution: 0,
    satisfactionBonus: 5,
    policeCoverage: 8,
    fireCoverage: 0,
    healthCoverage: 0,
    educationCoverage: 0,
    width: 1,
    height: 1,
    colors: {
      base: '#1E90FF',
      roof: '#000080',
      accent: '#FFFFFF'
    }
  },
  [BuildingType.FIRE_STATION]: {
    type: BuildingType.FIRE_STATION,
    category: BuildingCategory.PUBLIC_SERVICE,
    name: '消防局',
    cost: 5000,
    maxPopulation: 0,
    maxJobs: 8,
    taxRate: 0,
    maintenanceCost: 100,
    minLevel: 1,
    maxLevel: 1,
    landValueBonus: 3,
    pollution: 0,
    satisfactionBonus: 5,
    policeCoverage: 0,
    fireCoverage: 8,
    healthCoverage: 0,
    educationCoverage: 0,
    width: 1,
    height: 1,
    colors: {
      base: '#FF4500',
      roof: '#8B0000',
      accent: '#FFFF00'
    }
  },
  [BuildingType.SCHOOL]: {
    type: BuildingType.SCHOOL,
    category: BuildingCategory.PUBLIC_SERVICE,
    name: '学校',
    cost: 8000,
    maxPopulation: 0,
    maxJobs: 15,
    taxRate: 0,
    maintenanceCost: 150,
    minLevel: 1,
    maxLevel: 1,
    landValueBonus: 4,
    pollution: 0,
    satisfactionBonus: 8,
    policeCoverage: 0,
    fireCoverage: 0,
    healthCoverage: 0,
    educationCoverage: 10,
    width: 1,
    height: 1,
    colors: {
      base: '#FFD700',
      roof: '#DAA520',
      accent: '#8B4513'
    }
  },
  [BuildingType.HOSPITAL]: {
    type: BuildingType.HOSPITAL,
    category: BuildingCategory.PUBLIC_SERVICE,
    name: '医院',
    cost: 10000,
    maxPopulation: 0,
    maxJobs: 20,
    taxRate: 0,
    maintenanceCost: 200,
    minLevel: 1,
    maxLevel: 1,
    landValueBonus: 5,
    pollution: 0,
    satisfactionBonus: 10,
    policeCoverage: 0,
    fireCoverage: 0,
    healthCoverage: 10,
    educationCoverage: 0,
    width: 1,
    height: 1,
    colors: {
      base: '#FFFFFF',
      roof: '#F5F5F5',
      accent: '#FF0000'
    }
  },
  [BuildingType.PARK]: {
    type: BuildingType.PARK,
    category: BuildingCategory.PUBLIC_SERVICE,
    name: '公园',
    cost: 2000,
    maxPopulation: 0,
    maxJobs: 2,
    taxRate: 0,
    maintenanceCost: 20,
    minLevel: 1,
    maxLevel: 1,
    landValueBonus: 5,
    pollution: -3,
    satisfactionBonus: 10,
    policeCoverage: 0,
    fireCoverage: 0,
    healthCoverage: 0,
    educationCoverage: 0,
    width: 1,
    height: 1,
    colors: {
      base: '#228B22',
      roof: '#006400',
      accent: '#90EE90'
    }
  }
};

export function getBuildingConfig(type: BuildingType): BuildingConfig {
  return BUILDING_CONFIGS[type];
}

export function getResidentialBuildingForLevel(level: number): BuildingType {
  switch (level) {
    case 1: return BuildingType.HOUSE_LOW;
    case 2: return BuildingType.HOUSE_MED;
    case 3: return BuildingType.APARTMENT;
    default: return BuildingType.HOUSE_LOW;
  }
}

export function getCommercialBuildingForLevel(level: number): BuildingType {
  switch (level) {
    case 1: return BuildingType.SHOP_SMALL;
    case 2: return BuildingType.SHOP_LARGE;
    case 3: return BuildingType.OFFICE;
    default: return BuildingType.SHOP_SMALL;
  }
}

export function getIndustrialBuildingForLevel(level: number): BuildingType {
  switch (level) {
    case 1: return BuildingType.FACTORY_SMALL;
    case 2: return BuildingType.FACTORY_LARGE;
    default: return BuildingType.FACTORY_SMALL;
  }
}
