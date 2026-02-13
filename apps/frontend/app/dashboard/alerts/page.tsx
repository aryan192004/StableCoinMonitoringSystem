'use client';
import {
  BellIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';

interface Alert {
  _id: string;
  stablecoinId: string;
  name: string;
  type: string;
  condition: string;
  threshold: number;
  channels: string[];
  enabled: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    stablecoinId: 'USDT',
    metricType: 'peg_deviation',
    condition: 'below',
    threshold: '0.5',
  });

  // Fetch alerts on mount
  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/alerts');
      if (!response.ok) throw new Error('Failed to fetch alerts');
      const data = await response.json();
      setAlerts(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching alerts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.stablecoinId || !formData.metricType || !formData.condition || !formData.threshold) {
      setError('All fields are required');
      return;
    }

    const thresholdNum = parseFloat(formData.threshold);
    if (isNaN(thresholdNum)) {
      setError('Threshold must be a valid number');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:8000/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stablecoinId: formData.stablecoinId,
          name: `${formData.stablecoinId} ${formData.metricType} Alert`,
          type: formData.metricType,
          condition: formData.condition,
          threshold: thresholdNum,
          channels: ['email'],
          enabled: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create alert');
      }

      const newAlert = await response.json();
      setAlerts([newAlert, ...alerts]);
      setSuccess('Alert created successfully!');
      
      // Reset form
      setFormData({
        stablecoinId: 'USDT',
        metricType: 'peg_deviation',
        condition: 'below',
        threshold: '0.5',
      });

      // Auto-hide success message
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error creating alert:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/alerts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete alert');

      setAlerts(alerts.filter(a => a._id !== id));
      setSuccess('Alert deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting alert:', err);
      setError(err.message);
    }
  };

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    try {
      const response = await fetch(`http://localhost:8000/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });

      if (!response.ok) throw new Error('Failed to update alert');

      const updatedAlert = await response.json();
      setAlerts(alerts.map(a => a._id === id ? updatedAlert : a));
    } catch (err: any) {
      console.error('Error toggling alert:', err);
      setError(err.message);
    }
  };

  const recentAlerts = alerts.slice(0, 3).map(alert => ({
    stablecoin: alert.stablecoinId,
    message: `${alert.condition} threshold of ${alert.threshold}`,
    severity: alert.enabled ? 'active' : 'inactive',
    time: new Date(alert.createdAt).toLocaleString(),
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Alert Management</h1>
            <p className="text-textSecondary">Configure and monitor custom alert conditions</p>
          </div>
          <Button
  variant="primary"
  onClick={() => {
    // 1. scroll to form
    formRef.current?.scrollIntoView({ behavior: 'smooth' });

    // 2. focus first field after scroll
    setTimeout(() => {
      document.getElementById('alert-stablecoin')?.focus();
    }, 400);
  }}
>
  + Create Alert
</Button>

          </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-success/10 border border-success text-success px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Alert Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSecondary mb-1">Active Alerts</p>
                <h3 className="text-2xl font-semibold text-textPrimary">
                  {alerts.filter(a => a.enabled).length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BellIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSecondary mb-1">Total Alerts</p>
                <h3 className="text-2xl font-semibold text-textPrimary">{alerts.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-warning" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSecondary mb-1">Total Triggers</p>
                <h3 className="text-2xl font-semibold text-textPrimary">
                  {alerts.reduce((sum, a) => sum + a.triggerCount, 0)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
               <ClockIcon className="w-6 h-6 text-success" />
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alert Triggers</CardTitle>
            <button className="text-sm text-primary hover:underline">View All</button>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="text-center py-8 text-textSecondary">Loading alerts...</div>
            ) : recentAlerts.length === 0 ? (
              <div className="text-center py-8 text-textSecondary">No alerts configured yet</div>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((alert, i) => (
                  <div 
                    key={i} 
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className={`
                      w-2 h-2 rounded-full mt-2
                      ${alert.severity === 'active' ? 'bg-success' : 'bg-gray-400'}
                      animate-pulse
                    `} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-textPrimary">{alert.stablecoin}</span>
                        <Badge variant={alert.severity === 'active' ? 'success' : 'neutral'}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-textSecondary">{alert.message}</p>
                    </div>
                    <span className="text-xs text-textTertiary whitespace-nowrap">{alert.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Alert Configuration Table */}
        <Card>
          <CardHeader>
            <CardTitle>Configured Alerts</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={fetchAlerts}>Refresh</Button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="text-center py-12 text-textSecondary">Loading alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-12 text-textSecondary">
                No alerts configured yet. Create one to get started!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase">
                        Stablecoin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase">
                        Condition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase">
                        Threshold
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase">
                        Triggers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {alerts.map((alert) => (
                      <tr key={alert._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                              {alert.stablecoinId.charAt(0)}
                            </div>
                            <span className="font-medium text-textPrimary">{alert.stablecoinId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-textSecondary">
                          {alert.type.replace(/_/g, ' ')}
                        </td>
                        <td className="px-6 py-4 text-sm text-textSecondary">
                          {alert.condition}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-textPrimary">
                          {alert.threshold}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={alert.enabled ? 'success' : 'neutral'}>
                            {alert.enabled ? 'Active' : 'Disabled'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-textPrimary">
                          {alert.triggerCount}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleToggle(alert._id, alert.enabled)}
                              className="text-primary hover:underline text-sm"
                            >
                              {alert.enabled ? 'Disable' : 'Enable'}
                            </button>
                            <button 
                              onClick={() => handleDelete(alert._id)}
                              className="text-danger hover:underline text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Alert Configuration Form */}
        <div ref={formRef}>
        <Card>
          <CardHeader>
            <CardTitle>Create New Alert</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-2">
                    Select Stablecoin
                  </label>
                  <select 
                    id="alert-stablecoin"
                    value={formData.stablecoinId}
                    onChange={(e) => setFormData({...formData, stablecoinId: e.target.value})}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                    <option value="DAI">DAI</option>
                    <option value="BUSD">BUSD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-2">
                    Metric Type
                  </label>
                  <select 
                    value={formData.metricType}
                    onChange={(e) => setFormData({...formData, metricType: e.target.value})}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="peg_deviation">Price Deviation</option>
                    <option value="liquidity_drop">Liquidity Drop</option>
                    <option value="volume_spike">Volume Spike</option>
                    <option value="market_cap_change">Market Cap Change</option>
                    <option value="reserve_change">Reserve Change</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-2">
                    Condition
                  </label>
                  <select 
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="above">Greater than</option>
                    <option value="below">Less than</option>
                    <option value="equals">Equals</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-2">
                    Threshold Value
                  </label>
                  <input
                    type="text"
                    placeholder="0.5"
                    value={formData.threshold}
                    onChange={(e) => setFormData({...formData, threshold: e.target.value})}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button 
                    type="submit"
                    variant="primary" 
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating...' : 'Create Alert'}
                  </Button>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
