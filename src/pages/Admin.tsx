import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ShieldAlert, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Admin() {
  const { data: users, isLoading, error } = useAdminUsers();
  const { user } = useAuth();

  if (error) {
    const is403 = (error as any)?.context?.status === 403 ||
      (error as any)?.message?.includes("Forbidden");

    if (is403) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
          <ShieldAlert className="h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-5xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <CardTitle>All Users</CardTitle>
          {users && (
            <Badge variant="secondary" className="ml-auto">
              {users.length} user{users.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Signed Up</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Contacts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.display_name || "—"}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      {format(new Date(u.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {u.last_sign_in_at
                        ? format(new Date(u.last_sign_in_at), "MMM d, yyyy")
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">{u.contact_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
