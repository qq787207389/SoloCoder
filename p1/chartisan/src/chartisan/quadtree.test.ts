import { describe, it, expect, beforeEach } from 'vitest'
import { QuadTree } from './quadtree'

describe('QuadTree', () => {
  let quadTree: QuadTree

  beforeEach(() => {
    quadTree = new QuadTree({
      x: 0,
      y: 0,
      width: 100,
      height: 100
    })
  })

  it('should insert items within bounds', () => {
    const result = quadTree.insert({ x: 50, y: 50, data: { label: 'test', value: 1 }, seriesIndex: 0 })
    expect(result).toBe(true)
  })

  it('should not insert items outside bounds', () => {
    const result = quadTree.insert({ x: 150, y: 150, data: { label: 'test', value: 1 }, seriesIndex: 0 })
    expect(result).toBe(false)
  })

  it('should query nearby items', () => {
    quadTree.insert({ x: 50, y: 50, data: { label: 'A', value: 1 }, seriesIndex: 0 })
    quadTree.insert({ x: 60, y: 60, data: { label: 'B', value: 2 }, seriesIndex: 0 })
    quadTree.insert({ x: 200, y: 200, data: { label: 'C', value: 3 }, seriesIndex: 0 })

    const results = quadTree.query(55, 55, 20)
    expect(results.length).toBe(2)
    expect(results[0].data.label).toBe('A')
  })

  it('should sort results by distance', () => {
    quadTree.insert({ x: 70, y: 70, data: { label: 'Far', value: 1 }, seriesIndex: 0 })
    quadTree.insert({ x: 55, y: 55, data: { label: 'Near', value: 2 }, seriesIndex: 0 })

    const results = quadTree.query(50, 50, 50)
    expect(results[0].data.label).toBe('Near')
    expect(results[1].data.label).toBe('Far')
  })

  it('should clear all items', () => {
    quadTree.insert({ x: 50, y: 50, data: { label: 'A', value: 1 }, seriesIndex: 0 })
    quadTree.insert({ x: 60, y: 60, data: { label: 'B', value: 2 }, seriesIndex: 0 })

    quadTree.clear()
    const results = quadTree.query(55, 55, 50)
    expect(results.length).toBe(0)
  })
})
