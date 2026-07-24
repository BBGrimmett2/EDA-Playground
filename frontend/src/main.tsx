import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// PatternFly CSS - MUST be imported before custom styles
import '@patternfly/react-core/dist/styles/base.css'

// Custom styles
import './styles/design-system.css'
import './styles/layout.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
