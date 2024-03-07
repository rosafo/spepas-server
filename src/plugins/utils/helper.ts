import { IncomingHttpHeaders } from 'http';

export function convertHeaders(
    headers: IncomingHttpHeaders
  ): Record<string, string[]> {
    return Object.entries(headers).reduce((acc, [key, value]) => {
      if (Array.isArray(value)) {
        acc[key] = value.filter((v) => typeof v === 'string') as string[];
      } else if (typeof value === 'string') {
        acc[key] = [value];
      }
      return acc;
    }, {} as Record<string, string[]>);
  }
  

  export function generatePassword(): string  {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }
