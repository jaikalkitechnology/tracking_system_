import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { customersApi } from "@/api/customers";
import { AddAddressModal } from "@/pages/customers/AddAddressModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { CustomerDetail } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";

export function CustomerDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isStaff = user && user.role !== "CUSTOMER";
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);

  const load = () => {
    if (!id) return;
    setIsLoading(true);
    customersApi
      .get(Number(id))
      .then(setCustomer)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [id]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!customer) return null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{customer.name}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Customer Code: {customer.customer_code}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Orders</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{customer.total_orders}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Spent</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{formatCurrency(customer.total_spent)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Customer Information</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Email</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{customer.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Phone</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{customer.phone || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Status</span>
              <Badge status={customer.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Joined</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(customer.created_at)}</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Addresses</h2>
            {isStaff && (
              <Button variant="secondary" onClick={() => setShowAddAddress(true)}>
                + Add Address
              </Button>
            )}
          </CardHeader>
          <CardBody className="space-y-3">
            {customer.addresses.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">No addresses on file.</p>
            ) : (
              customer.addresses.map((addr) => (
                <div key={addr.id} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  <p>{addr.address_line1}</p>
                  {addr.address_line2 && <p>{addr.address_line2}</p>}
                  <p>
                    {addr.city}, {addr.state} {addr.pincode}
                  </p>
                  <p>{addr.country}</p>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      {showAddAddress && (
        <AddAddressModal
          customerId={customer.id}
          onClose={() => setShowAddAddress(false)}
          onCreated={() => {
            setShowAddAddress(false);
            load();
          }}
        />
      )}
    </div>
  );
}
