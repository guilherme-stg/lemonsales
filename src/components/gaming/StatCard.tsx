import { ReactNode } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: 'primary' | 'secondary' | 'accent';
  subtitle?: string;
}

export function StatCard({ title, value, icon: Icon, gradient = 'primary', subtitle }: StatCardProps) {
  const gradientClass = {
    primary: 'from-gaming-purple/20 to-gaming-cyan/20',
    secondary: 'from-gaming-cyan/20 to-gaming-lime/20',
    accent: 'from-gaming-lime/20 to-gaming-pink/20',
  }[gradient];

  return (
    <Card className="gaming-border hover-lift overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-50`} />
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="p-3 rounded-lg bg-card/50 gaming-border-secondary">
            <Icon className="w-6 h-6 text-secondary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
