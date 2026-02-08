export type Category = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DeleteCategories = {
  count: number
}