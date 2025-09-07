export interface ISocialMedia {
  id: string;
  platform: string;
  url: string;
  icon?: string; // Optional custom icon (SVG recommended)
  createdAt: string;
  updatedAt: string;
}
