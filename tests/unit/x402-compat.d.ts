declare module "@x402/fetch" {
  export class x402Client {}

  export function wrapFetchWithPayment(
    fetchImpl: typeof fetch,
    client: unknown
  ): (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
}

declare module "@x402/evm/exact/client" {
  export function registerExactEvmScheme(
    client: unknown,
    options: { signer: unknown }
  ): void;
}
