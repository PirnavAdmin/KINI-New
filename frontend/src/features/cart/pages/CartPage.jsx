import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiBarChart2, FiClock, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { readCartSelection, writeCartSelection } from "../utils/cartSelection";

import Navbar from "@shared/components/Navbar";
import Footer from "@shared/components/Footer";
import { ROUTES } from "@shared/constants/routeConstants";
import { formatCurrency } from "@shared/utils/formatters";
import { useCart } from "@/context/CartContext";
import { readEnrollmentDraft, writeEnrollmentDraft } from "@features/enrollment/utils/enrollmentDraft";

import CourseThumb from "../components/CourseThumb";
import OrderSummary from "../components/OrderSummary";

const courseLabel = (count) => `${count} ${count === 1 ? "Course" : "Courses"}`;

function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-[36rem] rounded-3xl bg-white border border-slate-200 px-6 py-14 sm:px-12 text-center shadow-[0_20px_60px_rgba(19,59,93,0.08)]"
    >
      <div className="relative mx-auto w-24 h-24">
        <div className="absolute inset-0 rounded-full bg-[#F39924]/15 animate-ping [animation-duration:2.6s]" />
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#133B5D] to-[#1f5785] flex items-center justify-center shadow-lg">
          <FiShoppingCart className="w-10 h-10 text-white" />
        </div>
      </div>

      <h2 className="mt-8 text-2xl sm:text-3xl font-extrabold text-[#133B5D]">Your Cart is Empty</h2>
      <p className="mt-3 text-slate-500 leading-relaxed">
        Explore our courses and start building your learning journey.
      </p>

      <Link
        to={ROUTES.PUBLIC.COURSES}
        className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#F39924] px-7 py-3.5 font-bold text-[#133B5D] shadow-lg transition hover:bg-[#e08a17] hover:shadow-xl"
      >
        Browse Courses
        <FiArrowRight />
      </Link>
    </motion.div>
  );
}

function CartItem({ item, onRemove, selected, onToggle }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 sm:gap-5 rounded-3xl bg-white border p-4 sm:p-5 shadow-sm hover:shadow-md transition-all ${
        selected ? "border-[#F39924] ring-2 ring-[#F39924]/25" : "border-slate-200"
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(item.id)}
        aria-label={`Include ${item.name} in this payment`}
        className="mt-1 h-[18px] w-[18px] shrink-0 cursor-pointer self-center rounded accent-[#F39924]"
      />
      <CourseThumb course={item} />

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-[#133B5D]">{item.name}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium">
            {item.level && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#133B5D]/[0.07] px-2.5 py-1 text-[#133B5D]">
                <FiBarChart2 className="w-3.5 h-3.5" />
                {item.level}
              </span>
            )}
            {item.duration && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F39924]/10 px-2.5 py-1 text-[#9a5a06]">
                <FiClock className="w-3.5 h-3.5" />
                {item.duration}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <p className="text-xl font-extrabold text-[#133B5D] tabular-nums">{formatCurrency(item.price)}</p>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.name} from cart`}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            <FiTrash2 className="w-4 h-4" />
            Remove
          </button>
        </div>
      </div>
    </motion.li>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, cartCount, removeFromCart } = useCart();
  // Ticked courses are paid together in one order; unticked ones stay in the
  // cart. Everything starts ticked unless the student saved a choice earlier.
  const [selectedIds, setSelectedIds] = useState(() => readCartSelection() ?? cartItems.map((item) => String(item.id)));
  const cartIds = useMemo(() => cartItems.map((item) => String(item.id)), [cartItems]);
  const selected = useMemo(() => new Set(selectedIds.filter((id) => cartIds.includes(id))), [selectedIds, cartIds]);
  const selectedItems = cartItems.filter((item) => selected.has(String(item.id)));
  const subtotal = selectedItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const allSelected = cartCount > 0 && selected.size === cartCount;

  useEffect(() => { writeCartSelection([...selected]); }, [selected]);

  const toggle = (id) => setSelectedIds((current) => {
    const key = String(id);
    return current.includes(key) ? current.filter((value) => value !== key) : [...current, key];
  });
  const toggleAll = () => setSelectedIds(allSelected ? [] : cartIds);

  const proceedToPayment = () => {
    if (!selectedItems.length) return;
    const draft = readEnrollmentDraft();
    const ids = selectedItems.map((item) => String(item.id));
    const draftIds = (draft?.courses ?? (draft?.course ? [draft.course] : [])).map((course) => String(course.id));
    const sameCourses = draftIds.length === ids.length && ids.every((id) => draftIds.includes(id));
    writeEnrollmentDraft({
      // Keep details the student already typed for this same selection.
      ...(sameCourses && draft?.step !== "complete" ? draft : {}),
      courses: selectedItems.map((item) => ({ ...item, title: item.name, image: item.thumbnail })),
      course: undefined,
      step: "details",
      source: "cart",
    });
    navigate(`${ROUTES.PUBLIC.ENROLLMENT}?courseIds=${ids.map(encodeURIComponent).join(",")}`);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-[70vh] bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F39924]">Shopping Cart</p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#133B5D]">Your Cart</h1>
            </div>
            {cartCount > 0 && (
              <span className="rounded-full bg-[#133B5D] px-4 py-2 text-sm font-bold text-white">
                {courseLabel(cartCount)}
              </span>
            )}
          </header>

          {cartCount === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:gap-8 items-start">
              <section aria-label="Courses in your cart">
                {cartCount > 1 && (
                  <label className="mb-3 inline-flex cursor-pointer items-center gap-2.5 rounded-xl px-1 text-sm font-semibold text-[#133B5D]">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(element) => { if (element) element.indeterminate = selected.size > 0 && !allSelected; }}
                      onChange={toggleAll}
                      className="h-[18px] w-[18px] cursor-pointer rounded accent-[#F39924]"
                    />
                    Select all ({selected.size} of {cartCount} selected)
                  </label>
                )}
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {cartItems.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onRemove={removeFromCart}
                        selected={selected.has(String(item.id))}
                        onToggle={toggle}
                      />
                    ))}
                  </AnimatePresence>
                </ul>

                <Link
                  to={ROUTES.PUBLIC.COURSES}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-[#133B5D]/20 bg-white px-5 py-3 text-sm font-bold text-[#133B5D] transition hover:border-[#133B5D] hover:bg-[#133B5D] hover:text-white"
                >
                  <FiArrowLeft />
                  Continue Shopping
                </Link>
              </section>

              <OrderSummary
                title="Paying Now"
                subtotal={subtotal}
                discount={0}
                total={subtotal}
                courseCount={selectedItems.length}
                lines={selectedItems.map((item) => ({ id: item.id, label: item.name, amount: item.price }))}
                note={
                  selectedItems.length
                    ? <>Purchase multiple selected courses together in one secure payment. Coupons and a batch for each course are chosen on the next step.</>
                    : <>Select at least one course to continue. Unselected courses stay in your cart.</>
                }
              >
                <button
                  type="button"
                  onClick={proceedToPayment}
                  disabled={!selectedItems.length}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F39924] py-4 font-bold text-[#133B5D] shadow-lg transition hover:bg-[#e08a17] hover:shadow-xl disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                >
                  {selectedItems.length > 1 ? `Proceed to Payment · ${selectedItems.length} courses` : "Proceed to Payment"}
                  <FiArrowRight className="transition group-hover:translate-x-1" />
                </button>
              </OrderSummary>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
