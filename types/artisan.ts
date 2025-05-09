export type OnboardingStatus = {
  profile: boolean;
  specialties: boolean;
  documents: boolean;
  assessment: boolean;
  confirmation: boolean;
}

export type ArtisanProfile = {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  companyName: string;
  siren: string;
}

export type NotificationSetting = {
  id: string;
  label: string;
  enabled: boolean;
}

export type Appointment = {
  id: string;
  title: string;
  client: {
    name: string;
    avatar: string;
  };
  address: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "pending";
  project: string;
} 