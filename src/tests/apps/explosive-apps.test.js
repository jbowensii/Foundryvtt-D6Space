import { ExplosiveDialog } from "../../module/apps/explosive-dialog.js";

export const od6sExplosiveAppTests = (context) => {
  const { describe, it, assert, before, after } = context;

  describe("OD6S Explosive Application Tests", () => {
    let ExplosivesTemplate;

    describe("ExplosiveDialog", () => {
      it("should have DEFAULT_OPTIONS", () => {
        assert.ok(ExplosiveDialog.DEFAULT_OPTIONS);
        assert.ok(ExplosiveDialog.DEFAULT_OPTIONS.classes.includes("explosive-dialog"));
      });

      it("should have show static method", () => {
        assert.equal(typeof ExplosiveDialog.show, 'function');
      });

      it("can be instantiated (with mocks)", () => {
        const mockData = { type: "grenade", timer: 0, contact: false };
        const instance = new ExplosiveDialog(mockData, {
          window: { title: "Test Dialog" },
          buttons: [{ action: "test", label: "Test Button" }]
        });
        assert.ok(instance);
        assert.equal(instance.explosiveData, mockData);
      });
    });

    describe("ExplosivesTemplate", () => {
      let originalMeasuredTemplate;
      let originalPixi;

      before(async () => {
        originalMeasuredTemplate = globalThis.MeasuredTemplate;
        originalPixi = globalThis.PIXI;

        // Mock MeasuredTemplate to avoid "You must provide an embedded Document instance" error
        globalThis.MeasuredTemplate = class {
          constructor(document) {
            this.document = document;
          }
        };

        // We need to mock PIXI if it's not available in the test environment
        globalThis.PIXI = globalThis.PIXI || { 
          Graphics: class {
            constructor() { this.position = { set: () => {} }; }
            clear() {}
            lineStyle() {}
            moveTo() {}
            lineTo() {}
          }, 
          Text: class {
            constructor() { this.style = {}; }
          } 
        };

        // Import ExplosivesTemplate AFTER mocking MeasuredTemplate
        const module = await import("../../module/apps/explosives-template.js");
        ExplosivesTemplate = module.default;
      });

      after(() => {
        globalThis.MeasuredTemplate = originalMeasuredTemplate;
        globalThis.PIXI = originalPixi;
      });

      it("ExplosivesTemplate should be defined", () => {
        assert.ok(ExplosivesTemplate);
      });

      it("should have setExplosiveData method", () => {
        const mockDocument = { updateSource: () => {} };
        const instance = new ExplosivesTemplate(mockDocument);
        assert.equal(typeof instance.setExplosiveData, 'function');
      });

      it("setExplosiveData sets properties", async () => {
        const mockDocument = { updateSource: () => {} };
        const instance = new ExplosivesTemplate(mockDocument);
        const mockData = { actor: { sheet: { minimize: () => {}, maximize: () => {} } } };
        
        await instance.setExplosiveData(mockData, 100, 200);
        
        assert.equal(instance.exData, mockData);
        assert.equal(instance.originX, 100);
        assert.equal(instance.originY, 200);
        assert.ok(instance.rangeLine);
        assert.ok(instance.rangeMeasure);
      });
    });
  });
};
