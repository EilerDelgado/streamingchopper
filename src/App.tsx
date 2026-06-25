import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import IniciarSesion from './pages/IniciarSesion';
import Perfil from './pages/Perfil';
import CartDrawer from './components/ui/CartDrawer';
import { CartItem, crearCartHandlers, WHATSAPP_NUMBER } from './store/cartStore';
import { useIdleReload } from './hooks/useIdleReload';

function AppContent() {
  // ── Inactividad: recarga tras 10 min ──────────────────────────
  useIdleReload();

  // ── Carrito y Categorías elevadas al nivel raíz ───────────────
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<string>('todos');

  const {
    agregarItem,
    incrementarItem,
    decrementarItem,
    quitarItem,
    limpiarCarrito,
    totalPrecio,
    generarMensajeWhatsApp,
  } = crearCartHandlers(cartItems, setCartItems);

  // Wrapper que agrega y abre el drawer
  const agregarYAbrir = (item: Omit<CartItem, 'cantidad'>) => {
    agregarItem(item);
    setCartOpen(true);
  };

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              cartItems={cartItems}
              agregarItem={agregarYAbrir}
              quitarItem={quitarItem}
              generarMensajeWhatsApp={generarMensajeWhatsApp}
              totalPrecio={totalPrecio}
              onOpenCart={() => setCartOpen(true)}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          }
        />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/perfil" element={<Perfil />} />
      </Routes>

      {/* Carrito global drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        incrementarItem={incrementarItem}
        decrementarItem={decrementarItem}
        quitarItem={quitarItem}
        limpiarCarrito={limpiarCarrito}
        totalPrecio={totalPrecio}
        generarMensajeWhatsApp={generarMensajeWhatsApp}
      />

      {/* Botón flotante de Carrito en Móvil (encima del de WhatsApp) */}
      {cartItems.reduce((acc, i) => acc + i.cantidad, 0) > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="md:hidden fixed bottom-[92px] right-6 z-40 bg-brand-500 hover:bg-brand-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
          aria-label="Ver carrito"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-scale-in">
            {cartItems.reduce((acc, i) => acc + i.cantidad, 0)}
          </span>
        </button>
      )}

      {/* Botón flotante de WhatsApp */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('¡Hola! 👋 Vengo de la página web y quiero hacer una consulta.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group"
        aria-label="Escribir por WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping opacity-75 group-hover:hidden" />
        <svg
          className="w-7 h-7 fill-current relative z-10"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.747 1.451 5.436.002 9.861-4.422 9.864-9.863.002-2.637-1.019-5.115-2.876-6.974-1.858-1.859-4.338-2.88-6.98-2.881-5.448 0-9.873 4.426-9.876 9.868-.001 1.762.476 3.429 1.378 4.906l-.999 3.647 3.74-.954zm11.305-6.702c-.3-.149-1.772-.874-2.046-.974-.275-.1-.475-.149-.675.15-.2.3-.772.974-.946 1.173-.175.2-.35.226-.65.075-1.207-.604-1.998-1.082-2.797-2.454-.257-.441.258-.409.739-1.373.08-.164.04-.308-.02-.457-.06-.149-.475-1.144-.65-1.564-.17-.408-.344-.353-.475-.359-.123-.007-.264-.008-.405-.008-.141 0-.369.053-.563.264-.194.21-.74.722-.74 1.761s.755 2.043.859 2.193c.105.15 1.488 2.274 3.605 3.187.504.218.897.348 1.205.446.507.162.968.139 1.332.085.407-.06 1.772-.724 2.022-1.424.25-.699.25-1.299.175-1.424-.075-.125-.275-.199-.575-.349z"/>
        </svg>
      </a>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
