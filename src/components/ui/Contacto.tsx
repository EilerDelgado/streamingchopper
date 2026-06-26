import { MessageCircle, Instagram, Clock } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../../store/cartStore';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function Contacto() {
  const urlWA = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola! Quiero más información sobre sus planes de streaming.')}`;
  const sectionRef = useScrollReveal();

  return (
    <>
      <section id="contacto" ref={sectionRef} className="bg-transparent py-12 px-4 md:px-16 lg:px-24 xl:px-32 relative overflow-hidden">
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 dot-pattern pointer-events-none" />

        {/* Ambient glow */}
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[50%] h-[60%] bg-brand-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="reveal reveal-delay-1 text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
            ¿Listo para empezar?
          </h2>
          <p className="reveal reveal-delay-2 text-gray-400 mb-6 max-w-lg mx-auto text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            Escríbenos por WhatsApp y te respondemos en minutos. Sin formularios, sin esperas.
          </p>

          {/* WhatsApp CTA with pulse */}
          <div className="reveal reveal-delay-3 relative inline-block">
            <span className="absolute inset-0 rounded-full bg-green-500/20 animate-pulse-ring pointer-events-none" />
            <a
              href={urlWA}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-xl shadow-green-600/25 text-sm hover:shadow-green-500/40 hover:scale-[1.04] active:scale-[0.97]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <MessageCircle className="w-5 h-5" />
              Escribir por WhatsApp
            </a>
          </div>

          {/* Info badges */}
          <div className="reveal reveal-delay-4 mt-8 flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-500 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            <span className="flex items-center gap-2 hover:text-gray-300 transition-colors">
              <Clock className="w-4 h-4" />
              Todos los días · 8am – 10pm
            </span>
            <a 
              href="https://www.instagram.com/streaming__chopper" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 hover:text-brand-400 transition-colors"
            >
              <Instagram className="w-4 h-4" />
              @streaming__chopper
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-[#080616] border-t border-white/[0.04] py-4 px-4 text-center">
        <div 
          className="max-w-6xl mx-auto text-white/60 text-[11px] font-light flex items-center justify-center gap-1.5" 
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <span>© {new Date().getFullYear()}</span>
          <span className="font-semibold text-white">Streaming Chopper</span>
          <span>•</span>
          <span className="text-white/60">CodEiler Software</span>
        </div>
      </footer>
    </>
  );
}
