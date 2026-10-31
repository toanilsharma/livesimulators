import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'katex/dist/katex.min.css';

// Immediately remove prerendered SEO static content node upon JavaScript execution
// Guarantees real users never see static fallback text and headless crawlers see full semantic HTML
const seoContent = document.getElementById('seo-static-content') || document.getElementById('seo-fallback');
if (seoContent) {
  seoContent.remove();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

