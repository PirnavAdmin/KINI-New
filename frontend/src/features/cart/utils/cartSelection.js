/**
 * Which cart courses the student has ticked for the next payment
 * (localStorage `kini:cart:selection`), so the choice survives a refresh or a
 * trip back from checkout. Courses left unticked simply stay in the cart.
 */
export const CART_SELECTION_KEY = "kini:cart:selection";

export const readCartSelection = () => {
  try {
    const value = JSON.parse(localStorage.getItem(CART_SELECTION_KEY) || "null");
    return Array.isArray(value) ? value.map(String) : null;
  } catch {
    return null;
  }
};

export const writeCartSelection = (ids) => {
  try {
    localStorage.setItem(CART_SELECTION_KEY, JSON.stringify([...new Set(ids.map(String))]));
  } catch {
    // Storage unavailable — the selection just won't persist.
  }
};
