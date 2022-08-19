import {
  AbstractResolverModule,
  DNSResult,
  ResolverOptions,
} from "@lumeweb/resolver-common";
export default class Avax extends AbstractResolverModule {
  getSupportedTlds(): string[];
  resolve(
    domain: string,
    options: ResolverOptions,
    bypassCache: boolean
  ): Promise<DNSResult>;
}
