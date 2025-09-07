export interface PayloadMedia {
  createdAt: string;
  updatedAt: string;
  alt: string;
  prefix: string;
  filename: string;
  mimeType: string;
  filesize: number;
  width: number;
  height: number;
  focalX: number;
  focalY: number;
  id: string;
  url: string;
  thumbnailURL: string | null;
}

export interface FooterLogo {
  logo: PayloadMedia;
  isMainLogo: boolean;
  displaySize: 'default' | 'large' | 'small';
  id: string;
}

export interface FooterSettingsGlobal {
  createdAt: string;
  updatedAt: string;
  globalType: 'footer-settings';
  logos: FooterLogo[];
  showLogos: boolean;
  id: string;
}
