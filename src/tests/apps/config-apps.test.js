import od6sActiveAttributesConfiguration from "../../module/apps/config-active-attributes.js";
import od6sAttributesSortingConfiguration from "../../module/apps/config-attributes-sorting.js";
import od6sAutomationConfiguration from "../../module/apps/config-automation.js";
import od6sCharacterPointsConfiguration from "../../module/apps/config-characterpoints.js";
import od6sCustomFieldsConfiguration from "../../module/apps/config-custom-fields.js";
import od6sDeadlinessConfiguration from "../../module/apps/config-deadliness.js";
import od6sDifficultyConfiguration from "../../module/apps/config-difficulty.js";
import od6sInitiativeConfiguration from "../../module/apps/config-initiative.js";
import od6sCustomLabelsConfiguration from "../../module/apps/config-labels.js";
import od6sMiscRulesConfiguration from "../../module/apps/config-miscrules.js";
import od6sRevealConfiguration from "../../module/apps/config-reveal.js";
import od6sRulesConfiguration from "../../module/apps/config-rules.js";
import od6sWildDieConfiguration from "../../module/apps/config-wild-die.js";

export const od6sConfigAppTests = (context) => {
  const { describe, it, assert } = context;

  describe("OD6S Config Application Tests", () => {
    const configApps = [
      { name: "Active Attributes", class: od6sActiveAttributesConfiguration },
      { name: "Attributes Sorting", class: od6sAttributesSortingConfiguration },
      { name: "Automation", class: od6sAutomationConfiguration },
      { name: "Character Points", class: od6sCharacterPointsConfiguration },
      { name: "Custom Fields", class: od6sCustomFieldsConfiguration },
      { name: "Deadliness", class: od6sDeadlinessConfiguration },
      { name: "Difficulty", class: od6sDifficultyConfiguration },
      { name: "Initiative", class: od6sInitiativeConfiguration },
      { name: "Custom Labels", class: od6sCustomLabelsConfiguration },
      { name: "Misc Rules", class: od6sMiscRulesConfiguration },
      { name: "Reveal", class: od6sRevealConfiguration },
      { name: "Rules", class: od6sRulesConfiguration },
      { name: "Wild Die", class: od6sWildDieConfiguration }
    ];

    configApps.forEach(app => {
      describe(`${app.name} Configuration App`, () => {
        it(`should have DEFAULT_OPTIONS`, () => {
          assert.ok(app.class.DEFAULT_OPTIONS, "App should have DEFAULT_OPTIONS defined");
          assert.ok(app.class.DEFAULT_OPTIONS.window, "App should have window options");
          assert.ok(app.class.DEFAULT_OPTIONS.form, "App should have form options");
        });

        it(`should have PARTS`, () => {
          assert.ok(app.class.PARTS, "App should have PARTS defined");
          assert.ok(app.class.PARTS.form, "App should have a form part");
          assert.ok(app.class.PARTS.form.template, "Form part should have a template");
        });

        it(`can be instantiated (with mocks)`, () => {
          // Mock super constructor behavior for ApplicationV2
          const instance = new app.class({}, { id: "test-app" });
          assert.ok(instance, "Instance should be created");
          // Some config apps default to true, others to false. We just check it's defined.
          assert.notEqual(typeof instance.requiresWorldReload, 'undefined', "requiresWorldReload should be defined");
        });

        if (app.class.formHandler) {
          it(`should have a formHandler static method`, () => {
            assert.equal(typeof app.class.formHandler, 'function', "App should have formHandler static method");
          });
        }
      });
    });
  });
};
