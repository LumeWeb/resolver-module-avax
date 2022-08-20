import {
  AbstractResolverModule,
  DNS_RECORD_TYPE,
  DNSRecord,
  DNSResult,
  resolverEmptyResponse,
  resolverError,
  ResolverOptions,
  resolveSuccess,
} from "@lumeweb/libresolver";
import { RpcProvider } from "@lumeweb/resolver-module-eip137-common";
import pocketNetworks from "@lumeweb/pokt-rpc-endpoints";
// @ts-ignore
import AVVY from "@avvy/client";
export default class Avax extends AbstractResolverModule {
  getSupportedTlds(): string[] {
    return ["avax"];
  }
  async resolve(
    domain: string,
    options: ResolverOptions,
    bypassCache: boolean
  ): Promise<DNSResult> {
    if (!this.isTldSupported(domain)) {
      return resolverEmptyResponse();
    }

    const connection: RpcProvider = new RpcProvider(
      pocketNetworks["avax-mainnet"],
      this.resolver.rpcNetwork,
      bypassCache
    );

    const avaxDomain = new AVVY(connection).name(domain);

    const records: DNSRecord[] = [];

    const typeMap = {
      [DNS_RECORD_TYPE.CONTENT]: AVVY.RECORDS.CONTENT,
      [DNS_RECORD_TYPE.TEXT]: AVVY.RECORDS.CONTENT,
      [DNS_RECORD_TYPE.A]: AVVY.RECORDS.DNS_A,
      [DNS_RECORD_TYPE.CNAME]: AVVY.RECORDS.DNS_CNAME,
    };

    for (const type of Object.keys(typeMap)) {
      if (options.type === type) {
        let record;
        try {
          record = await avaxDomain.resolve(typeMap[type]);
        } catch (e: any) {
          return resolverError(e);
        }
        records.push({ type: options.type, value: record as string });
        break;
      }
    }

    if (
      options.type === DNS_RECORD_TYPE.CUSTOM &&
      (options?.customType as string) in AVVY.RECORDS
    ) {
      let record;
      try {
        record = await avaxDomain.resolve(
          AVVY.RECORDS[options?.customType as string]
        );
      } catch (e: any) {
        return resolverError(e);
      }
      records.push({
        type: options.type,
        customType: options.customType,
        value: record as string,
      });
    }

    if (0 < records.length) {
      return resolveSuccess(records);
    }

    return resolverEmptyResponse();
  }
}
