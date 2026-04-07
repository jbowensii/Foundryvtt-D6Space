/*
  OpenD6 Space – Quench Test Scaffolding
  Purpose: Register placeholder Quench suites and tests matching TEST_PLAN_QUENCH.md IDs.
  Behavior: If Quench is not installed/ready, this file is a no-op. If Quench is present,
            it will register suites and tests that currently always pass but log their
            intended manual steps. This provides immediate visibility in Quench and a
            skeleton to incrementally replace with real automated interactions.
*/

(() => {
  const QUIET = false; // set true to suppress console info logs

  const log = (msg, ...rest) => {
    if (!QUIET) console.info(`[OD6S/Quench] ${msg}`, ...rest);
  };

  // Define the suites/tests derived from TEST_PLAN_QUENCH.md
  const suites = [
    {
      id: 'O6S.SYS',
      label: 'System Load & Configuration',
      tests: [
        {
          id: 'O6S.SYS.001',
          name: 'System installs and loads',
          steps: [
            'Install system from manifest (README) or local system.json.',
            'Create/launch a World using od6s; wait for initial load.'
          ]
        },
        {
          id: 'O6S.SYS.002',
          name: 'System settings menu present',
          steps: [
            'Open Game Settings > Configure Settings > System Settings.',
            'Verify OpenD6 Space settings groups render and open.'
          ]
        },
        {
          id: 'O6S.SYS.003',
          name: 'Grid and units',
          steps: [
            'Open Scene configuration for “Blank”.',
            'Confirm grid distance 1 and units m; save and persist.'
          ]
        }
      ]
    },
    {
      id: 'O6S.LOC',
      label: 'Localization',
      tests: [
        {
          id: 'O6S.LOC.001',
          name: 'Language switching',
          steps: [
            'Switch language between en, fr, es, ru.',
            'Reopen common UIs; verify localization without missing keys.'
          ]
        }
      ]
    },
    {
      id: 'O6S.CMP',
      label: 'Compendia',
      tests: [
        {
          id: 'O6S.CMP.001',
          name: 'All compendia load',
          steps: [
            'Open Compendium tab.',
            'Open all packs (items/actors/macros) and verify contents; drag-drop to sidebar.'
          ]
        }
      ]
    },
    {
      id: 'O6S.ACT',
      label: 'Actors & Actor Sheets',
      tests: [
        { id: 'O6S.ACT.001', name: 'Create Character actor', steps: [
          'Actors > Create Actor > Type: Character.',
          'Open sheet; verify sections and no console errors.'
        ]},
        { id: 'O6S.ACT.002', name: 'Create Vehicle actor', steps: [
          'Create Actor > Type: Vehicle.',
          'Open sheet; verify vehicle stats.'
        ]},
        { id: 'O6S.ACT.003', name: 'Create Starship actor', steps: [
          'Create Actor > Type: Starship.',
          'Open sheet; verify starship stats/crew UI if applicable.'
        ]},
        { id: 'O6S.ACT.004', name: 'Attribute edit', steps: [
          'On Character sheet, edit an attribute value inline.',
          'Blur/save; reopen and verify persistence and dice/pips updates.'
        ]},
        { id: 'O6S.ACT.005', name: 'Character creation helper (if present)', steps: [
          'Launch character creation app/dialog.',
          'Verify selections update actor; cancel/confirm behavior.'
        ]}
      ]
    },
    {
      id: 'O6S.ITM',
      label: 'Items & Item Sheets',
      tests: [
        { id: 'O6S.ITM.001', name: 'Create core item types', steps: [
          'Create items for: Weapon, Armor, Gear, Skill, Advantage, Disadvantage, Natural, Cybernetic, Special Ability, Vehicle Gear/Weapon, Starship Gear/Weapon, Character Template.',
          'Open each sheet; verify tabs (Attributes where applicable).'
        ]},
        { id: 'O6S.ITM.002', name: 'Weapon stun fields', steps: [
          'Open a Weapon item; set Stun Dice/Pips to non-zero on Attributes tab.',
          'Save and verify persistence.'
        ]},
        { id: 'O6S.ITM.003', name: 'Drag items onto Actor', steps: [
          'Drag Weapon, Armor, Gear from Items to Character.',
          'Verify inventory sections, quantity, equipped flags editable.'
        ]}
      ]
    },
    {
      id: 'O6S.ROL',
      label: 'Rolling & Chat',
      tests: [
        { id: 'O6S.ROL.001', name: 'Skill roll from sheet', steps: [
          'Click a Skill roll on Character.',
          'Accept dialog defaults and roll.'
        ]},
        { id: 'O6S.ROL.002', name: 'Attribute roll from sheet', steps: [
          'Roll a core attribute; verify chat card.'
        ]},
        { id: 'O6S.ROL.003', name: 'Weapon attack roll', steps: [
          'From inventory, use Weapon attack control to roll to chat.'
        ]},
        { id: 'O6S.ROL.004', name: 'Damage roll including Stun option', steps: [
          'Trigger weapon damage roll with Stun fields set; ensure Stun checkbox appears.',
          'Toggle Stun ON and roll; verify chat reflects Stun path.'
        ]},
        { id: 'O6S.ROL.005', name: 'Rerolls/exploding die/wild die', steps: [
          'Perform multiple rolls to trigger wild die/explosions; verify behavior.'
        ]},
        { id: 'O6S.ROL.006', name: 'Chat sound (if configured)', steps: [
          'Perform a roll that emits sound; verify audio plays without error.'
        ]}
      ]
    },
    {
      id: 'O6S.AUTO',
      label: 'Automation & Special Dialogs',
      tests: [
        { id: 'O6S.AUTO.001', name: 'Explosives template placement', steps: [
          'Open explosives template tool/dialog.',
          'Place template on Scene; verify behavior; cancel removes.'
        ]},
        { id: 'O6S.AUTO.002', name: 'Add embedded crew (vehicles/starships)', steps: [
          'On Vehicle/Starship, use add embedded crew action; verify embedding.'
        ]},
        { id: 'O6S.AUTO.003', name: 'Config: active attributes', steps: [
          'Open active attributes config; toggle attribute; save.',
          'Reopen Character; visibility matches config.'
        ]},
        { id: 'O6S.AUTO.004', name: 'Config: attribute sorting', steps: [
          'Open attribute sorting config; reorder; save; verify sheet order.'
        ]},
        { id: 'O6S.AUTO.005', name: 'Config: automation', steps: [
          'Open automation config; toggle option; perform affected roll; verify.'
        ]},
        { id: 'O6S.AUTO.006', name: 'Config: character points', steps: [
          'Adjust character points config; verify sheet updates.'
        ]},
        { id: 'O6S.AUTO.007', name: 'Config: custom fields', steps: [
          'Add custom field via config; open sheet and verify render/persistence.'
        ]}
      ]
    },
    {
      id: 'O6S.TOK',
      label: 'Tokens & Scene Interactions',
      tests: [
        { id: 'O6S.TOK.001', name: 'Token creation and overlay', steps: [
          'Drag Character to Scene to create Token.',
          'Apply condition/effect to set overlay; verify token overlay/tint.'
        ]},
        { id: 'O6S.TOK.002', name: 'Targeting and roll with target', steps: [
          'Place attacker/defender tokens; target defender.',
          'Perform attack; verify chat/automation uses target.'
        ]}
      ]
    },
    {
      id: 'O6S.PER',
      label: 'Permissions & Ownership',
      tests: [
        { id: 'O6S.PER.001', name: 'Player vs GM sheet access', steps: [
          'As GM, set PL1 owner of Character and remove other ownership.',
          'As PL1, open owned vs unowned sheets; verify permissions.'
        ]},
        { id: 'O6S.PER.002', name: 'Item visibility and edit restrictions', steps: [
          'As PL1, attempt to edit non-owned items; verify restrictions.'
        ]}
      ]
    },
    {
      id: 'O6S.MAC',
      label: 'Macros',
      tests: [
        { id: 'O6S.MAC.001', name: 'Macros compendium import', steps: [
          'Drag a macro from Macros compendium into Macro Directory.',
          'Execute macro; verify expected output or action.'
        ]}
      ]
    },
    {
      id: 'O6S.SOC',
      label: 'Socket & Multiplayer',
      tests: [
        { id: 'O6S.SOC.001', name: 'Socketlib availability', steps: [
          'Ensure socketlib enabled; check console for socket registration errors.'
        ]},
        { id: 'O6S.SOC.002', name: 'Player triggers GM-only effects (if applicable)', steps: [
          'As PL1, trigger GM-side action via socket; observe GM client.'
        ]}
      ]
    },
    {
      id: 'O6S.PKS',
      label: 'Packs & Data Integrity',
      tests: [
        { id: 'O6S.PKS.001', name: 'Drag from pack to world', steps: [
          'Drag Skill, Weapon, Armor from packs into World directories; open and verify schema.'
        ]},
        { id: 'O6S.PKS.002', name: 'Actor packs (vehicles/starships)', steps: [
          'Drag Vehicle and Starship from packs into Actors; open and verify fields.'
        ]}
      ]
    },
    {
      id: 'O6S.MIG',
      label: 'Data Schema & Migrations',
      tests: [
        { id: 'O6S.MIG.001', name: 'Version metadata', steps: [
          'Compare system.json version vs displayed system version; ensure no unexpected migrations.'
        ]}
      ]
    },
    {
      id: 'O6S.UIX',
      label: 'General UI/UX',
      tests: [
        { id: 'O6S.UIX.001', name: 'Sheet tab navigation', steps: [
          'On Item/Actor sheets, switch through tabs including Attributes/Inventory; observe.'
        ]},
        { id: 'O6S.UIX.002', name: 'Drag-and-drop between lists', steps: [
          'Reorder items in Actor inventory; drag to delete/drop zones; verify.'
        ]}
      ]
    }
  ];

  function tryRegister(quenchApi) {
    if (!quenchApi) return false;
    const registerSuite = quenchApi.registerSuite || quenchApi.addSuite || quenchApi.suite;
    const addTest = (suiteCtx, title, fn) => {
      // Cover a few API shapes
      if (typeof suiteCtx.test === 'function') return suiteCtx.test(title, fn);
      if (typeof quenchApi.test === 'function') return quenchApi.test(title, fn);
      // Fallback: run immediately so at least it logs in console
      log(`(fallback run) ${title}`);
      return Promise.resolve().then(fn);
    };

    if (typeof registerSuite !== 'function') return false;

    for (const suite of suites) {
      try {
        registerSuite.call(quenchApi, suite.id, (suiteCtx) => {
          for (const t of suite.tests) {
            const title = `${t.id} – ${t.name}`;
            addTest(suiteCtx, title, async (ctx = {}) => {
              // Log planned steps for visibility
              if (Array.isArray(t.steps)) {
                t.steps.forEach((s, i) => log(`${t.id} step ${i + 1}: ${s}`));
              }
              // Placeholders: replace with actual assertions/actions
              if (ctx?.assert?.true) {
                ctx.assert.true(true, 'Placeholder – replace with automated steps.');
              }
            });
          }
        }, { description: suite.label });
        log(`Registered Quench suite: ${suite.id} – ${suite.label}`);
      } catch (e) {
        console.warn(`[OD6S/Quench] Failed to register suite ${suite.id}`, e);
      }
    }
    return true;
  }

  // Hook into Quench readiness in a defensive manner
  if (globalThis.Hooks?.once) {
    Hooks.once('quenchReady', (api) => {
      if (!tryRegister(api)) {
        console.warn('[OD6S/Quench] quenchReady fired but API shape not supported.');
      }
    });
  }

  // Also try on ready in case Quench is already up or exposes a global
  if (globalThis.Hooks?.once) {
    Hooks.once('ready', () => {
      const api = globalThis.quench || game?.modules?.get?.('quench')?.api;
      if (!api) {
        log('Quench not detected; test scaffolding inactive.');
        return;
      }
      tryRegister(api);
    });
  }
})();
