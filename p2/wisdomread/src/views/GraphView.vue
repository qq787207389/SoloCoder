<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import * as d3 from 'd3'
import { useBookStore } from '@/stores/book'
import { useNoteStore } from '@/stores/note'
import type { GraphNode } from '@/types'

const bookStore = useBookStore()
const noteStore = useNoteStore()

const selectedNode = ref<GraphNode | null>(null)
const searchQuery = ref('')

const graphData = computed(() => {
  const nodes: GraphNode[] = []
  const edges: { source: string; target: string; type: string }[] = []
  const nodeIds = new Set<string>()

  bookStore.books.forEach(book => {
    if (!nodeIds.has(book.id)) {
      nodes.push({ id: book.id, label: book.title, type: 'book' })
      nodeIds.add(book.id)
    }

    const authorId = `author-${book.author}`
    if (!nodeIds.has(authorId)) {
      nodes.push({ id: authorId, label: book.author, type: 'author' })
      nodeIds.add(authorId)
    }
    edges.push({ source: book.id, target: authorId, type: 'written-by' })

    book.tags.forEach(tag => {
      const tagId = `tag-${tag}`
      if (!nodeIds.has(tagId)) {
        nodes.push({ id: tagId, label: tag, type: 'tag' })
        nodeIds.add(tagId)
      }
      edges.push({ source: book.id, target: tagId, type: 'tagged-with' })
    })
  })

  noteStore.notes.forEach(note => {
    const noteId = `note-${note.id}`
    if (!nodeIds.has(noteId)) {
      nodes.push({ id: noteId, label: note.title, type: 'note' })
      nodeIds.add(noteId)
    }

    if (note.bookId && nodeIds.has(note.bookId)) {
      edges.push({ source: noteId, target: note.bookId, type: 'about' })
    }

    note.tags.forEach(tag => {
      const tagId = `tag-${tag}`
      if (!nodeIds.has(tagId)) {
        nodes.push({ id: tagId, label: tag, type: 'tag' })
        nodeIds.add(tagId)
      }
      edges.push({ source: noteId, target: tagId, type: 'tagged-with' })
    })
  })

  return { nodes, edges }
})

const filteredNodes = computed(() => {
  if (!searchQuery.value) return graphData.value.nodes
  return graphData.value.nodes.filter(n => 
    n.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

function getNodeColor(type: string) {
  const colors: Record<string, string> = {
    book: '#3b82f6',
    note: '#10b981',
    tag: '#f59e0b',
    author: '#8b5cf6'
  }
  return colors[type] || '#64748b'
}

function getNodeRadius(node: GraphNode) {
  const baseRadius = { book: 25, note: 15, tag: 10, author: 20 }
  return baseRadius[node.type as keyof typeof baseRadius] || 15
}

let simulation: d3.Simulation<GraphNode, undefined> | null = null

onMounted(() => {
  const container = d3.select('#graph-container')
  const width = 800
  const height = 600

  const svg = container.append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', '#f8fafc')
    .style('border-radius', '8px')

  const defs = svg.append('defs')
  defs.append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '-0 -5 10 10')
    .attr('refX', 25)
    .attr('refY', 0)
    .attr('orient', 'auto')
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .append('path')
    .attr('d', 'M 0,-5 L 10,0 L 0,5')
    .attr('fill', '#cbd5e1')

  const g = svg.append('g')

  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
    })

  svg.call(zoom)

  function updateGraph() {
    const { nodes, edges } = graphData.value

    g.selectAll('*').remove()

    const link = g.append('g')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1)

    const node = g.append('g')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes, d => d.id)
      .join('g')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))

    node.append('circle')
      .attr('r', d => getNodeRadius(d))
      .attr('fill', d => getNodeColor(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        selectedNode.value = d
        event.stopPropagation()
      })

    node.append('text')
      .text(d => d.label.length > 15 ? d.label.slice(0, 15) + '...' : d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', d => getNodeRadius(d) + 12)
      .attr('font-size', '11px')
      .attr('fill', '#475569')

    simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => getNodeRadius(d as GraphNode) + 10))

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node.attr('transform', d => `translate(${d.x}, ${d.y})`)
    })
  }

  function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, unknown>, d: GraphNode) {
    if (!event.active) simulation?.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }

  function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, unknown>, d: GraphNode) {
    d.fx = event.x
    d.fy = event.y
  }

  function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, unknown>, d: GraphNode) {
    if (!event.active) simulation?.alphaTarget(0)
    d.fx = null
    d.fy = null
  }

  updateGraph()

  svg.on('click', () => {
    selectedNode.value = null
  })
})

onUnmounted(() => {
  if (simulation) {
    simulation.stop()
  }
})
</script>

<template>
  <div class="graph-view">
    <div class="flex justify-between items-center mb-6">
      <h1>🕸️ 知识图谱</h1>
      <input 
        v-model="searchQuery" 
        type="text" 
        class="input" 
        style="width: 250px"
        placeholder="搜索节点..."
      />
    </div>

    <div class="legend card mb-4">
      <div class="flex gap-6">
        <div class="flex items-center gap-2">
          <span class="legend-dot" style="background: #3b82f6"></span>
          <span class="text-sm">书籍</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="legend-dot" style="background: #10b981"></span>
          <span class="text-sm">笔记</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="legend-dot" style="background: #f59e0b"></span>
          <span class="text-sm">标签</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="legend-dot" style="background: #8b5cf6"></span>
          <span class="text-sm">作者</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <div class="card" style="padding: 0; overflow: hidden">
        <div id="graph-container"></div>
      </div>

      <div class="card">
        <h3 class="mb-4">节点详情</h3>
        <div v-if="selectedNode" class="node-detail">
          <div 
            class="node-icon" 
            :style="{ background: getNodeColor(selectedNode.type) }"
          >
            {{ selectedNode.type === 'book' ? '📕' : selectedNode.type === 'note' ? '📝' : selectedNode.type === 'tag' ? '🏷️' : '👤' }}
          </div>
          <h4 class="mt-3">{{ selectedNode.label }}</h4>
          <p class="text-sm text-muted">类型: {{ selectedNode.type }}</p>
        </div>
        <div v-else class="text-center text-muted py-8">
          <p>点击节点查看详情</p>
        </div>

        <div class="mt-6">
          <h4 class="mb-3">节点列表 ({{ filteredNodes.length }})</h4>
          <div class="node-list">
            <div 
              v-for="node in filteredNodes.slice(0, 20)" 
              :key="node.id"
              class="node-list-item"
              :class="{ selected: selectedNode?.id === node.id }"
              @click="selectedNode = node"
            >
              <span 
                class="node-list-dot" 
                :style="{ background: getNodeColor(node.type) }"
              ></span>
              <span class="text-sm">{{ node.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-6">
      <h3 class="mb-4">📊 图谱统计</h3>
      <div class="grid grid-cols-4 gap-4">
        <div class="stat-box">
          <div class="text-2xl font-bold text-blue-500">{{ graphData.nodes.filter(n => n.type === 'book').length }}</div>
          <div class="text-sm text-muted">书籍</div>
        </div>
        <div class="stat-box">
          <div class="text-2xl font-bold text-green-500">{{ graphData.nodes.filter(n => n.type === 'note').length }}</div>
          <div class="text-sm text-muted">笔记</div>
        </div>
        <div class="stat-box">
          <div class="text-2xl font-bold text-amber-500">{{ graphData.nodes.filter(n => n.type === 'tag').length }}</div>
          <div class="text-sm text-muted">标签</div>
        </div>
        <div class="stat-box">
          <div class="text-2xl font-bold text-purple-500">{{ graphData.nodes.filter(n => n.type === 'author').length }}</div>
          <div class="text-sm text-muted">作者</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

#graph-container {
  width: 100%;
  height: 500px;
}

.node-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.node-list {
  max-height: 300px;
  overflow-y: auto;
}

.node-list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.node-list-item:hover,
.node-list-item.selected {
  background: #e2e8f0;
}

.node-list-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat-box {
  padding: 16px;
  background: var(--bg-light);
  border-radius: 8px;
  text-align: center;
}
</style>
