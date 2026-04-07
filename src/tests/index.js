import { od6sActorDataTests } from "./data/actor-data.test.js";
import { od6sItemDataTests } from "./data/item-data.test.js";
import { od6sMixinTests } from "./data/mixins.test.js";
import { od6sMainTests } from "./od6s.test.js";
import { od6sUtilitiesTests } from "./system/utilities.test.js";
import { od6sInitiativeTests } from "./system/initiative.test.js";
import { od6sSocketTests } from "./system/socket.test.js";
import { od6sHandlebarsTests } from "./system/handlebars.test.js";
import { od6sChatLogTests } from "./overrides/chat-log.test.js";
import { od6sCombatTrackerTests } from "./overrides/combat-tracker.test.js";
import { od6sCombatTests } from "./overrides/combat.test.js";
import { od6sCompendiumDirectoryTests } from "./overrides/compendium-directory.test.js";
import { od6sTokenTests } from "./overrides/token.test.js";
import { od6sItemTests } from "./item/item.test.js";
import { od6sItemSheetTests } from "./item/item-sheet.test.js";
import { od6sActorTests } from "./actor/actor.test.js";
import { od6sConfigTests } from "./config/config-od6s.test.js";
import { od6sSettingsTests } from "./config/settings-od6s.test.js";
import { od6sConfigAppTests } from "./apps/config-apps.test.js";
import { od6sChatAppTests } from "./apps/chat-apps.test.js";
import { od6sCreationAppTests } from "./apps/creation-apps.test.js";
import { od6sExplosiveAppTests } from "./apps/explosive-apps.test.js";
import { od6sRollUnitTests } from "./apps/od6s-roll.test.js";

Hooks.on("quenchReady", (quench) => {
  console.log("OD6S | Quench Ready");
  registerTests(quench);
});

function registerTests(quench) {
  console.log("OD6S | Registering tests...");
  try {
    quench.registerBatch(
      "od6s.main",
      (context) => {
        od6sMainTests(context);
      },
      { displayName: "OD6S Main Module Unit Tests" }
    );

    quench.registerBatch(
      "od6s.data",
      (context) => {
        od6sActorDataTests(context);
        od6sItemDataTests(context);
        od6sMixinTests(context);
      },
      { displayName: "OD6S DataModel Unit Tests" }
    );

    quench.registerBatch(
      "od6s.system",
      (context) => {
        od6sUtilitiesTests(context);
        od6sInitiativeTests(context);
        od6sSocketTests(context);
        od6sHandlebarsTests(context);
      },
      { displayName: "OD6S System Unit Tests" }
    );

    quench.registerBatch(
      "od6s.overrides",
      (context) => {
        od6sChatLogTests(context);
        od6sCombatTrackerTests(context);
        od6sCombatTests(context);
        od6sCompendiumDirectoryTests(context);
        od6sTokenTests(context);
      },
      { displayName: "OD6S Override Unit Tests" }
    );

    quench.registerBatch(
      "od6s.item",
      (context) => {
        od6sItemTests(context);
        od6sItemSheetTests(context);
      },
      { displayName: "OD6S Item Unit Tests" }
    );

    quench.registerBatch(
      "od6s.actor",
      (context) => {
        od6sActorTests(context);
      },
      { displayName: "OD6S Actor Unit Tests" }
    );

    quench.registerBatch(
      "od6s.config",
      (context) => {
        od6sConfigTests(context);
        od6sSettingsTests(context);
      },
      { displayName: "OD6S Config Unit Tests" }
    );

    quench.registerBatch(
      "od6s.apps",
      (context) => {
        od6sConfigAppTests(context);
        od6sChatAppTests(context);
        od6sCreationAppTests(context);
        od6sExplosiveAppTests(context);
        od6sRollUnitTests(context);
      },
      { displayName: "OD6S Application Unit Tests" }
    );
    console.log("OD6S | Tests registered successfully.");
  } catch (error) {
    console.error("OD6S | Error registering tests:", error);
  }
}
