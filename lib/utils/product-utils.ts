/**
 * Logic for "New Arrivals" - Products created within 7 days.
 */
export function isProductNew(createdAt: string | Date): boolean {
  if (!createdAt) return false;
  
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  
  return diffInDays <= 7;
}
