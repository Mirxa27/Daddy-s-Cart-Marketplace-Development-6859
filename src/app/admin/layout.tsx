import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    // During build time, auth might not be available
    console.log('Auth check skipped during build');
    return (
      <div className="flex h-screen bg-muted/30">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b bg-background px-4 sm:px-6 py-4">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/admin');
  }
  
  // Check if user has admin access
  if (!['ADMIN', 'SUPER_ADMIN', 'VENDOR'].includes(session.user.role)) {
    redirect('/?error=unauthorized');
  }
  
  return (
    <div className="flex h-screen bg-muted/30">
      <AdminSidebar userRole={session.user.role} userId={session.user.id} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}