import {BaseMixin} from "./mixins/base-mixin.js";
import {SkillMixin} from "./mixins/skill-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "skill" item type.
 * Composes: base + skill.
 */
export class SkillData extends SkillMixin(BaseMixin(foundry.abstract.TypeDataModel)) {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.label = new fields.StringField({initial: "OD6S.CHAR_SKILLS"});

        return schema;
    }
}
