declare const rateLimiter: (secondsLimit: number, limitAmount: number, type: string, emailInput: string) => (parent: any, args: any, context: any, info: any) => Promise<boolean>;
export default rateLimiter;
