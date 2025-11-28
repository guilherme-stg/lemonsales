import { Progress } from "@/components/ui/progress";

interface XPBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
}

export function XPBar({ currentXP, maxXP, level }: XPBarProps) {
  const progress = (currentXP / maxXP) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-primary flex items-center gap-2">
          <span className="text-2xl">★</span>
          NÍVEL {level}
        </span>
        <span className="text-muted-foreground font-mono">
          {currentXP.toLocaleString()} / {maxXP.toLocaleString()} XP
        </span>
      </div>
      <div className="relative">
        <Progress 
          value={progress} 
          className="h-3 gaming-border"
        />
        <div 
          className="absolute inset-0 h-3 rounded-full bg-gradient-primary opacity-80 transition-all duration-1000"
          style={{ 
            width: `${progress}%`,
            boxShadow: 'var(--glow-primary)'
          }}
        />
      </div>
    </div>
  );
}
