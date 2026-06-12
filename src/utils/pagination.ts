import type { PaginationMeta } from '../types/api';

/**
 * Paginates an array of items for dummy mode
 */
export const paginateArray = <T>(items: T[], page: number = 1, limit: number = 10): { data: T[], meta: PaginationMeta } => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const data = items.slice(startIndex, endIndex);
  const total = items.length;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages
    }
  };
};

/**
 * Sorts an array of items by a key
 */
export const sortArray = <T>(items: T[], sortBy: keyof T, sortOrder: 'asc' | 'desc' = 'asc'): T[] => {
  return [...items].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];

    if (valA === valB) return 0;
    
    // Handle string comparisons
    if (typeof valA === 'string' && typeof valB === 'string') {
      const comparison = valA.localeCompare(valB);
      return sortOrder === 'asc' ? comparison : -comparison;
    }

    // Default numeric/other comparison
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    
    return 0;
  });
};

/**
 * Filters an array by search string across multiple keys
 */
export const filterBySearch = <T>(items: T[], search: string, keys: (keyof T)[]): T[] => {
  if (!search) return items;
  
  const lowerSearch = search.toLowerCase();
  
  return items.filter(item => {
    return keys.some(key => {
      const val = item[key];
      if (val == null) return false;
      return String(val).toLowerCase().includes(lowerSearch);
    });
  });
};
