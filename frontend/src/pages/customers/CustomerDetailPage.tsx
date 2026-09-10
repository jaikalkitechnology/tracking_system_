import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { customersApi } from "@/api/customers";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/Spinner";
import { CustomerDetail } from "@/types";
import { formatDate } from "@/utils/format";

export function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    customersApi
      .get(Number(id))
      .then(setCustomer)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!customer) return null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{customer.name}</h1>
        <p className="text-sm text-slate-500">Customer Code: {customer.customer_code}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">Customer Information</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-slate-800">{customer.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone</span>
              <span className="font-medium text-slate-800">{customer.phone || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <Badge status={customer.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Joined</span>
              <span className="font-medium text-slate-800">{formatDate(customer.created_at)}</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">Addresses</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {customer.addresses.length === 0 ? (
              <p className="text-sm text-slate-400">No addresses on file.</p>
            ) : (
              customer.addresses.map((addr) => (
                <div key={addr.id} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
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
    </div>
  );
}
