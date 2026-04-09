export const INQUIRY_CART_KEY = 'inquiry_cart';
export const INQUIRY_CART_EVENT = 'inquiry-cart-updated';

export type InquiryCartItem = {
  slug: string;
  title: string;
  article: string;
  quantity: number;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getInquiryCart(): InquiryCartItem[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(INQUIRY_CART_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as InquiryCartItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item && typeof item.slug === 'string' && typeof item.title === 'string' && typeof item.article === 'string')
      .map((item) => ({ ...item, quantity: Math.max(1, Number(item.quantity) || 1) }));
  } catch {
    return [];
  }
}

export function setInquiryCart(items: InquiryCartItem[]): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(INQUIRY_CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(INQUIRY_CART_EVENT));
}

export function addItemToInquiryCart(
  item: Omit<InquiryCartItem, 'quantity'>,
  quantity: number,
): { added: boolean; items: InquiryCartItem[] } {
  const items = getInquiryCart();
  const existing = items.find((entry) => entry.slug === item.slug);

  if (existing) {
    return { added: false, items };
  }

  const normalizedQuantity = Math.max(1, quantity);
  const updated = [...items, { ...item, quantity: normalizedQuantity }];
  setInquiryCart(updated);
  return { added: true, items: updated };
}

export function updateInquiryItemQuantity(slug: string, quantity: number): InquiryCartItem[] {
  const items = getInquiryCart().map((item) => (item.slug === slug ? { ...item, quantity: Math.max(1, quantity) } : item));
  setInquiryCart(items);
  return items;
}

export function removeInquiryItem(slug: string): InquiryCartItem[] {
  const items = getInquiryCart().filter((item) => item.slug !== slug);
  setInquiryCart(items);
  return items;
}

export function clearInquiryCart(): void {
  setInquiryCart([]);
}
