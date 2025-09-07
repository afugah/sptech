export interface IFooterLink {
  id: string;
  label: string;
  url: string;
  newTab: boolean;
}

export interface IFooterColumn {
  id: string;
  columnTitle: string;
  links: IFooterLink[];
}

export interface IFooter {
  id: string;
  title: string;
  columns: IFooterColumn[];
  createdAt: string;
  updatedAt: string;
}
