/**
 * Unit tests for Item DataModels in src/module/data/item
 */
import { SkillData } from "../../module/data/item/skill.js";
import { SpecializationData } from "../../module/data/item/specialization.js";
import { AdvantageData } from "../../module/data/item/advantage.js";
import { DisadvantageData } from "../../module/data/item/disadvantage.js";
import { SpecialAbilityData } from "../../module/data/item/special-ability.js";
import { ArmorData } from "../../module/data/item/armor.js";
import { WeaponData } from "../../module/data/item/weapon.js";
import { GearData } from "../../module/data/item/gear.js";
import { CyberneticData } from "../../module/data/item/cybernetic.js";
import { ManifestationData } from "../../module/data/item/manifestation.js";
import { CharacterTemplateData } from "../../module/data/item/character-template.js";
import { ActionData } from "../../module/data/item/action.js";
import { VehicleItemData } from "../../module/data/item/vehicle-item.js";
import { VehicleWeaponData } from "../../module/data/item/vehicle-weapon.js";
import { VehicleGearData } from "../../module/data/item/vehicle-gear.js";
import { StarshipWeaponData } from "../../module/data/item/starship-weapon.js";
import { StarshipGearData } from "../../module/data/item/starship-gear.js";
import { SpeciesTemplateData } from "../../module/data/item/species-template.js";
import { ItemGroupData } from "../../module/data/item/item-group.js";

export const od6sItemDataTests = (context) => {
  const { describe, it, assert } = context;
  describe("OD6S Item DataModel Tests", () => {
    it("SkillData Schema", () => {
      const schema = SkillData.defineSchema();
      assert.ok(schema.mod, "SkillData should have mod field");
      assert.ok(schema.attribute, "SkillData should have attribute field (from SkillMixin)");
    });

    it("WeaponData Schema", () => {
      const schema = WeaponData.defineSchema();
      assert.ok(schema.damage, "WeaponData should have damage field");
      assert.ok(schema.rof, "WeaponData should have rof field");
      assert.ok(schema.equipped, "WeaponData should have equipped field (from EquipMixin)");
    });

    it("ArmorData Schema", () => {
      const schema = ArmorData.defineSchema();
      assert.ok(schema.protection, "ArmorData should have protection field");
      assert.ok(schema.equipped, "ArmorData should have equipped field (from EquipMixin)");
    });

    it("VehicleWeaponData Schema", () => {
      const schema = VehicleWeaponData.defineSchema();
      assert.ok(schema.damage, "VehicleWeaponData should have damage field");
      assert.ok(schema.fire_arc, "VehicleWeaponData should have fire_arc field (from VehicleWeaponsMixin)");
    });

    it("SpeciesTemplateData Schema", () => {
      const schema = SpeciesTemplateData.defineSchema();
      assert.ok(schema.attributes, "SpeciesTemplateData should have attributes field");
    });

    it("SpecializationData Schema", () => {
      const schema = SpecializationData.defineSchema();
      assert.ok(schema.mod, "SpecializationData should have mod field");
      assert.ok(schema.attribute, "SpecializationData should have attribute field (from SkillMixin)");
    });

    it("AdvantageData Schema", () => {
      const schema = AdvantageData.defineSchema();
      assert.ok(schema.attribute, "AdvantageData should have attribute field (from AdvantageMixin)");
      assert.ok(schema.skill, "AdvantageData should have skill field");
      assert.ok(schema.value, "AdvantageData should have value field");
    });

    it("DisadvantageData Schema", () => {
      const schema = DisadvantageData.defineSchema();
      assert.ok(schema.attribute, "DisadvantageData should have attribute field (from AdvantageMixin)");
      assert.ok(schema.skill, "DisadvantageData should have skill field");
    });

    it("SpecialAbilityData Schema", () => {
      const schema = SpecialAbilityData.defineSchema();
      assert.ok(schema.description !== undefined || schema.attribute !== undefined,
        "SpecialAbilityData should have fields from its mixins");
    });

    it("GearData Schema", () => {
      const schema = GearData.defineSchema();
      assert.ok(schema.cost !== undefined || schema.quantity !== undefined,
        "GearData should have cost or quantity field (from EquipmentMixin)");
    });

    it("CyberneticData Schema", () => {
      const schema = CyberneticData.defineSchema();
      assert.ok(schema.location !== undefined || schema.description !== undefined,
        "CyberneticData should have fields from its definition");
    });

    it("ManifestationData Schema", () => {
      const schema = ManifestationData.defineSchema();
      assert.ok(schema.description !== undefined || schema.difficulty !== undefined,
        "ManifestationData should have fields from its definition");
    });

    it("CharacterTemplateData Schema", () => {
      const schema = CharacterTemplateData.defineSchema();
      assert.ok(schema, "CharacterTemplateData should define a schema");
    });

    it("ActionData Schema", () => {
      const schema = ActionData.defineSchema();
      assert.ok(schema, "ActionData should define a schema");
    });

    it("VehicleItemData Schema", () => {
      const schema = VehicleItemData.defineSchema();
      assert.ok(schema, "VehicleItemData should define a schema");
    });

    it("VehicleGearData Schema", () => {
      const schema = VehicleGearData.defineSchema();
      assert.ok(schema, "VehicleGearData should define a schema");
    });

    it("StarshipWeaponData Schema", () => {
      const schema = StarshipWeaponData.defineSchema();
      assert.ok(schema.damage, "StarshipWeaponData should have damage field");
      assert.ok(schema.fire_arc, "StarshipWeaponData should have fire_arc field (from VehicleWeaponsMixin)");
    });

    it("StarshipGearData Schema", () => {
      const schema = StarshipGearData.defineSchema();
      assert.ok(schema, "StarshipGearData should define a schema");
    });

    it("ItemGroupData Schema", () => {
      const schema = ItemGroupData.defineSchema();
      assert.ok(schema, "ItemGroupData should define a schema");
    });
  });
};
