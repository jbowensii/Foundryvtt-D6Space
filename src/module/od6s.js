/**
 * Main system entry point for od6s (OpenD6 Space) FoundryVTT system.
 *
 * Registers document classes, sheet applications, custom dice terms, and all
 * Foundry hooks that drive the system's runtime behavior: combat turn management,
 * wound/stun tracking with auto-status effects, explosive template lifecycle,
 * chat message interactivity (damage buttons, opposed rolls, wild die handling),
 * vehicle crew synchronization, and Dice So Nice integration.
 *
 * Also exports hotbar macro helpers and socketlib callback registrations.
 */
import {OD6SActor} from "./actor/actor.js";
import {OD6SActorSheet} from "./actor/actor-sheet.js";
import {OD6SItem} from "./item/item.js";
import {OD6SItemSheet} from "./item/item-sheet.js";
import {OD6SToken} from "./overrides/token.js";
import {od6sutilities} from "./system/utilities.js";
// REMOVED in v13 migration: CombatTracker, CompendiumDirectory, ChatLog overrides
// These core classes were converted to AppV2 in v13 and can no longer be subclassed this way.
// Combat tracker initiative logic moved to OD6SCombat.rollInitiative() in combat.js.
import OD6SEditDifficulty, {OD6SChat, OD6SChooseTarget, OD6SEditDamage, OD6SHandleWildDieForm} from "./apps/chat.js";
import OD6SSocketHandler from "./system/socket.js";
import OD6S from "./config/config-od6s.js";
import od6sSettings from "./config/settings-od6s.js";
import od6sHandlebars from "./system/handlebars.js"
import {OD6SInitiative} from "./system/initiative.js";
import {OD6SCombat} from "./overrides/combat.js";
import {od6sroll} from "./apps/od6sroll.js";

// DataModel imports — Actors
import {CharacterData} from "./data/actor/character.js";
import {NpcData} from "./data/actor/npc.js";
import {CreatureData} from "./data/actor/creature.js";
import {VehicleData} from "./data/actor/vehicle.js";
import {StarshipData} from "./data/actor/starship.js";
import {ContainerData} from "./data/actor/container.js";

// DataModel imports — Items
import {SkillData} from "./data/item/skill.js";
import {SpecializationData} from "./data/item/specialization.js";
import {AdvantageData} from "./data/item/advantage.js";
import {DisadvantageData} from "./data/item/disadvantage.js";
import {SpecialAbilityData} from "./data/item/special-ability.js";
import {ArmorData} from "./data/item/armor.js";
import {WeaponData} from "./data/item/weapon.js";
import {GearData} from "./data/item/gear.js";
import {CyberneticData} from "./data/item/cybernetic.js";
import {ManifestationData} from "./data/item/manifestation.js";
import {CharacterTemplateData} from "./data/item/character-template.js";
import {ActionData} from "./data/item/action.js";
import {VehicleItemData} from "./data/item/vehicle-item.js";
import {VehicleWeaponData} from "./data/item/vehicle-weapon.js";
import {VehicleGearData} from "./data/item/vehicle-gear.js";
import {StarshipWeaponData} from "./data/item/starship-weapon.js";
import {StarshipGearData} from "./data/item/starship-gear.js";
import {SpeciesTemplateData} from "./data/item/species-template.js";
import {ItemGroupData} from "./data/item/item-group.js";

od6sSettings();
od6sHandlebars();

Hooks.once('init', async function () {

    // Catch otherwise-silent errors that can trigger a reload or broken UI
    window.addEventListener("error", (event) => {
        try { console.error("OD6S window.error:", event?.error ?? event?.message ?? event); } catch (_) {}
    });
    window.addEventListener("unhandledrejection", (event) => {
        try { console.error("OD6S unhandledrejection:", event?.reason ?? event); } catch (_) {}
    });

    game.od6s = {
        OD6SActor,
        OD6SItem,
        OD6SToken,
        rollItemMacro,
        rollItemNameMacro,
        simpleRoll,
        getActorFromUuid,
        diceTerms: [CharacterPointDie, WildDie],
        config: OD6S,
    };

    //CONFIG.debug.hooks = true

    // Native socket handler for operations that predate socketlib integration.
    // Newer GM-only operations use socketlib (registered in socketlib.ready hook below).
    game.socket.on('system.od6s', (data) => {
        if (data.operation === 'updateRollMessage') OD6SSocketHandler.updateRollMessage(data);
        if (data.operation === 'updateInitRoll') OD6SSocketHandler.updateInitRoll(data);
        if (data.operation === 'addToVehicle') OD6SSocketHandler.addToVehicle(data);
        if (data.operation === 'removeFromVehicle') OD6SSocketHandler.removeFromVehicle(data);
        if (data.operation === 'sendVehicleStats') OD6SSocketHandler.sendVehicleStats(data);
        if (data.operation === 'updateExplosiveTemplate') OD6S.SocketHandler.updateExplosiveTemplate(data);
        if (data.operation === 'deleteExplosiveTemplate') OD6S.SocketHandler.deleteExplosiveTemplate(data);
    })

    /**
     * Set an initiative formula for the system
     * @type {String}
     */
    CONFIG.Combat.initiative = {
        formula: "@initiative.formula",
        decimals: 2
    };

    if (typeof Babele !== 'undefined') {
        Babele.get().setSystemTranslationsDir("lang/translations");
    }

    CONFIG.Combat.documentClass = OD6SCombat;
    CONFIG.statusEffects = OD6S.statusEffects;
    CONFIG.Dice.terms["w"] = WildDie;
    CONFIG.Dice.terms["b"] = CharacterPointDie;
    CONFIG.Token.objectClass = OD6SToken;

    // Register TypeDataModel classes for actor types (replaces template.json schema)
    CONFIG.Actor.dataModels.character = CharacterData;
    CONFIG.Actor.dataModels.npc = NpcData;
    CONFIG.Actor.dataModels.creature = CreatureData;
    CONFIG.Actor.dataModels.vehicle = VehicleData;
    CONFIG.Actor.dataModels.starship = StarshipData;
    CONFIG.Actor.dataModels.container = ContainerData;

    // Register TypeDataModel classes for item types
    CONFIG.Item.dataModels.skill = SkillData;
    CONFIG.Item.dataModels.specialization = SpecializationData;
    CONFIG.Item.dataModels.advantage = AdvantageData;
    CONFIG.Item.dataModels.disadvantage = DisadvantageData;
    CONFIG.Item.dataModels.specialability = SpecialAbilityData;
    CONFIG.Item.dataModels.armor = ArmorData;
    CONFIG.Item.dataModels.weapon = WeaponData;
    CONFIG.Item.dataModels.gear = GearData;
    CONFIG.Item.dataModels.cybernetic = CyberneticData;
    CONFIG.Item.dataModels.manifestation = ManifestationData;
    CONFIG.Item.dataModels["character-template"] = CharacterTemplateData;
    CONFIG.Item.dataModels.action = ActionData;
    CONFIG.Item.dataModels.vehicle = VehicleItemData;
    CONFIG.Item.dataModels["vehicle-weapon"] = VehicleWeaponData;
    CONFIG.Item.dataModels["vehicle-gear"] = VehicleGearData;
    CONFIG.Item.dataModels["starship-weapon"] = StarshipWeaponData;
    CONFIG.Item.dataModels["starship-gear"] = StarshipGearData;
    CONFIG.Item.dataModels["species-template"] = SpeciesTemplateData;
    CONFIG.Item.dataModels["item-group"] = ItemGroupData;

    CONFIG.ChatMessage.template = "systems/od6s/templates/chat/chat.html";

    // Define custom Entity classes
    CONFIG.Actor.documentClass = OD6SActor;
    CONFIG.Item.documentClass = OD6SItem;

    // Register sheet application classes
    foundry.documents.collections.Actors.registerSheet("od6s", OD6SActorSheet, {makeDefault: true});
    foundry.documents.collections.Items.registerSheet("od6s", OD6SItemSheet, {makeDefault: true});
});

// When an explosive template is moved on the canvas (e.g., GM repositioning),
// recalculate which tokens fall within the blast radius and update the linked
// chat message's target list so damage buttons reflect the new positions.
Hooks.on('updateMeasuredTemplate', async (template, change) => {
    if (game.user.isGM) {
        if (change.flags?.od6s.messageId ) {
            return;
        }
        if (template.getFlag('od6s', 'messageId') && !template.getFlag('od6s', 'handled')) {
            const message = game.messages.get(template.getFlag('od6s', 'messageId'));
            if (typeof (message !== 'undefined') && message !== '') {

                let actor;
                if (message.speaker.token !== '' && message.speaker.token !== null) {
                    actor = game.scenes.get(message.speaker.scene).tokens.get(message.speaker.token).object.actor;
                } else {
                    actor = game.actors.get(message.speaker.actor);
                }
                const targets = await od6sutilities.getExplosiveTargets(
                    actor,
                    template.getFlag('od6s', 'item'));
                await message.unsetFlag('od6s', 'targets');
                await message.setFlag('od6s', 'targets', targets);
                await message.render();
            }
        }
    }
})

// Cleanup crew links when deleting actors. Vehicles disembark all crew;
// characters/NPCs remove themselves from any vehicle they're crewing.
Hooks.on('preDeleteDocument', async (document, options, userId) => {
    if (['starship','vehicle'].includes(document.type)) {
        if (document.system.crewmembers.length > 0) {
            if(game.user.isGM) {
                for (const c in document.system.crewmembers) {
                    const actor = od6sutilities.getActorFromUuid(document.system.crewmembers[c].uuid);
                    await actor.removeFromCrew(this.document.uuid)
                }
            }
        }
    }

    if (['character','npc','creature'].includes(document.type)) {
        if (typeof document.system.vehicle.uuid !== 'undefined' && document.system.vehicle.uuid !== ''  ) {
            if (game.user.isGM) {
                const vehicle = od6sutilities.getActorFromUuid(document.system.vehicle.uuid);
                await vehicle.forceRemoveCrewmember(this.document.uuid);
            }
        }
    }
})

// When an explosive template is removed from the canvas, clean up all related
// flags on the source item and delete the linked chat message if unhandled.
Hooks.on('deleteMeasuredTemplate', async (template) => {
    if (game.settings.get('od6s', 'auto_explosive') && game.user.isGM) {
        if (template.getFlag('od6s', 'explosive')) {
            let actor;
            if(template.getFlag('od6s','token')) {
                const token = game.scenes.active.tokens.get(template.getFlag('od6s', 'token'));
                actor = token.actor;
            } else {
                actor = await od6sutilities.getActorFromUuid(template.getFlag('od6s', 'actor'));
            }
            if (typeof (actor) !== 'undefined') {
                const item = actor.items.get(template.getFlag('od6s', 'item'));
                if (typeof (item) !== 'undefined') {
                    await item.unsetFlag('od6s', 'explosiveOrigin');
                    await item.unsetFlag('od6s', 'explosiveRange');
                    await item.unsetFlag('od6s', 'explosiveSet');
                    await item.unsetFlag('od6s', 'explosiveTemplate');
                }
            }
            if(template.getFlag('od6s','messageId') && !template.getFlag('od6s','handled')) {
                const message = game.messages.get(template.getFlag('od6s','messageId'));
                if(typeof(message) !== 'undefined') await message.delete();
            }
        }
    }
})

// Chat hooks
// Chat listeners
Hooks.on('renderChatMessageHTML', (msg, html, data) => {
    if (game.settings.get('od6s', 'hide-gm-rolls') && data.whisperTo !== '') {
        if (game.user.isGM === false &&
            game.userId !== data.author.id &&
            data.message.whisper.indexOf(game.user.id) === -1) {
            msg.sound = null;
            html.style.display = 'none';
        }
    }
})

Hooks.on("preDeleteChatMessage", async (message, data, diff, id) => {
    if(message.getFlag('od6s','isExplosive') && game.user.isGM) {
        // Delete the template and clear the flag from the item
        let actor;
        if (message.speaker.token !== '') {
            actor = game.scenes.get(message.speaker.scene).tokens.get(message.speaker.token).object.actor;
        } else {
            actor = game.actors.get(message.speaker.actor);
        }
        const item = actor.items.find(i => i.id === message.getFlag('od6s', 'itemId'));
        const template = await canvas.scene.getEmbeddedDocument('MeasuredTemplate', item.getFlag('od6s', 'explosiveTemplate'));
        if (typeof (template) !== 'undefined') {
            await canvas.scene.deleteEmbeddedDocuments('MeasuredTemplate', [item.getFlag('od6s', 'explosiveTemplate')]);
        }
        await item.unsetFlag('od6s', 'explosiveSet');
        await item.unsetFlag('od6s', 'explosiveTemplate');
        await item.unsetFlag('od6s', 'explosiveOrigin');
        await item.unsetFlag('od6s', 'explosiveRange');
        await od6sutilities.wait(100);
    }
})

// Handles explosive attack resolution: when the GM sets success/failure on an
// explosive roll message, the template either scatters (miss) or snaps back to
// its original position (hit), then targets are recalculated for the new position.
Hooks.on("updateChatMessage", async (message, data, diff, id) => {
    // Un-hide messages that are no longer blind
    if (data.blind === false) {
        const messageLi = document.querySelector(`.message[data-message-id="${data._id}"]`);
        if (messageLi) messageLi.style.display = '';
    }

    if (message.getFlag('od6s','isExplosive') && typeof(data.flags?.od6s?.success) !== 'undefined') {
        if(game.user.isGM) {
            let newTargets = message.getFlag('od6s','targets');

                const messageData = od6sutilities.getTemplateFromMessage(message);
                const actor = messageData.actor;
                const item = messageData.item;
                const template = messageData.template;

                let updateTargets = false;

                if (!data.flags.od6s.success && OD6S.autoExplosive) {
                    // Miss: scatter the template randomly based on range
                    if (message.getFlag('od6s', 'isExplosive')) {
                        await od6sutilities.scatterExplosive(message.getFlag('od6s', 'range'), item.getFlag('od6s', 'explosiveOrigin'), template.id);
                        await od6sutilities.wait(100);
                        updateTargets = true;
                    }
                }

                if (data.flags.od6s.success) {
                    // Hit: restore template to its original aimed position
                    const update = {
                        x: template.getFlag('od6s', 'originalX'),
                        y: template.getFlag('od6s', 'originalY')
                    }
                    await template.update(update);
                    await od6sutilities.wait(100);
                    await template.render();
                    updateTargets = true;
                }

                if (updateTargets) {
                    newTargets = await od6sutilities.getExplosiveTargets(actor, item.id);
                    if (Object.keys(newTargets).length === 0) {
                        await message.setFlag('od6s','showButton', false);
                    } else {
                        await message.setFlag('od6s','showButton',true);
                    }
                    await message.unsetFlag('od6s','targets');
                    await message.setFlag('od6s', 'targets', newTargets);
                }

        }
    }

    await promptResistanceRolls(message);
});

// Chat log event delegation. All interactive chat message buttons (damage, difficulty,
// wild die handling, opposed rolls, etc.) are wired up here via event delegation on the
// chat log container, rather than per-message listeners.
Hooks.on('renderChatLog', (log, html, data) => {
    // Native DOM event delegation helper -- replaces jQuery html.on(event, selector, handler)
    function _delegate(eventType, selector, handler) {
        html.addEventListener(eventType, (ev) => {
            const target = ev.target.closest(selector);
            if (!target || !html.contains(target)) return;
            handler(ev, target);
        });
    }

    _delegate('input', ".explosive-damage", async (ev, el) => {
        const message = await game.messages.get(el.dataset.messageId);
        const targets = message.getFlag('od6s','targets');
        targets[el.dataset.target].damage = ev.target.value;
        await message.setFlag('od6s','targets',targets);
    })

    _delegate("click", ".modifiers-button", async (ev, el) => {
        const content = document.getElementById("modifiers-display-" + el.dataset.messageId);
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
        game.messages.get(el.dataset.messageId).render();
    })

    _delegate("click", ".damage-modifiers-button", async (ev, el) => {
        const content = document.getElementById("damage-modifiers-display-" + el.dataset.messageId);
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
        game.messages.get(el.dataset.messageId).render();
    })

    // Apply damage from a chat message to a target token. Handles three damage paths:
    // 1. Stun damage: applies stun counters and status effects (unconscious/-1D/-2D)
    // 2. Wound-level system (bodypoints=0): delegates to applyWounds/applyDamage
    // 3. Body-points system: subtracts numeric HP, optionally deriving wound level
    _delegate("click", ".apply-damage-button", async (ev, el) => {
        ev.preventDefault();
        const token = game.scenes.active.tokens.get(el.dataset.tokenId);
        let actor;
        if(typeof(token) === 'undefined' && token !== null) {
            actor = game.scenes.active.tokens.get(el.dataset.tokenId).actor;
        } else {
            actor = token?.actor;
        }
        const result = el.dataset.result;
        const isVehicle = el.dataset.isVehicle;
        const messageId = el.dataset.messageId;
        const update = {};
        const stun = el.dataset.stun;
        const msg = game.messages.get(messageId);
        const stunEffect = msg.getFlag('od6s', 'stunEffect');

        if ((actor.type !== 'vehicle' && actor.type !== 'starship') && (isVehicle === true || isVehicle === 'true')) {
            actor = await od6sutilities.getActorFromUuid(actor.system.vehicle.uuid);
        }

        if (od6sutilities.boolCheck(stun)) {
            if (stunEffect === 'unconscious') {
                if (game.settings.get('od6s', 'auto_status')) {
                    await token.object.toggleEffect(CONFIG.statusEffects.find(e => e.id === 'unconscious', {
                        overlay: false,
                        active: true
                    }));
                }
            } else {
                if (stunEffect === '-1D') {
                    const update = {}
                    update[`system.stuns.current`] = 1;
                    update[`system.stuns.rounds`] = 1;
                    update[`system.stuns.value`] = (+actor.system.stuns.value) + 1;
                    await actor.update(update);
                } else if (stunEffect === '-2D') {
                    update[`system.stuns.current`] = 2;
                    update[`system.stuns.rounds`] = 1;
                    update[`system.stuns.value`] = (+actor.system.stuns.value) + 1;
                    await actor.update(update);
                }
                if(!actor.effects.contents.find(
                    i => i.name === game.i18n.localize(CONFIG.statusEffects.find(
                        e => e.id === 'stunned').name))) {
                    await token.object.toggleEffect(CONFIG.statusEffects.find(e => e.id === 'stunned', {
                        overlay: false,
                        active: true
                    }));
                }
            }

        } else {
            update.id = actor.id;
            if (game.settings.get('od6s', 'bodypoints') === 0 || (isVehicle === true || isVehicle === 'true')
                || actor.type === 'starship' || actor.type === 'vehicle') {
                if (isVehicle === true || isVehicle === 'true') {
                    await actor.applyDamage(result);
                } else {
                    await actor.applyWounds(result);
                }
            } else {
                let bp = actor.system.wounds.body_points.current - result;
                if (bp < 0) bp = 0;
                update['system.wounds.body_points.current'] = bp;
                if (game.settings.get('od6s', 'bodypoints') === 1) await actor.setWoundLevelFromBodyPoints(bp);
            }
            await actor.update(update);
        }
        await actor.update(update);
        await msg.setFlag('od6s', 'applied', true);
    })

    _delegate("click", ".explosive-damage-button", async (ev, el) => {
        ev.preventDefault();
        await od6sutilities.detonateExplosive(el.dataset);
    })

    _delegate('click', '.remove-template-button', async (ev, el) => {
        const message = await game.messages.get(el.dataset.messageId);
        const actor = message.speaker.token === null ?
            game.actors.get(message.speaker.actor) : game.scenes.active.tokens.get(message.speaker.token).actor;
        const item = actor.items.get(message.getFlag('od6s','itemId'));
        const template = canvas.scene.getEmbeddedDocument('MeasuredTemplate', item.getFlag('od6s','explosiveTemplate'));
        await template.setFlag('od6s','handled', true);
        await message.setFlag('od6s','handled', true);
        await canvas.scene.deleteEmbeddedDocuments('MeasuredTemplate', [template.id]);
        message.setFlag('od6s', 'applied', true);
    })

    // Roll damage dice from a chat message button. Builds a roll string from damage dice/pips,
    // substituting one die for a wild die if enabled. Scale bonuses are added as flat modifiers
    // unless the "dice_for_scale" setting converts them to extra dice instead.
    _delegate("click", ".damage-button", async (ev, el) => {
        ev.preventDefault();
        const data = el.dataset;
        const dice = {};
        dice.dice = data.damageDice;
        dice.pips = data.damagePips;
        let rollString;
        let itemId = '';

        if (typeof (data?.itemId) !== 'undefined' && data.itemId !== '') {
            itemId = data.itemId;
        }

        if (game.settings.get('od6s', 'use_wild_die')) {
            dice.dice = dice.dice - 1;
            if (dice.dice < 1) {
                rollString = "+1dw" + game.i18n.localize("OD6S.WILD_DIE_FLAVOR");
            } else {
                rollString = dice.dice + "d6" + game.i18n.localize('OD6S.BASE_DIE_FLAVOR') + "+1dw" +
                    game.i18n.localize("OD6S.WILD_DIE_FLAVOR");
            }
        } else {
            rollString = dice.dice + "d6" + game.i18n.localize('OD6S.BASE_DIE_FLAVOR');
        }
        dice.pips ? rollString += "+" + dice.pips : null;
        if (!game.settings.get('od6s', 'dice_for_scale')) {
            if (data.damagescalebonus > 0) rollString += "+" + Math.abs(data.damagescalebonus);
            if (data.damagescalebonus < 0) rollString += "-" + Math.abs(data.damagescalebonus);
        }

        const roll = await new Roll(rollString).evaluate();

        let label = game.i18n.localize('OD6S.DAMAGE') + " (" +
            game.i18n.localize(OD6S.damageTypes[data.damagetype]) + ")";

        if (typeof (data.source) !== 'undefined' && data.source !== '') {
            label = label + " " + game.i18n.localize('OD6S.FROM') + " " +
                game.i18n.localize(data.source);
        }

        if (typeof (data.vehicle) !== 'undefined' && data.vehicle !== '') {
            const vehicle = await od6sutilities.getActorFromUuid(data.vehicle);
            label = label + " " + game.i18n.localize('OD6S.BY') + " " + vehicle.name;
        }

        if (typeof (data.targetname) !== 'undefined' && data.targetname !== '') {
            label = label + " " + game.i18n.localize('OD6S.TO') + " " + data.targetname;
        }

        data.collision = (data.collision === 'true');

        const flags = {
            "type": "damage",
            "source": data.source,
            "damageType": data.damagetype,
            "targetName": data.targetname,
            "targetId": data.targetid,
            "attackMessage": data.messageId,
            "isOpposable": true,
            "wild": false,
            "wildHandled": false,
            "wildResult": OD6S.wildDieResult[OD6S.wildDieOneDefault],
            "total": roll.total,
            "isVehicleCollision": data.collision,
            "stun": data.stun,
            "itemId": itemId
        }

        if (game.settings.get('od6s', 'use_wild_die')) {
            const WildDie = roll.terms.find(d => game.i18n.localize("OD6S.WILD_DIE_FLAVOR").includes(d.flavor))
            if (WildDie.total === 1) {
                flags.wild = true;
                if (OD6S.wildDieOneDefault > 0 && OD6S.wildDieOneAuto === 0) {
                    flags.wildHandled = true;
                }
            } else {
                flags.wild = false;
            }
        }

        let rollMode = 'roll';
        if (game.user.isGM && game.settings.get('od6s', 'hide-gm-rolls')) rollMode = CONST.DICE_ROLL_MODES.PRIVATE;

        const rollMessage = await roll.toMessage({
            speaker: ChatMessage.getSpeaker({actor: game.actors.find(a => a.id === data.actor)}),
            flavor: label,
            flags: {
                od6s: flags
            },
            rollMode: rollMode, create: true
        });

        // Wild die penalty (wildDieOneDefault=2): when the wild die rolls 1, find the highest
        // normal die and discard it, reducing the total. This is the "remove highest" penalty
        // variant. Non-GM players emit a socket message since they can't update others' rolls.
        if (flags.wild === true && OD6S.wildDieOneDefault === 2 && OD6S.wildDieOneAuto === 0) {
            const replacementRoll = JSON.parse(JSON.stringify(rollMessage.rolls[0].toJSON()));
            let highest = 0;
            for (let i = 0; i < replacementRoll.terms[0].results.length; i++) {
                replacementRoll.terms[0].results[i].result >
                replacementRoll.terms[0].results[highest].result ?
                    highest = i : {}
            }
            replacementRoll.terms[0].results[highest].discarded = true;
            replacementRoll.terms[0].results[highest].active = false;
            replacementRoll.total -= (+replacementRoll.terms[0].results[highest].result);
            const rollMessageUpdate = {};
            rollMessageUpdate.system = {};
            rollMessageUpdate.content = replacementRoll.total;
            rollMessageUpdate.id = rollMessage.id;
            rollMessageUpdate.rolls = [];
            rollMessageUpdate.rolls[0] = replacementRoll;

            if (game.user.isGM) {
                if (rollMessage.getFlag('od6s', 'difficulty') && rollMessage.getFlag('od6s', 'success')) {
                    replacementRoll.total < rollMessage.getFlag('od6s', 'difficulty') ? await rollMessage.setFlag('od6s', 'success', false) :
                        await rollMessage.setFlag('od6s', 'success', true);
                }
                await rollMessage.setFlag('od6s', 'originalroll', rollMessage.rolls[0])
                await rollMessage.update(rollMessageUpdate, {"diff": true});
            } else {
                game.socket.emit('system.od6s', {
                    operation: 'updateRollMessage',
                    message: rollMessage,
                    update: rollMessageUpdate
                })
            }
        }
    })

    _delegate("click", ".flavor-text", async (ev, el) => {
        if (!game.user.isGM) return;
        const message = game.messages.get(el.dataset.messageId);
        let actor;
        if (message.speaker.actor && message?.speaker.token) {
            actor = game.scenes.active?.tokens.get(message.speaker.token)?.actor;
            if (!actor) {
                actor = game.actors.get(message.speaker.actor);
            }
        } else {
            actor = game.actors.get(message.speaker.actor)
        }
        let item = actor?.items.find(i => i.id === message.getFlag('od6s', 'itemId'));
        if (typeof (item) === "undefined" || item === "") {
            if (typeof (actor?.system.vehicle.name) !== 'undefined') {
                const vehicleActor = await od6sutilities.getActorFromUuid(actor.system.vehicle.uuid);
                item = vehicleActor.items.find(i => i.id === message.getFlag('od6s', 'itemId'));
            }
        }
        if (typeof (item) === "undefined") return;
        item.sheet.render(true);
    })

    _delegate("click", ".select-actor", async (ev, el) => {
        if (!game.user.isGM) return;
        ev.preventDefault();
        const message = game.messages.get(el.dataset.messageId);
        let actor;
        if (message.speaker.actor && message.speaker.token) {
            actor = game.scenes.active?.tokens.get(message.speaker.token)?.actor;
        } else {
            actor = game.actors.get(message.speaker.actor)
        }
        if (actor) actor.sheet.render(true);
    })

    _delegate("click", ".edit-difficulty", async (ev, el) => {
        const data = {};
        data.messageId = el.dataset.messageId;
        const message = game.messages.get(data.messageId);
        data.baseDifficulty = message.getFlag('od6s', 'baseDifficulty');
        data.modifiers = message.getFlag('od6s', 'modifiers');
        new OD6SEditDifficulty(data).render({force: true});
    })

    _delegate("click", ".edit-damage", async (ev, el) => {
        ev.preventDefault();
        const data = {};
        data.messageId = el.dataset.messageId;
        const message = game.messages.get(data.messageId);
        data.damage = message.getFlag('od6s', 'damageScore');
        data.damageDice = message.getFlag('od6s', 'damageDice');
        new OD6SEditDamage(data).render({force: true});
    })

    _delegate("click", ".choose-target", async (ev, el) => {
        ev.preventDefault();
        const data = {};
        data.targets = [];
        data.messageId = el.dataset.messageId;
        const message = game.messages.get(data.messageId);

        if (game.user.isGM) {
            data.isExplosive = message.getFlag('od6s','isExplosive');
            if (game.combat) {
                for (const t of game.combat.combatants) {
                    const target = {
                        "id": t.token.id,
                        "name": t.token.name
                    }
                    data.targets.push(target);
                }
            } else {
                data.targets = game.scenes.active.tokens;
            }
        } else {
            return;
        }
        new OD6SChooseTarget(data).render({force: true});
    })

    _delegate("change", ".explosive-target-zone", async (ev, el) => {
        const message = game.messages.get(el.dataset.messageId);
        const targets = Array.from(message.getFlag('od6s','targets'));
        for (const t in targets) {
            if(el.dataset.targetId === targets[t].id) {
                targets[t].zone = parseInt(ev.target.value);
            }
        }
        await message.setFlag('od6s','targets', targets);
    })

    _delegate("click", ".message-sender", async (ev, el) => {
        ev.preventDefault();
        const message = await game.messages.get(el.dataset.messageId);
        if (message.speaker?.token !== null && message.speaker?.token !== "") {
            const scene = game.scenes.get(message.speaker.scene);
            const token = scene.tokens.get(message.speaker.token);
            if (typeof (token) !== "undefined" && typeof (token.actor) !== "undefined" && token.actor !== null) {
                if (game.user.isGM || token.actor.isOwner) {
                    token.actor.sheet.render(true)
                }
            }
        }
    })

    _delegate("click", ".wilddiegm", async (ev, el) => {
        ev.preventDefault();
        new OD6SHandleWildDieForm(ev).render({force: true});
    })

    _delegate("click", ".message-reveal", async (ev, el) => {
        const message = game.messages.get(el.dataset.messageId);
        await message.setFlag('od6s', 'isVisible', true);
        await message.setFlag('od6s', 'isKnown', true);
        if(message.getFlag('od6s','isExplosive') && game.settings.get('od6s','auto_explosive')) {
            const template = od6sutilities.getTemplateFromMessage(message).template;
            if(template !== 'undefined') {
                const owner = game.users.get(template.getFlag('od6s', 'originalOwner'))
                await template.update({
                    hidden: false,
                    user: owner
                })
            }
        }
    })

    // Opposed roll pairing: the first click queues the attacker's message,
    // the second click provides the defender's message and triggers resolution.
    _delegate("click", ".message-oppose", async (ev, el) => {
        ev.preventDefault();
        const data = {};
        data.messageId = el.dataset.messageId;
        data.target = el.dataset?.target;

        if (OD6S.opposed.length > 0) {
            OD6S.opposed.push(data);
            return od6sutilities.handleOpposedRoll(data);
        } else {
            OD6S.opposed.push(data);
        }
    })

    // GM difficulty selector: sets the target number on a roll message and recalculates
    // success/failure. For purchase rolls, a success immediately triggers the item transfer.
    _delegate("change", ".choose-difficulty", async (ev, el) => {
        ev.preventDefault();
        const message = game.messages.get(el.dataset.messageId);
        const flags = {
            difficultyLevel: el.value,
            difficulty: await od6sutilities.getDifficultyFromLevel(el.value)
        }

        const update = {};
        update.flags = {};
        update.flags.od6s = flags;
        update.id = message.id;
        update._id = message.id;

        if (message.getFlag('od6s', 'total') < flags.difficulty) {
            flags.success = false;
        } else {
            flags.success = true;
        }

        if (message.getFlag('od6s', 'subtype') === 'purchase' && message.getFlag('od6s', 'success')) {
            const seller = game.actors.get(message.getFlag('od6s', 'seller'));
            await seller.sheet._onPurchase(message.getFlag('od6s', 'purchasedItem'), message.speaker.actor);
        }

        await message.update(update, {"diff": true});
    })
})

// Custom dice for DiceSoNice
Hooks.on('diceSoNiceReady', (dice3d) => {
    dice3d.addSystem({id: 'od6s', name: "OpenD6 Space"}, "default")
    dice3d.addDicePreset({
        type: "dw",
        labels: [game.settings.get('od6s', 'wild_die_one_face'), "2", "3", "4", "5", game.settings.get('od6s', 'wild_die_six_face')],
        colorset: "white",
        values: {min: 1, max: 6},
        system: "od6s"
    }, "dw")
    dice3d.addDicePreset({
        type: "db",
        labels: ["1", "2", "3", "4", "5", "6"],
        colorset: "black",
        values: {min: 1, max: 6},
        system: "od6s"
    }, "db")
})

Hooks.on('diceSoNiceRollStart', (messageId, context) => {
    const message = game.messages.get(messageId);
    if (message.getFlag('od6s','isExplosive') && message.getFlag('od6s','triggered')) {
        context.blind=true;
    }
    const roll = context.roll;
    let die;
    const len = roll.dice.length;
    // Customize colors for Dice So Nice
    for (die = 0; die < len; die++) {
        switch (roll.dice[die].options.flavor) {
            case game.i18n.localize("OD6S.WILD_DIE_FLAVOR").includes(roll.dice[die].options.flavor):
                roll.dice[die].options.colorset = "white";
                break;
            case "CP":
                roll.dice[die].options.colorset = "black";
                break;
            case "Bonus":
                roll.dice[die].options.colorset = "black";
                break;
            default:
                break;
        }
    }
})

Hooks.on('renderChatMessageHTML', (message, html, data) => {
    ui.chat.scrollBottom();
})

Hooks.on('updateActiveEffect', async (effect) => {
    await od6sutilities.handleEffectChange(effect);
})

Hooks.on('deleteActiveEffect', async (effect) => {
    if(effect.statuses.has('stunned')) {
        const update = {};
        update.system = {};
        update.system.stuns = {};
        update.system.stuns.current = 0;
        //update.system.stuns.value = effect.target.system.stuns.value ? effect.target.system.stuns.value - 1 : 0;
        await effect.target.update(update);
    }
    await od6sutilities.handleEffectChange(effect);
})

// On scene load, re-sync vehicle data to all crew members so their sheets
// reflect the current vehicle state (shields, weapons, maneuverability, etc.)
Hooks.on("canvasReady", async () => {
    if (game.user.isGM) {
        if (typeof (game.scenes.active && game.scenes.active.tokens.size > 0) !== 'undefined') {
            for (const t in game.scenes.active.tokens) {
                if (['starship','vehicle'].includes(game.scenes?.active.tokens[t].type)) {
                    await game.scenes?.active.tokens[t].sendVehicleData();
                }
            }
        }
    }
})

Hooks.on("getOD6SChatLogEntryContext", async (html, options) => {
    await OD6SChat.chatContextMenu(html, options);
})

// Sync stun state with wound level changes (wound-level mode only):
// - Wound increasing to "stunned" level: increment stun counter and set 1-round duration
// - Wound decreasing back to healthy: clear all stun state
Hooks.on("preUpdateActor", async (document, change, options, userId) => {
    if (change.system?.wounds && change.system.wounds.value > document.system.wounds.value) {
        if (game.settings.get('od6s', 'bodypoints') === 0) {
            const status = OD6S.woundsId[od6sutilities.getWoundLevel(change.system.wounds.value, document)];
            if (status === 'stunned') {
                change.system.stuns = {};
                change.system.stuns.value = document.system.stuns.value + 1;
                document.system.stuns.current < 1 ? change.system.stuns.current = 1 : change.system.stuns.current = document.system.stuns.current;
                change.system.stuns.rounds = 1;
            } else {
                if (document.system.stuns.current < 1) {
                    change.system.stuns = {};
                    change.system.stuns.current = 0;
                    change.system.stuns.rounds = 0;
                }
            }
        }
  } else if (change.system?.wounds && change.system.wounds.value < document.system.wounds.value) {
        const status = OD6S.woundsId[od6sutilities.getWoundLevel(change.system.wounds.value, document)];
        if (status === 'healthy') {
            change.system.stuns = {};
            change.system.stuns.value = 0;
            change.system.stuns.rounds = 0;
        }
    }
})

// Post-update actor hook: syncs vehicle data to crew, checks stun thresholds,
// and manages auto-status effects based on wound level changes.
Hooks.on("updateActor", async (document, change, options, userId) => {
    // Vehicle/starship data must propagate to all crew members after any update
    if ((document.type === "vehicle" || document.type === "starship") && document.system.crewmembers.length > 0) {
        await document.sendVehicleData();
    }

    // Stun tracking: if total stuns >= Strength dice, actor goes unconscious.
    // A 2d6 roll determines how many rounds they stay down.
    if(change.system?.stuns?.value) {
        if(game.settings.get('od6s','track_stuns')) {
            if (game.user.isGM) {
                if (document.system.stuns.value >= od6sutilities.getDiceFromScore(document.system.attributes.str.score).dice) {
                    const roll = await new Roll("2d6").evaluate();
                    const flavor = document.name +
                        game.i18n.localize('OD6S.CHAT_UNCONSCIOUS_01') +
                        roll.total +
                        game.i18n.localize('OD6S.CHAT_UNCONSCIOUS_02');
                    await roll.toMessage({flavor: flavor});

                    let tokens;
                    tokens ??= document.getActiveTokens(true, false);
                    for (const token of tokens) {
                        await token.toggleEffect(CONFIG.statusEffects.find(e => e.id === 'unconscious', {
                            overlay: false,
                            active: true
                        }));
                    }
                }
            }
        }
    }

    // Auto-status: when wound level changes, remove all wound status effects then
    // apply only the current one. Handles player-owned and GM-owned actors separately
    // since only the GM can toggle effects on NPC tokens.
    if (change.system?.wounds?.value) {
        if(game.settings.get('od6s','auto_status')) {
            const status = OD6S.woundsId[od6sutilities.getWoundLevel(change.system.wounds.value, document)];
            if ((document.hasPlayerOwner && document.isOwner)) {
                let tokens;
                tokens ??= document.getActiveTokens(true, false);

                // Clear all wound-related status effects first
                for (const s in OD6S.woundsId) {
                    const id = OD6S.woundsId[s]
                    if (id === 'healthy') continue;
                    const statusEffect = CONFIG.statusEffects.find(e => e.id === id)
                    if (game.user.isGM) {
                        for (const token of tokens) {
                            await token.toggleEffect(statusEffect, {
                                overlay: false,
                                active: false
                            });
                        }
                    }
                }

                // Apply the current wound level's status effect
                for (const token of tokens) {
                    if (status === 'healthy') continue;
                    if (game.user.isGM) {
                        await token.toggleEffect(CONFIG.statusEffects.find(e => e.id === status, {
                            overlay: false,
                            active: true
                        }));
                    }
                }

                if (status === 'healthy') {
                    await document.unsetFlag('od6s', 'mortally_wounded');
                } else if (status === 'stunned') {
                    // Apply stunned flag
                    if (document.getFlag('od6s', 'mortally_wounded') !== 'undefined') {
                        await document.unsetFlag('od6s', 'mortally_wounded');
                    }
                } else if (status === 'wounded') {
                    if (document.getFlag('od6s', 'mortally_wounded') !== 'undefined') {
                        await document.unsetFlag('od6s', 'mortally_wounded');
                    }
                } else if (status === 'severely_wounded') {
                    if (document.getFlag('od6s', 'mortally_wounded') !== 'undefined') {
                        await document.unsetFlag('od6s', 'mortally_wounded');
                    }
                } else if (status === 'incapacitated') {
                    if (document.getFlag('od6s', 'mortally_wounded') !== 'undefined') {
                        await document.unsetFlag('od6s', 'mortally_wounded');
                    }

                    if (game.settings.get('od6s', 'auto_incapacitated')) {
                        const rollData = {
                            name: game.i18n.localize('OD6S.RESIST_INCAPACITATED'),
                            actor: document,
                            score: document.system.attributes.str.score,
                            type: 'incapacitated',
                            difficultylevel: 'OD6S.DIFFICULTY_MODERATE'
                        }
                        await od6sroll._onRollDialog(rollData);
                    } else {
                        await document.applyIncapacitatedFailure();
                    }
                } else if (status === 'mortally_wounded') {
                    await document.setFlag('od6s', 'mortally_wounded', 0)
                }


            } else if (!document.hasPlayerOwner && game.user.isGM) {
                let tokens;
                tokens ??= document.getActiveTokens(true, false);
                for (const s in OD6S.woundsId) {
                    const id = OD6S.woundsId[s]
                    if (id === 'healthy') continue;
                    const statusEffect = CONFIG.statusEffects.find(e => e.id === id)
                    for (const token of tokens) {
                        await token.toggleEffect(statusEffect, {
                            overlay: false,
                            active: false
                        });
                    }
                }

                for (const token of tokens) {
                    if (status === 'healthy') continue;
                    await token.toggleEffect(CONFIG.statusEffects.find(e => e.id === status, {
                        overlay: false,
                        active: true
                    }));
                }

                for (const token of tokens) {
                    if (status === 'stunned') {
                        // Apply stunned flag
                        if (token.actor.getFlag('od6s', 'mortally_wounded') !== 'undefined') {
                            await token.actor.unsetFlag('od6s', 'mortally_wounded');
                        }
                    } else if (status === 'wounded') {
                        if (token.actor.getFlag('od6s', 'mortally_wounded') !== 'undefined') {
                            await token.actor.unsetFlag('od6s', 'mortally_wounded');
                        }
                    } else if (status === 'severely_wounded') {
                        if (token.actor.getFlag('od6s', 'mortally_wounded') !== 'undefined') {
                            await token.actor.unsetFlag('od6s', 'mortally_wounded');
                        }
                    } else if (status === 'incapacitated') {
                        if (token.actor.getFlag('od6s', 'mortally_wounded') !== 'undefined') {
                            await token.actor.unsetFlag('od6s', 'mortally_wounded');
                        }

                        const rollData = {
                            name: game.i18n.localize('OD6S.RESIST_INCAPACITATED'),
                            actor: token.actor,
                            score: token.actor.system.attributes.str.score,
                            type: 'incapacitated',
                            difficultylevel: 'OD6S.DIFFICULTY_MODERATE'
                        }
                        await od6sroll._onRollDialog(rollData);
                    } else if (status === 'mortally_wounded') {
                        await token.actor.setFlag('od6s', 'mortally_wounded', 1)
                    }
                }
            }
        }
    }
})

Hooks.on("updateToken", async (document, change, options, userId) => {
    if ((document.type === "vehicle" || document.type === "starship")
        && document.system.crewmembers.length > 0 && !document.system?.embedded_pilot) {
        await document.sendVehicleData();
    }
})

Hooks.on('i18nInit', () => {
    game.i18n.translations.ITEM.TypeManifestation = OD6S.manifestationName;
})

Hooks.on("preDeleteToken", async (document, change, options, userId) => {
    if (document.actor.type === 'vehicle' || document.actor.type === 'starship') {
        if (document.actor.system.crew.value > 0) {
            for (let i = 0; i < document.actor.system.crewmembers.length; i++) {
                const crewMember = await od6sutilities.getActorFromUuid(document.actor.system.crewmembers[i].uuid);
                if (crewMember) {
                    try {
                        crewMember.removeFromCrew(document.actor.uuid);
                    } catch {
                        // Likely the other token was simultaneously deleted
                    }
                }
            }
        }
    } else {
        if (document.actor.getFlag('od6s', 'crew') !== '') {
            const vehicle = await od6sutilities.getActorFromUuid(document.actor.getFlag('od6s', 'crew'));
            if (vehicle) {
                try {
                    await vehicle.forceRemoveCrewmember(document.actor.uuid);
                } catch {
                    // Likely the other token was simultaneously deleted
                }
            }
        }
    }
})

Hooks.on("renderActorSheet", async (sheet) => {
    if ((sheet.actor.type === "vehicle" || sheet.actor.type === "starship") && sheet.actor.system.crewmembers.length > 0) {
        await sheet.actor.sendVehicleData();
    }
})

// Prevent containers and uncrewed vehicles from being added to the combat tracker.
// Vehicles with embedded pilots are allowed since they roll their own initiative.
Hooks.on("preCreateCombatant", (combatant) => {
    if (combatant.actor.type === "container") return false;
    if ((combatant.actor.type === "vehicle" || combatant.actor.type === "starship") &&
        !combatant.actor.system?.embedded_pilot.value) {
        return false;
    }
})

// Turn start: reset the active combatant's defensive scores (dodge/parry/block)
// and fate point effect. If the combatant is crewing a vehicle and was the one
// who set the vehicle's dodge, clear the vehicle's dodge too.
Hooks.on("updateCombat", async (Combat, data, options, userId) => {
    if (game.user.isGM && Combat.round === 1 && Combat.turn === 0 && Combat.active && OD6S.startCombat) {
        OD6S.startCombat = false;
        for (let i = 0; i < Combat.combatants.length; i++) {
            await clearActionList(Combat.combatants[i].actor);
        }
    }

    if (game.user.isGM && Combat.round !== 0 && Combat.turn === 0 && Combat.active && !OD6S.startCombat) {
        // New round placeholder
    }

    if (typeof (Combat.combatant.actor) !== 'undefined') {
        if (game.user.isGM) {

            // Reset defensive bonuses unless reaction_skills mode is on (that resets at round end instead)
            if (!game.settings.get('od6s', 'reaction_skills')) {
                const update = {};
                update.id = Combat.combatant.actor.id;
                update.system = {};
                update.system.parry = {};
                update.system.parry.score = 0;
                update.system.dodge = {};
                update.system.dodge.score = 0;
                update.system.block = {};
                update.system.block.score = 0;
                await Combat.combatant.actor.update(update, {'diff': true});

                // If this crew member set the vehicle's dodge, clear it too
                if (Combat.combatant.actor.isCrewMember()) {
                    if (Combat.combatant.actor.system.vehicle.dodge.score > 0) {
                        const vehicleId = Combat.combatant.actor.getFlag('od6s', 'crew');
                        const dodgeActor = await OD6S.socket.executeAsGM('getVehicleFlag', vehicleId, 'dodge_actor');
                        if (dodgeActor === Combat.combatant.actor.uuid) {
                            const vUpdate = {};
                            vUpdate.flags = {};
                            vUpdate.flags.od6s = {};
                            vUpdate.system = {};
                            vUpdate.system.dodge = {};
                            vUpdate.system.dodge.score = 0;
                            await OD6S.socket.executeAsGM('updateVehicle', vehicleId, vUpdate);
                            await OD6S.socket.executeAsGM('unsetVehicleFlag', vehicleId, 'dodge_actor');
                        }
                    }
                }
            }
            if (!OD6S.fatePointRound) {
                await Combat.combatant.actor.setFlag('od6s', 'fatepointeffect', false);
            }
        }
    }
})

// End-of-round processing: runs before the combat turn resets to 0.
// For each combatant: clear action lists, tick down stun durations (removing
// the stunned status when expired), reset defensive scores if using reaction_skills
// mode, clear fate point effects, and trigger mortally wounded checks.
Hooks.on("preUpdateCombat", async (Combat, data, options, userId) => {
    if (data.turn === 0) {
        if (game.user.isGM && game.settings.get('od6s', 'reroll_initiative')) {
            await OD6SInitiative._onPreUpdateCombat(Combat, data, options, userId);
        }
        if (game.user.isGM) {
            for (let i = 0; i < Combat.combatants.size; i++) {
                const combatant = Combat.combatants.contents[i].token;

                if (typeof (combatant) !== 'undefined') {
                    await clearActionList(combatant.actor);

                    const rounds = combatant.actor.system?.stuns?.rounds;
                    const update = {};
                    update.id = combatant.id;
                    update.system = {};

                    // Stun duration expired: remove the stunned AE and reset counters
                    if (rounds < 1) {
                        const effect = combatant.actor.effects.contents.find(
                            i => i.name === game.i18n.localize(CONFIG.statusEffects.find(
                                e => e.id === 'stunned').name));

                        if (typeof (effect) !== 'undefined') {
                            await combatant.actor.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);
                        }
                        update.system.stuns = {};
                        update.system.stuns.rounds = 0;
                        update.system.stuns.current = 0;
                        update.system.stuns.value = combatant.actor.system.stuns.value;
                    } else if (rounds > 0) {
                        // Decrement remaining stun rounds
                        update.system.stuns = {};
                        update.system.stuns.rounds = rounds - 1;
                    }

                    // reaction_skills mode: defensive scores reset at round end instead of turn start
                    if (game.settings.get('od6s', 'reaction_skills')) {
                        update.system.parry = {};
                        update.system.parry.score = 0;
                        update.system.dodge = {};
                        update.system.dodge.score = 0;
                        update.system.block = {};
                        update.system.block.score = 0;

                        if (combatant.actor.isCrewMember()) {
                            const vUpdate = {};
                            vUpdate.system = {};
                            vUpdate.system.dodge = {};
                            vUpdate.system.dodge.score = 0;
                            const vehicleId = combatant.actor.getFlag('od6s', 'crew');
                            const vehicle = await od6sutilities.getActorFromUuid(vehicleId);
                            if (typeof vehicle !== 'undefined') {
                                await vehicle.update(vUpdate);
                            }
                        }
                    }
                    await combatant.actor.update(update, {'diff': true});
                    if (OD6S.fatePointRound) {
                        await combatant.actor.setFlag('od6s', 'fatepointeffect', false);
                    }

                    // Mortally wounded actors must roll each round to survive.
                    // Player-owned actors have the roll triggered via socket on their client.
                    if (game.settings.get('od6s', 'auto_mortally_wounded')) {
                        if (combatant.actor.getFlag('od6s', 'mortally_wounded') !== undefined) {
                            await combatant.actor.setFlag('od6s', 'mortally_wounded',
                                combatant.actor.getFlag('od6s', 'mortally_wounded') + 1);
                            if(combatant.hasPlayerOwner) {
                                OD6S.socket.executeForOthers("triggerRoll", 'mortally_wounded', combatant.uuid);
                            } else {
                                combatant.actor.triggerMortallyWoundedCheck();
                            }
                        }
                    }
                }
            }
        }
    }
})

Hooks.on("deleteCombat", async function (Combat) {
    // Combat is over, clear all combatant action lists
    for (let i = 0; i < Combat.combatants.size; i++) {
        const combatant = Combat.combatants.contents[i].actor;
        if (typeof (combatant) !== 'undefined') {
            await clearActionList(combatant)
            const update = {};
            update.id = combatant.id;
            update.system = {};
            update.system.parry = {};
            update.system.parry.score = 0;
            update.system.dodge = {};
            update.system.dodge.score = 0;
            update.system.block = {};
            update.system.block.score = 0;
            await combatant.update(update, {'diff': true});
            await combatant.setFlag('od6s', 'fatepointeffect', false);
        }
    }
})

// Auto-opposed roll handling: when a damage/resistance/explosive message is created
// and autoOpposed is enabled, automatically generate the opposing roll. For explosives,
// each target in the blast area gets an individual opposed roll, processed sequentially
// to avoid race conditions with the OD6S.opposed queue.
Hooks.on('createChatMessage', async function (msg) {

    if (game.user.isGM) {
        if (msg.getFlag('od6s', 'isOpposable') && OD6S.autoOpposed) {
            if ((msg.getFlag('od6s', 'type') === 'damage') ||
                msg.getFlag('od6s', 'type') === 'resistance') {
                await od6sutilities.waitFor3DDiceMessage(msg.id);
                await od6sutilities.autoOpposeRoll(msg);
            } else if (msg.getFlag('od6s', 'type') === 'explosive') {
                const targets = msg.getFlag('od6s', 'targets');
                for (const target in targets) {
                    // Wait for previous opposed roll to complete before starting the next
                    while (OD6S.opposed.length > 0) {
                        await new Promise(r => setTimeout(r, 100));
                    }
                    OD6S.opposed[0] = {
                        messageId: msg.id
                    };
                    const token = await game.scenes.active.tokens.get(targets[target].id);
                    if (typeof (token) !== 'undefined') {
                        await od6sutilities.generateOpposedRoll(token, msg);
                    }
                }

                // Delete the template and clear the flag from the item
                let actor;
                if (msg.speaker.token !== null && msg.speaker.token !== '') {
                    actor = game.scenes.get(msg.speaker.scene).tokens.get(msg.speaker.token).object.actor;
                } else {
                    actor = game.actors.get(msg.speaker.actor);
                }
                const item = actor.items.find(i => i.id === msg.getFlag('od6s', 'item'));

                await item.unsetFlag('od6s', 'explosiveSet');
                await item.unsetFlag('od6s', 'explosiveTemplate');
                await item.unsetFlag('od6s', 'explosiveOrigin');
                await item.unsetFlag('od6s', 'explosiveRange');
                await od6sutilities.wait(100);

                const template = await canvas.scene.getEmbeddedDocument('MeasuredTemplate', msg.getFlag('od6s', 'template'));
                if (typeof (template) !== "undefined") {
                    await template.setFlag('od6s', 'handled', true);
                    await canvas.scene.deleteEmbeddedDocuments('MeasuredTemplate', [template.id])
                }
            }

            let target;
            if (msg.getFlag('od6s', 'target')) {
                target = await od6sutilities.getActorFromUuid(msg.getFlag('od6s', 'targetId'))
            }
            if (msg.getFlag('od6s', 'isOpposable') && OD6S.autoOpposed && !target?.hasPlayerOwner
                && (msg.getFlag('od6s', 'type') === 'damage') || msg.getFlag('od6s', 'type') === 'resistance') {
                await od6sutilities.waitFor3DDiceMessage(msg.id);
                await od6sutilities.autoOpposeRoll(msg);
            }
        }
    }

    await promptResistanceRolls(msg);
})

/**
 * Clear an actor's action list
 * @param actor
 * @returns {Promise<void>}
 */
async function clearActionList(actor) {
    if (actor !== null) {
        const actions = actor.itemTypes.action;
        for (let i = 0; i < actions.length; i++) {
            await actor.deleteEmbeddedDocuments('Item', [actions[i].id]);
        }
    }
}

/* -------------------------------------------- */
/*  Hotbar Macros                               */

/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
export async function createOD6SMacro(data, slot) {

    if (data.type !== "Item" || data.type !== 'availableaction') return;
    if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.'))return ui.notifications.warn(game.i18n.localize('OD6S.WARN_NOT_OWNED'));
    const item = await Item.fromDropData(data);

    // Filter out certain item types
    if (item.type === '' ||
        item.type === 'charactertemplate' ||
        item.type === 'action' ||
        item.type === 'disadvantage' ||
        item.type === 'advantage' ||
        item.type === 'armor' ||
        item.type === 'gear' ||
        item.type === 'cybernetic' ||
        item.type === 'vehicle' ||
        item.type === 'base') {
        return ui.notifications.warn(game.i18n.localize('OD6S.WARN_INVALID_MACRO_ITEM'));
    }

    // Create the macro command
    const command = `game.od6s.rollItemMacro("${item._id}");`;
    let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
    if (!macro) {
        macro = await Macro.create({
            name: item.name,
            type: "script",
            img: item.img,
            command: command,
            flags: {"od6s.itemMacro": true}
        });
    }
    await game.user.assignHotbarMacro(macro, slot);
    return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemId
 * @return {Promise}
 */
export function rollItemMacro(itemId) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.scenes.active?.tokens.get(speaker.token)?.actor;
    if (!actor) actor = game.actors.get(speaker.actor);
    const item = actor ? actor.items.find(i => i.id === itemId) : null;
    if (!item) return ui.notifications.warn(game.i18n.localize('OD6S.WARN_NO_ITEM_ID') + " " + itemId);

    // Trigger the item roll
    return item.roll();
}

/**
 * Roll a Macro from an Item name.
 * @param {string} itemId
 * @return {Promise}
 */
export function rollItemNameMacro(name) {
    name = game.i18n.localize(name);
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.scenes.active?.tokens.get(speaker.token)?.actor;
    if (!actor) actor = game.actors.get(speaker.actor);
    const item = actor ? actor.items.find(i => i.name === name) : null;
    if (!item) return ui.notifications.warn(game.i18n.localize('OD6S.WARN_NO_ITEM_NAME') + " " + name);

    // Trigger the item roll
    return item.roll();
}

/**
 * Return either the customized or translated name of an attribute
 * @param attribute
 * @returns {string}
 */
export function getAttributeName(attribute) {
    attribute = attribute.toLowerCase();
    if (typeof (OD6S.attributes[attribute]) === "undefined") {
        const warnString = game.i18n.localize('OD6S.ERROR_ATTRIBUTE_KEY') + ": " + attribute;
        ui.notifications.warn(warnString);
    } else {
        return game.i18n.localize(OD6S.attributes[attribute].name);
    }
}

/**
 * Return either the customized or translated short name of an attribute
 * @param attribute
 * @returns {string}
 */
export function getAttributeShortName(attribute) {
    attribute = attribute.toLowerCase();
    return OD6S.attributes[attribute].shortName;
}

async function simpleRoll() {
    const html = await renderTemplate("systems/od6s/templates/simpleRoll.html",
        {"wilddie": true, "dice": 1, "pips": 0});
    new Dialog({
        title: game.i18n.localize('OD6S.ROLL'),
        content: html,
        buttons: {
            roll: {
                label: game.i18n.localize('OD6S.ROLL'),
                callback: async (dlg) => {
                    let wild = false;
                    let rollString = "";
                    let rollMode = 0;
                    const dlgEl = dlg instanceof HTMLElement ? dlg : dlg[0];
                    let dice = dlgEl.querySelector("#dice").value;
                    const pips = dlgEl.querySelector("#pips").value;
                    const damageRoll = dlgEl.querySelector('#damageroll').checked;
                    const damageType = dlgEl.querySelector('#damagetype').value;
                    if (game.settings.get('od6s', 'use_wild_die')) {
                        wild = dlgEl.querySelector("#wilddie").checked;
                    } else {
                        wild = false;
                    }
                    if (wild) {
                        dice -= 1;
                        if (dice < 0) {
                            ui.notifications.warn('OD6S.NOT_ENOUGH_DICE');
                            return;
                        }
                        if (dice > 0) rollString = dice + 'd6' + game.i18n.localize('OD6S.BASE_DIE_FLAVOR');
                        rollString += '+1dw' + game.i18n.localize('OD6S.WILD_DIE_FLAVOR');
                    } else {
                        rollString = dice + 'd6' + game.i18n.localize('OD6S.BASE_DIE_FLAVOR');
                    }
                    if (pips > 0) rollString += '+' + pips;

                    let label = game.i18n.localize('OD6S.ROLLING');
                    if (damageRoll) {
                        label += " " + game.i18n.localize('OD6S.DAMAGE') + "(" +
                            game.i18n.localize(OD6S.damageTypes[damageType]) + ")";
                    }
                    const roll = await new Roll(rollString).evaluate();

                    let flags = {
                        "type": "simple",
                        "wild": false,
                        "wildHandled": false,
                        "wildResult": OD6S.wildDieResult[OD6S.wildDieOneDefault],
                    };
                    if (damageRoll) {
                        flags = {
                            "type": "damage",
                            "source": game.i18n.localize('OD6S.DAMAGE'),
                            "damageType": damageType,
                            "isOpposable": true,
                            "wild": false,
                            "wildHandled": false,
                            "wildResult": OD6S.wildDieResult[OD6S.wildDieOneDefault],
                        }
                    }

                    if (game.settings.get('od6s', 'use_wild_die')) {
                        const WildDie = roll.terms.find(d => game.i18n.localize("OD6S.WILD_DIE_FLAVOR").includes(d.flavor))
                        if (WildDie.total === 1) {
                            flags.wild = true;
                            if (OD6S.wildDieOneDefault > 0 && OD6S.wildDieOneAuto === 0) {
                                flags.wildHandled = true;
                            }
                        } else {
                            flags.wild = false;
                        }
                    }

                    if (game.user.isGM && game.settings.get('od6s', 'hide-gm-rolls')) rollMode = CONST.DICE_ROLL_MODES.PRIVATE;
                    const rollMessage = await roll.toMessage({
                        speaker: ChatMessage.getSpeaker(),
                        flavor: label,
                        flags: {
                            od6s: flags
                        },
                        rollMode: rollMode, create: true
                    });

                    // Same "remove highest" wild die penalty as the damage-button handler above
                    if (flags.wild === true && OD6S.wildDieOneDefault === 2 && OD6S.wildDieOneAuto === 0) {
                        const replacementRoll = JSON.parse(JSON.stringify(rollMessage.rolls[0].toJSON()));
                        let highest = 0;
                        for (let i = 0; i < replacementRoll.terms[0].results.length; i++) {
                            replacementRoll.terms[0].results[i].result >
                            replacementRoll.terms[0].results[highest].result ?
                                highest = i : {}
                        }
                        replacementRoll.terms[0].results[highest].discarded = true;
                        replacementRoll.terms[0].results[highest].active = false;
                        replacementRoll.total -= (+replacementRoll.terms[0].results[highest].result);
                        const rollMessageUpdate = {};
                        rollMessageUpdate.system = {};
                        rollMessageUpdate.content = replacementRoll.total;
                        rollMessageUpdate.id = rollMessage.id;
                        rollMessageUpdate.rolls = [];
                        rollMessageUpdate.rolls[0] = replacementRoll;

                        if (game.user.isGM) {
                            if (rollMessage.getFlag('od6s', 'difficulty') && rollMessage.getFlag('od6s', 'success')) {
                                replacementRoll.total < rollMessage.getFlag('od6s', 'difficulty') ? await rollMessage.setFlag('od6s', 'success', false) :
                                    await rollMessage.setFlag('od6s', 'success', true);
                            }
                            await rollMessage.setFlag('od6s', 'originalroll', rollMessage.rolls[0])
                            await rollMessage.update(rollMessageUpdate, {"diff": true});
                        } else {
                            game.socket.emit('system.od6s', {
                                operation: 'updateRollMessage',
                                message: rollMessage,
                                update: rollMessageUpdate
                            })
                        }
                    }
                }
            }
        },
        default: "roll"
    }).render(true);
}

// Custom die terms registered in CONFIG.Dice.terms. Both are d6 with the "x6"
// modifier (explode on 6). The denomination letter is used in roll formulas:
// "1dw" = wild die, "1db" = character point die. Dice So Nice uses these to
// apply distinct colorsets (white for wild, black for CP).
export class WildDie extends foundry.dice.terms.Die {
    constructor(termData) {
        termData.faces = 6;
        termData.modifiers = ["x6"];
        super(termData);
    }

    static DENOMINATION = "w";
}

export class CharacterPointDie extends foundry.dice.terms.Die {
    constructor(termData) {
        termData.faces = 6;
        termData.modifiers = ["x6"];
        super(termData);
    }
    static DENOMINATION = "b";
}

Hooks.once("socketlib.ready", () => {
    OD6S.socket = socketlib.registerSystem("od6s");
    OD6S.socket.register("checkCrewStatus", checkCrewStatus);
    OD6S.socket.register("sendVehicleData", sendVehicleData);
    OD6S.socket.register("modifyShields", modifyShields);
    OD6S.socket.register("unlinkCrew", unlinkCrew);
    OD6S.socket.register("addToVehicle", addToVehicle);
    OD6S.socket.register("updateVehicle", updateVehicle);
    OD6S.socket.register("triggerRoll", triggerRoll);
    OD6S.socket.register("triggerRollAction", triggerRollAction);
    OD6S.socket.register('updateExplosiveTemplate', updateExplosiveTemplate);
    OD6S.socket.register('deleteExplosiveTemplate', deleteExplosiveTemplate);
    OD6S.socket.register('getVehicleFlag', getVehicleFlag);
    OD6S.socket.register('setVehicleFlag', setVehicleFlag);
    OD6S.socket.register('unsetVehicleFlag', unsetVehicleFlag);
});

async function triggerRoll(type, actorId) {
    const actor = await od6sutilities.getActorFromUuid(actorId)
    if (type === 'mortally_wounded') {
        if (actor.hasPlayerOwner && actor.isOwner && !game.user.isGM) {
            actor.triggerMortallyWoundedCheck();
        } else if (!actor.hasPlayerOwner && game.user.isGM) {
            actor.triggerMortallyWoundedCheck();
        }
    }
}

async function triggerRollAction(type, actorId) {
    const actor = game.actors.get(actorId);
    return await actor.rollAction(type);
}

export async function updateExplosiveTemplate(data) {
    const template = canvas.templates.get(data.templateId);
    if (data.operation === "update") {
        return await template.document.update(data.update);
    } else if (data.operation === "setFlags") {
        for (const flag in data.flags) {
            await template.document.setFlag('od6s', data.flags[flag].flag, data.flags[flag].value);
        }
    }
}

export async function deleteExplosiveTemplate(data) {
    const template = canvas.templates.get(data.templateId);
    await canvas.scene.deleteEmbeddedDocuments('MeasuredTemplate', [template.id]);
}

/**
 * Check is an actor is crewing a vehicle
 * @param actorId
 * @returns {boolean|*}
 */
async function checkCrewStatus(actorId) {
    const actor = await od6sutilities.getActorFromUuid(actorId);
    return actor.isCrewMember();
}

/**
 * Update actor's vehicle data
 * @param data
 */
async function sendVehicleData(data) {
    for (const e of data.crewmembers) {
        const actor = await od6sutilities.getActorFromUuid(e.uuid);
        const update = {};
        update.system = {};
        update.id = actor.id;
        update.system.vehicle = data;
        await actor.update(update);
    }
}

/**
 * Update vehicle's shields from actor
 * @param update
 * @returns {Promise<void>}
 */
async function modifyShields(update) {
    const actor = await od6sutilities.getActorFromUuid(update.uuid);
    await actor.update(update);
}

/**
 * Remove crewmwmber
 * @param vehicleId
 * @param crewId
 * @returns {Promise<void>}
 */
async function unlinkCrew(vehicleId, crewId) {
    const actor = await od6sutilities.getActorFromUuid(crewId);
    await actor.sheet.unlinkCrew(vehicleId);
}

/**
 * Add crewmember
 * @param vehicleId
 * @param crewId
 * @returns {Promise<void>}
 */
async function addToVehicle(vehicleId, crewId) {
    const actor = await od6sutilities.getActorFromUuid(crewId);
    return await actor.addToCrew(vehicleId);
}

/**
 * Update a vehicle
 * @param vehicleID
 * @param update
 * @returns {Promise<*>}
 */
async function updateVehicle(vehicleID, update) {
    const actor = await od6sutilities.getActorFromUuid(vehicleID);
    return await actor.update(update);
}


async function getVehicleFlag(vehicleID, flag) {
    const actor = await od6sutilities.getActorFromUuid(vehicleID);
    return await actor.getFlag('od6s', flag);
}

async function setVehicleFlag(vehicleID, flag) {
    const actor = await od6sutilities.getActorFromUuid(vehicleID);
    return await actor.setFlag('od6s', flag);
}

async function unsetVehicleFlag(vehicleID, flag) {
    const actor = await od6sutilities.getActorFromUuid(vehicleID);
    return await actor.unsetFlag('od6s', flag);
}

export async function getActorFromUuid(uuid) {
    return od6sutilities.getActorFromUuid(uuid);
}

// Auto-prompt player resistance rolls: when a damage message targets a player-owned
// token, automatically open the resistance roll dialog on that player's client.
// For vehicles, the first crew member rolls vehicle toughness instead.
// Skipped for GMs (they handle NPC resistance via autoOpposed) and while wild die is unresolved.
export async function promptResistanceRolls(msg) {
    if(game.user.isGM) return;
    if (msg.getFlag('od6s','type') === 'damage' && OD6S.autoPromptPlayerResistance) {
        const target = game.scenes.active.tokens.get(msg.getFlag('od6s', 'targetId'));

        if (msg.getFlag('od6s', 'wild') && !msg.getFlag('od6s', 'wildHandled')) return;

        if (typeof (target) !== 'undefined' && target) {
            if (target.actor.type === 'starship' || target.actor.type === 'vehicle') {
                if(!target.actor.isOwner) return;
                const crew = await od6sutilities.getActorFromUuid(target.actor.system.crewmembers[0].uuid);
                if (typeof (crew) !== 'undefined' || crew !== null) {
                    if (crew?.hasPlayerOwner && crew?.isOwner) {
                        return crew.rollAction('vehicletoughness', msg);
                    }
                }
            }


            if (!game.user.isGM && target.actor.hasPlayerOwner && target.isOwner) {
                const resistType = msg.getFlag('od6s', 'damageType') + 'r';
                return target.actor.rollAction(resistType, msg);
            }
        }
    }
}
