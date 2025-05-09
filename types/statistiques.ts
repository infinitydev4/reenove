export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend: "up" | "down";
  trendValue: string;
  description: string;
  color: string;
}

export interface ChartDataItem {
  label: string;
  value: number;
  color: string;
}

export interface SimpleBarChartProps {
  data: ChartDataItem[];
  height?: number;
}

export interface SimpleTrendLineProps {
  data: number[];
  height?: number;
}

export interface CategoryItem {
  name: string;
  count: number;
  percentage: number;
}

export interface ActivityItem {
  id: number;
  type: "new_user" | "new_project" | "project_assigned" | "project_completed";
  title: string;
  description: string;
  time: string;
}

export type PeriodType = "day" | "week" | "month" | "quarter" | "year";
export type TabType = "apercu" | "projets" | "utilisateurs" | "artisans" | "finances"; 