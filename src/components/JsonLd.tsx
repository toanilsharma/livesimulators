import React, { useEffect } from 'react';
import { AppRoute } from '../types';
import { getSeoMetadata } from '../utils/seo';

export interface JsonLdProps {
  /**
   * One or more schema.org objects to inject.
   * If an array is provided, it will be automatically formatted into a Schema.org @graph.
   */
  schema?: Record<string, any> | Record<string, any>[];
  /**
   * Optional full graph nodes.
   */
  graph?: Record<string, any>[];
  /**
   * Optional AppRoute to dynamically generate SEO metadata and JSON-LD schema for.
   */
  route?: AppRoute;
  /**
   * The DOM element ID for the <script> tag in <head>. Defaults to 'seo-jsonld'.
   */
  scriptId?: string;
}

/**
 * Formats one or multiple Schema.org JSON-LD nodes into a valid @graph structure.
 */
export function formatJsonLdGraph(nodes: (Record<string, any> | undefined | null)[]): {
  '@context': string;
  '@graph': Record<string, any>[];
} {
  const cleanNodes: Record<string, any>[] = [];

  for (const node of nodes) {
    if (!node) continue;
    const { '@context': _, ...cleanNode } = node;
    cleanNodes.push(cleanNode);
  }

  return {
    '@context': 'https://schema.org',
    '@graph': cleanNodes,
  };
}

/**
 * Injects or updates a JSON-LD <script type="application/ld+json"> tag in document.head.
 */
export function injectJsonLdToHead(
  data: Record<string, any> | Record<string, any>[],
  scriptId = 'seo-jsonld'
): HTMLScriptElement | null {
  if (typeof document === 'undefined') return null;

  let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = scriptId;
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  let jsonString: string;
  if (Array.isArray(data)) {
    jsonString = JSON.stringify(formatJsonLdGraph(data), null, 2);
  } else if (data['@graph']) {
    jsonString = JSON.stringify(data, null, 2);
  } else if (data['@context']) {
    jsonString = JSON.stringify(data, null, 2);
  } else {
    jsonString = JSON.stringify(
      {
        '@context': 'https://schema.org',
        ...data,
      },
      null,
      2
    );
  }

  scriptEl.textContent = jsonString;
  return scriptEl;
}

/**
 * Reusable React Hook to dynamically inject Schema.org JSON-LD structured data into document.head.
 */
export function useJsonLd(
  schemaOrRoute?: Record<string, any> | Record<string, any>[] | AppRoute,
  scriptId = 'seo-jsonld'
): void {
  useEffect(() => {
    if (!schemaOrRoute) return;

    if ('view' in schemaOrRoute) {
      // It's an AppRoute
      const meta = getSeoMetadata(schemaOrRoute as AppRoute);
      injectJsonLdToHead(meta.jsonLd, scriptId);
    } else {
      injectJsonLdToHead(schemaOrRoute as Record<string, any> | Record<string, any>[], scriptId);
    }
  }, [schemaOrRoute, scriptId]);
}

/**
 * Reusable JSON-LD Injection Component.
 * Ensures valid, dynamic Schema.org structured data is placed inside a <script type="application/ld+json"> tag in the <head>.
 */
export const JsonLd: React.FC<JsonLdProps> = ({ schema, graph, route, scriptId = 'seo-jsonld' }) => {
  // Determine payload
  let payload: Record<string, any> | Record<string, any>[] | undefined;

  if (route) {
    const meta = getSeoMetadata(route);
    payload = meta.jsonLd;
  } else if (graph) {
    payload = graph;
  } else if (schema) {
    payload = schema;
  }

  // Synchronize with document.head on mount & changes
  useJsonLd(payload, scriptId);

  if (!payload) return null;

  const jsonContent = Array.isArray(payload)
    ? JSON.stringify(formatJsonLdGraph(payload))
    : JSON.stringify(payload);

  // Also render inside the React component hierarchy for isomorphic crawlers
  return (
    <script
      type="application/ld+json"
      id={scriptId}
      dangerouslySetInnerHTML={{ __html: jsonContent }}
    />
  );
};
