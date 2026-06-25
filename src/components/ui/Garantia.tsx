import { ShieldCheck, Clock, HeadphonesIcon, RefreshCw } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const items = [
  { Icono: ShieldCheck,     titulo: 'Cuentas 100% seguras',  desc: 'Perfiles propios, sin compartir con desconocidos. Tu privacidad está protegida.' },
  { Icono: Clock,           titulo: 'Entrega inmediata',     desc: 'Recibes tus datos de acceso por WhatsApp en minutos, disponible las 24 horas.' },
  { Icono: RefreshCw,       titulo: 'Garantía de 30 días',   desc: 'Si algo falla, lo reponemos sin costo adicional ni preguntas.' },
  { Icono: HeadphonesIcon,  titulo: 'Soporte real',          desc: 'Atención directa por WhatsApp. Nada de chatbots ni formularios interminables.' },
];

export default function Garantia() {
  const sectionRef = useScrollReveal();

  return (
    <section id="garantia" ref={sectionRef} className="bg-transparent py-16 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-6xl mx-auto">
        <p className="reveal text-brand-400 text-xs font-semibold tracking-widest uppercase text-center mb-3">
          Tu tranquilidad primero
        </p>
        <h2 className="reveal reveal-delay-1 text-3xl md:text-4xl font-bold text-white text-center mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
          ¿Por qué confiar en nosotros?
        </h2>
        <p className="reveal reveal-delay-2 text-gray-400 text-center max-w-xl mx-auto mb-14 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
          Miles de clientes satisfechos avalan nuestro servicio. La confianza se gana con hechos.
        </p>
 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ Icono, titulo, desc }, i) => (
            <div
              key={titulo}
              className={`reveal reveal-delay-${i + 1} bg-[#141130]/55 hover:bg-[#141130]/80 rounded-2xl p-6 flex flex-col gap-4 shadow-lg shadow-black/30 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 hover:-translate-y-1.5 border-0 group`}
            >
              <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center transition-all duration-400 group-hover:bg-brand-500/30 group-hover:shadow-lg group-hover:shadow-brand-500/20">
                <Icono className="w-5 h-5 text-brand-400 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="text-white font-bold text-base" style={{ fontFamily: 'Syne, sans-serif' }}>{titulo}</h3>
              <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
