/**
 * Unit tests for DataModel Mixins in src/module/data
 */
import { AttributesMixin } from "../../module/data/actor/mixins/attributes-mixin.js";
import { CommonMixin } from "../../module/data/actor/mixins/common-mixin.js";
import { NpcMixin } from "../../module/data/actor/mixins/npc-mixin.js";
import { VehicleCommonMixin } from "../../module/data/actor/mixins/vehicle-common-mixin.js";
import { BaseMixin } from "../../module/data/item/mixins/base-mixin.js";
import { EquipMixin } from "../../module/data/item/mixins/equip-mixin.js";
import { EquipmentMixin } from "../../module/data/item/mixins/equipment-mixin.js";
import { SkillMixin } from "../../module/data/item/mixins/skill-mixin.js";
import { VehicleWeaponsMixin } from "../../module/data/item/mixins/vehicle-weapons-mixin.js";
import { AdvantageMixin } from "../../module/data/item/mixins/advantage-mixin.js";

export const od6sMixinTests = (context) => {
  const { describe, it, assert } = context;
  describe("OD6S Mixin Tests", () => {
    it("AttributesMixin", () => {
      class MockBase {}
      const Mixed = AttributesMixin(MockBase);
      const schema = Mixed.defineSchema();
      assert.ok(schema.attributes, "AttributesMixin should add attributes field");
      assert.ok(schema.attributes.fields.agi, "AttributesMixin should have agi attribute");
    });

    it("CommonMixin", () => {
      class MockBase { static defineSchema() { return {}; } }
      const Mixed = CommonMixin(MockBase);
      const schema = Mixed.defineSchema();
      assert.ok(schema.move, "CommonMixin should add move field");
      assert.ok(schema.wounds, "CommonMixin should add wounds field");
    });

    it("NpcMixin", () => {
      class MockBase { static defineSchema() { return {}; } }
      const Mixed = NpcMixin(MockBase);
      const schema = Mixed.defineSchema();
      assert.ok(schema.npc_type, "NpcMixin should add npc_type field");
    });

    it("VehicleCommonMixin", () => {
      class MockBase { static defineSchema() { return {}; } }
      const Mixed = VehicleCommonMixin(MockBase);
      const schema = Mixed.defineSchema();
      assert.ok(schema.maneuverability, "VehicleCommonMixin should add maneuverability field");
    });

    it("EquipMixin", () => {
      class MockBase { static defineSchema() { return {}; } }
      const Mixed = EquipMixin(MockBase);
      const schema = Mixed.defineSchema();
      assert.ok(schema.equipped, "EquipMixin should add equipped field");
    });

    it("BaseMixin", () => {
      class MockBase {}
      const Mixed = BaseMixin(MockBase);
      const schema = Mixed.defineSchema();
      assert.ok(schema.description, "BaseMixin should add description field");
      assert.ok(schema.labels, "BaseMixin should add labels field");
      assert.ok(schema.tags, "BaseMixin should add tags field");
    });

    it("EquipmentMixin", () => {
      class MockBase { static defineSchema() { return {}; } }
      const Mixed = EquipmentMixin(MockBase);
      const schema = Mixed.defineSchema();
      assert.ok(schema.cost, "EquipmentMixin should add cost field");
      assert.ok(schema.price, "EquipmentMixin should add price field");
      assert.ok(schema.availability, "EquipmentMixin should add availability field");
      assert.ok(schema.quantity, "EquipmentMixin should add quantity field");
    });

    it("SkillMixin", () => {
      class MockBase { static defineSchema() { return {}; } }
      const Mixed = SkillMixin(MockBase);
      const schema = Mixed.defineSchema();
      assert.ok(schema.attribute, "SkillMixin should add attribute field");
      assert.ok(schema.mod, "SkillMixin should add mod field");
      assert.ok(schema.score, "SkillMixin should add score field");
      assert.ok(schema.base, "SkillMixin should add base field");
      assert.ok(schema.min, "SkillMixin should add min field");
      assert.ok(schema.time_taken, "SkillMixin should add time_taken field");
      assert.ok(schema.isAdvancedSkill, "SkillMixin should add isAdvancedSkill field");
      assert.ok(schema.used, "SkillMixin should add used field");
    });

    it("VehicleWeaponsMixin", () => {
      class MockBase { static defineSchema() { return {}; } }
      const Mixed = VehicleWeaponsMixin(MockBase);
      const schema = Mixed.defineSchema();
      assert.ok(schema.scale, "VehicleWeaponsMixin should add scale field");
      assert.ok(schema.damaged, "VehicleWeaponsMixin should add damaged field");
      assert.ok(schema.ammo, "VehicleWeaponsMixin should add ammo field");
      assert.ok(schema.fire_arc, "VehicleWeaponsMixin should add fire_arc field");
      assert.ok(schema.crew, "VehicleWeaponsMixin should add crew field");
      assert.ok(schema.fire_control, "VehicleWeaponsMixin should add fire_control field");
      assert.ok(schema.range, "VehicleWeaponsMixin should add range field");
      assert.ok(schema.damage, "VehicleWeaponsMixin should add damage field");
      assert.ok(schema.difficulty, "VehicleWeaponsMixin should add difficulty field");
      assert.ok(schema.mods, "VehicleWeaponsMixin should add mods field");
    });

    it("AdvantageMixin", () => {
      class MockBase { static defineSchema() { return {}; } }
      const Mixed = AdvantageMixin(MockBase);
      const schema = Mixed.defineSchema();
      assert.ok(schema.attribute, "AdvantageMixin should add attribute field");
      assert.ok(schema.skill, "AdvantageMixin should add skill field");
      assert.ok(schema.value, "AdvantageMixin should add value field");
    });
  });
};
