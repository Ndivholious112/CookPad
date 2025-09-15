export interface Recipe {
  _id?: string;
  id?: number;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  imageUrl?: string;
  createdBy?: string;
  createdByName?: string;
}
