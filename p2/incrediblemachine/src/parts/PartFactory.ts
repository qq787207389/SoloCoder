import Matter from 'matter-js';
import { Part, PartType, SerializedPart } from '../types';

export class PartFactory {
  private static idCounter = 0;

  private static generateId(): string {
    return `part_${++PartFactory.idCounter}_${Date.now()}`;
  }

  static createPart(type: PartType, x: number, y: number, rotation: number = 0): Part {
    const id = this.generateId();
    
    switch (type) {
      case 'wood_plank':
        return this.createWoodPlank(id, x, y, rotation);
      case 'spring':
        return this.createSpring(id, x, y, rotation);
      case 'conveyor':
        return this.createConveyor(id, x, y, rotation);
      case 'speed_ring':
        return this.createSpeedRing(id, x, y, rotation);
      case 'seesaw':
        return this.createSeesaw(id, x, y, rotation);
      case 'balloon':
        return this.createBalloon(id, x, y, rotation);
      case 'fan':
        return this.createFan(id, x, y, rotation);
      case 'pin':
        return this.createPin(id, x, y, rotation);
      default:
        throw new Error(`Unknown part type: ${type}`);
    }
  }

  private static createWoodPlank(id: string, x: number, y: number, rotation: number): Part {
    const body = Matter.Bodies.rectangle(x, y, 120, 20, {
      isStatic: true,
      friction: 0.8,
      restitution: 0.2,
      render: {
        fillStyle: '#8B4513',
        strokeStyle: '#5D3A1A',
        lineWidth: 2
      }
    });
    
    Matter.Body.setAngle(body, rotation);
    
    return {
      id,
      type: 'wood_plank',
      x,
      y,
      rotation,
      bodies: [body],
      constraints: [],
      isStatic: true,
      isSelected: false
    };
  }

  private static createSpring(id: string, x: number, y: number, rotation: number): Part {
    const base = Matter.Bodies.rectangle(x, y + 20, 60, 10, {
      isStatic: true,
      render: { fillStyle: '#654321' }
    });
    
    const platform = Matter.Bodies.rectangle(x, y - 10, 50, 10, {
      density: 0.0005,
      restitution: 0.8,
      render: { fillStyle: '#8B4513' }
    });
    
    const spring = Matter.Constraint.create({
      bodyA: base,
      bodyB: platform,
      stiffness: 0.05,
      damping: 0.05,
      length: 25,
      render: { strokeStyle: '#CD853F', lineWidth: 2 }
    });
    
    const leftSpring = Matter.Constraint.create({
      bodyA: base,
      pointA: { x: -20, y: 0 },
      bodyB: platform,
      pointB: { x: -15, y: 0 },
      stiffness: 0.05,
      damping: 0.05,
      length: 25,
      render: { visible: false }
    });
    
    const rightSpring = Matter.Constraint.create({
      bodyA: base,
      pointA: { x: 20, y: 0 },
      bodyB: platform,
      pointB: { x: 15, y: 0 },
      stiffness: 0.05,
      damping: 0.05,
      length: 25,
      render: { visible: false }
    });
    
    return {
      id,
      type: 'spring',
      x,
      y,
      rotation,
      bodies: [base, platform],
      constraints: [spring, leftSpring, rightSpring],
      isStatic: true,
      isSelected: false,
      data: { isSpring: true, bounceForce: 0.01 }
    };
  }

  private static createConveyor(id: string, x: number, y: number, rotation: number): Part {
    const body = Matter.Bodies.rectangle(x, y, 100, 20, {
      isStatic: true,
      friction: 0,
      render: {
        fillStyle: '#4A4A4A',
        strokeStyle: '#2A2A2A',
        lineWidth: 2
      }
    });
    
    Matter.Body.setAngle(body, rotation);
    
    return {
      id,
      type: 'conveyor',
      x,
      y,
      rotation,
      bodies: [body],
      constraints: [],
      isStatic: true,
      isSelected: false,
      data: { speed: 5 }
    };
  }

  private static createSpeedRing(id: string, x: number, y: number, rotation: number): Part {
    const body = Matter.Bodies.circle(x, y, 25, {
      isStatic: true,
      isSensor: true,
      render: {
        fillStyle: 'transparent',
        strokeStyle: '#FFD700',
        lineWidth: 3
      }
    });
    
    return {
      id,
      type: 'speed_ring',
      x,
      y,
      rotation,
      bodies: [body],
      constraints: [],
      isStatic: true,
      isSelected: false,
      data: { boostForce: 0.015 }
    };
  }

  private static createSeesaw(id: string, x: number, y: number, rotation: number): Part {
    const pivot = Matter.Bodies.circle(x, y, 10, {
      isStatic: true,
      render: { fillStyle: '#654321' }
    });
    
    const plank = Matter.Bodies.rectangle(x, y - 5, 150, 15, {
      density: 0.002,
      friction: 0.6,
      render: {
        fillStyle: '#8B4513',
        strokeStyle: '#5D3A1A',
        lineWidth: 2
      }
    });
    
    const constraint = Matter.Constraint.create({
      bodyA: pivot,
      bodyB: plank,
      pointA: { x: 0, y: 0 },
      pointB: { x: 0, y: 0 },
      stiffness: 1,
      length: 0,
      render: { visible: false }
    });
    
    return {
      id,
      type: 'seesaw',
      x,
      y,
      rotation,
      bodies: [pivot, plank],
      constraints: [constraint],
      isStatic: false,
      isSelected: false
    };
  }

  private static createBalloon(id: string, x: number, y: number, rotation: number): Part {
    const balloon = Matter.Bodies.circle(x, y, 25, {
      density: 0.0001,
      restitution: 0.5,
      render: {
        fillStyle: '#FF6B6B',
        strokeStyle: '#CC5555',
        lineWidth: 2
      }
    });
    
    const stringEnd = Matter.Bodies.circle(x, y + 50, 5, {
      isStatic: true,
      render: { visible: false }
    });
    
    const string = Matter.Constraint.create({
      bodyA: balloon,
      bodyB: stringEnd,
      pointA: { x: 0, y: 25 },
      pointB: { x: 0, y: 0 },
      stiffness: 0.1,
      damping: 0.05,
      length: 50,
      render: { strokeStyle: '#888', lineWidth: 1 }
    });
    
    return {
      id,
      type: 'balloon',
      x,
      y,
      rotation,
      bodies: [balloon, stringEnd],
      constraints: [string],
      isStatic: false,
      isSelected: false,
      data: { buoyancy: -0.0008 }
    };
  }

  private static createFan(id: string, x: number, y: number, rotation: number): Part {
    const body = Matter.Bodies.rectangle(x, y, 60, 60, {
      isStatic: true,
      isSensor: true,
      render: {
        fillStyle: '#87CEEB',
        strokeStyle: '#5BA3C6',
        lineWidth: 2
      }
    });
    
    Matter.Body.setAngle(body, rotation);
    
    return {
      id,
      type: 'fan',
      x,
      y,
      rotation,
      bodies: [body],
      constraints: [],
      isStatic: true,
      isSelected: false,
      data: {
        windForce: 0.003,
        windDirection: { x: 0, y: -1 },
        range: 150
      }
    };
  }

  private static createPin(id: string, x: number, y: number, rotation: number): Part {
    const body = Matter.Bodies.circle(x, y, 8, {
      isStatic: true,
      render: {
        fillStyle: '#C0C0C0',
        strokeStyle: '#808080',
        lineWidth: 1
      }
    });
    
    return {
      id,
      type: 'pin',
      x,
      y,
      rotation,
      bodies: [body],
      constraints: [],
      isStatic: true,
      isSelected: false
    };
  }

  static serializePart(part: Part): SerializedPart {
    return {
      id: part.id,
      type: part.type,
      x: part.x,
      y: part.y,
      rotation: part.rotation,
      isStatic: part.isStatic,
      data: part.data
    };
  }

  static deserializePart(serialized: SerializedPart): Part {
    const part = this.createPart(serialized.type, serialized.x, serialized.y, serialized.rotation);
    part.id = serialized.id;
    part.isStatic = serialized.isStatic;
    if (serialized.data) {
      part.data = serialized.data;
    }
    return part;
  }
}
