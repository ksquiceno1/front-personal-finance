const categoryIconClasses: Record<string, string> = {
  utensils: 'fa-solid fa-utensils',
  coins: 'fa-solid fa-coins',
  award: 'fa-solid fa-award',
  'bag-shopping': 'fa-solid fa-bag-shopping',
  'credit-card': 'fa-solid fa-credit-card',
  'graduation-cap': 'fa-solid fa-graduation-cap',
  gamepad: 'fa-solid fa-gamepad',
  'hand-holding-dollar': 'fa-solid fa-hand-holding-dollar',
  paw: 'fa-solid fa-paw',
  'cart-arrow-down': 'fa-solid fa-cart-arrow-down',
  'file-invoice-dollar': 'fa-solid fa-file-invoice-dollar',
  'arrow-rotate-left': 'fa-solid fa-arrow-rotate-left',
  'hand-holding-heart': 'fa-solid fa-hand-holding-heart',
  'money-bill-wave': 'fa-solid fa-money-bill-wave',
  'heart-pulse': 'fa-solid fa-heart-pulse',
  receipt: 'fa-solid fa-receipt',
  'user-tie': 'fa-solid fa-user-tie',
  car: 'fa-solid fa-car',
  'plane-up': 'fa-solid fa-plane-up',
  house: 'fa-solid fa-house',
};

export function resolveCategoryIconClass(icon: string): string {
  if (icon.startsWith('fa-')) {
    return icon;
  }

  return categoryIconClasses[icon.toLowerCase()] ?? 'fa-solid fa-tag';
}
