import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle, User, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { CartItem } from '../../store/cartStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  incrementarItem: (id: string) => void;
  decrementarItem: (id: string) => void;
  quitarItem: (id: string) => void;
  limpiarCarrito: () => void;
  totalPrecio: () => number;
  generarMensajeWhatsApp: (nombre?: string, nota?: string) => string;
}

/** Ícono WhatsApp inline SVG */
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/** Badge de plataforma con colores dinámicos */
const platformColors: Record<string, { bg: string; text: string; border: string }> = {
  'Netflix': { bg: 'rgba(229, 9, 20, 0.15)', text: '#ff6b6b', border: 'rgba(229, 9, 20, 0.3)' },
  'Spotify': { bg: 'rgba(30, 215, 96, 0.15)', text: '#1ed760', border: 'rgba(30, 215, 96, 0.3)' },
  'Disney+': { bg: 'rgba(17, 60, 207, 0.15)', text: '#7b9cff', border: 'rgba(17, 60, 207, 0.3)' },
  'Max': { bg: 'rgba(0, 55, 255, 0.15)', text: '#6b8bff', border: 'rgba(0, 55, 255, 0.3)' },
};

function getPlatformStyle(plataforma: string) {
  // Check each platform key in the plataforma string
  for (const [key, style] of Object.entries(platformColors)) {
    if (plataforma.includes(key)) return style;
  }
  return { bg: 'rgba(74, 50, 147, 0.2)', text: '#a594e0', border: 'rgba(74, 50, 147, 0.3)' };
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  incrementarItem,
  decrementarItem,
  quitarItem,
  limpiarCarrito,
  totalPrecio,
  generarMensajeWhatsApp,
}: CartDrawerProps) {
  const [nombre, setNombre] = React.useState('');
  const [nota, setNota] = React.useState('');
  const [removingId, setRemovingId] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<'cart' | 'checkout'>('cart');
  const drawerRef = React.useRef<HTMLDivElement>(null);

  // Reset to cart step when drawer opens
  React.useEffect(() => {
    if (isOpen) {
      setStep('cart');
    }
  }, [isOpen]);

  // Close on ESC
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleRemove = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      quitarItem(id);
      setRemovingId(null);
    }, 300);
  };

  const totalCantidad = cartItems.reduce((acc, i) => acc + i.cantidad, 0);
  const total = totalPrecio();
  const isEmpty = cartItems.length === 0;

  return (
    <>
      {/* Overlay */}
      <div
        className={[
          'fixed inset-0 z-[60] transition-all duration-300',
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        ].join(' ')}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={[
          'fixed top-0 right-0 h-full z-[70] flex flex-col',
          'w-full sm:w-[440px] max-w-full',
          'transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        style={{
          background: 'linear-gradient(180deg, #110f27 0%, #0d0b1f 50%, #140f08 100%)',
          borderLeft: '1px solid rgba(74, 50, 147, 0.25)',
          boxShadow: isOpen ? '-20px 0 60px rgba(0, 0, 0, 0.5)' : 'none',
        }}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: '1px solid rgba(74, 50, 147, 0.2)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(74, 50, 147, 0.3), rgba(124, 107, 194, 0.15))',
                border: '1px solid rgba(74, 50, 147, 0.3)',
              }}
            >
              <ShoppingBag className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h2
                className="text-white font-bold text-lg leading-tight"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                {step === 'cart' ? 'Tu Carrito' : 'Finalizar Pedido'}
              </h2>
              {step === 'cart' && (
                <p className="text-gray-500 text-xs mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {totalCantidad} {totalCantidad === 1 ? 'producto' : 'productos'}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all hover:scale-110 active:scale-95"
            style={{
              background: 'rgba(74, 50, 147, 0.15)',
              border: '1px solid rgba(74, 50, 147, 0.2)',
            }}
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: 'thin' }}>
          {step === 'cart' ? (
            <>
              {isEmpty ? (
                /* Estado vacío */
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                    style={{
                      background: 'linear-gradient(135deg, rgba(74, 50, 147, 0.2), rgba(74, 50, 147, 0.05))',
                      border: '1px solid rgba(74, 50, 147, 0.2)',
                    }}
                  >
                    <ShoppingBag className="w-9 h-9 text-brand-600" />
                  </div>
                  <p
                    className="text-white font-semibold text-lg mb-2"
                    style={{ fontFamily: 'Syne, sans-serif' }}
                  >
                    Tu carrito está vacío
                  </p>
                  <p
                    className="text-gray-500 text-sm max-w-[260px]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Explora nuestros planes y agrega tus favoritos para empezar.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-8 flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-all hover:scale-[1.03] active:scale-[0.97]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      background: 'linear-gradient(135deg, #4a3293, #2c276d)',
                      color: 'white',
                      border: '1px solid rgba(74, 50, 147, 0.4)',
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Ver Planes
                  </button>
                </div>
              ) : (
                /* Lista de productos */
                <div className="flex flex-col gap-3">
                  {cartItems.map((item) => {
                    const isRemoving = removingId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl p-4 transition-all duration-300"
                        style={{
                          background: 'rgba(17, 15, 39, 0.6)',
                          border: '1px solid rgba(74, 50, 147, 0.15)',
                          opacity: isRemoving ? 0 : 1,
                          transform: isRemoving ? 'translateX(100px) scale(0.9)' : 'translateX(0) scale(1)',
                        }}
                      >
                        {/* Top row: name + delete */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4
                              className="text-white font-semibold text-sm leading-tight"
                              style={{ fontFamily: 'Syne, sans-serif' }}
                            >
                              {item.nombre}
                            </h4>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {item.plataforma.split(' + ').map((p) => {
                                const style = getPlatformStyle(p);
                                return (
                                  <span
                                    key={p}
                                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                                    style={{
                                      background: style.bg,
                                      color: style.text,
                                      border: `1px solid ${style.border}`,
                                    }}
                                  >
                                    {p.trim()}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="p-1.5 rounded-lg transition-all hover:scale-110 active:scale-90 shrink-0 ml-2"
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.15)',
                            }}
                            aria-label={`Eliminar ${item.nombre}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>

                        {/* Bottom row: quantity + price */}
                        <div className="flex items-center justify-between">
                          <div
                            className="flex items-center gap-0 rounded-xl overflow-hidden"
                            style={{
                              border: '1px solid rgba(74, 50, 147, 0.25)',
                              background: 'rgba(74, 50, 147, 0.08)',
                            }}
                          >
                            <button
                              onClick={() => decrementarItem(item.id)}
                              className="p-2 transition-all hover:bg-brand-700/30 active:scale-90"
                              aria-label="Reducir cantidad"
                            >
                              <Minus className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                            <span
                              className="w-9 text-center text-white font-semibold text-sm tabular-nums"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => incrementarItem(item.id)}
                              className="p-2 transition-all hover:bg-brand-700/30 active:scale-90"
                              aria-label="Aumentar cantidad"
                            >
                              <Plus className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p
                              className="text-white font-bold text-base"
                              style={{ fontFamily: 'Syne, sans-serif' }}
                            >
                              ${(item.precio * item.cantidad).toLocaleString('es-CO')}
                            </p>
                            {item.cantidad > 1 && (
                              <p
                                className="text-gray-500 text-xs"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                              >
                                ${item.precio.toLocaleString('es-CO')} c/u
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Vaciar carrito */}
                  <button
                    onClick={limpiarCarrito}
                    className="self-start text-xs text-gray-500 hover:text-red-400 transition-colors mt-1 flex items-center gap-1.5"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <Trash2 className="w-3 h-3" />
                    Vaciar carrito
                  </button>
                </div>
              )}
            </>
          ) : (
            /* ── Paso Checkout ─────────────────────────────────── */
            <div className="flex flex-col gap-5 py-2">
              {/* Resumen */}
              <div
                className="rounded-2xl p-4"
                style={{
                  background: 'rgba(74, 50, 147, 0.08)',
                  border: '1px solid rgba(74, 50, 147, 0.15)',
                }}
              >
                <p
                  className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Resumen del pedido
                </p>
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2"
                    style={{ borderBottom: '1px solid rgba(74, 50, 147, 0.1)' }}
                  >
                    <span className="text-gray-300 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {item.nombre}{' '}
                      <span className="text-gray-500">x{item.cantidad}</span>
                    </span>
                    <span
                      className="text-white font-semibold text-sm"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      ${(item.precio * item.cantidad).toLocaleString('es-CO')}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 mt-1">
                  <span
                    className="text-white font-bold"
                    style={{ fontFamily: 'Syne, sans-serif' }}
                  >
                    Total mensual
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{
                      fontFamily: 'Syne, sans-serif',
                      background: 'linear-gradient(to right, #7c6bc2, #a594e0)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    ${total.toLocaleString('es-CO')}/mes
                  </span>
                </div>
              </div>

              {/* Formulario datos */}
              <div className="flex flex-col gap-4">
                <p
                  className="text-gray-400 text-xs font-medium uppercase tracking-wider"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Tus datos (opcional)
                </p>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:ring-2 focus:ring-brand-500/40"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      background: 'rgba(17, 15, 39, 0.6)',
                      border: '1px solid rgba(74, 50, 147, 0.2)',
                    }}
                  />
                </div>

                <div className="relative">
                  <FileText className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                  <textarea
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="¿Alguna nota especial? (ej: prefiero perfil con mi nombre)"
                    rows={3}
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:ring-2 focus:ring-brand-500/40 resize-none"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      background: 'rgba(17, 15, 39, 0.6)',
                      border: '1px solid rgba(74, 50, 147, 0.2)',
                    }}
                  />
                </div>
              </div>

              {/* Info entrega */}
              <div
                className="flex items-start gap-3 rounded-xl p-3.5"
                style={{
                  background: 'rgba(30, 215, 96, 0.06)',
                  border: '1px solid rgba(30, 215, 96, 0.15)',
                }}
              >
                <MessageCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <p
                  className="text-gray-400 text-xs leading-relaxed"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Al presionar el botón serás redirigido a <strong className="text-green-400">WhatsApp</strong> con tu pedido listo.
                  Te responderemos en minutos con las instrucciones de pago y acceso.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        {!isEmpty && (
          <div
            className="shrink-0 px-6 py-5"
            style={{
              borderTop: '1px solid rgba(74, 50, 147, 0.2)',
              background: 'rgba(13, 11, 31, 0.8)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {step === 'cart' ? (
              <>
                {/* Total */}
                <div className="flex justify-between items-center mb-4">
                  <span
                    className="text-gray-400 text-sm"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Total mensual
                  </span>
                  <span
                    className="text-xl font-bold"
                    style={{
                      fontFamily: 'Syne, sans-serif',
                      background: 'linear-gradient(to right, #7c6bc2, #a594e0)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    ${total.toLocaleString('es-CO')}/mes
                  </span>
                </div>

                {/* Botón continuar */}
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-medium text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] group"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    background: 'linear-gradient(135deg, #4a3293, #2c276d)',
                    border: '1px solid rgba(74, 50, 147, 0.4)',
                    boxShadow: '0 8px 32px rgba(74, 50, 147, 0.2)',
                  }}
                >
                  Continuar al pedido
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </>
            ) : (
              <>
                {/* Botones checkout */}
                <div className="flex flex-col gap-3">
                  <a
                    href={generarMensajeWhatsApp(nombre || undefined, nota || undefined)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-semibold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      background: 'linear-gradient(135deg, #25d366, #128c7e)',
                      boxShadow: '0 8px 32px rgba(37, 211, 102, 0.25)',
                    }}
                  >
                    {/* Pulse glow */}
                    <span
                      className="absolute inset-0 rounded-2xl animate-pulse-ring pointer-events-none"
                      style={{ background: 'rgba(37, 211, 102, 0.15)' }}
                    />
                    <WhatsAppIcon />
                    Finalizar por WhatsApp
                  </a>

                  <button
                    onClick={() => setStep('cart')}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-medium text-sm text-gray-400 transition-all hover:text-white hover:bg-brand-800/30"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      border: '1px solid rgba(74, 50, 147, 0.2)',
                    }}
                  >
                    ← Volver al carrito
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
