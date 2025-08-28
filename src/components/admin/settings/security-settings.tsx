'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, Lock, Key, AlertTriangle, Database, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export function SecuritySettings() {
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Backup failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString()}.sql`;
      a.click();
      
      toast.success('Database backup created successfully');
    } catch (error) {
      toast.error('Failed to create database backup');
    } finally {
      setBackupLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Authentication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Authentication Settings
          </CardTitle>
          <CardDescription>
            Configure authentication and session management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require 2FA for admin accounts
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Verification</Label>
              <p className="text-sm text-muted-foreground">
                Require email verification for new accounts
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label>Session Timeout (minutes)</Label>
            <Input type="number" defaultValue="30" min="5" max="1440" />
            <p className="text-xs text-muted-foreground">
              Automatically log out users after this period of inactivity
            </p>
          </div>

          <div className="space-y-2">
            <Label>Maximum Login Attempts</Label>
            <Input type="number" defaultValue="5" min="3" max="10" />
            <p className="text-xs text-muted-foreground">
              Lock account after this many failed login attempts
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Password Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password Policy
          </CardTitle>
          <CardDescription>
            Set password requirements for user accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Minimum Password Length</Label>
            <Input type="number" defaultValue="8" min="6" max="32" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Uppercase Letters</Label>
              <p className="text-sm text-muted-foreground">
                Password must contain at least one uppercase letter
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Numbers</Label>
              <p className="text-sm text-muted-foreground">
                Password must contain at least one number
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Special Characters</Label>
              <p className="text-sm text-muted-foreground">
                Password must contain at least one special character
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label>Password Expiry (days)</Label>
            <Input type="number" defaultValue="90" min="0" max="365" />
            <p className="text-xs text-muted-foreground">
              Set to 0 to disable password expiry
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Features
          </CardTitle>
          <CardDescription>
            Additional security settings and protections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Rate Limiting</Label>
              <p className="text-sm text-muted-foreground">
                Limit API requests to prevent abuse
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>CSRF Protection</Label>
              <p className="text-sm text-muted-foreground">
                Protect against cross-site request forgery
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SQL Injection Protection</Label>
              <p className="text-sm text-muted-foreground">
                Automatically enabled with Prisma ORM
              </p>
            </div>
            <Switch checked disabled />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>XSS Protection</Label>
              <p className="text-sm text-muted-foreground">
                Protect against cross-site scripting attacks
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Audit Logging</Label>
              <p className="text-sm text-muted-foreground">
                Log all admin actions for security auditing
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Database Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Management
          </CardTitle>
          <CardDescription>
            Backup and restore database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium mb-1">Important:</p>
                <p>Regular backups are essential for data recovery. We recommend setting up automated backups through your database provider.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleBackup}
              loading={backupLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              Create Backup
            </Button>
            
            <Button variant="outline" disabled>
              Restore from Backup
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Automatic Backups</Label>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Enable daily automatic backups
              </p>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button loading={loading}>
          Save Security Settings
        </Button>
      </div>
    </div>
  );
}