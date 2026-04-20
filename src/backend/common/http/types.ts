export type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
