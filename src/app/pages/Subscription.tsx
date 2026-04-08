import { Check, Crown, Lock, Download, Users, Map, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export function Subscription() {
  const freeFeatures = [
    'Browse public trails',
    'Filter by vehicle class',
    'Record 5 rides per month',
    'Save 10 favorite trails',
    'Basic ride stats',
    'Upload 3 photos per trail',
    'Community feed access'
  ];

  const premiumFeatures = [
    'Unlimited ride tracking',
    'Offline maps downloads',
    'Advanced route planning',
    'Private trails & routes',
    'GPX import/export',
    'Hazard markers & closures',
    'Unlimited photo uploads',
    'Trail condition reports',
    'Priority support',
    'No ads'
  ];

  const eliteFeatures = [
    'All Premium features',
    'Live group tracking',
    'Private groups & clubs',
    'Event planning tools',
    'Land ownership overlays',
    'Advanced 3D mapping',
    'Trip planning & itineraries',
    'Emergency SOS features',
    'Exclusive trail access',
    'Beta feature access'
  ];

  return (
    <div className="min-h-full bg-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-amber-950 to-neutral-950 px-4 py-8">
        <div className="text-center mb-6">
          <Crown className="w-16 h-16 text-amber-500 mx-auto mb-3" />
          <h1 className="text-white text-3xl mb-2">Upgrade Your Adventure</h1>
          <p className="text-neutral-400">
            Unlock premium features and explore without limits
          </p>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Current Plan */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-neutral-400 text-sm">Current Plan</span>
              <div className="text-white text-xl">Free</div>
            </div>
            <Badge variant="outline" className="border-neutral-700 text-neutral-400">
              Active
            </Badge>
          </div>
        </div>

        {/* Free Tier */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-4">
          <div className="mb-4">
            <h2 className="text-white text-2xl mb-2">Free</h2>
            <div className="text-white text-4xl mb-1">$0</div>
            <div className="text-neutral-400 text-sm">Forever free</div>
          </div>

          <div className="space-y-3 mb-6">
            {freeFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full border-neutral-700" disabled>
            Current Plan
          </Button>
        </div>

        {/* Premium Tier */}
        <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 border-2 border-emerald-600 rounded-lg p-6 mb-4 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Badge className="bg-emerald-500 text-neutral-900">Most Popular</Badge>
          </div>

          <div className="mb-4">
            <h2 className="text-white text-2xl mb-2">Premium</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-white text-4xl">$59.99</span>
              <span className="text-neutral-300">/year</span>
            </div>
            <div className="text-emerald-300 text-sm mt-1">Save 40% vs monthly</div>
          </div>

          <div className="space-y-3 mb-6">
            {premiumFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-white text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg">
            <Crown className="w-5 h-5 mr-2" />
            Upgrade to Premium
          </Button>

          <div className="text-center mt-3">
            <span className="text-neutral-300 text-sm">or $6.99/month</span>
          </div>
        </div>

        {/* Elite Tier */}
        <div className="bg-gradient-to-br from-amber-950 to-amber-900 border-2 border-amber-600 rounded-lg p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-white text-2xl mb-2 flex items-center gap-2">
              Elite
              <Badge className="bg-amber-500 text-neutral-900">New</Badge>
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="text-white text-4xl">$99.99</span>
              <span className="text-neutral-300">/year</span>
            </div>
            <div className="text-amber-300 text-sm mt-1">For serious adventurers</div>
          </div>

          <div className="space-y-3 mb-6">
            {eliteFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-white text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <Button className="w-full bg-amber-600 hover:bg-amber-700 h-12 text-lg">
            <Crown className="w-5 h-5 mr-2" />
            Upgrade to Elite
          </Button>

          <div className="text-center mt-3">
            <span className="text-neutral-300 text-sm">or $10.99/month</span>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-center">
            <Download className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <div className="text-white text-sm">Offline Maps</div>
            <div className="text-neutral-400 text-xs mt-1">Premium+</div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-center">
            <Lock className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <div className="text-white text-sm">Private Trails</div>
            <div className="text-neutral-400 text-xs mt-1">Premium+</div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-center">
            <Users className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <div className="text-white text-sm">Group Tracking</div>
            <div className="text-neutral-400 text-xs mt-1">Elite Only</div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-center">
            <Map className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <div className="text-white text-sm">Land Overlays</div>
            <div className="text-neutral-400 text-xs mt-1">Elite Only</div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-white text-lg mb-4">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            <div>
              <div className="text-white text-sm mb-1">Can I cancel anytime?</div>
              <div className="text-neutral-400 text-sm">
                Yes, you can cancel your subscription at any time. Your premium features will remain active until the end of your billing period.
              </div>
            </div>

            <div>
              <div className="text-white text-sm mb-1">What payment methods do you accept?</div>
              <div className="text-neutral-400 text-sm">
                We accept all major credit cards, PayPal, and mobile payments through Apple Pay and Google Pay.
              </div>
            </div>

            <div>
              <div className="text-white text-sm mb-1">Can I upgrade or downgrade my plan?</div>
              <div className="text-neutral-400 text-sm">
                Yes, you can change your plan at any time. Changes take effect immediately and pricing is prorated.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
