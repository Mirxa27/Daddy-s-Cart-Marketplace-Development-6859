'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    setLoading(true);
    
    try {
      // TODO: Implement actual newsletter subscription
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-primary text-primary-foreground">
      <div className="container-mobile mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-foreground/10 rounded-full">
              <Mail className="h-8 w-8" />
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Stay Updated with Our Newsletter
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Get exclusive deals, new product announcements, and shopping tips delivered to your inbox.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-primary-foreground text-primary"
              disabled={loading}
            />
            <Button
              type="submit"
              size="lg"
              variant="secondary"
              loading={loading}
              className="whitespace-nowrap"
            >
              <Send className="h-4 w-4 mr-2" />
              Subscribe
            </Button>
          </form>
          
          <p className="text-xs text-primary-foreground/60 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}