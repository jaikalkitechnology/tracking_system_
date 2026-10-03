import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { addressesApi } from "@/api/addresses";
import { getApiErrorMessage } from "@/api/axios";
import { customersApi } from "@/api/customers";
import { ordersApi } from "@/api/orders";
import { productsApi } from "@/api/products";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Label, Select } from "@/components/ui/Input";
import { IconSearch } from "@/components/ui/icons";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Address, Customer, Product } from "@/types";
import { formatCurrency } from "@/utils/format";

type Step = "customer" | "products" | "shipping" | "payment" | "review";

const STEPS: { key: Step; label: string }[] = [
  { key: "customer", label: "Customer" },
  { key: "products", label: "Products" },
  { key: "shipping", label: "Shipping" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
];

interface CartLine {
  product: Product;
  quantity: number;
}

interface AddressDraft {
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const EMPTY_ADDRESS: AddressDraft = { address_line1: "", address_line2: "", city: "", state: "", pincode: "", country: "India" };

export function CreateOrderPage() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex].key;
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [customerSearch, setCustomerSearch] = useState("");
  const debouncedCustomerSearch = useDebouncedValue(customerSearch);
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (customerMode !== "existing" || !debouncedCustomerSearch) {
      setCustomerResults([]);
      return;
    }
    customersApi.list({ search: debouncedCustomerSearch, limit: 10 }).then((r) => setCustomerResults(r.items));
  }, [customerMode, debouncedCustomerSearch]);

  // Products
  const [productSearch, setProductSearch] = useState("");
  const debouncedProductSearch = useDebouncedValue(productSearch);
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);

  useEffect(() => {
    productsApi.list({ search: debouncedProductSearch || undefined, status: "ACTIVE", limit: 10 }).then((r) => setProductResults(r.items));
  }, [debouncedProductSearch]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) return prev.map((l) => (l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l));
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setCart((prev) => prev.map((l) => (l.product.id === productId ? { ...l, quantity: Math.max(1, quantity) } : l)));
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((l) => l.product.id !== productId));
  };

  // Shipping
  const [existingAddresses, setExistingAddresses] = useState<Address[]>([]);
  const [shippingAddressId, setShippingAddressId] = useState<number | "">("");
  const [shippingMode, setShippingMode] = useState<"existing" | "new">("new");
  const [shippingDraft, setShippingDraft] = useState<AddressDraft>(EMPTY_ADDRESS);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddressId, setBillingAddressId] = useState<number | "">("");
  const [billingMode, setBillingMode] = useState<"existing" | "new">("new");
  const [billingDraft, setBillingDraft] = useState<AddressDraft>(EMPTY_ADDRESS);

  useEffect(() => {
    if (customerMode === "existing" && selectedCustomer) {
      addressesApi.listForCustomer(selectedCustomer.id).then((addrs) => {
        setExistingAddresses(addrs);
        setShippingMode(addrs.length > 0 ? "existing" : "new");
      });
    } else {
      setExistingAddresses([]);
      setShippingMode("new");
    }
  }, [customerMode, selectedCustomer]);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("ONLINE");
  const [shippingAmount, setShippingAmount] = useState("0");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [taxAmount, setTaxAmount] = useState("0");

  const subtotal = cart.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const total = subtotal + (Number(shippingAmount) || 0) + (Number(taxAmount) || 0) - (Number(discountAmount) || 0);

  const canProceed = (): boolean => {
    if (step === "customer") {
      return customerMode === "existing" ? !!selectedCustomer : !!(newCustomer.name && newCustomer.email);
    }
    if (step === "products") return cart.length > 0;
    if (step === "shipping") {
      const addrOk = shippingMode === "existing" ? !!shippingAddressId : !!(shippingDraft.address_line1 && shippingDraft.city && shippingDraft.state && shippingDraft.pincode);
      const billingOk =
        billingSameAsShipping ||
        (billingMode === "existing" ? !!billingAddressId : !!(billingDraft.address_line1 && billingDraft.city && billingDraft.state && billingDraft.pincode));
      return addrOk && billingOk;
    }
    return true;
  };

  const goNext = () => {
    setError(null);
    if (!canProceed()) {
      setError("Please complete this step before continuing.");
      return;
    }
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const handleCreateOrder = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      let customerId = selectedCustomer?.id;
      if (customerMode === "new") {
        const created = await customersApi.create(newCustomer);
        customerId = created.id;
      }
      if (!customerId) throw new Error("No customer selected");

      let shipId: number;
      if (shippingMode === "existing" && shippingAddressId) {
        shipId = Number(shippingAddressId);
      } else {
        const created = await addressesApi.create({
          customer_id: customerId,
          address_line1: shippingDraft.address_line1,
          address_line2: shippingDraft.address_line2 || null,
          city: shippingDraft.city,
          state: shippingDraft.state,
          pincode: shippingDraft.pincode,
          country: shippingDraft.country,
          latitude: null,
          longitude: null,
        });
        shipId = created.id;
      }

      let billId: number;
      if (billingSameAsShipping) {
        billId = shipId;
      } else if (billingMode === "existing" && billingAddressId) {
        billId = Number(billingAddressId);
      } else {
        const created = await addressesApi.create({
          customer_id: customerId,
          address_line1: billingDraft.address_line1,
          address_line2: billingDraft.address_line2 || null,
          city: billingDraft.city,
          state: billingDraft.state,
          pincode: billingDraft.pincode,
          country: billingDraft.country,
          latitude: null,
          longitude: null,
        });
        billId = created.id;
      }

      const order = await ordersApi.create({
        customer_id: customerId,
        shipping_address_id: shipId,
        billing_address_id: billId,
        payment_method: paymentMethod,
        shipping_amount: Number(shippingAmount) || 0,
        discount_amount: Number(discountAmount) || 0,
        tax_amount: Number(taxAmount) || 0,
        items: cart.map((l) => ({ product_id: l.product.id, quantity: l.quantity })),
      });
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Create New Order</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add customer details, select products and create a new order.</p>
        </div>
        <ol className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s.key} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  i <= stepIndex ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                }`}
              >
                {i + 1}
              </span>
              <span className={`hidden text-xs font-medium sm:inline ${i === stepIndex ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <span className="mx-1 hidden h-px w-6 bg-slate-200 dark:bg-white/10 sm:block" />}
            </li>
          ))}
        </ol>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</div>}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {step === "customer" && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Customer Information</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCustomerMode("existing")}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${customerMode === "existing" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}
                  >
                    Search Existing Customer
                  </button>
                  <button
                    onClick={() => setCustomerMode("new")}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${customerMode === "new" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}
                  >
                    New Customer
                  </button>
                </div>

                {customerMode === "existing" ? (
                  <div>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <IconSearch className="h-4 w-4" />
                      </span>
                      <Input
                        className="pl-9"
                        placeholder="Search by name, email or code..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                      />
                    </div>
                    {selectedCustomer && (
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 text-sm dark:bg-brand-500/10">
                        <span className="font-medium text-brand-700 dark:text-brand-300">
                          {selectedCustomer.name} &middot; {selectedCustomer.email}
                        </span>
                        <button onClick={() => setSelectedCustomer(null)} className="text-xs text-brand-600 hover:underline dark:text-brand-400">
                          Change
                        </button>
                      </div>
                    )}
                    {!selectedCustomer && customerResults.length > 0 && (
                      <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-slate-100 p-1 dark:border-surface-dark-border">
                        {customerResults.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedCustomer(c);
                              setCustomerSearch("");
                              setCustomerResults([]);
                            }}
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/5"
                          >
                            <span className="font-medium text-slate-800 dark:text-slate-200">{c.name}</span>
                            <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">{c.email}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label>Customer Name</Label>
                      <Input value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Email</Label>
                        <Input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">A customer code will be generated automatically.</p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {step === "products" && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Products</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <IconSearch className="h-4 w-4" />
                  </span>
                  <Input className="pl-9" placeholder="Search products by name or SKU..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
                </div>
                <div className="max-h-64 space-y-1 overflow-y-auto">
                  {productResults.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="h-9 w-9 rounded-lg border border-slate-200 object-cover dark:border-surface-dark-border" />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                            {p.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{p.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {p.sku} &middot; {formatCurrency(p.price)}
                          </p>
                        </div>
                      </div>
                      <Button variant="secondary" onClick={() => addToCart(p)}>
                        Add
                      </Button>
                    </div>
                  ))}
                </div>

                {cart.length > 0 && (
                  <div className="border-t border-slate-100 pt-3 dark:border-surface-dark-border">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Cart</p>
                    <div className="space-y-2">
                      {cart.map((l) => (
                        <div key={l.product.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-300">{l.product.name}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(l.product.id, l.quantity - 1)}
                              className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-slate-500 dark:border-surface-dark-border"
                            >
                              -
                            </button>
                            <span className="w-6 text-center">{l.quantity}</span>
                            <button
                              onClick={() => updateQuantity(l.product.id, l.quantity + 1)}
                              className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-slate-500 dark:border-surface-dark-border"
                            >
                              +
                            </button>
                          </div>
                          <span className="w-20 text-right font-medium text-slate-800 dark:text-slate-200">
                            {formatCurrency(l.product.price * l.quantity)}
                          </span>
                          <button onClick={() => removeFromCart(l.product.id)} className="text-red-500 hover:text-red-600">
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {step === "shipping" && (
            <div className="space-y-5">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Shipping Address</h2>
                  {existingAddresses.length > 0 && (
                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() => setShippingMode("existing")}
                        className={`rounded-full px-2.5 py-1 font-medium ${shippingMode === "existing" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}
                      >
                        Existing
                      </button>
                      <button
                        onClick={() => setShippingMode("new")}
                        className={`rounded-full px-2.5 py-1 font-medium ${shippingMode === "new" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}
                      >
                        New
                      </button>
                    </div>
                  )}
                </CardHeader>
                <CardBody className="space-y-3">
                  {shippingMode === "existing" ? (
                    <Select value={shippingAddressId} onChange={(e) => setShippingAddressId(e.target.value ? Number(e.target.value) : "")}>
                      <option value="">Select address</option>
                      {existingAddresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.address_line1}, {a.city}, {a.state} {a.pincode}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <AddressFields draft={shippingDraft} onChange={setShippingDraft} />
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input type="checkbox" checked={billingSameAsShipping} onChange={(e) => setBillingSameAsShipping(e.target.checked)} />
                    Billing address same as shipping
                  </label>
                </CardBody>
              </Card>

              {!billingSameAsShipping && (
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Billing Address</h2>
                    {existingAddresses.length > 0 && (
                      <div className="flex gap-2 text-xs">
                        <button
                          onClick={() => setBillingMode("existing")}
                          className={`rounded-full px-2.5 py-1 font-medium ${billingMode === "existing" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}
                        >
                          Existing
                        </button>
                        <button
                          onClick={() => setBillingMode("new")}
                          className={`rounded-full px-2.5 py-1 font-medium ${billingMode === "new" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}
                        >
                          New
                        </button>
                      </div>
                    )}
                  </CardHeader>
                  <CardBody className="space-y-3">
                    {billingMode === "existing" ? (
                      <Select value={billingAddressId} onChange={(e) => setBillingAddressId(e.target.value ? Number(e.target.value) : "")}>
                        <option value="">Select address</option>
                        {existingAddresses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.address_line1}, {a.city}, {a.state} {a.pincode}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <AddressFields draft={billingDraft} onChange={setBillingDraft} />
                    )}
                  </CardBody>
                </Card>
              )}
            </div>
          )}

          {step === "payment" && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Payment Information</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <Label>Payment Method</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <input type="radio" checked={paymentMethod === "ONLINE"} onChange={() => setPaymentMethod("ONLINE")} />
                      Online
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <input type="radio" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                      Cash on Delivery (COD)
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Shipping (₹)</Label>
                    <Input type="number" min={0} value={shippingAmount} onChange={(e) => setShippingAmount(e.target.value)} />
                  </div>
                  <div>
                    <Label>Discount (₹)</Label>
                    <Input type="number" min={0} value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} />
                  </div>
                  <div>
                    <Label>Tax (₹)</Label>
                    <Input type="number" min={0} value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} />
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {step === "review" && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Review Order</h2>
              </CardHeader>
              <CardBody className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Customer</p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {customerMode === "existing" ? `${selectedCustomer?.name} (${selectedCustomer?.email})` : `${newCustomer.name} (${newCustomer.email})`}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Shipping Address</p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {shippingMode === "existing"
                      ? existingAddresses.find((a) => a.id === shippingAddressId)?.address_line1
                      : `${shippingDraft.address_line1}, ${shippingDraft.city}, ${shippingDraft.state} ${shippingDraft.pincode}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Payment</p>
                  <p className="text-slate-700 dark:text-slate-300">{paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</p>
                </div>
              </CardBody>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="secondary" onClick={goBack} disabled={stepIndex === 0}>
              Back
            </Button>
            {step === "review" ? (
              <Button onClick={handleCreateOrder} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Order"}
              </Button>
            ) : (
              <Button onClick={goNext}>Next</Button>
            )}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Order Summary</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {cart.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500">No products added yet.</p>
              ) : (
                <div className="space-y-2">
                  {cart.map((l) => (
                    <div key={l.product.id} className="flex items-center gap-3 text-sm">
                      {l.product.image_url ? (
                        <img src={l.product.image_url} alt={l.product.name} className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 object-cover dark:border-surface-dark-border" />
                      ) : (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                          {l.product.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-800 dark:text-slate-200">{l.product.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Qty: {l.quantity}</p>
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(l.product.price * l.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-1.5 border-t border-slate-100 pt-3 text-sm dark:border-surface-dark-border">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                  <span className="text-slate-700 dark:text-slate-300">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Shipping</span>
                  <span className="text-slate-700 dark:text-slate-300">{formatCurrency(Number(shippingAmount) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Discount</span>
                  <span className="text-slate-700 dark:text-slate-300">-{formatCurrency(Number(discountAmount) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Tax</span>
                  <span className="text-slate-700 dark:text-slate-300">{formatCurrency(Number(taxAmount) || 0)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold dark:border-surface-dark-border">
                  <span className="text-slate-900 dark:text-slate-50">Total Amount</span>
                  <span className="text-slate-900 dark:text-slate-50">{formatCurrency(total)}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AddressFields({ draft, onChange }: { draft: AddressDraft; onChange: (d: AddressDraft) => void }) {
  return (
    <>
      <div>
        <Label>Address Line 1</Label>
        <Input value={draft.address_line1} onChange={(e) => onChange({ ...draft, address_line1: e.target.value })} />
      </div>
      <div>
        <Label>Address Line 2</Label>
        <Input value={draft.address_line2} onChange={(e) => onChange({ ...draft, address_line2: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>City</Label>
          <Input value={draft.city} onChange={(e) => onChange({ ...draft, city: e.target.value })} />
        </div>
        <div>
          <Label>State</Label>
          <Input value={draft.state} onChange={(e) => onChange({ ...draft, state: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Pincode</Label>
          <Input value={draft.pincode} onChange={(e) => onChange({ ...draft, pincode: e.target.value })} />
        </div>
        <div>
          <Label>Country</Label>
          <Input value={draft.country} onChange={(e) => onChange({ ...draft, country: e.target.value })} />
        </div>
      </div>
    </>
  );
}
