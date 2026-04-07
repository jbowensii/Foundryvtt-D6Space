const fields = foundry.data.fields;

/**
 * Mixin that adds the "skill" template fields to an item DataModel.
 * Mirrors the "skill" template block from template.json.
 */
export function SkillMixin(Base) {
    return class extends Base {
        static defineSchema() {
            const schema = super.defineSchema();

            schema.attribute = new fields.StringField({initial: ""});
            schema.min = new fields.BooleanField({initial: false});
            schema.base = new fields.NumberField({initial: 0, integer: true});
            schema.mod = new fields.NumberField({initial: 0, integer: true});
            schema.score = new fields.NumberField({initial: 0, integer: true});
            schema.time_taken = new fields.StringField({initial: "One Round"});
            schema.isAdvancedSkill = new fields.BooleanField({initial: false});
            schema.used = new fields.SchemaField({
                value: new fields.BooleanField({initial: false}),
            });

            return schema;
        }
    };
}
