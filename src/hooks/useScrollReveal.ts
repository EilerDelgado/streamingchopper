import { useEffect, useRef } from 'react';

/**
 * Hook que observa elementos con la clase `.reveal` y les agrega `.revealed`
 * cuando entran al viewport, produciendo una animación de fade-up.
 * Utiliza MutationObserver para asegurar que la clase `.revealed` persista
 * frente a re-renders de React (como abrir acordiones en FAQ).
 *
 * @param rootMargin  — margen para el observer (default: empieza un poco antes)
 * @param threshold   — porcentaje visible para activar (default: 12%)
 */
export function useScrollReveal(rootMargin = '0px 0px -60px 0px', threshold = 0.12) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const revealedElementsRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const elements = section.querySelectorAll('.reveal');
    if (elements.length === 0) return;

    const revealedElements = revealedElementsRef.current;

    // Asegurar que los elementos ya revelados mantengan la clase
    revealedElements.forEach((el) => {
      if (section.contains(el) && !el.classList.contains('revealed')) {
        el.classList.add('revealed');
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealedElements.add(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin, threshold }
    );

    elements.forEach((el) => {
      if (!revealedElements.has(el)) {
        observer.observe(el);
      }
    });

    const mutationObserver = new MutationObserver(() => {
      revealedElements.forEach((el) => {
        if (section.contains(el) && !el.classList.contains('revealed')) {
          el.classList.add('revealed');
        }
      });
    });

    mutationObserver.observe(section, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }); // Ejecuta en cada render para asegurar la persistencia en re-renders

  return sectionRef;
}
