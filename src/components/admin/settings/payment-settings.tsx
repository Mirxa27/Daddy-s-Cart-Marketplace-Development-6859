'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { paymentSettingsSchema, PaymentSettingsInput } from '@/lib/validations/settings';
import { Save, CreditCard, DollarSign, Percent } from 'lucide-react';
import toast from 'react-hot-toast';

export function PaymentSettings() {
  const [loading, setLoading] = useState(false);
  const [testMode, setTestMode] = useState(true);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentSettingsInput>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      currency: { code: 'USD', symbol: '$' },
      tax_rate: 0.08,
    },
  });

  useEffect(() => {
    // Load current settings
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/payment');
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

  const onSubmit = async (data: PaymentSettingsInput) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast.success('Payment settings saved successfully');
    } catch (error) {
      toast.error('Failed to save payment settings');
    } finally {
      setLoading(false);
    }
  };

  const currencyCode = watch('currency.code');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Stripe Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Configuration
          </CardTitle>
          <CardDescription>
            Configure your Stripe payment gateway settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="test-mode">Test Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use test keys for development
              </p>
            </div>
            <Switch
              id="test-mode"
              checked={testMode}
              onCheckedChange={setTestMode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stripe_public_key">
              {testMode ? 'Test' : 'Live'} Publishable Key
            </Label>
            <Input
              id="stripe_public_key"
              type="text"
              placeholder="pk_test_..."
              {...register('stripe_public_key')}
            />
            {errors.stripe_public_key && (
              <p className="text-sm text-destructive">
                {errors.stripe_public_key.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stripe_secret_key">
              {testMode ? 'Test' : 'Live'} Secret Key
            </Label>
            <Input
              id="stripe_secret_key"
              type="password"
              placeholder="sk_test_..."
              {...register('stripe_secret_key')}
            />
            {errors.stripe_secret_key && (
              <p className="text-sm text-destructive">
                {errors.stripe_secret_key.message}
              </p>
            )}
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium mb-2">Webhook Endpoint</p>
            <code className="text-xs bg-background px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              Add this URL to your Stripe webhook settings
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Currency Settings
          </CardTitle>
          <CardDescription>
            Configure your store's currency and tax settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency_code">Currency Code</Label>
              <Select
                value={currencyCode}
                onValueChange={(value) => {
                  setValue('currency.code', value);
                  // Update symbol based on currency
                  const symbols: Record<string, string> = {
                    USD: '$',
                    EUR: '€',
                    GBP: '£',
                    JPY: '¥',
                    CAD: 'C$',
                    AUD: 'A$',
                  };
                  setValue('currency.symbol', symbols[value] || '$');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency_symbol">Currency Symbol</Label>
              <Input
                id="currency_symbol"
                type="text"
                {...register('currency.symbol')}
                readOnly
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax_rate" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Default Tax Rate
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                {...register('tax_rate', { valueAsNumber: true })}
              />
              <span className="text-sm text-muted-foreground">
                ({((watch('tax_rate') || 0) * 100).toFixed(2)}%)
              </span>
            </div>
            {errors.tax_rate && (
              <p className="text-sm text-destructive">{errors.tax_rate.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Payment Methods</CardTitle>
          <CardDescription>
            Enable other payment options for your customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>PayPal</Label>
              <p className="text-sm text-muted-foreground">
                Accept payments via PayPal
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Cash on Delivery</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to pay upon delivery
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Bank Transfer</Label>
              <p className="text-sm text-muted-foreground">
                Accept direct bank transfers
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          <Save className="mr-2 h-4 w-4" />
          Save Payment Settings
        </Button>
      </div>
    </form>
  );
}