export const toCategoryDTO = (category: Category): CategoryDTO => {
  return {
    name: category.name,
    description: category.description,
  };
};
