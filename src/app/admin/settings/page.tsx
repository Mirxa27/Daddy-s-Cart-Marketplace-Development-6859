'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Settings as SettingsIcon, 
  Globe, 
  CreditCard, 
  Mail, 
  Shield, 
  Database,
  Palette,
  Truck,
  Bell,
  Key,
  Upload
} from 'lucide-react';
import { SettingValue } from '@/types';

interface SettingsTab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

const settingsTabs: SettingsTab[] = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

// Mock settings data - replace with actual API calls
const mockSettings: Record<string, SettingValue[]> = {
  general: [
    {
      id: '1',
      key: 'site_name',
      value: "Daddy's Cart",
      type: 'STRING',
      description: 'The name of your marketplace',
      isPublic: true,
    },
    {
      id: '2',
      key: 'site_description',
      value: 'Your one-stop marketplace for everything',
      type: 'STRING',
      description: 'Short description of your marketplace',
      isPublic: true,
    },
    {
      id: '3',
      key: 'contact_email',
      value: 'support@daddyscart.com',
      type: 'STRING',
      description: 'Primary contact email address',
      isPublic: true,
    },
    {
      id: '4',
      key: 'currency',
      value: 'USD',
      type: 'STRING',
      description: 'Default currency for the marketplace',
      isPublic: true,
    },
    {
      id: '5',
      key: 'tax_rate',
      value: '0.08',
      type: 'NUMBER',
      description: 'Default tax rate (as decimal, e.g., 0.08 for 8%)',
      isPublic: false,
    },
    {
      id: '6',
      key: 'free_shipping_threshold',
      value: '75.00',
      type: 'NUMBER',
      description: 'Minimum order amount for free shipping',
      isPublic: true,
    },
  ],
  payments: [
    {
      id: '7',
      key: 'stripe_publishable_key',
      value: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      type: 'STRING',
      description: 'Stripe publishable key for payment processing',
      isPublic: true,
    },
    {
      id: '8',
      key: 'stripe_secret_key',
      value: '••••••••••••sk_test_example',
      type: 'STRING',
      description: 'Stripe secret key (keep secure)',
      isPublic: false,
    },
    {
      id: '9',
      key: 'payment_methods',
      value: JSON.stringify(['card', 'paypal', 'apple_pay', 'google_pay']),
      type: 'JSON',
      description: 'Enabled payment methods',
      isPublic: true,
    },
  ],
  email: [
    {
      id: '10',
      key: 'smtp_host',
      value: 'smtp.gmail.com',
      type: 'STRING',
      description: 'SMTP server host',
      isPublic: false,
    },
    {
      id: '11',
      key: 'smtp_port',
      value: '587',
      type: 'NUMBER',
      description: 'SMTP server port',
      isPublic: false,
    },
    {
      id: '12',
      key: 'smtp_user',
      value: 'admin@daddyscart.com',
      type: 'STRING',
      description: 'SMTP username',
      isPublic: false,
    },
    {
      id: '13',
      key: 'smtp_password',
      value: '••••••••••••',
      type: 'STRING',
      description: 'SMTP password',
      isPublic: false,
    },
  ],
  api: [
    {
      id: '14',
      key: 'uploadthing_secret',
      value: '••••••••••••sk_live_example',
      type: 'STRING',
      description: 'UploadThing secret key for file uploads',
      isPublic: false,
    },
    {
      id: '15',
      key: 'uploadthing_app_id',
      value: 'your-app-id',
      type: 'STRING',
      description: 'UploadThing application ID',
      isPublic: false,
    },
    {
      id: '16',
      key: 'google_analytics_id',
      value: 'GA-XXXXXXXXX',
      type: 'STRING',
      description: 'Google Analytics tracking ID',
      isPublic: true,
    },
  ],
  shipping: [
    {
      id: '17',
      key: 'default_shipping_rate',
      value: '9.99',
      type: 'NUMBER',
      description: 'Default shipping rate',
      isPublic: false,
    },
    {
      id: '18',
      key: 'shipping_zones',
      value: JSON.stringify([
        { name: 'Domestic', rate: 9.99, countries: ['US'] },
        { name: 'International', rate: 19.99, countries: ['*'] },
      ]),
      type: 'JSON',
      description: 'Shipping zones and rates',
      isPublic: false,
    },
  ],
  security: [
    {
      id: '19',
      key: 'jwt_secret',
      value: '••••••••••••••••••••••••••••••••',
      type: 'STRING',
      description: 'JWT secret key (keep secure)',
      isPublic: false,
    },
    {
      id: '20',
      key: 'session_timeout',
      value: '7',
      type: 'NUMBER',
      description: 'Session timeout in days',
      isPublic: false,
    },
    {
      id: '21',
      key: 'rate_limit_requests',
      value: '100',
      type: 'NUMBER',
      description: 'Maximum requests per minute per IP',
      isPublic: false,
    },
  ],
  notifications: [
    {
      id: '22',
      key: 'email_notifications',
      value: 'true',
      type: 'BOOLEAN',
      description: 'Enable email notifications',
      isPublic: false,
    },
    {
      id: '23',
      key: 'order_notifications',
      value: 'true',
      type: 'BOOLEAN',
      description: 'Send notifications for new orders',
      isPublic: false,
    },
    {
      id: '24',
      key: 'low_stock_notifications',
      value: 'true',
      type: 'BOOLEAN',
      description: 'Send notifications for low stock items',
      isPublic: false,
    },
  ],
  appearance: [
    {
      id: '25',
      key: 'primary_color',
      value: '#3B82F6',
      type: 'STRING',
      description: 'Primary brand color',
      isPublic: true,
    },
    {
      id: '26',
      key: 'logo_url',
      value: '/images/logo.png',
      type: 'STRING',
      description: 'URL to the site logo',
      isPublic: true,
    },
    {
      id: '27',
      key: 'favicon_url',
      value: '/favicon.ico',
      type: 'STRING',
      description: 'URL to the favicon',
      isPublic: true,
    },
  ],
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<Record<string, SettingValue[]>>(mockSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (tabId: string, settingId: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [tabId]: prev[tabId].map(setting => 
        setting.id === settingId ? { ...setting, value } : setting
      ),
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement actual API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving settings:', settings[activeTab]);
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
      // Show error message
    } finally {
      setIsSaving(false);
    }
  };

  const renderSettingInput = (setting: SettingValue) => {
    const onChange = (value: string) => {
      handleSettingChange(activeTab, setting.id, value);
    };

    switch (setting.type) {
      case 'BOOLEAN':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={setting.value === 'true'}
              onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        );
      
      case 'NUMBER':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      
      case 'JSON':
        return (
          <textarea
            value={typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value, null, 2)}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
        );
      
      default:
        return (
          <input
            type={setting.key.includes('password') || setting.key.includes('secret') || setting.key.includes('key') ? 'password' : 'text'}
            value={setting.value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your marketplace configuration and API integrations</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {settingsTabs.find(tab => tab.id === activeTab)?.label} Settings
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {settings[activeTab]?.map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    {!setting.isPublic && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        Private
                      </span>
                    )}
                  </div>
                  
                  {renderSettingInput(setting)}
                  
                  {setting.description && (
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  )}
                </div>
              ))}

              {/* Special sections for specific tabs */}
              {activeTab === 'api' && (
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">Important:</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Keep your API keys secure and never share them publicly</li>
                    <li>• Use environment variables for production deployments</li>
                    <li>• Rotate keys regularly for better security</li>
                    <li>• Test in development before applying to production</li>
                  </ul>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Payment Configuration:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Test with Stripe test keys before going live</li>
                    <li>• Configure webhooks in your Stripe dashboard</li>
                    <li>• Set up proper tax calculations for your region</li>
                    <li>• Enable required payment methods for your market</li>
                  </ul>
                </div>
              )}

              {activeTab === 'email' && (
                <div className="mt-8 space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800 mb-2">Email Templates:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>• Welcome Email</div>
                      <div>• Order Confirmation</div>
                      <div>• Shipping Notification</div>
                      <div>• Password Reset</div>
                      <div>• Low Stock Alert</div>
                      <div>• Newsletter</div>
                    </div>
                  </div>
                  
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Mail className="w-4 h-4" />
                    <span>Send Test Email</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}