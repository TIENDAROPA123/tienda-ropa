"use client";

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MessageCircle, 
  Bot, 
  X, 
  ChevronDown, 
  Send, 
  Ruler, 
  Check, 
  ShieldCheck, 
  Truck,
  Plus,
  Minus,
  Trash2,
  ArrowRight
} from 'lucide-react';

interface Variant {
  id: number;
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  stock: number;
  images: string[];
}

interface ProductData {
  id: number;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  compositionCare: string | null;
  shippingReturns: string | null;
  variants: Variant[];
}

interface CrossSellData {
  id: number;
  title: string;
  price: number;
  image: string;
  size: string;
  color: string;
}

interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export default function ProductClient({
  product,
  crossSell,
}: {
  product: ProductData;
  crossSell: CrossSellData | null;
}) {
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.colorName || '');
  const [selectedSize, setSelectedSize] = useState('M');
  const [openAccordion, setOpenAccordion] = useState<string | null>('care');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [chatMode, setChatMode] = useState<'idle' | 'bot'>('idle');
  const [chatMessages, setChatMessages] = useState<{ sender: 'bot' | 'user'; text: string }[]>([
    { sender: 'bot', text: '¡Hola! ¿Deseas asesoría con la talla o detalles del material?' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  // Variantes únicas por color y talla
  const availableColors = Array.from(
    new Map(product.variants.map((v) => [v.colorName, { name: v.colorName, hex: v.colorHex }])).values()
  );

  const currentVariant = product.variants.find(
    (v) => v.size === selectedSize && v.colorName === selectedColor
  );
  const isOutOfStock = currentVariant ? currentVariant.stock === 0 : true;

  const allImages = product.variants.flatMap((v) => v.images);
  const displayImages = allImages.length > 0 ? allImages : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80'];

  const addToCart = (
    itemData: { id: number; title: string; price: number; image: string },
    size: string,
    color: string
  ) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === itemData.id && item.size === size && item.color === color
      );
      if (existing) {
        return prev.map((item) =>
          item.id === itemData.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: itemData.id,
          title: itemData.title,
          price: itemData.price,
          image: itemData.image,
          size,
          color,
          quantity: 1,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, i) => {
          if (i !== index) return item;
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const freeShippingThreshold = 80.0;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputMsg('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Este modelo tiene un corte estructurado de 400 GSM. Para una talla ${selectedSize}, la caída queda ligeramente holgada.`,
        },
      ]);
    }, 600);
  };

  const getWhatsAppLink = () => {
    const phoneNumber = "50200000000";
    const sku = currentVariant?.sku || 'SUD-DEFAULT';
    const message = encodeURIComponent(
      `Hola, me interesa comprar: ${product.title} (SKU: ${sku}), Color: ${selectedColor}, Talla: ${selectedSize}. ¿Tienen disponibilidad?`
    );
    return `https://wa.me/${phoneNumber}?text=${message}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-20 relative overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <span className="font-black text-xl tracking-wider uppercase">NOVA ATELIER</span>
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold border border-neutral-200 px-4 py-2 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" /> Carrito ({totalItems})
        </button>
      </header>

      {/* Contenedor PDP */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Galería */}
        <div className="flex flex-col gap-4">
          <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
            <img
              src={displayImages[selectedImg] || displayImages[0]}
              alt={product.title}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImg(idx)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImg === idx ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Panel de Compra */}
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold mb-1">
            SKU: {currentVariant?.sku || 'SUD-DEFAULT'}
          </span>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{product.title}</h1>
          <p className="text-2xl font-semibold text-neutral-900 mb-6">${product.basePrice.toFixed(2)}</p>

          <p className="text-neutral-600 text-sm leading-relaxed mb-6">{product.description}</p>

          {/* Selector de Color */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
              Color: <span className="text-neutral-500 font-normal">{selectedColor}</span>
            </label>
            <div className="flex items-center gap-3">
              {availableColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  style={{ backgroundColor: color.hex }}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedColor === color.name
                      ? 'ring-2 ring-black ring-offset-2 border-white'
                      : 'border-neutral-200'
                  }`}
                >
                  {selectedColor === color.name && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Talla */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">Talla</label>
              <button className="text-xs text-neutral-500 underline flex items-center gap-1 hover:text-black">
                <Ruler className="w-3.5 h-3.5" /> Guía de tallas
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['S', 'M', 'L', 'XL'].map((size) => {
                const variantForSize = product.variants.find(
                  (v) => v.size === size && v.colorName === selectedColor
                );
                const disabled = !variantForSize || variantForSize.stock === 0;
                return (
                  <button
                    key={size}
                    disabled={disabled}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                      disabled
                        ? 'border-neutral-200 bg-neutral-100 text-neutral-300 cursor-not-allowed line-through'
                        : selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-300 hover:border-black text-neutral-800'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            {currentVariant && currentVariant.stock > 0 && currentVariant.stock <= 3 && (
              <p className="text-xs text-amber-600 mt-2 font-medium">
                ¡Solo quedan {currentVariant.stock} unidades en esta talla!
              </p>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-3 mb-8">
            <button
              disabled={isOutOfStock}
              onClick={() =>
                addToCart(
                  {
                    id: product.id,
                    title: product.title,
                    price: product.basePrice,
                    image: displayImages[0],
                  },
                  selectedSize,
                  selectedColor
                )
              }
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-neutral-800 shadow-md hover:shadow-lg active:scale-[0.99]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {isOutOfStock ? 'Agotado en esta talla' : 'Agregar al carrito'}
            </button>
          </div>

          {/* Garantías */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-neutral-200 text-xs text-neutral-600 mb-6">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-neutral-800" />
              <span>Envío gratis en compras mayores a $80</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neutral-800" />
              <span>Garantía de cambio por 30 días</span>
            </div>
          </div>

          {/* Acordeones */}
          <div className="divide-y divide-neutral-200">
            <div>
              <button
                onClick={() => setOpenAccordion(openAccordion === 'care' ? null : 'care')}
                className="w-full py-3.5 flex justify-between items-center text-sm font-semibold"
              >
                Composición y Cuidado
                <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === 'care' ? 'rotate-180' : ''}`} />
              </button>
              {openAccordion === 'care' && (
                <div className="pb-4 text-xs text-neutral-600 space-y-1">
                  <p>{product.compositionCare || '100% Algodón peinado.'}</p>
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                className="w-full py-3.5 flex justify-between items-center text-sm font-semibold"
              >
                Envíos y Devoluciones
                <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === 'shipping' ? 'rotate-180' : ''}`} />
              </button>
              {openAccordion === 'shipping' && (
                <div className="pb-4 text-xs text-neutral-600 space-y-1">
                  <p>{product.shippingReturns || 'Entregas en 2 a 4 días hábiles.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* DRAWER CART */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <h3 className="font-bold text-base uppercase tracking-wider">Tu Carrito ({totalItems})</h3>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-1.5 rounded-full hover:bg-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de progreso */}
            <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span>
                  {subtotal >= freeShippingThreshold ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> ¡Tienes Envío Gratis!
                    </span>
                  ) : (
                    `Agrega $${(freeShippingThreshold - subtotal).toFixed(2)} más para Envío Gratis`
                  )}
                </span>
                <span className="text-neutral-500">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                <div className="bg-black h-full transition-all duration-300 rounded-full" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* Ítems del carrito */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-neutral-100">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400 gap-3">
                  <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
                  <p className="text-sm font-medium">Tu carrito está vacío</p>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="py-4 flex gap-4 items-start">
                    <img src={item.image} alt={item.title} className="w-16 h-20 object-cover rounded-lg border border-neutral-200" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold truncate">{item.title}</h4>
                        <button onClick={() => removeFromCart(index)} className="text-neutral-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Talla: {item.size} | Color: {item.color}</p>
                      <p className="text-xs font-bold mt-2">${item.price.toFixed(2)}</p>
                      <div className="flex items-center border border-neutral-200 rounded-lg w-fit mt-2">
                        <button onClick={() => updateQuantity(index, -1)} className="px-2 py-1 hover:bg-neutral-100 text-neutral-600">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold min-w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(index, 1)} className="px-2 py-1 hover:bg-neutral-100 text-neutral-600">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Cross-selling */}
              {crossSell && cart.length > 0 && (
                <div className="pt-4 mt-2">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 block mb-2">Completa tu look</span>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between gap-3">
                    <img src={crossSell.image} alt={crossSell.title} className="w-12 h-12 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold truncate">{crossSell.title}</h5>
                      <span className="text-xs text-neutral-600">${crossSell.price.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() =>
                        addToCart(
                          { id: crossSell.id, title: crossSell.title, price: crossSell.price, image: crossSell.image },
                          crossSell.size,
                          crossSell.color
                        )
                      }
                      className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-semibold hover:bg-neutral-800"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-neutral-200 bg-white flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Subtotal</span>
                  <span className="text-lg">${subtotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => alert("Redirigiendo a pasarela de pago...")}
                  className="w-full py-3.5 bg-black text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:bg-neutral-800 shadow-lg"
                >
                  Proceder al Pago <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Widget Flotante */}
      <aside className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {isWidgetOpen && (
          <div className="w-80 sm:w-96 bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden mb-3 flex flex-col">
            <div className="bg-neutral-950 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-sm">Soporte & Asesoría</span>
              </div>
              <button onClick={() => setIsWidgetOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {chatMode === 'idle' ? (
              <div className="p-5 flex flex-col gap-3">
                <p className="text-xs text-neutral-600 mb-1">¿Cómo prefieres que te ayudemos?</p>
                <button
                  onClick={() => setChatMode('bot')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-neutral-200 hover:border-black text-left transition-colors"
                >
                  <div className="p-2 bg-neutral-100 rounded-lg">
                    <Bot className="w-5 h-5 text-neutral-800" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Asistente Virtual IA</h4>
                    <p className="text-[11px] text-neutral-500">Recomendaciones de talla y dudas al instante.</p>
                  </div>
                </button>
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors text-left"
                >
                  <div className="p-2 bg-emerald-500 rounded-lg text-white">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">Chat por WhatsApp</h4>
                    <p className="text-[11px] text-emerald-800">Habla con un asesor sobre esta prenda.</p>
                  </div>
                </a>
              </div>
            ) : (
              <div className="flex flex-col h-80">
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50 text-xs">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 ${
                        msg.sender === 'user' ? 'bg-black text-white' : 'bg-white border border-neutral-200 text-neutral-800'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="p-2 border-t border-neutral-200 bg-white flex gap-2">
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Escribe tu consulta..."
                    className="flex-1 text-xs border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-black"
                  />
                  <button type="submit" className="p-2 bg-black text-white rounded-lg hover:bg-neutral-800">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
                <div className="px-3 py-1.5 bg-neutral-100 flex justify-between items-center text-[10px] text-neutral-500">
                  <button onClick={() => setChatMode('idle')} className="underline hover:text-black">
                    Volver
                  </button>
                  <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-medium hover:underline">
                    Transferir a WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setIsWidgetOpen(!isWidgetOpen)}
          className="h-14 w-14 rounded-full bg-black text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center relative"
          aria-label="Atención al cliente"
        >
          {isWidgetOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
        </button>
      </aside>
    </div>
  );
}