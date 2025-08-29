import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralSettings } from '@/components/admin/settings/general-settings';
import { PaymentSettings } from '@/components/admin/settings/payment-settings';
import { ShippingSettings } from '@/components/admin/settings/shipping-settings';
import { EmailSettings } from '@/components/admin/settings/email-settings';
import { VendorSettings } from '@/components/admin/settings/vendor-settings';
import { SecuritySettings } from '@/components/admin/settings/security-settings';

export const metadata: Metadata = {
  title: 'Settings - Admin Dashboard',
  description: 'Configure your marketplace settings',
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your marketplace configuration and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="vendor">Vendor</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentSettings />
        </TabsContent>

        <TabsContent value="shipping">
          <ShippingSettings />
        </TabsContent>

        <TabsContent value="email">
          <EmailSettings />
        </TabsContent>

        <TabsContent value="vendor">
          <VendorSettings />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}