export type AppContext = {
  requestId?: string;
  userId?: string;
  action?: string;
};

export const createContextLog = (context: AppContext) => {
  const parts: string[] = [];
  if (context.requestId) parts.push(`req: ${context.requestId}`);
  if (context.userId) parts.push(`user: ${context.userId}`);
  if (context.action) parts.push(`action: ${context.action}`);
  return parts.length > 0 ? `[${parts.join(", ")}]` : "";
};
