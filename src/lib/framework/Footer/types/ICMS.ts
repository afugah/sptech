export interface ICMSFooterLink {
  id: string;
  label: string;
  url: string;
  newTab: boolean;
}

export interface ICMSFooterColumn {
  id: string;
  columnTitle: string;
  links: ICMSFooterLink[];
}

export interface ICMSFooterResponse {
  id: string;
  title: string;
  columns: ICMSFooterColumn[];
  createdAt: string;
  updatedAt: string;
}

export interface IPayloadResponse {
  docs: ICMSFooterResponse[];
}
