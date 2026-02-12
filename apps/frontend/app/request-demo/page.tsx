'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

export default function RequestDemoPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    size: '',
    message: '',
  });

  const [errors, setErrors] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);

  // Handle input change
  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });

    // Remove error once user types
    setErrors({ ...errors, [field]: '' });
  };

  // Validate fields
  const validate = () => {
    let newErrors: any = {};

    if (!form.name) newErrors.name = 'Full name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.company) newErrors.company = 'Company name is required';
    if (!form.role) newErrors.role = 'Role is required';
    if (!form.size) newErrors.size = 'Company size is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (!validate()) return;

    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
    }, 600);
  };

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="bg-surface border border-border rounded-xl2 shadow-card p-10 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-textPrimary mb-4">
            Demo Requested Successfully!
          </h2>
          <p className="text-textSecondary">
            Our team will contact you within 24 hours with your personalized demo.
          </p>

          <div className="mt-6">
            <a
              href="/"
              className="text-primary font-medium hover:underline"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Form UI
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="bg-surface border border-border rounded-xl2 shadow-card p-8 w-full max-w-xl">
        <h1 className="text-3xl font-bold text-textPrimary mb-2 text-center">
          Request a Demo
        </h1>
        <p className="text-textSecondary text-center mb-6">
          Get a personalized walkthrough of our institutional-grade stablecoin intelligence platform.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <input
              type="text"
              placeholder="Full Name *"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.name ? 'border-red-500' : 'border-border'
              } bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Work Email *"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.email ? 'border-red-500' : 'border-border'
              } bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Company */}
          <div>
            <input
              type="text"
              placeholder="Company Name *"
              value={form.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.company ? 'border-red-500' : 'border-border'
              } bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.company && (
              <p className="text-red-500 text-sm mt-1">{errors.company}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <input
              type="text"
              placeholder="Role / Job Title *"
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.role ? 'border-red-500' : 'border-border'
              } bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          {/* Company Size */}
          <div>
            <select
              value={form.size}
              onChange={(e) => handleChange('size', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.size ? 'border-red-500' : 'border-border'
              } bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
            >
              <option value="">Company Size *</option>
              <option>1-10</option>
              <option>11-50</option>
              <option>51-200</option>
              <option>200+</option>
            </select>
            {errors.size && (
              <p className="text-red-500 text-sm mt-1">{errors.size}</p>
            )}
          </div>

          {/* Message */}
          <div>
            <textarea
              rows={3}
              placeholder="Message (optional)"
              value={form.message}
              onChange={(e) => handleChange('message', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Submit */}
          <Button variant="primary" size="lg" className="w-full mt-4">
            Book My Demo
          </Button>
        </form>
      </div>
    </div>
  );
}
