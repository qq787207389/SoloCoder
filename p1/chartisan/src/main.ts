import './styles.css'
import { renderDataSourcePanel } from './builder/DataSourcePanel'
import { renderConfigPanel } from './builder/ConfigPanel'
import { renderPreviewPanel } from './builder/PreviewPanel'

function initApp() {
  const app = document.getElementById('app')
  if (!app) return

  app.innerHTML = `
    <div class="builder-container">
      <div class="panel" id="dataSourcePanel"></div>
      <div id="previewPanel"></div>
      <div class="panel" id="configPanel"></div>
    </div>
  `

  renderDataSourcePanel(document.getElementById('dataSourcePanel')!)
  renderConfigPanel(document.getElementById('configPanel')!)
  renderPreviewPanel(document.getElementById('previewPanel')!)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}
