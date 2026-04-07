/**
 * Unit tests for OD6SItemSheet in src/module/item/item-sheet.js
 */
import { OD6SItemSheet } from "../../module/item/item-sheet.js";

export const od6sItemSheetTests = (context) => {
  const { describe, it, assert } = context;

  describe("OD6SItemSheet Tests", () => {
    it("DEFAULT_OPTIONS", () => {
      const options = OD6SItemSheet.DEFAULT_OPTIONS;
      assert.ok(options.classes.includes("od6s"), "Item sheet should have od6s class");
      assert.ok(options.classes.includes("sheet"), "Item sheet should have sheet class");
      assert.ok(options.classes.includes("item"), "Item sheet should have item class");
      assert.equal(options.position.width, 700, "Item sheet default width should be 700");
    });
  });
};
