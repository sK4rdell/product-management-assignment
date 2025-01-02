type Category = CategoryDTO & {
  id: number;
};

type CategoryPost = Pick<CategoryDTO, "name" | "description">;

type CategoryPatch = Partial<CategoryPost>;
