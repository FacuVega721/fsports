import { useEffect } from 'react';

const SUFIJO = ' · FSports';
const BASE_URL = 'https://oficialfsports.com';

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setCanonical(path: string) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', `${BASE_URL}${path}`);
}

/** Título + descripción + OG/Twitter + canonical por página (la SPA solo tiene un <head> fijo en index.html). */
export function useSeo(titulo: string, descripcion: string, path: string) {
  useEffect(() => {
    const tituloCompleto = titulo + SUFIJO;
    document.title = tituloCompleto;
    setMeta('description', descripcion);
    setMeta('og:title', tituloCompleto, 'property');
    setMeta('og:description', descripcion, 'property');
    setMeta('og:url', `${BASE_URL}${path}`, 'property');
    setMeta('twitter:title', tituloCompleto);
    setMeta('twitter:description', descripcion);
    setCanonical(path);
  }, [titulo, descripcion, path]);
}
