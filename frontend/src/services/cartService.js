/**
 * cartService
 * Browser-side persistence for the course cart (localStorage `kini_cart`).
 *
 * The backend has no cart API, so the cart lives in the browser. Purchasing is
 * handled by the enrollment page (/enrollment), one course per payment, because
 * POST /api/v1/orders/create accepts a single amount and no course list.
 */

export const CART_STORAGE_KEY = "kini_cart";

const readList = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeList = (key, list) => {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch (error) {
    console.error(`Unable to persist ${key}`, error);
  }
  return list;
};

/** Reduce any course shape to the fields the cart stores. */
export const toCartItem = (course) => ({
  id: course.id,
  name: course.name ?? course.title,
  price: Number(course.price) || 0,
  duration: course.duration ?? "",
  level: course.level ?? "",
  ...(course.thumbnail ? { thumbnail: course.thumbnail } : {}),
});

export const getCart = () => readList(CART_STORAGE_KEY);

export const saveCart = (cartItems) => writeList(CART_STORAGE_KEY, cartItems);

/** Courses are unique products: adding one that is already present is a no-op. */
export const addToCart = (course) => {
  const cart = getCart();
  if (cart.some((item) => String(item.id) === String(course.id))) return cart;
  return saveCart([...cart, toCartItem(course)]);
};

export const removeFromCart = (courseId) =>
  saveCart(getCart().filter((item) => String(item.id) !== String(courseId)));

export const clearCart = () => saveCart([]);

const cartService = { getCart, saveCart, addToCart, removeFromCart, clearCart };

export default cartService;
