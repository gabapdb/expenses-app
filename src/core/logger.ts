export const log = (scope: string, ...args: unknown[]) => console.log(`[${scope}]`, ...args);
export const warn = (scope: string, ...args: unknown[]) => console.warn(`[${scope}]`, ...args);
export const error = (scope: string, ...args: unknown[]) => console.error(`[${scope}]`, ...args);