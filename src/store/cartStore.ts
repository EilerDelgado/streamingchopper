import React from "react";

export interface CartItem {
  id: string;
  nombre: string;
  plataforma: string;
  precio: number;
  cantidad: number;
}

// Número WhatsApp del negocio — reemplazar con el real
export const WHATSAPP_NUMBER = "573229851240";

/**
 * Genera los handlers del carrito para usar junto a useState en App.tsx.
 * Se pasa hacia abajo por props; no usa Context para mantenerlo simple.
 */
export function crearCartHandlers(
  items: CartItem[],
  setItems: React.Dispatch<React.SetStateAction<CartItem[]>>,
) {
  const agregarItem = (nuevo: Omit<CartItem, "cantidad">) => {
    setItems((prev) => {
      const existe = prev.find((i) => i.id === nuevo.id);
      if (existe) {
        return prev.map((i) =>
          i.id === nuevo.id ? { ...i, cantidad: i.cantidad + 1 } : i,
        );
      }
      return [...prev, { ...nuevo, cantidad: 1 }];
    });
  };

  const incrementarItem = (id: string) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, cantidad: i.cantidad + 1 } : i)),
    );

  const decrementarItem = (id: string) =>
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i))
        .filter((i) => i.cantidad > 0),
    );

  const quitarItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const limpiarCarrito = () => setItems([]);

  const totalItems = () => items.reduce((acc, i) => acc + i.cantidad, 0);

  const totalPrecio = () =>
    items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  const generarMensajeWhatsApp = (nombre?: string, nota?: string): string => {
    if (items.length === 0) return `https://wa.me/${WHATSAPP_NUMBER}`;
    const lineas = items.map(
      (i) =>
        `• ${i.nombre} (${i.plataforma}) x${i.cantidad} — $${(i.precio * i.cantidad).toLocaleString("es-CO")}`,
    );
    let msg = `¡Hola! 👋 Quiero hacer un pedido:\n\n${lineas.join("\n")}\n\n💰 *Total: $${totalPrecio().toLocaleString("es-CO")}/mes*`;
    if (nombre) msg += `\n\n👤 Nombre: ${nombre}`;
    if (nota) msg += `\n📝 Nota: ${nota}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  return {
    agregarItem,
    incrementarItem,
    decrementarItem,
    quitarItem,
    limpiarCarrito,
    totalItems,
    totalPrecio,
    generarMensajeWhatsApp,
  };
}
