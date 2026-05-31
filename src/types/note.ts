export type Note = {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DeleteNotes = {
  count: number;
};
