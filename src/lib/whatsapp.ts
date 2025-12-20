import { CartItem } from '@/types/database';

const WHATSAPP_NUMBER = '584140257059';

export function generateWhatsAppMessage(items: CartItem[]): string {
  if (items.length === 0) return '';

  const productLines = items.map(item => 
    `• ${item.product.name} - Talla: ${item.size} (x${item.quantity})`
  ).join('\n');

  return `¡Hola! Quiero comprar:\n\n${productLines}`;
}

export function generateSingleProductMessage(productName: string, size: string): string {
  return `¡Hola! Quiero comprar: ${productName} - Talla: ${size}`;
}

export function openWhatsApp(message: string): void {
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  window.open(url, '_blank');
}

export function openWhatsAppWithCart(items: CartItem[]): void {
  const message = generateWhatsAppMessage(items);
  openWhatsApp(message);
}

export function openWhatsAppWithProduct(productName: string, size: string): void {
  const message = generateSingleProductMessage(productName, size);
  openWhatsApp(message);
}
