'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { generalSettingsSchema, GeneralSettingsInput } from '@/lib/validations/settings';
import { Save, Globe, Mail, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export function GeneralSettings() {
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GeneralSettingsInput>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      maintenance_mode: false,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/general');
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

  const onSubmit = async (data: GeneralSettingsInput) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast.success('General settings saved successfully');
    } catch (error) {
      toast.error('Failed to save general settings');
    } finally {
      setLoading(false);
    }
  };

  const maintenanceMode = watch('maintenance_mode');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Site Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Site Information
          </CardTitle>
          <CardDescription>
            Basic information about your marketplace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site_name">Site Name</Label>
            <Input
              id="site_name"
              type="text"
              placeholder="My Marketplace"
              {...register('site_name')}
            />
            {errors.site_name && (
              <p className="text-sm text-destructive">{errors.site_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_description">Site Description</Label>
            <Textarea
              id="site_description"
              placeholder="A brief description of your marketplace..."
              rows={3}
              {...register('site_description')}
            />
            {errors.site_description && (
              <p className="text-sm text-destructive">{errors.site_description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
          <CardDescription>
            Email addresses for customer communication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                placeholder="contact@example.com"
                {...register('contact_email')}
              />
              {errors.contact_email && (
                <p className="text-sm text-destructive">{errors.contact_email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="support_email">Support Email</Label>
              <Input
                id="support_email"
                type="email"
                placeholder="support@example.com"
                {...register('support_email')}
              />
              {errors.support_email && (
                <p className="text-sm text-destructive">{errors.support_email.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Maintenance Mode
          </CardTitle>
          <CardDescription>
            Temporarily disable access to your marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance_mode">Enable Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, only administrators can access the site
              </p>
            </div>
            <Switch
              id="maintenance_mode"
              checked={maintenanceMode}
              onCheckedChange={(checked) => setValue('maintenance_mode', checked)}
            />
          </div>

          {maintenanceMode && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> Maintenance mode is enabled. Regular users cannot access the site.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          <Save className="mr-2 h-4 w-4" />
          Save General Settings
        </Button>
      </div>
    </form>
  );
}