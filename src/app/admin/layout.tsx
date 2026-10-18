import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="SUPER_ADMIN">{children}</DashboardLayout>;
}
