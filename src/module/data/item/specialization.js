import {BaseMixin} from "./mixins/base-mixin.js";
import {SkillMixin} from "./mixins/skill-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "specialization" item type.
 * Composes: base + skill + specialization-specific fields.
 */
export class SpecializationData extends SkillMixin(BaseMixin(foundry.abstract.TypeDataModel)) {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.skill = new fields.StringField({initial: ""});
        schema.label = new fields.StringField({initial: "OD6S.CHAR_SPECIALIZATIONS"});
        // Override used from skill mixin — specialization has its own used at top level
        schema.used = new fields.SchemaField({
            value: new fields.BooleanField({initial: false}),
        });

        return schema;
    }
}
