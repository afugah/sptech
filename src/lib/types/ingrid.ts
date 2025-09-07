export interface IngridSessionRequest {
  ingrid: {
    locales: string[];
    postalCode?: string;
  };
}

export interface IngridSessionResponse {
  id: string;
  htmlSnippet: string;
}
