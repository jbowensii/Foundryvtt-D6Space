import {AttributesMixin} from "./mixins/attributes-mixin.js";
import {CommonMixin} from "./mixins/common-mixin.js";
import {NpcMixin} from "./mixins/npc-mixin.js";

/**
 * DataModel for the "creature" actor type.
 * Composes: attributes + common + npc (no extra fields).
 */
export class CreatureData extends NpcMixin(CommonMixin(AttributesMixin(foundry.abstract.TypeDataModel))) {
    static defineSchema() {
        const schema = super.defineSchema();
        return schema;
    }
}
