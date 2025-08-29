'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { emailSettingsSchema, EmailSettingsInput } from '@/lib/validations/settings';
import { Save, Mail, Send, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function EmailSettings() {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmailSettingsInput>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/email');
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

  const onSubmit = async (data: EmailSettingsInput) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast.success('Email settings saved successfully');
    } catch (error) {
      toast.error('Failed to save email settings');
    } finally {
      setLoading(false);
    }
  };

  const testEmailConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/admin/settings/email/test', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to send test email');
      }

      toast.success('Test email sent successfully! Check your inbox.');
    } catch (error) {
      toast.error('Failed to send test email. Please check your settings.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            SMTP Configuration
          </CardTitle>
          <CardDescription>
            Configure email server settings for sending transactional emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp_host">SMTP Host</Label>
              <Input
                id="smtp_host"
                type="text"
                placeholder="smtp.gmail.com"
                {...register('smtp_host')}
              />
              {errors.smtp_host && (
                <p className="text-sm text-destructive">{errors.smtp_host.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_port">SMTP Port</Label>
              <Input
                id="smtp_port"
                type="number"
                placeholder="587"
                {...register('smtp_port', { valueAsNumber: true })}
              />
              {errors.smtp_port && (
                <p className="text-sm text-destructive">{errors.smtp_port.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp_user">SMTP Username</Label>
            <Input
              id="smtp_user"
              type="email"
              placeholder="your-email@gmail.com"
              {...register('smtp_user')}
            />
            {errors.smtp_user && (
              <p className="text-sm text-destructive">{errors.smtp_user.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp_password">SMTP Password</Label>
            <Input
              id="smtp_password"
              type="password"
              placeholder="••••••••"
              {...register('smtp_password')}
            />
            {errors.smtp_password && (
              <p className="text-sm text-destructive">{errors.smtp_password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              For Gmail, use an App-specific password
            </p>
          </div>

          {/* Gmail Instructions */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Gmail Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Enable 2-factor authentication in your Google account</li>
                  <li>Generate an App Password: Google Account → Security → App passwords</li>
                  <li>Use the generated password in the SMTP Password field above</li>
                  <li>Set SMTP Host to smtp.gmail.com and Port to 587</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={testEmailConnection}
          loading={testing}
        >
          <Send className="mr-2 h-4 w-4" />
          Send Test Email
        </Button>
        
        <Button type="submit" loading={loading}>
          <Save className="mr-2 h-4 w-4" />
          Save Email Settings
        </Button>
      </div>
    </form>
  );
}