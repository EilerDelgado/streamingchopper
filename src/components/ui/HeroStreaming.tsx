'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronRight, ShoppingCart, User } from 'lucide-react';
import { CartItem } from '../../store/cartStore';
import logoImg from '../../assets/perfil_chopper.png';
import netflixLogo from '../../assets/logos/netflix.svg';
import disneyLogo from '../../assets/logos/disney.svg';
import maxLogo from '../../assets/logos/max.svg';
import primeLogo from '../../assets/logos/prime.svg';
import paramountLogo from '../../assets/logos/paramount.svg';
import spotifyLogo from '../../assets/logos/spotify.svg';
import youtubeLogo from '../../assets/logos/youtube.svg';

interface HeroStreamingProps {
  cartItems: CartItem[];
  onOpenCart: () => void;
  setActiveCategory: (cat: string) => void;
}

/** Scroll suave a cualquier sección por id con offset para la barra fija */
const scrollTo = (id: string, closeFn?: () => void) => {
  closeFn?.();
  const element = document.getElementById(id);
  if (element) {
    const navbarHeight = 84; // Alto aproximado del navbar sticky
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - navbarHeight - 20; // 20px extra de respiro

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

export default function HeroStreaming(props: HeroStreamingProps) {
  const { cartItems, onOpenCart, setActiveCategory } = props;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  const totalCarrito = cartItems.reduce((acc, i) => acc + i.cantidad, 0);

  // ── Scroll listener for sticky nav ─────────────────────────────
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Menu ESC & Scroll Lock ─────────────────────────────────────
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    if (menuOpen) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleCombosClick = () => {
    setActiveCategory('combos');
    scrollTo('planes');
  };

  return (
    <>
      {/* ── STICKY NAV ──────────────────────────────────────────── */}
      <nav
        className={[
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          'flex items-center justify-between',
          'p-4 md:px-16 lg:px-24 xl:px-32 md:py-5',
          scrolled
            ? 'glass-strong shadow-lg shadow-black/20 border-b border-brand-700/40'
            : 'bg-transparent border-b border-transparent',
        ].join(' ')}
      >
        {/* Logo */}
        <a href="#inicio" className="flex items-center gap-2.5 group" style={{ fontFamily: 'Syne, sans-serif' }}>
          <img
            src={logoImg}
            alt="Logo"
            className="w-9 h-9 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <span className="text-xl font-bold tracking-tight text-white">Streaming Chopper</span>
        </a>

        {/* Menú Desktop */}
        <div
          className="hidden md:flex items-center gap-8"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
        >
          {['Inicio', 'Planes', 'Garantía', 'Preguntas frecuentes', 'Contacto'].map((label) => {
            const id = label === 'Planes' ? 'planes' : label === 'Preguntas frecuentes' ? 'faq' : label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return (
              <button
                key={label}
                onClick={() => scrollTo(id)}
                className="text-white hover:text-brand-400 transition-colors text-base"
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Acciones derecha */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={onOpenCart} className="relative p-2 rounded-full hover:bg-brand-800/60 transition text-white" aria-label="Carrito">
            <ShoppingCart className="w-5 h-5" />
            {totalCarrito > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center leading-none animate-scale-in font-semibold">
                {totalCarrito}
              </span>
            )}
          </button>
          {/* Botón de login discreto en cabecera */}
          <Link
            to="/iniciar-sesion"
            className="p-2.5 rounded-full border border-brand-700/60 hover:bg-brand-800/60 text-white hover:text-brand-300 transition-all hover:scale-105 active:scale-95"
            title="Iniciar Sesión"
          >
            <User className="w-4.5 h-4.5" />
          </Link>
        </div>

        {/* Hamburguesa (móvil) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(true);
          }}
          className="md:hidden bg-brand-800 hover:bg-brand-700 p-2 rounded-md text-white"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>
      </nav>

      {/* Drawer Móvil Overlay + Menú */}
      {menuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
          onClick={() => setMenuOpen(false)}
        >
          {/* Panel del Menú (deslizable desde la izquierda) */}
          <div 
            ref={menuRef}
            className="w-[75%] max-w-[300px] h-full bg-[#110f27] p-6 flex flex-col justify-start gap-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Header con Logo y la X de cerrar */}
            <div className="flex items-center justify-between border-b border-brand-800/40 pb-4">
              <div className="flex items-center gap-2.5" style={{ fontFamily: 'Syne, sans-serif' }}>
                <img src={logoImg} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
                <span className="text-md font-bold text-white tracking-tight">Streaming Chopper</span>
              </div>
              <button 
                onClick={() => setMenuOpen(false)} 
                className="bg-brand-800 hover:bg-brand-700 p-1.5 rounded-md text-white transition-colors" 
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links de navegación */}
            <div className="flex flex-col gap-5 font-semibold text-base">
              {['Inicio', 'Planes', 'Garantía', 'Preguntas frecuentes', 'Contacto'].map((label) => {
                const id = label === 'Planes' ? 'planes' : label === 'Preguntas frecuentes' ? 'faq' : label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return (
                  <button
                    key={label}
                    onClick={() => scrollTo(id, () => setMenuOpen(false))}
                    className="text-left text-white hover:text-brand-400 transition-colors py-1.5 border-b border-brand-800/20"
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Iniciar Sesión abajo */}
            <div className="mt-auto border-t border-brand-800/40 pt-6">
              <Link
                to="/iniciar-sesion"
                onClick={() => setMenuOpen(false)}
                className="text-white hover:text-brand-400 transition-colors text-base flex items-center gap-2"
              >
                <User className="w-5 h-5 text-brand-400" />
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <section 
        id="inicio" 
        className="relative w-full min-h-[92vh] lg:min-h-screen flex flex-col justify-center items-center text-white overflow-hidden pt-24 md:pt-28 pb-10 px-4 md:px-8"
      >
        {/* Ambient overlays and blur */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          {/* Subtle cinematic vignette */}
          <div className="absolute inset-0 bg-[#0c0a1f]/10" />
          
          {/* Luces y orbes morados difuminados para aspecto premium */}
          <div className="absolute top-[10%] left-[25%] -translate-x-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-brand-500/25 blur-[130px] rounded-full animate-float-slow pointer-events-none" />
          <div className="absolute bottom-[10%] right-[10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-brand-600/20 blur-[120px] rounded-full animate-float pointer-events-none" />
        </div>

        {/* CONTENIDO HERO */}
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
          
          {/* Badge Superior / Banner de Combos */}
          <button 
            onClick={handleCombosClick}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-400/20 bg-brand-800/40 hover:bg-brand-850 active:scale-95 backdrop-blur-md text-brand-300 text-[10px] sm:text-xs font-semibold tracking-wider uppercase mb-5 shadow-lg shadow-black/20 animate-fade-in transition-all cursor-pointer group"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span>Ahorra hasta 50% con nuestros Combos Premium</span>
            <span className="ml-1 text-[9px] sm:text-[10px] opacity-80 group-hover:translate-x-0.5 transition-transform">→</span>
          </button>

          {/* Título Principal */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight max-w-4xl text-center font-display mb-5 animate-fade-up text-white"
            style={{ 
              animationDelay: '0.1s',
              textShadow: '0 4px 16px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.7)'
            }}
          >
            Tus{' '}
            <span className="text-brand-300 font-extrabold font-display px-2">
              plataformas favoritas
            </span>{' '}
            al mejor precio
          </h1>

          {/* Descripción */}
          <p
            className="text-gray-200 text-xs sm:text-sm md:text-base font-normal leading-relaxed max-w-2xl text-center font-body mb-8 px-2 animate-fade-up"
            style={{ 
              animationDelay: '0.2s',
              textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.8)'
            }}
          >
            Accede a tus servicios de streaming favoritos desde un solo lugar. Películas, series, deportes, anime, música y más con activación rápida y soporte durante tu servicio.
          </p>

          {/* CTA Button */}
          <div 
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 mb-10 animate-fade-up"
            style={{ animationDelay: '0.3s' }}
          >
            <button
              onClick={() => scrollTo('planes')}
              className="w-full sm:w-auto px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full font-bold transition-all duration-300 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/55 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group font-body uppercase text-xs sm:text-sm tracking-wider"
            >
              Ver Catálogo Completo
              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Logos de Plataformas */}
          <div 
            className="w-full flex flex-col items-center gap-4 border-t border-brand-800/40 pt-10 px-4 animate-fade-up"
            style={{ animationDelay: '0.5s' }}
          >
            <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">
              DISPONIBLE PARA TODAS LAS PANTALLAS
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
              {/* Netflix */}
              <div className="flex items-center justify-center h-6 sm:h-7 opacity-85 hover:opacity-100 transition-all duration-300 hover:scale-105">
                <img 
                  src={netflixLogo} 
                  alt="Netflix" 
                  className="h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" 
                />
              </div>

              {/* Disney+ */}
              <div className="flex items-center justify-center h-8 sm:h-9 opacity-85 hover:opacity-100 transition-all duration-300 hover:scale-105">
                <img 
                  src={disneyLogo} 
                  alt="Disney+" 
                  className="h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" 
                />
              </div>

              {/* Max */}
              <div className="flex items-center justify-center h-5 sm:h-6 opacity-85 hover:opacity-100 transition-all duration-300 hover:scale-105">
                <img 
                  src={maxLogo} 
                  alt="Max" 
                  className="h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" 
                />
              </div>

              {/* Prime Video */}
              <div className="flex items-center justify-center h-7 sm:h-8 opacity-85 hover:opacity-100 transition-all duration-300 hover:scale-105">
                <img 
                  src={primeLogo} 
                  alt="Prime Video" 
                  className="h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" 
                />
              </div>

              {/* Paramount+ */}
              <div className="flex items-center justify-center h-6 sm:h-7 opacity-85 hover:opacity-100 transition-all duration-300 hover:scale-105">
                <img 
                  src={paramountLogo} 
                  alt="Paramount+" 
                  className="h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" 
                />
              </div>

              {/* Spotify */}
              <div className="flex items-center gap-1.5 opacity-85 hover:opacity-100 transition-all duration-300 hover:scale-105">
                <img 
                  src={spotifyLogo} 
                  alt="Spotify" 
                  className="h-5 sm:h-6 object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" 
                />
                <span className="font-bold tracking-tight text-sm sm:text-base text-white font-body" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>Spotify</span>
              </div>

              {/* YouTube Premium */}
              <div className="flex items-center justify-center h-5 sm:h-6 opacity-85 hover:opacity-100 transition-all duration-300 hover:scale-105">
                <img 
                  src={youtubeLogo} 
                  alt="YouTube Premium" 
                  className="h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" 
                />
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
