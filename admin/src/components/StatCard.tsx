
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{title}</span>
        <Icon size={19} />
      </div>

      <strong>{value}</strong>
      <p>{description}</p>
    </div>
  );
}
