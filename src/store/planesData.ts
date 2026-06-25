import defaultCardImg from '../assets/prime_video_completa.webp';

export interface Plan {
  id: string;
  nombre: string;
  plataforma: string;
  precio: number;
  descripcion: string;
  caracteristicas: string[];
  imagen?: string; // URL o path de la imagen estilo FUT
  categoria: 'video' | 'musica' | 'combos' | 'otros' | 'productividad' | 'deportes'; // Compatibilidad con base de datos
  categorias: string[]; // Arreglo para filtrado multicategoría
  destacado?: boolean;
  agotado?: boolean; // Nuevo campo de control de stock
  descripcionLarga?: string; // Descripción detallada para el modal
}

export function resolverImagen(imagenPath: string | null | undefined): string {
  if (!imagenPath) return defaultCardImg;
  
  if (
    imagenPath.startsWith('http://') || 
    imagenPath.startsWith('https://') || 
    imagenPath.startsWith('data:')
  ) {
    return imagenPath;
  }
  
  if (
    (imagenPath.startsWith('/src/assets/') || imagenPath.startsWith('/assets/')) &&
    (imagenPath.endsWith('.png') || imagenPath.endsWith('.jpg') || imagenPath.endsWith('.jpeg') || imagenPath.endsWith('.webp') || imagenPath.endsWith('.svg'))
  ) {
    return imagenPath;
  }

  let filename = imagenPath;
  if (filename.startsWith('/src/assets/')) {
    filename = filename.replace('/src/assets/', '');
  } else if (filename.startsWith('src/assets/')) {
    filename = filename.replace('src/assets/', '');
  } else if (filename.startsWith('/assets/')) {
    filename = filename.replace('/assets/', '');
  } else if (filename.startsWith('assets/')) {
    filename = filename.replace('assets/', '');
  }

  try {
    return new URL(`../assets/${filename}`, import.meta.url).href;
  } catch (error) {
    console.error('Error resolving local image path:', error);
    return defaultCardImg;
  }
}

// Catálogo local vacío. Los datos se cargarán en tiempo real desde Supabase.
export const PLANES_LOCALES: Plan[] = [];
