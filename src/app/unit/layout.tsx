import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function UnitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="UNIT">{children}</DashboardLayout>;
}
