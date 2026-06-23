import { Category, AppStats } from './index';

export const calculateStats = (categories: Category[]): AppStats => {
  const totalRights = categories.reduce(
    (sum, category) => sum + category.rights.length,
    0
  );

  return {
    categories: categories.length,
    rights: totalRights,
    sections: 354, // Total sections in Bangladesh Labor Law 2006
  };
};

export const filterCategories = (
  categories: Category[],
  searchQuery: string
): Category[] => {
  if (!searchQuery.trim()) return categories;

  const query = searchQuery.toLowerCase();

  return categories
    .map((category) => ({
      ...category,
      rights: category.rights.filter(
        (right) =>
          right.title.toLowerCase().includes(query) ||
          right.details.toLowerCase().includes(query) ||
          right.reference.toLowerCase().includes(query) ||
          right.provisions.some((provision) =>
            provision.text.toLowerCase().includes(query)
          )
      ),
    }))
    .filter((category) => category.rights.length > 0);
};