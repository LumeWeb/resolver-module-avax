import { AbstractResolverModule, DNS_RECORD_TYPE, resolverEmptyResponse, resolverError, resolveSuccess, } from "@lumeweb/libresolver";
import { RpcProvider } from "@lumeweb/resolver-module-eip137-common";
import pocketNetworks from "@lumeweb/pokt-rpc-endpoints";
// @ts-ignore
import AVVY from "@avvy/client";
export default class Avax extends AbstractResolverModule {
    getSupportedTlds() {
        return ["avax"];
    }
    async resolve(domain, options, bypassCache) {
        if (!this.isTldSupported(domain)) {
            return resolverEmptyResponse();
        }
        const connection = new RpcProvider(pocketNetworks["avax-mainnet"], this.resolver.rpcNetwork, bypassCache);
        const avaxDomain = new AVVY(connection).name(domain);
        const records = [];
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
                }
                catch (e) {
                    return resolverError(e);
                }
                if (record.length > 0) {
                    records.push({ type: options.type, value: record });
                    break;
                }
            }
        }
        if (options.type === DNS_RECORD_TYPE.CUSTOM &&
            options?.customType in AVVY.RECORDS) {
            let record;
            try {
                record = await avaxDomain.resolve(AVVY.RECORDS[options?.customType]);
            }
            catch (e) {
                return resolverError(e);
            }
            records.push({
                type: options.type,
                customType: options.customType,
                value: record,
            });
        }
        if (0 < records.length) {
            return resolveSuccess(records);
        }
        return resolverEmptyResponse();
    }
}
