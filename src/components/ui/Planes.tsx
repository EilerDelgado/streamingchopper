import { useState, useEffect } from 'react';
import { ShoppingCart, Crown, ShoppingBag, Zap, Search, X, Check } from 'lucide-react';
import { Pagination } from 'flowbite-react';
import { CartItem, WHATSAPP_NUMBER } from '../../store/cartStore';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { PLANES_LOCALES, Plan, resolverImagen } from '../../store/planesData';
import defaultCardImg from '../../assets/prime_video_completa.webp';

interface PlanesProps {
  cartItems: CartItem[];
  agregarItem: (item: Omit<CartItem, 'cantidad'>) => void;
  quitarItem: (id: string) => void;
  generarMensajeWhatsApp: (nombre?: string, nota?: string) => string;
  totalPrecio: () => number;
  onOpenCart: () => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

export default function Planes({
  cartItems,
  agregarItem,
  totalPrecio,
  onOpenCart,
  activeCategory,
  setActiveCategory
}: PlanesProps) {
  const [planes, setPlanes] = useState<Plan[]>(PLANES_LOCALES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  
  // Detalle de producto seleccionado
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const sectionRef = useScrollReveal();

  // Cargar datos de Supabase si está disponible, o de localStorage si estamos en modo demo local
  useEffect(() => {
    async function loadPlanes() {
      if (!isSupabaseConfigured() || !supabase) {
        // Cargar desde localStorage
        const localPlanes = localStorage.getItem('chopper_local_planes_v2');
        if (localPlanes) {
          try {
            const parsed = JSON.parse(localPlanes);
            setPlanes(parsed);
          } catch (e) {
            console.error('Error al parsear planes locales:', e);
            setPlanes(PLANES_LOCALES);
          }
        } else {
          localStorage.setItem('chopper_local_planes_v2', JSON.stringify(PLANES_LOCALES));
          setPlanes(PLANES_LOCALES);
        }
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('planes')
          .select('*')
          .order('precio', { ascending: true });
        
        if (error) throw error;
        if (data && data.length > 0) {
          setPlanes(data);
        }
      } catch (err) {
        console.warn('No se pudieron cargar los planes de Supabase, usando locales:', err);
        const localPlanes = localStorage.getItem('chopper_local_planes_v2');
        if (localPlanes) {
          try {
            const parsed = JSON.parse(localPlanes);
            setPlanes(parsed);
          } catch (e) {
            setPlanes(PLANES_LOCALES);
          }
        } else {
          localStorage.setItem('chopper_local_planes_v2', JSON.stringify(PLANES_LOCALES));
          setPlanes(PLANES_LOCALES);
        }
      } finally {
        setLoading(false);
      }
    }
    loadPlanes();
  }, []);

  // Resetear paginación al cambiar filtros o búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const handleAgregar = (plan: Plan) => {
    if (plan.agotado) return; // Evitar agregar agotados
    agregarItem({
      id: plan.id,
      nombre: plan.nombre,
      plataforma: plan.plataforma,
      precio: plan.precio
    });
    setFeedback(plan.id);
    setTimeout(() => setFeedback(null), 1400);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    // Desplazar la pantalla suavemente al inicio de la sección de planes
    const element = document.getElementById('planes');
    if (element) {
      const navbarHeight = 84; // Altura aproximada del navbar sticky
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarHeight - 20;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const estaEnCarrito = (id: string) => cartItems.some((i) => i.id === id);
  const totalCantidad = cartItems.reduce((acc, i) => acc + i.cantidad, 0);

  // 1. Filtrar planes por búsqueda y categorías
  const planesFiltrados = planes.filter((plan) => {
    const matchesSearch = plan.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          plan.plataforma.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          plan.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'todos' || 
                            (plan.categorias && plan.categorias.includes(activeCategory));

    return matchesSearch && matchesCategory;
  });

  // 2. Ordenar por destacados (TOP) primero, y luego alfabéticamente por Plataforma y Nombre
  const planesOrdenados = [...planesFiltrados].sort((a, b) => {
    const aDest = !!a.destacado;
    const bDest = !!b.destacado;
    if (aDest !== bDest) {
      return aDest ? -1 : 1; // Destacados arriba
    }
    const platCompare = a.plataforma.localeCompare(b.plataforma, 'es', { sensitivity: 'base' });
    if (platCompare !== 0) return platCompare;
    return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
  });

  // 3. Paginación de 10 en 10
  const totalPages = Math.ceil(planesOrdenados.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = planesOrdenados.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <section id="planes" ref={sectionRef} className="bg-transparent py-16 px-4 md:px-16 lg:px-24 xl:px-32 relative overflow-hidden cart-pattern">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Título y Filtros */}
        <div className="flex flex-col items-center mb-10">
          <p className="reveal text-brand-400 text-xs font-semibold tracking-widest uppercase text-center mb-2">
            NUESTRO CATÁLOGO
          </p>
          <h2 className="reveal reveal-delay-1 text-3xl md:text-4xl font-bold text-white text-center mb-8" style={{ fontFamily: 'Syne, sans-serif' }}>
            Servicios Disponibles
          </h2>

          {/* Buscador y Categorías */}
          <div className="w-full max-w-4xl flex flex-col xl:flex-row gap-4 justify-between items-center mb-8 reveal reveal-delay-2">
            
            {/* Buscador */}
            <div className="relative w-full xl:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </span>
              <input
                type="text"
                placeholder="Buscar plataforma o servicio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-brand-900/60 border border-brand-700/60 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder-gray-500"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            {/* Categorías (Pestañas) */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { id: 'todos', name: 'Todos' },
                { id: 'video', name: 'Series/Cine 🎬' },
                { id: 'deportes', name: 'Deportes ⚽' },
                { id: 'musica', name: 'Música 🎵' },
                { id: 'productividad', name: 'Productividad 💼' },
                { id: 'combos', name: 'Combos 🌟' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={[
                    'px-4 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95',
                    activeCategory === cat.id
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                      : 'bg-brand-900/50 text-gray-400 border border-brand-800 hover:text-white hover:bg-brand-900/80'
                  ].join(' ')}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Carga o Resultados vacíos */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Cargando catálogo...</p>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-base">No se encontraron servicios que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          /* Cuadrícula de productos estilo FUT */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 justify-items-center">
            {currentItems.map((plan, i) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`reveal reveal-delay-${Math.min(i + 1, 4)} flex flex-col items-center text-center group w-full max-w-[220px] cursor-pointer bg-[#141130]/55 hover:bg-[#141130]/80 rounded-3xl p-3 shadow-lg shadow-black/35 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 hover:-translate-y-1.5 border border-white/[0.05] hover:border-brand-500/20`}
              >
                {/* Contenedor de la Imagen FUT */}
                <div className="relative overflow-hidden rounded-2xl w-full aspect-[3/4] flex items-center justify-center transition-all duration-300 group-hover:scale-[1.03]">
                  <img
                    src={resolverImagen(plan.imagen)}
                    alt={plan.nombre}
                    className={[
                      'w-full h-full object-contain filter transition-all duration-300',
                      plan.agotado
                        ? 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]'
                        : 'drop-shadow-[0_6px_12px_rgba(74,50,147,0.35)] group-hover:drop-shadow-[0_10px_20px_rgba(74,50,147,0.45)]'
                    ].join(' ')}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultCardImg;
                    }}
                  />
                  
                  {plan.destacado && !plan.agotado && (
                    <span className="absolute top-2.5 right-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <Crown className="w-2.5 h-2.5" />
                      TOP
                    </span>
                  )}

                  {/* Overlay oscurecedor sutil con insignia de Agotado */}
                  {plan.agotado && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-red-600/95 border border-red-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1 animate-pulse">
                        Agotado
                      </span>
                    </div>
                  )}
                </div>

                {/* Título del producto (altura fija para alineación vertical perfecta en 1 y 2 líneas) */}
                <h3 
                  className={`font-bold text-xs sm:text-sm tracking-wide mt-2.5 max-w-full uppercase font-display transition-colors min-h-[40px] flex items-center justify-center px-1 ${plan.agotado ? 'text-gray-500' : 'text-white group-hover:text-brand-300'}`}
                  style={{ fontFamily: 'Syne, sans-serif' }}
                  title={plan.nombre}
                >
                  {plan.nombre}
                </h3>

                {/* Subtítulo / Plataforma */}
                <p className={`text-[10px] sm:text-xs mt-0.5 font-body ${plan.agotado ? 'text-gray-600' : 'text-gray-400'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                  {plan.plataforma}
                </p>

                {/* Precio del producto */}
                <p className={`font-bold text-xs sm:text-sm mt-1 font-body ${plan.agotado ? 'text-gray-500' : 'text-brand-300'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                  ${plan.precio.toLocaleString('es-CO')}
                </p>

                {/* Botón Comprar / Agotado */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!plan.agotado) handleAgregar(plan);
                  }}
                  disabled={plan.agotado}
                  className={[
                    'mt-3.5 flex items-center justify-center gap-1.5 w-full rounded-xl py-2 font-bold text-[10px] sm:text-xs uppercase transition-all duration-300 active:scale-95',
                    plan.agotado
                      ? 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
                      : estaEnCarrito(plan.id)
                      ? 'bg-green-700/30 border border-green-600/50 text-green-300 hover:bg-green-700/40'
                      : 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/30'
                  ].join(' ')}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {plan.agotado ? 'Sin Stock' : feedback === plan.id ? '¡Añadido! ✓' : estaEnCarrito(plan.id) ? 'Añadido (+1)' : 'Comprar'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Paginador de 10 en 10 (con estilos del tema de la marca) */}
        {/* Paginador de 12 en 12 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showIcons
              previousLabel="Anterior"
              nextLabel="Siguiente"
              theme={{
                pages: {
                  base: "xs:mt-0 mt-2 inline-flex items-center -space-x-px",
                  showIcon: "inline-flex",
                  previous: {
                    base: "ml-0 rounded-l-xl border border-white/[0.05] bg-[#141130]/40 px-4 py-2 leading-tight text-gray-400 hover:bg-brand-500 hover:text-white transition-colors",
                    icon: "h-5 w-5"
                  },
                  next: {
                    base: "rounded-r-xl border border-white/[0.05] bg-[#141130]/40 px-4 py-2 leading-tight text-gray-400 hover:bg-brand-500 hover:text-white transition-colors",
                    icon: "h-5 w-5"
                  },
                  selector: {
                    base: "w-10 border border-white/[0.05] bg-[#141130]/30 py-2 leading-tight text-gray-400 hover:bg-brand-500 hover:text-white transition-colors",
                    active: "bg-brand-500 text-white border-brand-500"
                  }
                }
              }}
            />
          </div>
        )}

        {/* Resumen del Carrito flotante en Planes */}
        {cartItems.length > 0 && (
          <div className="reveal mt-12 animate-scale-in">
            <button
              onClick={onOpenCart}
              className="w-full glass-strong rounded-2xl p-5 flex items-center justify-between gap-4 transition-all hover:scale-[1.01] active:scale-[0.99] group cursor-pointer"
              style={{ border: '1px solid rgba(74, 50, 147, 0.3)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(74, 50, 147, 0.3), rgba(124, 107, 194, 0.15))',
                    border: '1px solid rgba(74, 50, 147, 0.3)',
                  }}
                >
                  <ShoppingBag className="w-5 h-5 text-brand-400" />
                  <span
                    className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                  >
                    {totalCantidad}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {totalCantidad} {totalCantidad === 1 ? 'producto en tu carrito' : 'productos en tu carrito'}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Toca para revisar y finalizar tu pedido por WhatsApp
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className="text-lg font-bold hidden sm:block"
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    background: 'linear-gradient(to right, #7c6bc2, #a594e0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  ${totalPrecio().toLocaleString('es-CO')}/mes
                </span>
                <div
                  className="flex items-center gap-2 bg-green-600/90 hover:bg-green-500 text-white px-5 py-2.5 rounded-full font-medium text-sm transition-all shadow-lg shadow-green-600/20 whitespace-nowrap"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Zap className="w-4 h-4 transition-transform group-hover:rotate-12" />
                  Ver Carrito
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Modal de Detalle de Producto */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          {/* Background click to close */}
          <div className="absolute inset-0" onClick={() => setSelectedPlan(null)} />
          
          <div 
            className="relative bg-brand-900/95 border border-brand-700/50 rounded-3xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl z-10 glass-strong animate-scale-in"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Botón de cerrar */}
            <button 
              onClick={() => setSelectedPlan(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-brand-800 hover:bg-brand-700 text-gray-400 hover:text-white transition-all cursor-pointer z-10"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Contenido Responsivo */}
            <div className="flex flex-col md:flex-row gap-8 mt-4">
              {/* Columna Izquierda: Tarjeta e imagen + botón de compra abajo */}
              <div className="flex flex-col items-center shrink-0 w-full md:w-[220px]">
                <div className="relative overflow-hidden rounded-2xl w-full aspect-[3/4] flex items-center justify-center bg-brand-950/40 border border-brand-800/40 p-4">
                  <img
                    src={resolverImagen(selectedPlan.imagen)}
                    alt={selectedPlan.nombre}
                    className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(74,50,147,0.35)]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultCardImg;
                    }}
                  />
                  {selectedPlan.destacado && !selectedPlan.agotado && (
                    <span className="absolute top-2.5 right-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <Crown className="w-2.5 h-2.5" />
                      TOP
                    </span>
                  )}
                  {selectedPlan.agotado && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-red-600/95 border border-red-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg animate-pulse">
                        Agotado
                      </span>
                    </div>
                  )}
                </div>

                {/* Botón de comprar justo debajo de la tarjeta */}
                <button
                  onClick={() => {
                    if (!selectedPlan.agotado) {
                      handleAgregar(selectedPlan);
                      setSelectedPlan(null); // Opcional: cierra tras agregar
                    }
                  }}
                  disabled={selectedPlan.agotado}
                  className={[
                    'mt-4 flex items-center justify-center gap-2 w-full rounded-xl py-3 font-bold text-sm uppercase transition-all duration-300 active:scale-95',
                    selectedPlan.agotado
                      ? 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
                      : estaEnCarrito(selectedPlan.id)
                      ? 'bg-green-700/30 border border-green-600/50 text-green-300 hover:bg-green-700/40'
                      : 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                  ].join(' ')}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {selectedPlan.agotado ? 'Agotado' : estaEnCarrito(selectedPlan.id) ? 'En el Carrito' : 'Comprar Ahora'}
                </button>
              </div>

              {/* Columna Derecha: Información y detalles */}
              <div className="flex-1 text-left flex flex-col justify-between">
                <div>
                  <span className="inline-block bg-brand-800/80 border border-brand-700/40 text-brand-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                    {selectedPlan.plataforma}
                  </span>
                  
                  <h2 
                    className="text-2xl font-bold text-white mb-2 leading-tight"
                    style={{ fontFamily: 'Syne, sans-serif' }}
                  >
                    {selectedPlan.nombre}
                  </h2>
                  
                  <p className="text-xl font-extrabold text-brand-300 mb-6">
                    ${selectedPlan.precio.toLocaleString('es-CO')} <span className="text-xs text-gray-400 font-normal">/ mes</span>
                  </p>

                  {/* Descripción detallada formateada */}
                  <div className="space-y-4 text-gray-300 text-sm leading-relaxed mb-6 font-light">
                    {(() => {
                      const desc = selectedPlan.descripcionLarga || (() => {
                        const duracion = selectedPlan.nombre.toLowerCase().includes('día') || selectedPlan.nombre.toLowerCase().includes('dias')
                          ? selectedPlan.nombre.toLowerCase().match(/\d+\s*días?/)?.[0] || '30 días'
                          : '30 días';
                        return `Ofrecemos el servicio de Venta de pantallas de ${selectedPlan.plataforma}. Obtén acceso inmediato a tus series y películas favoritas con una pantalla de ${selectedPlan.nombre} por solo $${selectedPlan.precio.toLocaleString('es-CO')} los ${duracion}.

Olvídate de los altos costos. Con nosotros, tienes la libertad de disfrutar todo el contenido que te encanta a un precio súper económico y barato.

¿Buscas más opciones? Tenemos distintos planes and precios que se adaptan a tus necesidades.

¡Queremos que tengas la mejor experiencia! Contáctanos ahora mismo por WhatsApp para recibir toda la información. ¡Tu entretenimiento está a un mensaje de distancia!`;
                      })();

                      return desc.split('\n\n').map((parrafo, idx) => (
                        <p key={idx} className="whitespace-pre-line">
                          {parrafo}
                        </p>
                      ));
                    })()}
                  </div>

                  {/* Características estructuradas */}
                  {selectedPlan.caracteristicas && selectedPlan.caracteristicas.length > 0 && (
                    <div className="mb-6 bg-brand-950/30 border border-brand-850 rounded-2xl p-5">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
                        Especificaciones:
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-300">
                        {selectedPlan.caracteristicas.map((carac, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                            <span>{carac}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Pie de página del modal con enlace a consulta directa de WhatsApp */}
                <div className="border-t border-brand-800/60 pt-4 flex flex-col sm:flex-row items-center gap-4 text-xs text-gray-400 mt-6">
                  <span className="sm:mr-auto">¿Tienes dudas sobre este plan?</span>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`¡Hola! Vengo de la web y quiero consultar sobre: ${selectedPlan.nombre} (${selectedPlan.plataforma})`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold transition-colors bg-green-950/20 hover:bg-green-950/40 border border-green-900/40 hover:border-green-800 px-4 py-2 rounded-xl"
                  >
                    Consultar por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
