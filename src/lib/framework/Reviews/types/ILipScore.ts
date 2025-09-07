export namespace ILipScore {
  export interface Product {
    id: string;
    internal_id: string;
    sku: string[];
    name: string;
    brand: string;
    gtin: string | null;
    urls: string[];

    votes: number | null;
    rating: string; // Ex. '4.4'

    review_count: number | null;
    reviews: ProductReview[];
  }

  export interface ProductReview {
    id: number;
    text: string;
    created_at: string;
    votes_up: number;
    votes_down: number;
    video: string;
    purchase_date: string;
    rating: number;

    user: User;
    images: Image[];

    review_reply: ReviewReply;

    internal_order_id: string;
    internal_customer_id: string;
    internal_attr_1: string;
    internal_attr_2: string;
    internal_attr_3: string;
    internal_attr_4: string;
    internal_attr_5: string;
    testimonial: boolean;
    displayed_name: string;
  }

  export interface User {
    id: number;
    name: string;
    avatar_thumb_url: string;
    short_name: string;
  }

  export interface Image {
    id: number;
    thumb_url: string;
    image_url: string;
  }

  export interface ReviewReply {
    text: string;
    created_at: string;
    member_site: string;
  }

  export type ApiScoreResponse = Omit<Product, 'reviews'>;

  export interface ApiReviewsRequest {
    rating?: number;
    parent_source_id?: number;
    source_id?: number;
    translate_to_lang?: string;
    updated_after?: string;
    page?: number;
    per_page?: number;
  }

  export type ApiReviewsResponse = Array<{
    id: number;
    text: string;
    translated_text: string | null;
    created_at: string;
    votes_up: number;
    votes_down: number;
    video: string;
    purchase_date: string;
    imported_at: unknown | null;
    rating: number;
    user: User;
    images: Image[];
    review_reply: ReviewReply;
    internal_order_id: string;
    internal_customer_id: string;
    internal_attr_1: string;
    internal_attr_2: string;
    internal_attr_3: string;
    internal_attr_4: string;
    internal_attr_5: string;
    testimonial: boolean;
    displayed_name: string;
    attributes: unknown[];
  }>;
}
