'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { vendorSettingsSchema, VendorSettingsInput } from '@/lib/validations/settings';
import { Save, Store, Percent, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export function VendorSettings() {
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VendorSettingsInput>({
    resolver: zodResolver(vendorSettingsSchema),
    defaultValues: {
      allow_vendor_registration: true,
      require_vendor_approval: true,
      commission_rate: 0.10,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/vendor');
      if (response.ok) {
        const data = await response.json();
        Object.keys(data).forEach((key) => {
          setValue(key as any, data[key]);
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const onSubmit = async (data: VendorSettingsInput) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings/vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast.success('Vendor settings saved successfully');
    } catch (error) {
      toast.error('Failed to save vendor settings');
    } finally {
      setLoading(false);
    }
  };

  const allowRegistration = watch('allow_vendor_registration');
  const requireApproval = watch('require_vendor_approval');
  const commissionRate = watch('commission_rate');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Vendor Management
          </CardTitle>
          <CardDescription>
            Configure vendor registration and approval settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow_vendor_registration">
                Allow Vendor Registration
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable vendors to register on the platform
              </p>
            </div>
            <Switch
              id="allow_vendor_registration"
              checked={allowRegistration}
              onCheckedChange={(checked) => setValue('allow_vendor_registration', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="require_vendor_approval">
                Require Admin Approval
              </Label>
              <p className="text-sm text-muted-foreground">
                New vendor accounts need admin approval before activation
              </p>
            </div>
            <Switch
              id="require_vendor_approval"
              checked={requireApproval}
              onCheckedChange={(checked) => setValue('require_vendor_approval', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Commission Settings
          </CardTitle>
          <CardDescription>
            Set the platform commission rate for vendor sales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="commission_rate">Platform Commission Rate</Label>
            <div className="flex items-center gap-2">
              <Input
                id="commission_rate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                {...register('commission_rate', { valueAsNumber: true })}
              />
              <span className="text-sm text-muted-foreground">
                ({((commissionRate || 0) * 100).toFixed(2)}%)
              </span>
            </div>
            {errors.commission_rate && (
              <p className="text-sm text-destructive">{errors.commission_rate.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              The percentage of each sale that goes to the platform
            </p>
          </div>

          {/* Commission Preview */}
          <div className="rounded-lg bg-muted p-4">
            <h4 className="font-medium mb-2">Commission Example</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product Price:</span>
                <span>$100.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Commission:</span>
                <span className="text-destructive">
                  -${(100 * (commissionRate || 0)).toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-1 flex justify-between font-medium">
                <span>Vendor Receives:</span>
                <span className="text-green-600">
                  ${(100 * (1 - (commissionRate || 0))).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Vendor Policies
          </CardTitle>
          <CardDescription>
            Additional vendor policies and restrictions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Product Approval Required</Label>
              <p className="text-sm text-muted-foreground">
                Require admin approval for new products
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Product Variants</Label>
              <p className="text-sm text-muted-foreground">
                Enable vendors to create product variants
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Vendor Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Provide vendors with sales analytics
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          <Save className="mr-2 h-4 w-4" />
          Save Vendor Settings
        </Button>
      </div>
    </form>
  );
}