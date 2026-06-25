import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const preguntas = [
  { q: '¿Las cuentas son seguras?',              r: 'Sí. Todas las cuentas son perfiles propios dentro de un plan. No compartes acceso con desconocidos y tus datos de visualización son privados.' },
  { q: '¿Cuánto tarda la entrega?',              r: 'La entrega es inmediata por WhatsApp. Una vez confirmado el pago, recibes los datos de acceso en menos de 5 minutos.' },
  { q: '¿Qué pasa si la cuenta deja de funcionar?', r: 'Tienes garantía de 30 días. Si algo falla, lo reponemos sin costo adicional. Solo escríbenos al WhatsApp.' },
  { q: '¿En cuántos dispositivos puedo usarla?', r: 'Depende del plan. Los planes básicos permiten 1 dispositivo a la vez. Los combos pueden incluir más pantallas según la plataforma.' },
  { q: '¿Puedo cambiar mi plan después?',        r: 'Claro. Escríbenos al WhatsApp y te ayudamos a hacer el cambio sin problema.' },
];

export default function FAQ() {
  const [abierto, setAbierto] = React.useState<number | null>(null);
  const sectionRef = useScrollReveal();

  return (
    <section id="faq" ref={sectionRef} className="bg-transparent py-16 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-3xl mx-auto">
        <p className="reveal text-brand-400 text-xs font-semibold tracking-widest uppercase text-center mb-3">
          Preguntas frecuentes
        </p>
        <h2 className="reveal reveal-delay-1 text-3xl md:text-4xl font-bold text-white text-center mb-14" style={{ fontFamily: 'Syne, sans-serif' }}>
          ¿Tienes dudas?
        </h2>
 
        <div className="flex flex-col gap-3">
          {preguntas.map(({ q, r }, i) => {
            const isOpen = abierto === i;
            return (
              <div
                key={i}
                className={[
                  `reveal reveal-delay-${Math.min(i + 1, 5)}`,
                  'rounded-2xl overflow-hidden transition-all duration-400 border-0 shadow-lg shadow-black/25',
                  isOpen
                    ? 'bg-[#141130]/75 shadow-xl shadow-brand-500/5'
                    : 'bg-[#141130]/55 hover:bg-[#141130]/70',
                ].join(' ')}
              >
                <button
                  onClick={() => setAbierto(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group"
                  aria-expanded={isOpen}
                >
                  <span className="text-white font-medium text-sm group-hover:text-brand-300 transition-colors" style={{ fontFamily: 'Syne, sans-serif' }}>{q}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? 'bg-brand-500/30 rotate-180' : 'bg-brand-700/30'}`}>
                    <ChevronDown className="w-4 h-4 text-brand-400" />
                  </div>
                </button>
                <div
                  className="grid transition-all duration-400 ease-in-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="text-gray-400 text-sm leading-relaxed px-6 pb-5" style={{ fontFamily: 'Inter, sans-serif' }}>{r}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
