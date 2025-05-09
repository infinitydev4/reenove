export type ProjectStatus = "En cours" | "À démarrer" | "Finition" | "Terminé";
export type ProjectStatusColor = "blue" | "orange" | "green";

export type Project = {
  id: string;
  title: string;
  client: string;
  location: string;
  progress: number;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  statusColor: ProjectStatusColor;
  description: string;
}; 