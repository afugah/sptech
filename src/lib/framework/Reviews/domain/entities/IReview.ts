interface IUser {
  id: string;
  name: string;
}

export interface IReview {
  id: string;

  user: IUser;
  date: string;
  rating: number;
  text: string;
  translatedText: string | null;

  productTitle: string;
}
