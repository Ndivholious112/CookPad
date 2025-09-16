export interface Recipe {
  _id?: string; // from MongoDB
  id?: number; // retained for mock fallback
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  imageUrl?: string;
  createdBy?: string;
  createdByName?: string;
}
