import { PluginBase } from "@nova-sdk/core";
import { SuperfluidService } from "./superfluid.service";

export class SuperfluidPlugin extends PluginBase {
    constructor() {
        super("superfluid", [new SuperfluidService()]);
    }

    supportsChain = () => true;
}

export function superfluid() {
    return new SuperfluidPlugin();
}
