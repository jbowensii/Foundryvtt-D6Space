/**
 * Unit tests for Actor classes in src/module/actor
 */
import { OD6SActor } from "../../module/actor/actor.js";
import { OD6SActorSheet } from "../../module/actor/actor-sheet.js";
import { OD6SAddCrew } from "../../module/actor/add-crew.js";
import { OD6SAddEmbeddedCrew } from "../../module/actor/add-embedded-crew.js";
import { OD6SAddItem } from "../../module/actor/add-item.js";
import { AdvanceDialog, od6sadvance, od6sInitRoll } from "../../module/actor/advance.js";
import { od6sattributeedit } from "../../module/actor/attribute-edit.js";
import { od6sspecialize } from "../../module/actor/specialize.js";

export const od6sActorTests = (context) => {
  const { describe, it, assert } = context;

  describe("OD6S Actor Module Tests", () => {

    describe("OD6SActor", () => {
      it("should extend Actor", () => {
        assert.ok(OD6SActor.prototype instanceof Actor, "OD6SActor should extend Actor");
      });

      it("should have prepareData method", () => {
        assert.equal(typeof OD6SActor.prototype.prepareData, "function");
      });

      it("should have prepareBaseData method", () => {
        assert.equal(typeof OD6SActor.prototype.prepareBaseData, "function");
      });

      it("should have prepareDerivedData method", () => {
        assert.equal(typeof OD6SActor.prototype.prepareDerivedData, "function");
      });

      it("should have rollAttribute method", () => {
        assert.equal(typeof OD6SActor.prototype.rollAttribute, "function");
      });

      it("should have rollAction method", () => {
        assert.equal(typeof OD6SActor.prototype.rollAction, "function");
      });

      it("should have getActionScoreText method", () => {
        assert.equal(typeof OD6SActor.prototype.getActionScoreText, "function");
      });

      it("should have getVehicleActionScore method", () => {
        assert.equal(typeof OD6SActor.prototype.getVehicleActionScore, "function");
      });

      it("should have getVehicleActionScoreText method", () => {
        assert.equal(typeof OD6SActor.prototype.getVehicleActionScoreText, "function");
      });

      it("should have applyMods method", () => {
        assert.equal(typeof OD6SActor.prototype.applyMods, "function");
      });

      it("should have setStrengthDamageBonus method", () => {
        assert.equal(typeof OD6SActor.prototype.setStrengthDamageBonus, "function");
      });

      it("should have setInitiative method", () => {
        assert.equal(typeof OD6SActor.prototype.setInitiative, "function");
      });
    });

    describe("OD6SActorSheet", () => {
      it("should be defined", () => {
        assert.ok(OD6SActorSheet, "OD6SActorSheet should be defined");
      });

      it("should have DEFAULT_OPTIONS", () => {
        assert.ok(OD6SActorSheet.DEFAULT_OPTIONS, "OD6SActorSheet should have DEFAULT_OPTIONS");
      });
    });

    describe("OD6SAddCrew", () => {
      it("should be defined", () => {
        assert.ok(OD6SAddCrew, "OD6SAddCrew should be defined");
      });

      it("should have a show static method or DEFAULT_OPTIONS", () => {
        assert.ok(
          typeof OD6SAddCrew.show === "function" || OD6SAddCrew.DEFAULT_OPTIONS,
          "OD6SAddCrew should have show or DEFAULT_OPTIONS"
        );
      });
    });

    describe("OD6SAddEmbeddedCrew", () => {
      it("should be defined", () => {
        assert.ok(OD6SAddEmbeddedCrew, "OD6SAddEmbeddedCrew should be defined");
      });

      it("should have DEFAULT_OPTIONS", () => {
        assert.ok(OD6SAddEmbeddedCrew.DEFAULT_OPTIONS, "OD6SAddEmbeddedCrew should have DEFAULT_OPTIONS");
      });
    });

    describe("OD6SAddItem", () => {
      it("should be defined", () => {
        assert.ok(OD6SAddItem, "OD6SAddItem should be defined");
      });

      it("should have DEFAULT_OPTIONS", () => {
        assert.ok(OD6SAddItem.DEFAULT_OPTIONS, "OD6SAddItem should have DEFAULT_OPTIONS");
      });
    });

    describe("AdvanceDialog", () => {
      it("should be defined", () => {
        assert.ok(AdvanceDialog, "AdvanceDialog should be defined");
      });

      it("should have DEFAULT_OPTIONS", () => {
        assert.ok(AdvanceDialog.DEFAULT_OPTIONS, "AdvanceDialog should have DEFAULT_OPTIONS");
      });
    });

    describe("od6sadvance", () => {
      it("should have advanceAction static method", () => {
        assert.equal(typeof od6sadvance.advanceAction, "function");
      });
    });

    describe("od6sInitRoll", () => {
      it("should have rollInitiative static method", () => {
        assert.equal(typeof od6sInitRoll.rollInitiative, "function");
      });
    });

    describe("od6sattributeedit", () => {
      it("should be defined", () => {
        assert.ok(od6sattributeedit, "od6sattributeedit should be defined");
      });
    });

    describe("od6sspecialize (from specialize.js)", () => {
      it("should be defined", () => {
        assert.ok(od6sspecialize, "od6sspecialize should be defined");
      });
    });
  });
};
