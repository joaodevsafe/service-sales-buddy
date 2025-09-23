import React from 'react';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  variant = 'default' 
}: StatsCardProps) {
  const variantStyles = {
    default: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    destructive: 'text-destructive bg-destructive/10',
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <p className={cn(
              "text-sm mt-1",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}
            </p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          variantStyles[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}