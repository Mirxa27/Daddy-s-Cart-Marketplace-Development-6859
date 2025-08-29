'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { shippingSettingsSchema, ShippingSettingsInput } from '@/lib/validations/settings';
import { Save, Truck, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export function ShippingSettings() {
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShippingSettingsInput>({
    resolver: zodResolver(shippingSettingsSchema),
    defaultValues: {
      shipping_fee: 5.99,
      free_shipping_threshold: 50,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/shipping');
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

  const onSubmit = async (data: ShippingSettingsInput) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast.success('Shipping settings saved successfully');
    } catch (error) {
      toast.error('Failed to save shipping settings');
    } finally {
      setLoading(false);
    }
  };

  const shippingFee = watch('shipping_fee');
  const threshold = watch('free_shipping_threshold');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Configuration
          </CardTitle>
          <CardDescription>
            Configure shipping rates and policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shipping_fee">Standard Shipping Fee</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">$</span>
              <Input
                id="shipping_fee"
                type="number"
                step="0.01"
                min="0"
                placeholder="5.99"
                {...register('shipping_fee', { valueAsNumber: true })}
              />
            </div>
            {errors.shipping_fee && (
              <p className="text-sm text-destructive">{errors.shipping_fee.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              The standard shipping fee for orders
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="free_shipping_threshold">
              Free Shipping Threshold
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">$</span>
              <Input
                id="free_shipping_threshold"
                type="number"
                step="0.01"
                min="0"
                placeholder="50.00"
                {...register('free_shipping_threshold', { valueAsNumber: true })}
              />
            </div>
            {errors.free_shipping_threshold && (
              <p className="text-sm text-destructive">
                {errors.free_shipping_threshold.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Orders above this amount qualify for free shipping
            </p>
          </div>

          {/* Preview */}
          <div className="rounded-lg bg-muted p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Shipping Policy Preview
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Standard shipping: ${shippingFee?.toFixed(2) || '0.00'}</li>
              <li>• Free shipping on orders over ${threshold?.toFixed(2) || '0.00'}</li>
              <li>• Estimated delivery: 3-5 business days</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          <Save className="mr-2 h-4 w-4" />
          Save Shipping Settings
        </Button>
      </div>
    </form>
  );
}