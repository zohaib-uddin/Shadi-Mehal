
export const WHATSAPP_NUMBER = '+923116869582';

export interface OrderItem {
  id?: string;
  title: string;
  price: number;
  quantity: number;
  type: 'product' | 'service' | 'bundle' | 'deal';
  description?: string;
  duration?: string;
  items?: any[]; // For bundles
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export const formatWhatsAppMessage = (items: OrderItem[], customer: CustomerDetails) => {
  if (items.length === 0) return null;

  let message = "Hello, I want to place an order:\n\n🛒 *Items:*\n\n";
  let total = 0;

  items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    message += `${index + 1}. *${item.title}*\n`;
    message += `   Price: ${item.price.toLocaleString()} PKR\n`;
    message += `   Qty: ${item.quantity}\n`;
    message += `   Item Subtotal: ${itemTotal.toLocaleString()} PKR\n`;
    
    if (item.type === 'service') {
      message += `   Type: Service\n`;
      if (item.description) message += `   Desc: ${item.description.substring(0, 100)}${item.description.length > 100 ? '...' : ''}\n`;
      if (item.duration) message += `   Duration: ${item.duration}\n`;
    }

    if (item.type === 'deal') {
      message += `   Type: Exclusive Deal\n`;
      if (item.description) message += `   Desc: ${item.description.substring(0, 100)}${item.description.length > 100 ? '...' : ''}\n`;
    }

    if (item.type === 'bundle' && item.items) {
      message += `   *Bundle Includes:*\n`;
      item.items.forEach((sub: any) => {
        const subTitle = sub.item?.title || sub.title || 'Item';
        message += `   - ${subTitle}\n`;
      });
    }

    message += `\n`;
  });

  message += `---\n`;
  message += `💰 *Grand Total: ${total.toLocaleString()} PKR*\n\n`;

  message += `📍 *Customer Details:*\n\n`;
  message += `Full Name: ${customer.name}\n`;
  message += `Email: ${customer.email}\n`;
  message += `WhatsApp/Phone: ${customer.phone}\n`;
  message += `Home Address: ${customer.address}\n\n`;

  message += `---\n`;
  message += `*Please confirm this order and let me know the next steps.*`;

  return message;
};

export const openWhatsAppOrder = (items: OrderItem[], customer: CustomerDetails) => {
  const message = formatWhatsAppMessage(items, customer);
  if (!message) return;

  const encodedMessage = encodeURIComponent(message);
  // Remove + from number for URL if needed, but wa.me handles it usually. 
  // Let's strip special chars just in case.
  const cleanNumber = WHATSAPP_NUMBER.replace(/\+/g, '').replace(/\s/g, '');
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, "_blank");
};
