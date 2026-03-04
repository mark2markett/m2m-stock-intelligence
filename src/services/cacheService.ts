// Simple caching service to improve performance
export class CacheService {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  static set(key: string, data: any, ttlMinutes: number = 10): void {
    const ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    console.log(`Cached ${key} for ${ttlMinutes} minutes`);
  }
  
  static get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if cache has expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    console.log(`Cache hit for ${key}`);
    return cached.data;
  }
  
  static clear(): void {
    this.cache.clear();
  }
  
  static has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}