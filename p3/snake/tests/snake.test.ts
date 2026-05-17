import { describe, it, expect, beforeEach } from 'vitest';
import { Snake } from '../src/entities/Snake';

describe('Snake', () => {
  let snake: Snake;

  beforeEach(() => {
    snake = new Snake(10, 10, '#22c55e', 20, 20, 3, false);
  });

  it('should initialize with correct length', () => {
    expect(snake.getSegments().length).toBe(3);
  });

  it('should have correct head position', () => {
    const head = snake.getHeadPosition();
    expect(head.x).toBe(10);
    expect(head.y).toBe(10);
  });

  it('should grow when food is eaten', () => {
    const initialLength = snake.getSegments().length;
    snake.grow(1);
    expect(snake.getSegments().length).toBe(initialLength + 1);
  });

  it('should shrink when poison is eaten but not below 3', () => {
    snake.grow(2);
    expect(snake.getSegments().length).toBe(5);
    snake.grow(-2);
    expect(snake.getSegments().length).toBe(3);
  });

  it('should change direction correctly', () => {
    snake.setDirection('up');
    snake.update(200);
    const head = snake.getHeadPosition();
    expect(head.y).toBeLessThan(10);
  });

  it('should not reverse direction', () => {
    snake.setDirection('left');
    snake.setDirection('right');
    const segments = snake.getSegments();
    expect(segments[0].x).toBeGreaterThan(segments[1].x);
  });

  it('should be alive initially', () => {
    expect(snake.getIsAlive()).toBe(true);
  });

  it('should die when set to not alive', () => {
    snake.setIsAlive(false);
    expect(snake.getIsAlive()).toBe(false);
  });

  it('should update score correctly', () => {
    snake.addScore(100);
    expect(snake.getScore()).toBe(100);
    snake.addScore(-50);
    expect(snake.getScore()).toBe(50);
  });

  it('should not have negative score', () => {
    snake.addScore(-100);
    expect(snake.getScore()).toBe(0);
  });

  it('should have power up effect', () => {
    snake.setPowerUp('speed', 3000);
    expect(snake.getPowerUp()).toBe('speed');
  });

  it('should wrap walls when enabled', () => {
    snake.setWrapWalls(true);
    expect(snake.getWrapWalls()).toBe(true);
  });

  it('should increment foods eaten', () => {
    snake.grow(1);
    snake.grow(1);
    expect(snake.getFoodsEaten()).toBe(2);
  });

  it('should have correct color', () => {
    expect(snake.getColor()).toBe('#22c55e');
    snake.setColor('#ef4444');
    expect(snake.getColor()).toBe('#ef4444');
  });

  it('should identify AI correctly', () => {
    expect(snake.getIsAI()).toBe(false);
    const aiSnake = new Snake(5, 5, '#8b5cf6', 20, 20, 3, true);
    expect(aiSnake.getIsAI()).toBe(true);
  });
});
