import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/utils/format";

export function SettingsPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Your account information.</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Profile</h2>
        </CardHeader>
        <CardBody className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Name</span>
            <span className="font-medium text-slate-800">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Email</span>
            <span className="font-medium text-slate-800">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Phone</span>
            <span className="font-medium text-slate-800">{user.phone || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Role</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{user.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status</span>
            <Badge status={user.status} />
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Member since</span>
            <span className="font-medium text-slate-800">{formatDate(user.created_at)}</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
