import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'katex/dist/katex.min.css';

// Immediately remove prerendered SEO fallback node upon JavaScript execution
// Guarantees that real users never see fallback text and headless crawlers see strictly 1 canonical <h1>
const seoFallback = document.getElementById('seo-fallback');
if (seoFallback) {
  seoFallback.remove();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

