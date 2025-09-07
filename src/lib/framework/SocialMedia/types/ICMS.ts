export interface ICMSSocialMediaResponse {
  id: string;
  platform: string;
  url: string;
  icon?: string; // Optional custom icon (SVG recommended)
  createdAt: string;
  updatedAt: string;
}

export interface ISocialMediaPayloadResponse {
  docs: ICMSSocialMediaResponse[];
}
