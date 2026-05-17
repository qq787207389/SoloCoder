interface GraphNode {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  type: string
}

interface GraphEdge {
  source: string
  target: string
}

interface LayoutMessage {
  nodes: GraphNode[]
  edges: GraphEdge[]
  width: number
  height: number
}

const REPULSION = 1000
const ATTRACTION = 0.01
const DAMPING = 0.9
const ITERATIONS = 200

self.onmessage = (e: MessageEvent<LayoutMessage>) => {
  const { nodes, edges, width, height } = e.data

  const nodeMap = new Map<string, GraphNode>()
  nodes.forEach(node => {
    nodeMap.set(node.id, {
      ...node,
      x: node.x || Math.random() * width,
      y: node.y || Math.random() * height,
      vx: 0,
      vy: 0
    })
  })

  for (let iter = 0; iter < ITERATIONS; iter++) {
    nodeMap.forEach(node => {
      nodeMap.forEach(other => {
        if (node.id !== other.id) {
          const dx = node.x - other.x
          const dy = node.y - other.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = REPULSION / (dist * dist)
          
          node.vx += (dx / dist) * force
          node.vy += (dy / dist) * force
        }
      })
    })

    edges.forEach(edge => {
      const source = nodeMap.get(edge.source)
      const target = nodeMap.get(edge.target)
      if (!source || !target) return

      const dx = target.x - source.x
      const dy = target.y - source.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const force = dist * ATTRACTION

      source.vx += (dx / dist) * force
      source.vy += (dy / dist) * force
      target.vx -= (dx / dist) * force
      target.vy -= (dy / dist) * force
    })

    const centerX = width / 2
    const centerY = height / 2
    nodeMap.forEach(node => {
      const dx = centerX - node.x
      const dy = centerY - node.y
      node.vx += dx * 0.001
      node.vy += dy * 0.001
    })

    nodeMap.forEach(node => {
      node.vx *= DAMPING
      node.vy *= DAMPING
      node.x += node.vx
      node.y += node.vy

      node.x = Math.max(20, Math.min(width - 20, node.x))
      node.y = Math.max(20, Math.min(height - 20, node.y))
    })

    if (iter % 10 === 0) {
      self.postMessage({
        nodes: Array.from(nodeMap.values()),
        progress: iter / ITERATIONS
      })
    }
  }

  self.postMessage({
    nodes: Array.from(nodeMap.values()),
    progress: 1,
    finished: true
  })
}
