export type SubscriptionFn = (data: unknown, success?: boolean) => void;
export type ComparatorFn<T = unknown> = (option: T) => boolean;
export type RefreshFn = () => Promise<unknown>

export interface ISubscriptionContainer {
  fn: Function;
  err: Error;
  subscription: SubscriptionFn
}
