/**
 * Supabase Utility Functions
 * Handles data mapping between frontend (camelCase) and database (snake_case)
 */

/**
 * Converts camelCase object keys to snake_case
 */
export const camelToSnake = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  if (obj === null || typeof obj !== 'object' || obj instanceof Date) return obj;

  return Object.keys(obj).reduce((acc, key) => {
    let snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    
    // OVERRIDES for Supabase Schema consistency
    if (key === 'timestamp' || key === 'createdAt') snakeKey = 'created_at';
    if (key === 'approvedBy') snakeKey = 'supervisor_id';
    if (key === 'userId') snakeKey = 'user_id';
    if (key === 'employeeId') snakeKey = 'employee_id';
    if (key === 'locationId') snakeKey = 'location_id';
    if (key === 'productId') snakeKey = 'product_id';
    if (key === 'companyId') snakeKey = 'company_id';
    if (key === 'warehouseId') snakeKey = 'warehouse_id';

    acc[snakeKey] = camelToSnake(obj[key]);
    return acc;
  }, {} as any);
};

/**
 * Converts snake_case object keys to camelCase
 */
export const snakeToCamel = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (obj === null || typeof obj !== 'object' || obj instanceof Date) return obj;

  return Object.keys(obj).reduce((acc, key) => {
    let camelKey = key.replace(/(_\w)/g, (match) => match[1].toUpperCase());
    
    // OVERRIDES for Frontend Type consistency
    if (key === 'created_at') camelKey = 'timestamp'; // Use timestamp as default for UI
    if (key === 'supervisor_id') camelKey = 'approvedBy';
    if (key === 'user_id') camelKey = 'userId';
    if (key === 'employee_id') camelKey = 'employeeId';
    if (key === 'location_id') camelKey = 'locationId';
    if (key === 'product_id') camelKey = 'productId';
    if (key === 'company_id') camelKey = 'companyId';
    if (key === 'warehouse_id') camelKey = 'warehouseId';

    acc[camelKey] = snakeToCamel(obj[key]);
    return acc;
  }, {} as any);
};

/**
 * Validates if a string is a valid UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
};

/**
 * Generates a dummy UUID for mock data (compatible with Supabase schema)
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
