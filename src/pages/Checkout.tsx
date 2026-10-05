import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  CreditCard,
  Wallet,
  MessageSquare,
  Ticket,
  X,
  MapPin,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { cn, getSizeFullName, formatProductVariantName } from "../lib/utils";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useBundle } from "../context/BundleContext";
import { adminService } from "../lib/adminService";
import Select from "react-select";
import { pakistanCities } from "../../cities";

export default function Checkout() {
  const {
    cart: cartFromContext,
    totalAmount: totalFromContext,
    clearCart,
  } = useCart();
  const { clearBundle } = useBundle();
  const { user, userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Get direct items if provided via location state (Buy Now or Bundle Finalize)
  const directItems = location.state?.items as any[];

  const checkoutItems = useMemo(() => {
    if (directItems && directItems.length > 0) {
      return directItems.map((item) => {
        // If it's already a cart-like object {item, quantity, type}
        if (item.item && item.quantity !== undefined) return item;

        // If it's a raw item, wrap it
        return {
          item: item,
          quantity: item.quantity || 1,
          type: item.type || "product",
        };
      });
    }
    return cartFromContext;
  }, [directItems, cartFromContext]);

  const subtotal = useMemo(() => {
    return checkoutItems.reduce(
      (sum, item) =>
        sum + (item.item?.price || item.item?.totalPrice) * item.quantity,
      0,
    );
  }, [checkoutItems]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return Math.round(subtotal * (appliedCoupon.discount_percentage / 100));
  }, [subtotal, appliedCoupon]);

  const checkoutTotal = useMemo(() => {
    return subtotal - discountAmount;
  }, [subtotal, discountAmount]);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    try {
      setCouponLoading(true);
      const coupon = await adminService.validateCoupon(couponCodeInput);
      if (coupon) {
        setAppliedCoupon(coupon);
        toast.success(
          `Coupon Applied! ${coupon.discount_percentage}% discount.`,
        );
      } else {
        toast.error("Invalid or expired coupon code");
      }
    } catch (error) {
      toast.error("Error validating coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    billingAddress: "",
    city: "Select City",
    postalCode: "",
    paymentMethod: "cod",
    notes: "",
    country: "Pakistan",
  });

  const isValidPhone = useMemo(() => {
    return /^03[0-9]{9}$/.test(formData.phone);
  }, [formData.phone]);

  const [useSameAddress, setUseSameAddress] = useState(true);
    const cityOptions = pakistanCities.map((city) => ({
  value: city,
  label: city,
}));

  // Sync formData when userData is available
  React.useEffect(() => {
    if (userData) {
      setFormData((prev) => ({
        ...prev,
        name: userData.fullName || userData.name || prev.name,
        email: userData.email || prev.email,
        phone: userData.phone || prev.phone,
        address: userData.address || prev.address,
        city: userData.city || prev.city,
        postalCode: userData.postalCode || prev.postalCode,
      }));
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.user_metadata?.full_name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [userData, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Place Order button clicked", formData);

    if (!user) {
      alert("Please login first before placing an order");
      navigate("/auth");
      return;
    }

    // Validation
    if (
      !formData.name ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.notes
    ) {
      toast.error("Please fill all required details");
      return;
    }

    if (!isValidPhone) {
      toast.error("Invalid phone format. Use 03XXXXXXXXX (11 digits)");
      return;
    }

    setLoading(true);
    try {
      const finalBillingAddress = useSameAddress
        ? formData.address
        : formData.billingAddress || formData.address;

      // Step 1: Clean Payload Creation (STRICT PAYLOAD CONTROL)
      const payload = {
        userId: user.id,
        userName: formData.name,
        userEmail: formData.email,
        items: checkoutItems,
        total: checkoutTotal,
        subtotal: subtotal,
        discountAmount: discountAmount,
        couponCode: appliedCoupon?.code || "N/A",
        country: "Pakistan",
        status: "pending",
        paymentStatus: "unpaid",
        paymentMethod: "cod",
        address: formData.address,
        billingAddress: finalBillingAddress,
        phone: formData.phone,
        city: formData.city,
        postalCode: formData.postalCode,
        notes: formData.notes,
        is_custom_bundle: !!directItems,
        createdAt: new Date().toISOString(),
      };

      console.log("SENDING ORDER PAYLOAD:", payload);

      // Step 2: Safe Insert Function
      const order = await adminService.createOrder(payload);

      if (!order) {
        throw new Error("order_insert_failed: No data returned from Supabase");
      }

      console.log("Order Success:", order);

      // Step 3: Create Invoice (async but non-blocking)
      adminService
        .createInvoice({
          order_id: order.id,
          user_id: user.id,
          amount: checkoutTotal,
        })
        .catch((err) => console.warn("Invoice creation failed:", err));

      // Step 4: Clear items after placement
      if (!directItems) {
        await clearCart();
      } else if (
        directItems.some(
          (i) => i.isCustom || i.type === "bundle" || i.item?.type === "bundle",
        )
      ) {
        await clearBundle("product");
      }

      // Step 5: Show Success State
      toast.success("Your order has been placed successfully!");
      setOrderData(order);
      setShowOrderModal(true);
    } catch (error: any) {
      console.error("CRITICAL: Order placement failed", error);
      alert(
        `Order placement failed: ${error.message || "Unknown error"}. Please check your connection and try again.`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkoutItems.length === 0 && !showOrderModal) {
    return (
      <div className="pt-40 pb-20 px-6 min-h-screen bg-bg-dark flex flex-col items-center justify-center text-center">
        <h2 className="text-5xl font-semibold text-slate-900 mb-6">
          Your collection is empty
        </h2>
        <p className="text-slate-400 mb-10">
          Add masterpieces to your cart or collections to proceed.
        </p>
        <Link
          to="/products"
          className="text-primary font-black uppercase tracking-widest text-[11px] underline"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-20 px-4 md:px-10 min-h-screen bg-bg-dark">
      <div className="max-w-7xl mx-auto">
        {!showOrderModal && (
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all mb-6 md:mb-12"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
            Return to Cart
          </Link>
        )}

        <form
          onSubmit={handleSubmit}
          className={`flex flex-col lg:flex-row gap-8 lg:gap-20 ${showOrderModal ? "opacity-0 pointer-events-none" : ""}`}
        >
          {/* Form Side */}
          <div className="flex-1 space-y-8 md:space-y-12">
            <section className="space-y-6 md:space-y-10">
              <div className="flex items-center gap-3 md:gap-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center text-black shadow-lg">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <h2 className="text-xl md:text-4xl font-semibold text-slate-900">
                  Delivery Info
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <div className="md:col-span-2 space-y-1.5 md:space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3 md:ml-4">
                    Region / Country
                  </label>
                  <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl md:rounded-2xl px-5 py-3 md:py-4 shadow-sm">
                    <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                    </div>
                    <span className="text-sm md:text-base font-bold text-slate-900">
                      Pakistan
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3 md:ml-4">
                    Full Name
                  </label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-white border border-slate-100 rounded-xl md:rounded-2xl px-5 md:px-6 py-3 md:py-4 text-sm md:text-base text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/5 shadow-sm"
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3 md:ml-4">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="tel"
                      maxLength={11}
                      placeholder="03XXXXXXXXX"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value.replace(/[^0-9]/g, ""),
                        })
                      }
                      className={cn(
                        "w-full bg-white border rounded-xl md:rounded-2xl px-5 md:px-6 py-3 md:py-4 text-sm md:text-base font-bold outline-none focus:ring-4 transition-all shadow-sm",
                        formData.phone && !isValidPhone
                          ? "border-red-200 focus:ring-red-500/5 text-red-500"
                          : "border-slate-100 focus:ring-primary/5 text-slate-900",
                      )}
                    />
                    {formData.phone && !isValidPhone && (
                      <p className="text-[8px] font-bold text-red-400 uppercase mt-1 ml-4">
                        Start with 03 (11 digits)
                      </p>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-1.5 md:space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3 md:ml-4">
                    Shipping Address
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full bg-white border border-slate-100 rounded-xl md:rounded-2xl px-5 md:px-6 py-3 md:py-4 text-sm md:text-base text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/5 shadow-sm resize-none"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3 ml-3 md:ml-4">
                  <input
                    type="checkbox"
                    id="same-address"
                    checked={useSameAddress}
                    onChange={(e) => setUseSameAddress(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="same-address"
                    className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer"
                  >
                    Billing Address same as Shipping
                  </label>
                </div>

                {!useSameAddress && (
                  <div className="md:col-span-2 space-y-1.5 md:space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3 md:ml-4">
                      Billing Address
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formData.billingAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingAddress: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-slate-100 rounded-xl md:rounded-2xl px-5 md:px-6 py-3 md:py-4 text-sm md:text-base text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/5 shadow-sm resize-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 md:gap-6 md:col-span-2">
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3 md:ml-4">
                      City
                    </label>
                <Select
  options={cityOptions}
  placeholder="Search City / Town"
  value={
    cityOptions.find(
      (option) => option.value === formData.city
    ) || null
  }
  onChange={(selectedOption) =>
    setFormData({
      ...formData,
      city: selectedOption?.value || "",
    })
  }
  isSearchable
  className="text-sm md:text-base"
  styles={{
    control: (base) => ({
      ...base,
      minHeight: "59px",
      borderRadius: "16px",
      borderColor: "#FFD200",
      boxShadow: "none",
      paddingLeft: "8px",
      paddingRight: "8px",
      fontWeight: "700",
    }),
      hover: (base) => ({
      borderColor: "#FFD200",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  }}
/>
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3 md:ml-4">
                      Postal Code (optional)
                    </label>
                    <input
                      value={formData.postalCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          postalCode: e.target.value.replace(/[^0-9]/g, ""),
                        })
                      }
                      placeholder="e.g. 43600"
                      className="w-full bg-white border border-slate-100 rounded-xl md:rounded-2xl px-5 md:px-6 py-3 md:py-4 text-sm md:text-base text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/5 shadow-sm"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-1.5 md:space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3 md:ml-4">
                    Special Instructions (Required)
                  </label>
                  <input
                    required
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="e.g. Near main gate..."
                    className="w-full bg-white border border-slate-100 rounded-xl md:rounded-2xl px-5 md:px-6 py-3 md:py-4 text-sm md:text-base text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/5 shadow-sm"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-8 border-l-4 border-primary pl-6">
                Payment Method
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    id: "cod",
                    name: "Cash on Delivery",
                    icon: Wallet,
                    desc: "Pay when your items arrive at your doorstep",
                  },
                ].map((method) => (
                  <div
                    key={method.id}
                    className="p-8 rounded-[30px] border-2 border-primary bg-primary/5 shadow-xl shadow-primary/10 text-left relative overflow-hidden"
                  >
                    <method.icon className="w-8 h-8 mb-6 text-primary" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-2">
                      {method.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      {method.desc}
                    </p>
                    <div className="absolute top-6 right-8 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-black">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sticky Summary */}
          <div className="w-full lg:w-[400px] xl:w-[450px]">
            <div className="sticky top-32">
              <div className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[50px] border border-slate-100 shadow-xl shadow-slate-100/50">
                <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-slate-50">
                  Review Order
                </h3>

                <div className="space-y-4 md:space-y-6 mb-8 md:mb-10 max-h-[300px] overflow-auto pr-4 scrollbar-thin scrollbar-thumb-slate-100">
                  {checkoutItems.map((cartItem, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                        <img
                          src={
                            (cartItem.item as any).img ||
                            (cartItem.item as any).items?.[0]?.img ||
                            (cartItem.item as any).items?.[0]?.item?.img
                          }
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {formatProductVariantName(
                            (cartItem.item as any).title || (cartItem.item as any).name,
                            (cartItem.item as any).selectedVariant?.color_name,
                            (cartItem.item as any).selectedVariant?.size
                          )}
                        </h4>
                        {(cartItem.item as any).selectedVariant && (
                          <div className="flex items-center gap-2 mt-1">
                            {(cartItem.item as any).selectedVariant.color_code && 
                             (cartItem.item as any).selectedVariant.color_name?.toLowerCase() !== 'standard' && (
                              <div
                                className="w-2.5 h-2.5 rounded-full border border-slate-200"
                                style={{
                                  backgroundColor: (cartItem.item as any)
                                    .selectedVariant.color_code,
                                }}
                              />
                            )}
                            <p className="text-[10px] text-primary font-black uppercase tracking-tight font-sans">
                              {[
                                (cartItem.item as any).selectedVariant.color_name?.toLowerCase() !== 'standard' ? (cartItem.item as any).selectedVariant.color_name : null,
                                getSizeFullName((cartItem.item as any).selectedVariant.size),
                              ]
                                .filter(Boolean)
                                .join(" / ")}
                            </p>
                          </div>
                        )}
                        {(cartItem.item as any).items &&
                          (cartItem.item as any).items.length > 0 && (
                            <div className="mt-2 space-y-2 pl-2 border-l-2 border-slate-100 mb-2">
                              {(cartItem.item as any).items.map(
                                (sub: any, sidx: number) => (
                                  <div
                                    key={sidx}
                                    className="flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <p className="text-[9px] font-bold text-slate-500 truncate">
                                        {sub.item.title}
                                      </p>
                                      {sub.item.selectedVariant && (
                                        <div
                                          className="w-1.5 h-1.5 rounded-full border border-slate-200 flex-shrink-0"
                                          style={{
                                            backgroundColor:
                                              sub.item.selectedVariant
                                                .color_code,
                                          }}
                                        />
                                      )}
                                    </div>
                                    <p className="text-[9px] font-black text-slate-300 flex-shrink-0">
                                      ×{sub.quantity}
                                    </p>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        <p className="text-[10px] text-slate-400 font-black uppercase mt-1">
                          Qty: {cartItem.quantity} × Rs.{" "}
                          {(
                            (cartItem.item as any).price ||
                            (cartItem.item as any).totalPrice
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-10 pb-10 border-b border-slate-50">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                    Have a promo code?
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) =>
                        setCouponCodeInput(e.target.value.toUpperCase())
                      }
                      placeholder="ENTER CODE"
                      disabled={appliedCoupon}
                      className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest focus:ring-1 focus:ring-primary h-12"
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCodeInput("");
                        }}
                        className="px-6 rounded-xl bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors h-12"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCodeInput}
                        className="px-6 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all h-12 disabled:opacity-50"
                      >
                        {couponLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-4 mb-10">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className={appliedCoupon ? "line-through" : ""}>
                      Rs. {subtotal.toLocaleString()}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <>
                      <div className="flex justify-between text-[11px] font-bold text-primary uppercase tracking-widest">
                        <span>
                          Discount ({appliedCoupon.discount_percentage}%)
                        </span>
                        <span>- Rs. {discountAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-900 uppercase tracking-widest">
                        <span>Discounted Subtotal</span>
                        <span>Rs. {checkoutTotal.toLocaleString()}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Shipping</span>
                    <span className="text-green-500">Free</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <span className="text-xs md:text-sm font-black uppercase text-slate-900 tracking-widest">
                      Total Amount
                    </span>
                    <div className="text-right">
                      <span className="text-2xl md:text-3xl font-semibold text-primary block leading-none">
                        Rs. {checkoutTotal.toLocaleString()}
                      </span>
                      {appliedCoupon && (
                        <span className="text-[10px] font-bold text-slate-400 line-through mt-1 block">
                          Original: Rs. {subtotal.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isValidPhone}
                  className="w-full py-4 md:py-6 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-[10px] md:text-[12px] hover:bg-primary hover:text-black transition-all shadow-2xl flex items-center justify-center gap-3 md:gap-4 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Place My Order
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                    </>
                  )}
                </button>

                <p className="text-center mt-6 text-[10px] text-slate-300 font-black uppercase tracking-widest">
                  Handcrafted with love by Hamza Decorations
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Success Modal: Detailed Order Confirmation */}
        {showOrderModal && orderData && (
          <OrderConfirmationModal
            order={orderData}
            onClose={() => {
              setShowOrderModal(false);
              navigate("/orders");
            }}
          />
        )}
      </div>
    </div>
  );
}

// Separate Component for the Logic-Heavy Modal
function OrderConfirmationModal({
  order,
  onClose,
}: {
  order: any;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        {/* Modal Header */}
        <div className="p-6 md:p-10 text-center border-b border-slate-50 relative shrink-0">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center text-black mx-auto mb-4 md:mb-6 shadow-xl shadow-primary/20">
            <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h2 className="text-xl md:text-3xl font-semibold text-slate-900 mb-2 underline decoration-primary/30">
            Order{" "}
            <span className="text-slate-400 not-italic">
              Placed Successfully
            </span>
          </h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            Reference: #{order.id?.slice(-8).toUpperCase()}
          </p>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 md:space-y-10 custom-scrollbar text-left">
          {/* Items List */}
          <section>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 md:mb-6 flex items-center gap-2">
              <ShoppingCart className="w-3 h-3" />
              Your Selection
            </h4>
            <div className="space-y-3 md:space-y-4">
              {order.items.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-4 md:gap-6 p-4 rounded-2xl md:rounded-3xl bg-slate-50/50 border border-slate-100"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl overflow-hidden bg-white shrink-0 border border-slate-100">
                    <img
                      src={item.item?.img || item.item?.image_url}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-bold text-slate-900 truncate">
                      {formatProductVariantName(
                        item.item?.title,
                        item.item?.selectedVariant?.color_name,
                        item.item?.selectedVariant?.size
                      )}
                    </p>
                    {item.item?.selectedVariant && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {item.item.selectedVariant.color_code && 
                         item.item.selectedVariant.color_name?.toLowerCase() !== 'standard' && (
                          <div
                            className="w-2 h-2 rounded-full border border-slate-200"
                            style={{
                              backgroundColor:
                                item.item.selectedVariant.color_code,
                            }}
                          />
                        )}
                        <p className="text-[8px] md:text-[10px] text-primary font-black uppercase font-sans">
                          {[
                            item.item.selectedVariant.color_name?.toLowerCase() !== 'standard' ? item.item.selectedVariant.color_name : null,
                            getSizeFullName(item.item.selectedVariant.size),
                          ]
                            .filter(Boolean)
                            .join(" / ")}
                        </p>
                      </div>
                    )}
                    <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase mt-1">
                      Qty: {item.quantity} × Rs.{" "}
                      {(
                        item.item?.price || item.item?.totalPrice
                      )?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs md:text-sm font-black text-slate-900">
                      Rs.{" "}
                      {(
                        (item.item?.price || item.item?.totalPrice) *
                        item.quantity
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Summary & User Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Wallet className="w-3 h-3" />
                Billing Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="text-slate-900">
                    Rs. {(order.subtotal || order.total).toLocaleString()}
                  </span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-[11px] font-bold text-primary">
                    <span>Discount ({order.couponCode}):</span>
                    <span>- Rs. {order.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400">Shipping:</span>
                  <span className="text-green-500 uppercase tracking-widest">
                    Free
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400">Payment Status:</span>
                  <span className="text-primary uppercase tracking-widest">
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400">Payment Method:</span>
                  <span className="text-slate-900 uppercase tracking-widest">
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="pt-4 border-t border-slate-50 flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Total Amount
                  </span>
                  <span className="text-2xl font-semibold text-slate-900">
                    Rs. {order.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                Customer Details
              </h4>
              <div className="text-[10px] font-bold text-slate-500 space-y-1">
                <p className="text-slate-900 font-black uppercase tracking-wider">
                  {order.userName}
                </p>
                <p>{order.userEmail}</p>
                <p>{order.phone}</p>
                <p className="pt-2 border-t border-slate-50 mt-2">
                  {order.address}, {order.city}, {order.postalCode}, PK
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 md:p-10 border-t border-slate-50 bg-slate-50/30 grid grid-cols-3 gap-3 md:gap-4 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/orders");
            }}
            className="py-3 md:py-4 bg-slate-200 text-slate-900 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[9px] hover:bg-slate-300 transition-all font-sans"
          >
            History
          </button>
          <button
            type="button"
            onClick={() => navigate(`/invoice/${order.id}`)}
            className="py-3 md:py-4 bg-primary text-black rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[9px] hover:bg-black hover:text-primary transition-all shadow-xl shadow-primary/10 font-sans"
          >
            Invoice
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/products");
            }}
            className="py-3 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[9px] hover:opacity-90 transition-all shadow-xl shadow-slate-900/10 font-sans"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
}
