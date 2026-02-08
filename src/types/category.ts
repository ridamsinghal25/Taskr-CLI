export type Category = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GetCategories = {
  categories: Category[];
};

export type DeleteCategories = {
  count: number
}