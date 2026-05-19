import { QuadTreeItem, Rectangle } from './types'

const MAX_ITEMS = 4
const MAX_DEPTH = 8

export class QuadTree {
  private bounds: Rectangle
  private depth: number
  private items: QuadTreeItem[] = []
  private nodes: QuadTree[] | null = null

  constructor(bounds: Rectangle, depth: number = 0) {
    this.bounds = bounds
    this.depth = depth
  }

  insert(item: QuadTreeItem): boolean {
    if (!this.contains(item.x, item.y)) {
      return false
    }

    if (this.items.length < MAX_ITEMS || this.depth >= MAX_DEPTH) {
      this.items.push(item)
      return true
    }

    if (!this.nodes) {
      this.split()
    }

    for (const node of this.nodes!) {
      if (node.insert(item)) {
        return true
      }
    }

    return false
  }

  query(x: number, y: number, radius: number = 5): QuadTreeItem[] {
    const result: QuadTreeItem[] = []
    this.queryRange({
      x: x - radius,
      y: y - radius,
      width: radius * 2,
      height: radius * 2
    }, result)
    return result.sort((a, b) => {
      const distA = Math.sqrt((a.x - x) ** 2 + (a.y - y) ** 2)
      const distB = Math.sqrt((b.x - x) ** 2 + (b.y - y) ** 2)
      return distA - distB
    })
  }

  private queryRange(range: Rectangle, result: QuadTreeItem[]): void {
    if (!this.intersects(range)) {
      return
    }

    for (const item of this.items) {
      if (this.pointInRange(item.x, item.y, range)) {
        result.push(item)
      }
    }

    if (this.nodes) {
      for (const node of this.nodes) {
        node.queryRange(range, result)
      }
    }
  }

  private contains(x: number, y: number): boolean {
    return x >= this.bounds.x &&
           x < this.bounds.x + this.bounds.width &&
           y >= this.bounds.y &&
           y < this.bounds.y + this.bounds.height
  }

  private pointInRange(x: number, y: number, range: Rectangle): boolean {
    return x >= range.x &&
           x < range.x + range.width &&
           y >= range.y &&
           y < range.y + range.height
  }

  private intersects(range: Rectangle): boolean {
    return !(range.x > this.bounds.x + this.bounds.width ||
             range.x + range.width < this.bounds.x ||
             range.y > this.bounds.y + this.bounds.height ||
             range.y + range.height < this.bounds.y)
  }

  private split(): void {
    const subWidth = this.bounds.width / 2
    const subHeight = this.bounds.height / 2
    const x = this.bounds.x
    const y = this.bounds.y

    this.nodes = [
      new QuadTree({ x: x + subWidth, y, width: subWidth, height: subHeight }, this.depth + 1),
      new QuadTree({ x, y, width: subWidth, height: subHeight }, this.depth + 1),
      new QuadTree({ x, y: y + subHeight, width: subWidth, height: subHeight }, this.depth + 1),
      new QuadTree({ x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight }, this.depth + 1)
    ]
  }

  clear(): void {
    this.items = []
    if (this.nodes) {
      for (const node of this.nodes) {
        node.clear()
      }
      this.nodes = null
    }
  }
}
