import {AttributesMixin} from "./mixins/attributes-mixin.js";
import {CommonMixin} from "./mixins/common-mixin.js";
import {NpcMixin} from "./mixins/npc-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "npc" actor type.
 * Composes: attributes + common + npc + npc-specific fields.
 */
export class NpcData extends NpcMixin(CommonMixin(AttributesMixin(foundry.abstract.TypeDataModel))) {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.vehicle = new fields.ObjectField();

        return schema;
    }
}
