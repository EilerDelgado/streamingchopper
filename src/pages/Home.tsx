import HeroStreaming from '../components/ui/HeroStreaming';
import Planes from '../components/ui/Planes';
import Garantia from '../components/ui/Garantia';
import FAQ from '../components/ui/FAQ';
import Contacto from '../components/ui/Contacto';
import { CartItem } from '../store/cartStore';

interface HomeProps {
  cartItems: CartItem[];
  agregarItem: (item: Omit<CartItem, 'cantidad'>) => void;
  quitarItem: (id: string) => void;
  generarMensajeWhatsApp: (nombre?: string, nota?: string) => string;
  totalPrecio: () => number;
  onOpenCart: () => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

/**
 * One-pager. El orden de secciones define el flujo de conversión:
 * Hero → Planes → Garantía → FAQ → Contacto
 */
export default function Home({
  cartItems,
  agregarItem,
  quitarItem,
  generarMensajeWhatsApp,
  totalPrecio,
  onOpenCart,
  activeCategory,
  setActiveCategory
}: HomeProps) {
  return (
    <main>
      <HeroStreaming cartItems={cartItems} onOpenCart={onOpenCart} setActiveCategory={setActiveCategory} />
      <Planes
        cartItems={cartItems}
        agregarItem={agregarItem}
        quitarItem={quitarItem}
        generarMensajeWhatsApp={generarMensajeWhatsApp}
        totalPrecio={totalPrecio}
        onOpenCart={onOpenCart}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      <Garantia />
      <FAQ />
      <Contacto />
    </main>
  );
}
