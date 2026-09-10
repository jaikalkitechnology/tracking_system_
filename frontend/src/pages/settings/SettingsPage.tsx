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
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your account information.</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Profile</h2>
        </CardHeader>
        <CardBody className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Name</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Email</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Phone</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{user.phone || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Role</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-300">{user.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Status</span>
            <Badge status={user.status} />
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Member since</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(user.created_at)}</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
