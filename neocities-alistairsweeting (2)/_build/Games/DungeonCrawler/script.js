// Import classes
import Spell from './classes/Spell.js';
import EquipmentItem from './classes/Equipment.js';
import Enemy from './classes/Enemy.js';
import { CHARACTER_CLASSES, CLASS_DESCRIPTIONS } from './classes/CharacterClasses.js';

console.log('=== Imports successful ===');
console.log('CHARACTER_CLASSES:', CHARACTER_CLASSES);
console.log('CLASS_DESCRIPTIONS:', CLASS_DESCRIPTIONS);

// ===============================================
// GAME STATE (Central state management for all game data)
// ===============================================
const gameState = {
    // Core game data
    level: 1,
    exp: 0,
    lives: 3,
    isGameOver: false,
    inCombat: false,
    discoveries: 0,
    selectedClass: null, // Selected character class
    
    // Inventory tracking
    inventory: {
        gold: 0,
        potions: 0,
        gems: 0,
        enemyKills: 0
    },
    
    // New progression tracking
    turnCounter: 0,
    maxTurns: 150,
    dungeonDepth: 0,
    targetDepth: 10, // Win condition - defeat final boss at depth 10
    hasWon: false,
    finalBossDefeated: false, // Flag to track final boss victory
    
    // Enhanced encounter balancing system
    encounterHistory: {
        lastEventType: null, // 'combat', 'item', 'progress'
        combatsSinceProgress: 0,
        minCombatsBetweenProgress: 4, // Increased from 3 to 4 for more challenge
        // eventWeights adjusted for higher difficulty and more combat
        eventWeights: {
            combat: 35,    // Combat encounters for challenge
            item: 25,      // Item/treasure events
            progress: 20,  // Progress events
            choice: 15,    // Choice-based events for strategy
            risk: 5        // High-risk, high-reward events
        },
        repeatedTypeModifier: 0.3 // Even stronger anti-repetition (was 0.5)
    },
    
    // Player character (will be initialized when class is selected)
    character: null,
    
    // Current enemy (dynamically created during combat)
    currentEnemy: null,
    
    // Game state methods (centralize game logic to avoid scattered functions)
    reset() {
        // Gold is now part of inventory, no separate score
        this.level = 1;
        this.exp = 0;
        this.lives = 3;
        this.isGameOver = false;
        this.inCombat = false;
        this.discoveries = 0;
        this.turnCounter = 0;
        this.dungeonDepth = 0;
        this.hasWon = false;
        this.finalBossDefeated = false;
        this.currentEnemy = null;
        
        // Character will be initialized when class is selected
        this.character = null;
        this.selectedClass = null;
        
        // Reset shop costs to base values for balanced progression
        Shop.upgrades.health.cost = Shop.upgrades.health.baseCost;
        Shop.upgrades.mana.cost = Shop.upgrades.mana.baseCost;
        Shop.upgrades.strength.cost = Shop.upgrades.strength.baseCost;
        Shop.upgrades.agility.cost = Shop.upgrades.agility.baseCost;
        Shop.upgrades.mastery.cost = Shop.upgrades.mastery.baseCost;
        Shop.upgrades.life.cost = Shop.upgrades.life.baseCost;
        
        // Reset encounter tracking
        this.encounterHistory = {
            lastEventType: null,
            combatsSinceProgress: 0,
            minCombatsBetweenProgress: 4, // Increased for difficulty
            eventWeights: {
                combat: 35,
                item: 25,
                progress: 20,
                choice: 15,
                risk: 5
            },
            repeatedTypeModifier: 0.3
        };
        
        // Reset inventory
        this.inventory = {
            gold: 0,
            potions: 0,
            manaPotions: 0,
            gems: 0,
            enemyKills: 0
        };
    },
    
    incrementTurn() {
        this.turnCounter++;
        if (this.turnCounter >= this.maxTurns && !this.hasWon) this.gameOver("time");
        if (this.finalBossDefeated && !this.hasWon) this.gameWin();
        UI.updateDisplay();
    },
    
    gameWin: function() {
        this.hasWon = true;
        this.isGameOver = true;
        UI.updateStory(`<i class="fas fa-trophy"></i> <strong>VICTORY!</strong> You have reached the deepest chamber of the dungeon and found the legendary treasure! The realm is saved!`);
        UI.addToLog("� GAME WON! You are a true hero!", "victory");
        UI.hideAllActionButtons();
    },
    
    gameOver: function(reason = "death") {
        this.isGameOver = true;
        
        if (reason === "time") {
            UI.updateStory(`<i class="fas fa-hourglass-end"></i> <strong>TIME'S UP!</strong> You spent too long in the dungeon and became lost forever in its dark passages...`);
            UI.addToLog("<i class='fas fa-skull'></i> GAME OVER - Time limit exceeded!", "death");
        } else if (reason === "victory") {
            UI.updateStory(`<i class="fas fa-trophy"></i> <strong>ULTIMATE VICTORY!</strong> You have conquered the deepest depths and defeated the Dungeon Lord! You emerge as a legendary hero, your name forever etched in the annals of greatness!`);
            UI.addToLog(`<i class='fas fa-trophy'></i> VICTORY! Final Gold: ${this.inventory.gold}!`, "victory");
            UI.addToLog(`⏱️ Completed in ${this.turnCounter} turns!`, "victory");
            UI.addToLog("🎊 Congratulations, Champion of the Depths!", "victory");
            
            // Show share button after a brief delay
            setTimeout(() => {
                UI.showVictoryShareButton();
            }, 2000);
        } else {
            UI.updateStory(`<i class="fas fa-skull-crossbones"></i> <strong>GAME OVER!</strong> Your adventure ends here...`);
            UI.addToLog("<i class='fas fa-skull'></i> GAME OVER - No lives remaining!", "death");
        }
        
        UI.hideAllActionButtons();
        UI.addToLog("Click 'Start New Game' to try again!", "start");
    },
    addGold: function(amount) {
        if (this.isGameOver) return;
        this.inventory.gold += amount;
        UI.updateDisplay();
        UI.addToLog(`Gold +${amount}! Total: ${this.inventory.gold}`, "gold");
    },
    
    // XP system - separate from gold
    getExpForLevel: function(level) {
        // Exponential scaling: level 2 = 50 XP, level 3 = 125 XP, level 4 = 225 XP, level 5 = 350 XP, etc.
        return Math.floor(50 * level * level - 50 * level);
    },
    
    addExp: function(amount) {
        if (this.isGameOver) return;
        this.exp += amount;
        
        // Check for level up
        const expNeeded = this.getExpForLevel(this.level + 1);
        if (this.exp >= expNeeded) {
            this.level++;
            this.levelUpCharacter();
            UI.addToLog(`⭐ LEVEL UP! Level ${this.level}! (+${amount} XP)`, "levelup");
            this.offerSpellChoice(this.level);
        } else {
            UI.addToLog(`XP +${amount}! (${this.exp}/${expNeeded})`, "gold");
        }
        UI.updateDisplay();
    },
    
    levelUpCharacter: function() {
        if (!this.character || !this.character.growthRates) {
            // Fallback for backwards compatibility
            if (this.character && this.character.levelUp) {
                this.character.levelUp(15, 5, 2, 1, 2);
            }
            return;
        }
        
        const rates = this.character.growthRates;
        
        // Apply growth rates
        this.character.maxHp += rates.hpPerLevel;
        this.character.hp = this.character.maxHp; // Full heal on level up
        this.character.maxMana += rates.manaPerLevel;
        this.character.mana = this.character.maxMana; // Full mana on level up
        
        // Apply stat increases with caps
        this.character.strength = Math.min(
            this.character.strength + rates.strengthPerLevel,
            this.character.maxStrength
        );
        this.character.agility = Math.min(
            this.character.agility + rates.agilityPerLevel,
            this.character.getMaxAgilityCap ? this.character.getMaxAgilityCap() : this.character.maxAgility
        );
        this.character.power = Math.min(
            this.character.power + rates.powerPerLevel,
            this.character.maxPower
        );
        this.character.defense = Math.min(
            this.character.defense + rates.defensePerLevel,
            this.character.maxDefense
        );
        
        // Apply class-specific bonuses (e.g., Rogue gets physical mastery)
        // Apply class-specific bonuses (e.g., Rogue gets physical mastery)
        if (rates.physicalMasteryPerLevel) {
            const newPhysicalMastery = Math.min(
                this.character.combatSpecialization.physicalMastery + rates.physicalMasteryPerLevel,
                this.character.combatSpecialization.maxPhysicalMastery
            );
            const masteryGain = newPhysicalMastery - this.character.combatSpecialization.physicalMastery;
            if (masteryGain > 0) {
                this.character.combatSpecialization.physicalMastery = newPhysicalMastery;
                UI.addToLog(`<i class="fas fa-sword"></i> Combat expertise sharpens! +${masteryGain.toFixed(2)} Physical Mastery`, "levelup");
            }
        }
        
        // Class-specific periodic mastery bonuses
        const className = this.character.characterClass;
        if (className === 'Warrior' && this.level % 3 === 0) {
            // Warrior: +0.125 physical mastery every 3 levels
            const newPhysical = Math.min(
                this.character.combatSpecialization.physicalMastery + 0.125,
                this.character.combatSpecialization.maxPhysicalMastery
            );
            if (newPhysical > this.character.combatSpecialization.physicalMastery) {
                this.character.combatSpecialization.physicalMastery = newPhysical;
                UI.addToLog(`<i class="fas fa-shield"></i> Battle experience! +0.125 Physical Mastery`, "levelup");
            }
        } else if (className === 'Paladin' && this.level % 2 === 0) {
            // Paladin: +0.25 both every 2 levels
            const newPhysical = Math.min(
                this.character.combatSpecialization.physicalMastery + 0.25,
                this.character.combatSpecialization.maxPhysicalMastery
            );
            const newMagical = Math.min(
                this.character.combatSpecialization.magicalMastery + 0.25,
                this.character.combatSpecialization.maxMagicalMastery
            );
            if (newPhysical > this.character.combatSpecialization.physicalMastery || 
                newMagical > this.character.combatSpecialization.magicalMastery) {
                this.character.combatSpecialization.physicalMastery = newPhysical;
                this.character.combatSpecialization.magicalMastery = newMagical;
                UI.addToLog(`<i class="fas fa-cross"></i> Divine balance! +0.25 Physical & Magical Mastery`, "levelup");
            }
        } else if (className === 'Mage' && this.level % 4 === 0) {
            // Mage: +0.25 magical mastery every 4 levels
            const newMagical = Math.min(
                this.character.combatSpecialization.magicalMastery + 0.25,
                this.character.combatSpecialization.maxMagicalMastery
            );
            if (newMagical > this.character.combatSpecialization.magicalMastery) {
                this.character.combatSpecialization.magicalMastery = newMagical;
                UI.addToLog(`<i class="fas fa-wand-magic"></i> Arcane knowledge! +0.25 Magical Mastery`, "levelup");
            }
        }
    },
    offerSpellChoice: function(level) {
        if (!this.character || this.character.isVampire) return;
        
        // Get the appropriate class spell pool
        let classSpellPool = null;
        const className = this.character.constructor.name;
        
        if (className === 'Warrior') classSpellPool = GameData.warriorSpells;
        else if (className === 'Mage') classSpellPool = GameData.mageSpells;
        else if (className === 'Rogue') classSpellPool = GameData.rogueSpells;
        else if (className === 'Paladin') classSpellPool = GameData.paladinSpells;
        
        const availableSpells = [];
        
        // Check generic spells (available to all classes)
        for (const spellName in GameData.genericSpells) {
            const spell = GameData.genericSpells[spellName];
            if ((spell.unlockLevel === level || (spell.unlockLevel >= level - 1 && spell.unlockLevel < level)) 
                && !this.character.knownSpells.includes(spellName)) {
                availableSpells.push(spellName);
            }
        }
        
        // Check class-specific spells
        if (classSpellPool) {
            for (const spellName in classSpellPool) {
                const spell = classSpellPool[spellName];
                if ((spell.unlockLevel === level || (spell.unlockLevel >= level - 1 && spell.unlockLevel < level)) 
                    && !this.character.knownSpells.includes(spellName)) {
                    availableSpells.push(spellName);
                }
            }
        }
        
        if (availableSpells.length === 0) return;
        
        const numChoices = Math.min(availableSpells.length, Math.random() < 0.4 ? 3 : 2);
        const spellChoices = [];
        for (let i = 0; i < numChoices; i++) {
            const randomIndex = Math.floor(Math.random() * availableSpells.length);
            spellChoices.push(availableSpells[randomIndex]);
            availableSpells.splice(randomIndex, 1);
        }
        
        UI.showSpellChoiceUI(spellChoices);
    },
    
    learnSpell: function(spellName) {
        if (this.character.knownSpells.length >= 4) {
            UI.showSpellReplaceUI(spellName);
            return true;
        }
        this.character.knownSpells.push(spellName);
        const spell = GameData.getSpell(spellName, this.character.isVampire);
        if (!spell) {
            console.error(`Failed to find spell: ${spellName}, isVampire: ${this.character.isVampire}`);
            UI.addToLog(`<i class="fas fa-magic"></i> Learned: ${spellName}!`, "levelup");
        } else {
            UI.addToLog(`<i class="fas fa-magic"></i> Learned: ${spellName}! ${spell.description}`, "levelup");
        }
        UI.updateDisplay();
        return false;
    },
    
    replaceSpell: function(oldSpell, newSpell) {
        const index = this.character.knownSpells.indexOf(oldSpell);
        if (index !== -1) {
            this.character.knownSpells[index] = newSpell;
            const spell = GameData.getSpell(newSpell, this.character.isVampire);
            if (!spell) {
                console.error(`Failed to find spell: ${newSpell}, isVampire: ${this.character.isVampire}`);
                UI.addToLog(`<i class="fas fa-exchange-alt"></i> Replaced ${oldSpell} with ${newSpell}!`, "levelup");
            } else {
                UI.addToLog(`<i class="fas fa-exchange-alt"></i> Replaced ${oldSpell} with ${newSpell}! ${spell.description}`, "levelup");
            }
            if (this.character.selectedSpell === oldSpell) this.character.selectedSpell = newSpell;
            UI.updateDisplay();
        }
    },
    
    playerDeath: function() {
        this.lives--;
        if (this.lives <= 0) {
            this.gameOver("death");
        } else {
            this.character.hp = Math.floor(this.character.maxHp / 2); // Revive with half health
            UI.addToLog(`<i class='fas fa-skull'></i> You died! Respawning with ${this.lives} lives remaining...`, "death");
            UI.updateStory("<i class=\"fas fa-skull\"></i> Death! You have been defeated but your spirit endures. You respawn at the dungeon entrance.");
            Combat.endBattle();
        }
    },
    

};

// ===============================================
// GAME DATA (Centralized configuration and content data)
// ===============================================
const GameData = {
    // Equipment definitions - compact format
    weapons: [
        // Daggers (Rogue preference)
        new EquipmentItem("Rusty Dagger", 2, "common", "agility", { classPreference: "Rogue" }),
        new EquipmentItem("Sharpened Dagger", 3, "common", "agility", { classPreference: "Rogue" }),
        new EquipmentItem("Assassin's Blade", 5, "uncommon", "agility", { classPreference: "Rogue" }),
        new EquipmentItem("Venomfang Dagger", 7, "uncommon", "agility", { classPreference: "Rogue" }),
        new EquipmentItem("Shadowstrike Dagger", 9, "rare", "agility", { classPreference: "Rogue" }),
        new EquipmentItem("Nightblade", 11, "rare", "agility", { classPreference: "Rogue" }),
        new EquipmentItem("Fang of the Abyss", 14, "epic", "agility", { classPreference: "Rogue" }),
        // Swords (Warrior/Paladin preference)
        new EquipmentItem("Iron Sword", 4, "common", "strength", { classPreference: "Warrior" }),
        new EquipmentItem("Steel Blade", 6, "uncommon", "strength", { classPreference: "Warrior" }),
        new EquipmentItem("Knight's Longsword", 8, "uncommon", "strength", { classPreference: "Paladin" }),
        new EquipmentItem("Executioner's Axe", 10, "rare", "strength", { classPreference: "Warrior" }),
        new EquipmentItem("Holy Avenger", 11, "rare", "strength", { classPreference: "Paladin" }),
        new EquipmentItem("Dragon Slayer", 12, "rare", "strength", { classPreference: "Warrior" }),
        new EquipmentItem("Demon's Greatsword", 15, "epic", "strength", { classPreference: "Warrior" }),
        // Staves/Wands (Mage preference)
        new EquipmentItem("Apprentice Wand", 2, "common", "power", { classPreference: "Mage" }),
        new EquipmentItem("Crystal Staff", 4, "common", "power", { classPreference: "Mage" }),
        new EquipmentItem("Enchanter's Rod", 6, "uncommon", "power", { classPreference: "Mage" }),
        new EquipmentItem("Sorcerer's Staff", 8, "uncommon", "power", { classPreference: "Mage" }),
        new EquipmentItem("Staff of the Archmage", 10, "rare", "power", { classPreference: "Mage" }),
        new EquipmentItem("Celestial Scepter", 12, "rare", "power", { classPreference: "Mage" }),
        new EquipmentItem("Staff of Ultimate Power", 15, "epic", "power", { classPreference: "Mage" })
    ],
    
    armor: [
        // Light armor (Rogue preference)
        new EquipmentItem("Leather Vest", 2, "common", "agility", { armorType: "light", classPreference: "Rogue" }),
        new EquipmentItem("Studded Leather", 4, "uncommon", "agility", { armorType: "light", classPreference: "Rogue" }),
        new EquipmentItem("Elven Mail", 6, "rare", "agility", { armorType: "light", classPreference: "Rogue" }),
        new EquipmentItem("Shadowweave Armor", 8, "rare", "agility", { armorType: "light", classPreference: "Rogue" }),
        new EquipmentItem("Dragon Scale Armor", 10, "epic", "agility", { armorType: "light", classPreference: "Rogue" }),
        // Heavy armor (Warrior/Paladin preference)
        new EquipmentItem("Chainmail Shirt", 8, "common", "defense", { armorType: "heavy", classPreference: "Warrior" }),
        new EquipmentItem("Steel Plate Armor", 14, "uncommon", "defense", { armorType: "heavy", classPreference: "Warrior" }),
        new EquipmentItem("Consecrated Plate", 16, "uncommon", "defense", { armorType: "heavy", classPreference: "Paladin" }),
        new EquipmentItem("Knight's Full Plate", 20, "rare", "defense", { armorType: "heavy", classPreference: "Paladin" }),
        new EquipmentItem("Battlelord's Armor", 22, "rare", "defense", { armorType: "heavy", classPreference: "Warrior" }),
        new EquipmentItem("Mithril Armor", 28, "epic", "defense", { armorType: "heavy", classPreference: "Warrior" }),
        // Robes (Mage preference)
        new EquipmentItem("Apprentice Robes", 3, "common", "power", { armorType: "cloth", classPreference: "Mage" }),
        new EquipmentItem("Arcane Vestments", 5, "uncommon", "power", { armorType: "cloth", classPreference: "Mage" }),
        new EquipmentItem("Sorcerer's Robes", 7, "rare", "power", { armorType: "cloth", classPreference: "Mage" }),
        new EquipmentItem("Robes of the Archmage", 9, "epic", "power", { armorType: "cloth", classPreference: "Mage" })
    ],
    accessories: [
        // Agility accessories (Rogue preference)
        new EquipmentItem("Silver Ring", 1, "common", "agility", { classPreference: "Rogue" }),
        new EquipmentItem("Amulet of Swiftness", 2, "common", "agility", { classPreference: "Rogue" }),
        new EquipmentItem("Boots of Speed", 4, "uncommon", "agility", { classPreference: "Rogue" }),
        new EquipmentItem("Cloak of Shadows", 5, "rare", "agility", { classPreference: "Rogue" }),
        new EquipmentItem("Shadowdancer's Mantle", 7, "epic", "agility", { classPreference: "Rogue" }),
        // Defense accessories (Warrior/Paladin preference)
        new EquipmentItem("Iron Bracers", 2, "common", "defense", { classPreference: "Warrior" }),
        new EquipmentItem("Guardian Amulet", 3, "uncommon", "defense", { classPreference: "Paladin" }),
        new EquipmentItem("Shield Ring", 4, "rare", "defense", { classPreference: "Warrior" }),
        new EquipmentItem("Bulwark Medallion", 6, "epic", "defense", { classPreference: "Warrior" }),
        new EquipmentItem("Holy Symbol", 5, "rare", "defense", { classPreference: "Paladin" }),
        // Power accessories (Mage preference)
        new EquipmentItem("Arcane Pendant", 4, "uncommon", "power", { classPreference: "Mage" }),
        new EquipmentItem("Ring of Power", 6, "rare", "power", { classPreference: "Mage" }),
        new EquipmentItem("Crown of the Ancients", 8, "epic", "power", { classPreference: "Mage" }),
        new EquipmentItem("Spellweaver's Charm", 5, "uncommon", "power", { classPreference: "Mage" }),
        // Special accessories
        new EquipmentItem("Blood Amulet", 3, "rare", "power", { vampiric: true, lifeDrain: 0.15, description: "Grants 15% life drain on attacks" }),
        new EquipmentItem("Crimson Ring", 2, "uncommon", "agility", { vampiric: true, lifeDrain: 0.1, description: "Grants 10% life drain on attacks" }),
        new EquipmentItem("Cursed Obsidian Ring", 8, "epic", "power", { cursed: true, description: "Cannot be removed once equipped! Drains 2 HP per turn", hpDrain: 2 }),
        new EquipmentItem("Ring of Eternal Binding", 7, "rare", "agility", { cursed: true, description: "Cannot be removed once equipped! Drains 3 mana per turn", manaDrain: 3 })
    ],
    
    // Spell system - Generic spells available to all classes
    genericSpells: {
        'Minor Heal': new Spell('Minor Heal', 15, 'heal', 'Basic healing magic - restores 30 HP', 2, {healAmount:30}),
        'Mana Surge': new Spell('Mana Surge', 10, 'utility', 'Channel ambient energy - restore 15 mana', 3, {manaDrain:15}),
        'Fortify': new Spell('Fortify', 20, 'buff', 'Hardens your body - increases defense by 8 for 3 turns', 4, {defenseBoost:8, duration:3}),
        'Weaken': new Spell('Weaken', 20, 'debuff', 'Curses enemy - reduces their attack by 25% for 3 turns', 5, {attackReduction:0.25, duration:3}),
        'Greater Heal': new Spell('Greater Heal', 30, 'heal', 'Advanced healing magic - restores 60 HP', 7, {healAmount:60}),
        'Haste': new Spell('Haste', 35, 'buff', 'Time magic - grants an extra attack each turn for 2 turns', 9, {hasteDuration:2}),
    },
    
    // Warrior spells - Combat buffs and battle shouts
    warriorSpells: {
        'Shield Bash': new Spell('Shield Bash', 18, 'damage', 'Slam with shield - moderate damage, 30% stun chance', 1, {damageMultiplier:1.0, bonusDamage:3, stunChance:0.3, damageType:'physical', physicalScaling:'strengthPower'}),
        'Battle Stance': new Spell('Battle Stance', 20, 'buff', 'Combat ready - increases strength by 6 for 3 turns', 2, {strengthBoost:6, duration:3}),
        'Shield Wall': new Spell('Shield Wall', 25, 'buff', 'Defensive barrier - reduces next 2 attacks by 20 damage', 3, {defenseBoost:20, duration:2}),
        'Warcry': new Spell('Warcry', 25, 'debuff', 'Intimidating roar - reduces enemy attack by 30% for 2 turns', 4, {attackReduction:0.30, duration:2}),
        'Cleave': new Spell('Cleave', 30, 'damage', 'Powerful swing - heavy physical damage', 5, {damageMultiplier:1.4, bonusDamage:8, damageType:'physical', physicalScaling:'strengthPower'}),
        'Iron Skin': new Spell('Iron Skin', 30, 'buff', 'Steel yourself - gain +15 defense for 3 turns', 6, {defenseBoost:15, duration:3}),
        'Berserker Rage': new Spell('Berserker Rage', 35, 'buff', 'Fury unleashed - +10 strength but -5 defense for 3 turns', 7, {strengthBoost:10, defensePenalty:-5, duration:3}),
        'Earthquake': new Spell('Earthquake', 40, 'damage', 'Ground slam - massive damage, effective vs constructs', 8, {damageMultiplier:1.5, bonusDamage:12, effectiveAgainst:['Stone Golem','Gargoyle','Sunlight Sentinel'], damageType:'physical', physicalScaling:'strengthPower'}),
        'Last Stand': new Spell('Last Stand', 35, 'buff', 'Desperate defense - gain +20 defense for 2 turns', 9, {defenseBoost:20, duration:2}),
        'Execute': new Spell('Execute', 45, 'damage', 'Finishing blow - devastating damage when enemy below 50% HP', 10, {damageMultiplier:1.8, bonusDamage:15, executeThreshold:0.5, damageType:'physical', physicalScaling:'strengthPower'}),
    },
    
    // Mage spells - Elemental magic and arcane power
    mageSpells: {
        'Magic Missile': new Spell('Magic Missile', 12, 'damage', 'Arcane projectile - reliable damage', 1, {damageMultiplier:1.2, bonusDamage:0, damageType:'arcane'}),
        'Frost Nova': new Spell('Frost Nova', 18, 'damage', 'Ice blast - effective vs fire enemies', 2, {damageMultiplier:1.2, bonusDamage:2, effectiveAgainst:['Fire Elemental','Ancient Dragon'], weakAgainst:['Ice Troll'], damageType:'ice'}),
        'Fireball': new Spell('Fireball', 20, 'damage', 'Scorching flame - effective vs undead and ice', 3, {damageMultiplier:1.3, bonusDamage:3, effectiveAgainst:['Ice Troll','Skeleton Warrior','Undead Knight'], weakAgainst:['Fire Elemental'], damageType:'fire'}),
        'Lightning Bolt': new Spell('Lightning Bolt', 22, 'damage', 'Electric shock - shatters constructs', 4, {damageMultiplier:1.3, bonusDamage:3, effectiveAgainst:['Stone Golem','Gargoyle'], damageType:'lightning'}),
        'Arcane Shield': new Spell('Arcane Shield', 25, 'buff', 'Magical barrier - reduces next 2 attacks by 18 damage', 5, {defenseBoost:18, duration:2}),
        'Ice Storm': new Spell('Ice Storm', 30, 'damage', 'Freezing blizzard - heavy ice damage', 6, {damageMultiplier:1.4, bonusDamage:6, effectiveAgainst:['Fire Elemental','Ancient Dragon'], weakAgainst:['Ice Troll','Stone Golem'], damageType:'ice'}),
        'Chain Lightning': new Spell('Chain Lightning', 32, 'damage', 'Multiple lightning strikes - high damage', 7, {damageMultiplier:1.4, bonusDamage:7, effectiveAgainst:['Stone Golem','Gargoyle'], damageType:'lightning'}),
        'Meteor Strike': new Spell('Meteor Strike', 38, 'damage', 'Falling meteor - massive fire damage', 8, {damageMultiplier:1.5, bonusDamage:10, effectiveAgainst:['Ice Troll','Wraith Lord'], weakAgainst:['Fire Elemental','Ancient Dragon'], damageType:'fire'}),
        'Time Stop': new Spell('Time Stop', 40, 'debuff', 'Freezes enemy in time - they skip their next turn', 9, {skipTurns:1}),
        'Arcane Apocalypse': new Spell('Arcane Apocalypse', 50, 'damage', 'Ultimate arcane power - pure devastating energy', 10, {damageMultiplier:1.7, bonusDamage:15, damageType:'arcane'})
    },
    
    // Rogue spells - Stealth, poisons, and shadow magic
    // Rogue spells - Stealth, poisons, and shadow magic
    rogueSpells: {
        'Shadow Meld': new Spell('Shadow Meld', 15, 'buff', 'Merge with shadows - 40% dodge chance for 1 turn', 1, {dodgeChance:0.4, duration:1}),
        'Poison Dagger': new Spell('Poison Dagger', 15, 'damage', 'Venomous strike - initial damage plus 8 poison per turn for 3 turns', 1, {damageMultiplier:1.0, bonusDamage:2, poisonDamage:8, poisonDuration:3, damageType:'physical', physicalScaling:'agility'}),
        'Backstab': new Spell('Backstab', 20, 'damage', 'Strike from behind - heavy critical damage', 3, {damageMultiplier:1.5, bonusDamage:5, damageType:'physical', physicalScaling:'agility', critBonus:0.15}),
        'Smoke Bomb': new Spell('Smoke Bomb', 20, 'debuff', 'Obscure vision - reduces enemy attack by 35% for 2 turns', 4, {attackReduction:0.35, duration:2}),
        'Deadly Poison': new Spell('Deadly Poison', 25, 'damage', 'Lethal toxin - 12 poison damage per turn for 4 turns', 5, {damageMultiplier:0.8, bonusDamage:2, poisonDamage:12, poisonDuration:4, effectiveAgainst:['Orc Warrior','Dark Sorcerer'], weakAgainst:['Stone Golem','Gargoyle'], damageType:'physical', physicalScaling:'agility'}),
        'Evasion': new Spell('Evasion', 28, 'buff', 'Perfect dodge - 70% dodge chance for 1 turn', 6, {dodgeChance:0.7, duration:1}),
        'Shadow Strike': new Spell('Shadow Strike', 30, 'damage', 'Attack from darkness - heavy shadow damage', 7, {damageMultiplier:1.5, bonusDamage:8, effectiveAgainst:['Paladin Spirit','Sunlight Sentinel'], damageType:'shadow', physicalScaling:'agility'}),
        'Vanish': new Spell('Vanish', 32, 'buff', 'Disappear completely - 80% dodge for 1 turn, +50% damage next attack', 8, {dodgeChance:0.8, duration:1, damageBonus:1.5}),
        'Assassinate': new Spell('Assassinate', 40, 'damage', 'Perfect execution - massive damage when enemy below 40% HP', 9, {damageMultiplier:2.0, bonusDamage:12, executeThreshold:0.4, damageType:'physical', physicalScaling:'agility', critBonus:0.20, critMultiplier:2.5}),
        'Death Mark': new Spell('Death Mark', 35, 'debuff', 'Mark for death - enemy takes 40% more damage for 3 turns', 10, {vulnerabilityIncrease:0.4, duration:3})
    },
    
    // Paladin spells - Holy magic, healing, and divine protection
    paladinSpells: {
        'Holy Strike': new Spell('Holy Strike', 18, 'damage', 'Divine weapon - effective vs undead', 1, {damageMultiplier:1.2, bonusDamage:2, effectiveAgainst:['Skeleton Warrior','Undead Knight','Wraith Lord'], damageType:'holy', physicalScaling:'strengthPower'}),
        'Lay on Hands': new Spell('Lay on Hands', 20, 'heal', 'Divine touch - restores 40 HP', 2, {healAmount:40}),
        'Divine Shield': new Spell('Divine Shield', 25, 'buff', 'Holy barrier - blocks next 2 attacks for 25 damage each', 3, {defenseBoost:25, duration:2}),
        'Smite': new Spell('Smite', 25, 'damage', 'Holy judgement - strong vs undead and demons', 4, {damageMultiplier:1.3, bonusDamage:5, effectiveAgainst:['Skeleton Warrior','Undead Knight','Lich King','Demon Lord'], damageType:'holy', physicalScaling:'strengthPower'}),
        'Cleanse': new Spell('Cleanse', 22, 'heal', 'Purifying light - heals 30 HP and removes debuffs', 5, {healAmount:30}),
        'Holy Light': new Spell('Holy Light', 30, 'damage', 'Radiant beam - devastating vs undead', 6, {damageMultiplier:1.4, bonusDamage:8, effectiveAgainst:['Skeleton Warrior','Undead Knight','Wraith Lord','Lich King'], weakAgainst:['Paladin Spirit'], damageType:'holy', physicalScaling:'strengthPower'}),
        'Divine Protection': new Spell('Divine Protection', 30, 'buff', 'God\'s blessing - +12 defense and immune to debuffs for 2 turns', 7, {defenseBoost:12, duration:2, debuffImmunity:true}),
        'Consecration': new Spell('Consecration', 35, 'damage', 'Holy ground - massive damage vs undead and demons', 8, {damageMultiplier:1.5, bonusDamage:10, effectiveAgainst:['Skeleton Warrior','Undead Knight','Wraith Lord','Lich King','Demon Lord'], damageType:'holy', physicalScaling:'strengthPower'}),
        'Resurrection': new Spell('Resurrection', 40, 'heal', 'Divine miracle - fully restore HP (once per battle)', 9, {healAmount:9999, limitedUse:true}),
        'Divine Wrath': new Spell('Divine Wrath', 45, 'damage', 'God\'s fury - ultimate holy damage', 10, {damageMultiplier:1.6, bonusDamage:15, effectiveAgainst:['Skeleton Warrior','Undead Knight','Wraith Lord','Lich King','Demon Lord','Shadow Beast'], damageType:'holy', physicalScaling:'strengthPower'})
    },
    
    // Original general spells (kept for reference/vampire transformation)
    spells: {
        'Magic Missile': new Spell('Magic Missile', 15, 'damage', 'A basic magical projectile - reliable neutral damage', 1, {damageMultiplier:1.2, bonusDamage:0, effectiveAgainst:[], weakAgainst:[]}),
        'Heal': new Spell('Heal', 20, 'heal', 'Restores HP - essential for survival in prolonged battles', 2, {healAmount:40}),
        'Fire Bolt': new Spell('Fire Bolt', 20, 'damage', 'Burns enemies weak to fire - tactical choice against undead', 3, {damageMultiplier:1.2, bonusDamage:0, effectiveAgainst:['Ice Troll','Wraith Lord','Lich King'], weakAgainst:['Fire Elemental','Ancient Dragon'], damageType:'fire'}),
        'Mana Drain': new Spell('Mana Drain', 15, 'utility', 'Siphon enemy magical energy - restore 20 mana (no enemy counter)', 3, {manaDrain:20}),
        'Ice Shard': new Spell('Ice Shard', 20, 'damage', 'Freezes fire creatures - tactical choice against fire enemies', 4, {damageMultiplier:1.2, bonusDamage:0, effectiveAgainst:['Fire Elemental','Ancient Dragon','Demon Lord'], weakAgainst:['Ice Troll','Stone Golem'], damageType:'ice'}),
        'Fortify': new Spell('Fortify', 20, 'buff', 'Hardens your body - increases defense by 10 for 3 turns', 4, {defenseBoost:10, duration:3}),
        'Shield': new Spell('Shield', 25, 'buff', 'Creates a magical barrier - reduces next 2 attacks by 15 damage', 5, {defenseBoost:15, duration:2}),
        'Lightning Strike': new Spell('Lightning Strike', 25, 'damage', 'Shatters constructs and armored foes', 6, {damageMultiplier:1.2, bonusDamage:0, effectiveAgainst:['Stone Golem','Gargoyle','Sunlight Sentinel'], weakAgainst:[], damageType:'lightning'}),
        'Slow': new Spell('Slow', 18, 'debuff', 'Time magic - halves enemy agility for 2 turns (prevents first strike)', 6, {agilityReduction:0.5, duration:2}),
        'Weaken': new Spell('Weaken', 20, 'debuff', 'Curses enemy - reduces their attack by 30% for 3 turns', 7, {attackReduction:0.3, duration:3}),
        'Cleanse': new Spell('Cleanse', 15, 'heal', 'Purifying light - heals 25 HP and removes all debuffs from you', 7, {healAmount:25}),
        'Holy Smite': new Spell('Holy Smite', 30, 'damage', 'Purges undead and shadow creatures with divine wrath', 8, {damageMultiplier:1.2, bonusDamage:0, effectiveAgainst:['Skeleton Warrior','Undead Knight','Wraith Lord','Lich King','Shadow Beast'], weakAgainst:['Paladin Spirit'], damageType:'holy'}),
        'Vulnerability': new Spell('Vulnerability', 25, 'debuff', 'Hexes enemy - next attack deals 50% more damage', 9, {damageAmplify:1.5, duration:1}),
        'Meteor': new Spell('Meteor', 40, 'damage', 'Massive fire damage - devastating but expensive', 9, {damageMultiplier:1.5, bonusDamage:15, effectiveAgainst:['Ice Troll','Wraith Lord','Lich King'], weakAgainst:['Fire Elemental','Ancient Dragon'], damageType:'fire'}),
        'Arcane Blast': new Spell('Arcane Blast', 35, 'damage', 'Pure arcane energy - disrupts magic users', 10, {damageMultiplier:1.2, bonusDamage:0, effectiveAgainst:['Dark Sorcerer'], weakAgainst:[], damageType:'arcane'}),
        'Chrono Lock': new Spell('Chrono Lock', 35, 'debuff', 'Freezes enemy in time - they skip their next turn entirely', 10, {skipTurns:1}),
        'Haste': new Spell('Haste', 30, 'buff', 'Time magic - grants an extra attack each turn for 2 turns', 11, {hasteDuration:2}),
        'Death Bolt': new Spell('Death Bolt', 22, 'damage', 'Necrotic energy bolt - effective against living creatures', 5, {damageMultiplier:1.2, bonusDamage:5, effectiveAgainst:['Goblin','Orc Warrior','Ice Troll','Fire Elemental'], weakAgainst:['Skeleton Warrior','Undead Knight','Lich King'], damageType:'necrotic'}),
        'Bone Shards': new Spell('Bone Shards', 28, 'damage', 'Launches razor-sharp bone fragments - heavy necrotic damage', 8, {damageMultiplier:1.3, bonusDamage:8, effectiveAgainst:['Dark Sorcerer','Demon Lord','Paladin Spirit'], weakAgainst:['Skeleton Warrior','Undead Knight'], damageType:'necrotic'}),
        'Plague Touch': new Spell('Plague Touch', 20, 'damage', 'Infects enemy with necrotic plague - deals damage over 3 turns', 6, {damageMultiplier:0.8, bonusDamage:3, poisonDamage:10, poisonDuration:3, effectiveAgainst:['Orc Warrior','Dark Sorcerer','Ancient Dragon'], weakAgainst:['Skeleton Warrior','Undead Knight','Lich King','Stone Golem'], damageType:'necrotic'})
    },
    
    // Vampire-exclusive spells (only available after transformation)
    // Diverse tactical spells with blood/shadow/night themes
    vampireSpells: {
        'Blood Bolt': new Spell('Blood Bolt', 18, 'damage', 'Basic vampiric attack - drains 20% HP from damage dealt', 1, {damageMultiplier:1.3, bonusDamage:0, lifeDrain:0.2, effectiveAgainst:[], weakAgainst:['Stone Golem','Gargoyle','Sunlight Sentinel'], damageType:'vampiric'}),
        'Crimson Regeneration': new Spell('Crimson Regeneration', 28, 'heal', 'Channel blood magic to heal yourself', 2, {healAmount:35}),
        'Bat Swarm': new Spell('Bat Swarm', 25, 'debuff', 'Summon bats to obscure enemy vision - reduces attack by 25% for 2 turns', 3, {attackReduction:0.25, duration:2}),
        'Hemomancy': new Spell('Hemomancy', 20, 'utility', 'Convert life force to magical energy - restore 25 mana', 3, {manaDrain:25}),
        'Shadow Meld': new Spell('Shadow Meld', 28, 'buff', 'Merge with shadows - 40% chance to dodge next attack', 4, {dodgeChance:0.4, duration:1}),
        'Blood Siphon': new Spell('Blood Siphon', 30, 'damage', 'Powerful blood drain - 35% life steal, moderate damage', 5, {damageMultiplier:1.4, bonusDamage:5, lifeDrain:0.35, effectiveAgainst:[], weakAgainst:['Lich King','Skeleton Warrior','Undead Knight'], damageType:'vampiric'}),
        'Nightfall': new Spell('Nightfall', 35, 'buff', 'Embrace the darkness - gain +12 defense for 3 turns', 6, {defenseBoost:12, duration:3}),
        'Dread Gaze': new Spell('Dread Gaze', 28, 'debuff', 'Paralyzing stare - reduces enemy attack by 35% for 2 turns', 7, {attackReduction:0.35, duration:2}),
        'Corpse Explosion': new Spell('Corpse Explosion', 40, 'damage', 'Detonate dark energy - heavy damage, no life drain', 8, {damageMultiplier:1.5, bonusDamage:10, effectiveAgainst:['Skeleton Warrior','Undead Knight','Lich King'], weakAgainst:[], damageType:'necrotic'}),
        'Sanguine Pact': new Spell('Sanguine Pact', 35, 'heal', 'Blood sacrifice - heal 50 HP but take 15 damage first', 8, {healAmount:50, hpCost:15}),
        'Night Terror': new Spell('Night Terror', 38, 'damage', 'Terrifying darkness - 25% life drain, 30% stun chance', 9, {damageMultiplier:1.5, bonusDamage:8, lifeDrain:0.25, stunChance:0.3, effectiveAgainst:['Dark Sorcerer','Demon Lord'], weakAgainst:['Paladin Spirit'], damageType:'vampiric'}),
        'Blood Moon': new Spell('Blood Moon', 45, 'damage', 'Ultimate blood magic - 40% life drain, massive damage', 10, {damageMultiplier:1.6, bonusDamage:12, lifeDrain:0.4, effectiveAgainst:[], weakAgainst:['Paladin Spirit','Sunlight Sentinel'], damageType:'vampiric'}),
        'Vampiric Ascension': new Spell('Vampiric Ascension', 40, 'buff', 'Transcend mortality - gain an extra attack each turn for 2 turns', 11, {hasteDuration:2})
    },
    
    // Depth-based enemy scaling with logical damage resistances/vulnerabilities
    enemyTypes: [
        // Early Dungeon (0-4) - Agility 8-20 (players have ~22-25 agility)
        new Enemy("Goblin", 60, 28, 9, 55, 6, 10, "A vicious green creature with razor-sharp claws", 0, 4, {physical:0.9, magical:1.2}, "Goblins are nimble but have no magical defenses", {dropPreference:'accessory'}),
        new Enemy("Skeleton Warrior", 58, 34, 8, 50, 3, 8, "An animated skeleton wielding a wickedly sharp blade", 0, 3, {physical:1.1, magical:0.8}, "Undead bones are hard to damage with magic but shatter under physical force", {dropPreference:'weapon'}),
        new Enemy("Cave Spider", 48, 24, 7, 40, 9, 18, "A massive spider with deadly venom", 0, 2, {physical:1.0, magical:1.3}, "Natural creatures are extremely susceptible to magical attacks", {dropPreference:'accessory'}),
        new Enemy("Rabid Wolf", 65, 30, 8, 58, 8, 14, "A savage wolf with foam-flecked jaws", 1, 4, {physical:1.0, magical:1.2}, "Wild beasts have no defense against supernatural forces"),
        
        // Mid Dungeon (2-7) - Agility 10-24 (players have ~24-28 agility)
        new Enemy("Orc Warrior", 115, 46, 16, 105, 4, 10, "A fierce orc wielding a massive battle axe", 2, 6, {physical:0.8, magical:1.1}, "Heavily armored but with no magical protection", {dropPreference:'weapon'}),
        new Enemy("Shadow Beast", 100, 42, 13, 85, 10, 24, "A creature of pure darkness that strikes without warning", 2, 7, {physical:1.3, magical:0.7}, "Shadow creatures are nearly immune to physical attacks but crumble before magical light", {dropPreference:'accessory'}),
        new Enemy("Paladin Spirit", 108, 45, 18, 110, 5, 12, "The lingering spirit of a holy warrior, radiating divine light", 3, 7, {physical:1.0, magical:0.9}, "Holy warriors wield divine power that burns the undead", {dropPreference:'weapon', damageType:'holy'}),
        new Enemy("Undead Knight", 138, 50, 20, 125, 2, 8, "A fallen knight in cursed armor, emanating cold death", 3, 7, {physical:0.7, magical:0.9}, "Heavy armor protects against magic, but concentrated force can shatter ancient metal", {dropPreference:'armor'}),
        new Enemy("Poison Basilisk", 105, 44, 14, 98, 5, 12, "A serpentine monster whose gaze brings paralysis", 3, 6, {physical:1.0, magical:1.2}, "Reptilian hide offers little protection against supernatural forces", {dropPreference:'accessory'}),
        new Enemy("Minotaur", 125, 54, 15, 115, 6, 14, "A bull-headed beast that charges with deadly fury", 4, 7, {physical:0.8, magical:1.3, vampiric:1.2, necrotic:1.3}, "Massive physical strength but completely vulnerable to magical attacks", {dropPreference:'weapon'}),
        new Enemy("Blood Cultist", 105, 48, 14, 125, 5, 16, "A deranged worshipper of dark gods, clad in crimson robes", 4, 7, {physical:1.1, magical:0.9, vampiric:1.4, necrotic:1.3}, "Blood cultists are ironically vulnerable to the very dark powers they worship", {dropPreference:'accessory', canCastSpells:true}),
        new Enemy("Gargoyle", 112, 40, 21, 100, 8, 18, "A stone creature that swoops from above with razor claws", 4, 6, {physical:0.6, magical:1.1, vampiric:0.7, necrotic:0.8}, "Stone skin deflects physical blows but magical energy penetrates deeply", {dropPreference:'armor'}),
        
        // Deep Dungeon (5-9) - Agility 8-28 (players have ~26-30 agility)
        new Enemy("Flesh Golem", 205, 60, 21, 170, 4, 10, "A patchwork abomination of stitched corpses, animated by dark magic", 5, 8, {physical:0.9, magical:1.0, vampiric:1.5, necrotic:1.4}, "Flesh constructs are particularly susceptible to life-draining and death magic", {dropPreference:'weapon'}),
        new Enemy("Fire Elemental", 188, 64, 24, 160, 7, 16, "A raging inferno given form, burning everything in its path", 5, 8, {physical:1.4, magical:0.8, vampiric:0.7, necrotic:0.8}, "Pure elemental fire laughs at physical weapons but succumbs to focused magical energy", {dropPreference:'accessory', damageType:'fire'}),
        new Enemy("Ice Troll", 222, 58, 30, 195, 3, 8, "A massive troll encased in magical ice armor", 5, 9, {physical:0.7, magical:0.9, vampiric:1.2, necrotic:1.3}, "Magical ice provides superior protection, but can be shattered with enough force", {dropPreference:'armor'}),
        new Enemy("Holy Inquisitor", 165, 66, 24, 175, 5, 13, "A zealot wielding divine fire to purge the unholy", 5, 8, {physical:1.0, magical:0.9, vampiric:0.5, necrotic:0.6}, "Divine protection shields against vampiric and necrotic corruption", {dropPreference:'weapon', damageType:'holy'}),
        new Enemy("Sunlight Sentinel", 178, 68, 27, 188, 6, 14, "A crystalline guardian that channels radiant sunlight", 5, 8, {physical:0.9, magical:0.8, vampiric:0.6, necrotic:0.7}, "Ancient constructs powered by the sun's wrath", {dropPreference:'armor', damageType:'light'}),
        new Enemy("Stone Golem", 248, 54, 34, 180, 2, 8, "An unstoppable construct of animated granite", 6, 9, {physical:0.5, magical:1.0, vampiric:0.6, necrotic:0.7}, "Enchanted stone construction makes it nearly impervious to physical damage", {dropPreference:'armor'}),
        new Enemy("Wraith Lord", 160, 72, 17, 225, 9, 28, "A spectral tyrant that drains the life from its victims", 6, 8, {physical:1.5, magical:0.6, vampiric:1.4, necrotic:1.5}, "Spectral form makes physical attacks nearly useless, but magic can bind and destroy spirits", {dropPreference:'accessory', canCastSpells:true}),
        
        // Final Depths (7-10) - Agility 12-30 (players have ~28-32 agility)
        new Enemy("Dark Sorcerer", 215, 82, 20, 270, 5, 14, "A master of forbidden magic, crackling with dark power", 7, 10, {physical:1.1, magical:0.7, vampiric:1.3, necrotic:1.2}, "Dark magic shields protect against physical harm but create vulnerability to pure magical force", {dropPreference:'accessory', canCastSpells:true}),
        new Enemy("Templar Knight", 252, 84, 32, 285, 5, 12, "An elite holy warrior blessed by divine power", 7, 10, {physical:0.8, magical:0.9, vampiric:0.4, necrotic:0.5}, "Divine blessings make these warriors the bane of the undead and vampires", {dropPreference:'weapon', damageType:'holy'}),
        new Enemy("Ancient Dragon", 325, 90, 37, 360, 7, 22, "A legendary wyrm whose breath can melt steel", 8, 10, {physical:0.6, magical:0.8, vampiric:1.2, necrotic:1.1}, "Dragon scales deflect most attacks, but ancient magic provides some protection against spells", {dropPreference:'armor', damageType:'fire'}),
        new Enemy("Demon Lord", 405, 102, 40, 450, 6, 18, "An archfiend from the deepest circles of the abyss", 9, 10, {physical:0.8, magical:0.8, vampiric:1.1, necrotic:1.0}, "Infernal power grants resistance to all mortal attacks, both physical and magical", {dropPreference:'weapon'}),
        new Enemy("Lich King", 290, 88, 27, 405, 4, 12, "An undead archmage wielding necromantic powers", 8, 10, {physical:1.2, magical:0.6, vampiric:0.7, necrotic:0.6}, "Undead flesh resists physical damage, but pure magical energy disrupts necromantic bindings", {dropPreference:'accessory', canCastSpells:true})
    ],
    
    // Item/treasure events (separated from progress events)
    itemEvents: [
        {
            text: "You find a healing potion in an old chest!",
            effect: () => {
                const healing = 20;
                gameState.character.heal(healing);
                gameState.inventory.potions++;
                return `You recover ${healing} HP!`;
            }
        },
        {
            text: "You discover a glowing mana potion hidden in an alcove!",
            effect: () => {
                gameState.inventory.manaPotions++;
                UI.updateDisplay();
                return "<span style='color: #4169E1'>You found a Mana Potion!</span>";
            }
        },
        {
            text: "You discover a mana crystal glowing softly in the cave wall!",
            effect: () => {
                const manaGain = 15;
                gameState.character.restoreMana(manaGain);
                return `You gain ${manaGain} mana!`;
            }
        },
        {
            text: "A magical spring bubbles up from the ground!",
            effect: () => {
                gameState.character.heal(30);
                gameState.character.restoreMana(20);
                return "The spring fully refreshes you! +30 HP, +20 Mana!";
            }
        },
        {
            text: "You find ancient coins scattered on the ground!",
            effect: () => {
                const points = Math.floor(Math.random() * 30) + 20;
                gameState.addGold(points);
                return `You gain ${points} gold!`;
            }
        },
        {
            text: "A hidden treasure cache reveals itself behind loose stones!",
            effect: () => {
                const points = Math.floor(Math.random() * 100) + 50;
                gameState.addGold(points);
                return `You find a valuable treasure worth ${points} gold!`;
            }
        },
        {
            text: "You discover a merchant's lost purse filled with gems!",
            effect: () => {
                const points = Math.floor(Math.random() * 80) + 40;
                gameState.addGold(points);
                gameState.inventory.gems++;
                return `The gems are worth ${points} gold!`;
            }
        },
        {
            text: "You stumble upon a training dummy and practice your combat skills!",
            effect: () => {
                gameState.character.strength += 1;
                gameState.character.agility += 1;
                UI.updateDisplay();
                return "Your strength and agility increase by 1!";
            }
        },
        {
            text: "An ancient tome of wisdom lies open on a stone pedestal!",
            effect: () => {
                gameState.character.maxMana += 3;
                gameState.character.mana = gameState.character.maxMana;
                gameState.character.agility += 2;
                UI.updateDisplay();
                return "Your magical knowledge grows! +3 Max Mana, +2 Agility!";
            }
        },
        {
            text: "You find an old warrior's training ground with practice weapons!",
            effect: () => {
                gameState.character.strength += 3;
                gameState.character.maxHp += 10;
                gameState.character.hp = Math.min(gameState.character.hp + 10, gameState.character.maxHp);
                UI.updateDisplay();
                return "Training makes you stronger! +3 Strength, +10 Max HP!";
            }
        },
        {
            text: "A glowing rune offers power, but at what cost?",
            effect: () => {
                if (Math.random() < 0.6) {
                    gameState.character.strength += 1;
                    gameState.character.agility += 1;
                    UI.updateDisplay();
                    return "The rune grants you power! +1 Strength, +1 Agility!";
                } else {
                    const damage = 15;
                    gameState.character.takeDamage(damage);
                    return `The rune's power is unstable! You take ${damage} damage!`;
                }
            }
        }
    ],
    
    // Choice-based events for strategic decision making
    choiceEvents: [
        {
            text: "The passage splits into two paths. To the left, you hear the sound of dripping water and see a faint blue glow. To the right, you feel a warm breeze and catch the scent of sulfur.",
            leftOption: "Follow the blue glow (left)",
            rightOption: "Follow the warm breeze (right)",
            leftOutcome: () => {
                const roll = Math.random();
                if (roll < 0.5) {
                    // Good outcome (50%)
                    gameState.character.heal(25);
                    gameState.character.restoreMana(20);
                    return "You discover an underground spring with healing properties! +25 HP, +20 Mana!";
                } else if (roll < 0.8) {
                    // Neutral outcome (30%)
                    gameState.addGold(30);
                    return "You find some glowing crystals worth modest treasure. +30 gold!";
                } else {
                    // Bad outcome (20%)
                    const damage = 15;
                    gameState.character.takeDamage(damage);
                    return `The blue glow was from toxic fungus! The spores damage you for ${damage} HP!`;
                }
            },
            rightOutcome: () => {
                const roll = Math.random();
                if (roll < 0.4) {
                    // Good outcome (40%)
                    gameState.addGold(80);
                    gameState.character.strength += 1;
                    UI.updateDisplay();
                    return "You find a forge with enchanted weapons! +80 gold, +1 Strength!";
                } else if (roll < 0.7) {
                    // Neutral outcome (30%)
                    gameState.addGold(50);
                    gameState.character.heal(10);
                    return "You discover a warm chamber with minor treasures. +50 gold, +10 HP!";
                } else {
                    // Bad outcome (30%)
                    const damage = 20;
                    gameState.character.takeDamage(damage);
                    return `You walk into a fire trap! The flames burn you for ${damage} HP!`;
                }
            }
        },
        {
            text: "You reach a chamber with two doors. The left door is made of dark iron with strange symbols. The right door is wooden with scratch marks and sounds of movement beyond.",
            leftOption: "Enter the iron door (left)",
            rightOption: "Enter the wooden door (right)",
            leftOutcome: () => {
                const roll = Math.random();
                if (roll < 0.35) {
                    // Good outcome (35%)
                    gameState.character.maxMana += 5;
                    gameState.character.mana = gameState.character.maxMana;
                    gameState.addGold(100);
                    UI.updateDisplay();
                    return "An ancient wizard's study! You absorb magical knowledge! +5 Max Mana, +100 gold!";
                } else if (roll < 0.65) {
                    // Neutral outcome (30%)
                    gameState.addGold(60);
                    UI.updateDisplay();
                    return "You find a library with some useful tomes. +60 gold!";
                } else {
                    // Bad outcome (35%)
                    const damage = 25;
                    gameState.character.takeDamage(damage);
                    gameState.character.mana = Math.max(0, gameState.character.mana - 15);
                    UI.updateDisplay();
                    return `A cursed room drains your life force! -${damage} HP, -15 Mana!`;
                }
            },
            rightOutcome: () => {
                const roll = Math.random();
                if (roll < 0.45) {
                    // Good outcome (45%)
                    gameState.addGold(70);
                    gameState.character.agility += 3;
                    UI.updateDisplay();
                    return "You find a beast trainer's room with agility equipment! +70 gold, +3 Agility!";
                } else if (roll < 0.75) {
                    // Neutral outcome (30%)
                    gameState.addGold(40);
                    gameState.character.strength += 1;
                    UI.updateDisplay();
                    return "You find some training equipment. +40 gold, +1 Strength!";
                } else {
                    // Bad outcome (25%) - Force combat
                    const enemy = { name: "Caged Beast", hp: 65, attack: 28, defense: 6, reward: 120, speed: 10, agility: 18, description: "A starved and enraged beast" };
                    setTimeout(() => {
                        World.spawnSpecificEnemy(enemy);
                    }, 100);
                    return "A caged beast breaks free and attacks immediately!";
                }
            }
        },
        {
            text: "You discover a treasure vault with two chests. The gold chest gleams invitingly but sits on a pressure plate. The silver chest is smaller and appears safer.",
            leftOption: "Open the gold chest (risky)",
            rightOption: "Open the silver chest (safe)",
            leftOutcome: () => {
                const roll = Math.random();
                if (roll < 0.25) {
                    // Great outcome (25%)
                    gameState.addGold(250);
                    gameState.character.maxHp += 15;
                    gameState.character.heal(15);
                    UI.updateDisplay();
                    return "Incredible treasure! A legendary artifact! +250 gold, +15 Max HP!";
                } else if (roll < 0.45) {
                    // Good outcome (20%)
                    gameState.addGold(120);
                    gameState.character.strength += 1;
                    UI.updateDisplay();
                    return "Valuable enchanted gear! +120 gold, +1 Strength!";
                } else if (roll < 0.65) {
                    // Neutral outcome (20%)
                    gameState.addGold(80);
                    const damage = 10;
                    gameState.character.takeDamage(damage);
                    return `A minor trap triggered, but you grabbed the treasure! +80 gold, -${damage} HP.`;
                } else {
                    // Bad outcome (35%)
                    const damage = 30;
                    gameState.character.takeDamage(damage);
                    gameState.addGold(20); // Small consolation
                    return `Dangerous trap! Poison darts hit you for ${damage} damage! You grab some coins (+20 gold).`;
                }
            },
            rightOutcome: () => {
                const roll = Math.random();
                if (roll < 0.6) {
                    // Good outcome (60%)
                    const points = Math.floor(Math.random() * 40) + 50;
                    gameState.addGold(points);
                    gameState.character.heal(15);
                    return `A modest but safe reward. +${points} gold, +15 HP!`;
                } else if (roll < 0.9) {
                    // Neutral outcome (30%)
                    const points = Math.floor(Math.random() * 30) + 30;
                    gameState.addGold(points);
                    return `Some coins and trinkets. +${points} gold.`;
                } else {
                    // Bad outcome (10% - even "safe" choices have small risks)
                    gameState.addGold(20);
                    const damage = 5;
                    gameState.character.takeDamage(damage);
                    return `The chest was booby-trapped anyway! Minor damage: -${damage} HP, +20 gold.`;
                }
            }
        },
        {
            text: "A mysterious merchant appears from the shadows. 'Trade your essence for power, or seek wisdom through sacrifice?' he whispers before pointing to two potions.",
            leftOption: "Drink red potion (power)",
            rightOption: "Drink blue potion (wisdom)",
            leftOutcome: () => {
                const roll = Math.random();
                if (roll < 0.4) {
                    // Good outcome (40%)
                    gameState.character.strength += 2;
                    if (gameState.character.isVampire) {
                        // Vampires convert physical mastery to magical (half value)
                        const magicalGain = Math.floor(1 * 0.5);
                        gameState.character.combatSpecialization.magicalMastery += magicalGain;
                        UI.updateDisplay();
                        return `Raw power surges through you! +2 Strength, +${magicalGain} Magical Mastery! (Vampiric conversion)`;
                    } else {
                        gameState.character.combatSpecialization.physicalMastery += 1;
                        UI.updateDisplay();
                        return "Raw power surges through you! +2 Strength, +1 Physical Mastery!";
                    }
                } else if (roll < 0.7) {
                    // Neutral outcome (30%)
                    gameState.character.strength += 1;
                    const hpCost = 10;
                    gameState.character.takeDamage(hpCost);
                    UI.updateDisplay();
                    return `Painful transformation! +1 Strength, -${hpCost} HP.`;
                } else {
                    // Bad outcome (30%)
                    const hpCost = Math.floor(gameState.character.maxHp * 0.25);
                    gameState.character.takeDamage(hpCost);
                    gameState.character.strength += 1;
                    UI.updateDisplay();
                    return `The potion burns! You gain power but at great cost: -${hpCost} HP, +1 Strength.`;
                }
            },
            rightOutcome: () => {
                const roll = Math.random();
                if (roll < 0.45) {
                    // Good outcome (45%)
                    gameState.character.agility += 4;
                    gameState.character.maxMana += 6;
                    gameState.character.combatSpecialization.magicalMastery += 2;
                    UI.updateDisplay();
                    return "Your mind expands with arcane knowledge! +4 Agility, +6 Max Mana, +2 Magical Mastery!";
                } else if (roll < 0.75) {
                    // Neutral outcome (30%)
                    gameState.character.agility += 2;
                    gameState.character.maxMana += 3;
                    UI.updateDisplay();
                    return "Moderate enlightenment. +2 Agility, +3 Max Mana.";
                } else {
                    // Bad outcome (25%)
                    const manaCost = Math.floor(gameState.character.maxMana * 0.3);
                    gameState.character.maxMana = Math.max(20, gameState.character.maxMana - manaCost);
                    gameState.character.mana = Math.min(gameState.character.mana, gameState.character.maxMana);
                    gameState.character.agility += 1;
                    UI.updateDisplay();
                    return `The knowledge is too much for your mind! -${manaCost} Max Mana, +1 Agility.`;
                }
            }
        },
        {
            text: "You discover an ancient crypt with a stone coffin. Inscribed on the lid: 'Eternal power awaits those who embrace the darkness.' A crimson mist seeps from the cracks.<br><span style='color: #ffaa00'><i class='fas fa-exclamation-triangle'></i> WARNING: Vampirism is permanent and comes with serious drawbacks!</span>",
            // Requires 15+ strength - vampire power is for strong adventurers
            minStrength: 15,
            // Rare event - only 8% chance to appear
            rarity: 0.08,
            leftOption: () => gameState.character.isVampire ? "Inspect the coffin" : "<span style='color: #ff6b6b'>Open the coffin</span> (<i class='fas fa-exclamation-triangle'></i> 30% chance to die!)",
            rightOption: () => gameState.character.isVampire ? "Leave it alone" : "Leave it sealed (stay safe)",
            leftOutcome: () => {
                if (gameState.character.isVampire) {
                    // Random event for vampires inspecting the coffin - RISKY
                    const roll = Math.random();
                    if (roll < 0.4) {
                        // Good outcome (40%)
                        const hpGain = 50;
                        const manaGain = 30;
                        gameState.character.heal(hpGain);
                        gameState.character.restoreMana(manaGain);
                        return `<i class='fas fa-moon'></i> You rest in the ancient coffin, feeling its dark energy restore you. +${hpGain} HP, +${manaGain} Mana!`;
                    } else if (roll < 0.7) {
                        // Neutral outcome (30%)
                        gameState.addGold(30);
                        return "You sense a familiar presence in the coffin, but nothing happens. +30 gold from nearby shadows.";
                    } else {
                        // Bad outcome (30%)
                        const damage = Math.floor(gameState.character.maxHp * 0.2);
                        gameState.character.takeDamage(damage);
                        return `<span style='color: #ff6b6b'><i class='fas fa-skull'></i> The coffin rejects your vampiric essence! Dark energy lashes out! -${damage} HP!</span>`;
                    }
                }
                
                // 30% chance to die from the ritual
                const deathRoll = Math.random();
                if (deathRoll < 0.3) {
                    gameState.character.hp = 0;
                    return "<span style='color: #ff0000'><i class='fas fa-skull'></i> THE RITUAL FAILS! The dark power overwhelms you, draining your life force completely. You have died!</span>";
                }
                
                // Calculate equipment bonuses before unequipping (25% absorption)
                let absorbedStrength = 0;
                let absorbedAgility = 0;
                let absorbedPower = 0;
                let absorptionMessage = "";
                
                if (gameState.character.equipment.weapon) {
                    const absorbed = Math.ceil(gameState.character.equipment.weapon.bonus * 0.25);
                    const statType = gameState.character.equipment.weapon.stat;
                    if (statType === 'strength') {
                        absorbedStrength += absorbed;
                        absorptionMessage += `<br><span style='color: #43ea7c'>Absorbed ${absorbed} Strength from ${gameState.character.equipment.weapon.name}!</span>`;
                    } else if (statType === 'power') {
                        absorbedPower += absorbed;
                        absorptionMessage += `<br><span style='color: #43ea7c'>Absorbed ${absorbed} Power from ${gameState.character.equipment.weapon.name}!</span>`;
                    }
                }
                if (gameState.character.equipment.armor) {
                    const absorbed = Math.ceil(gameState.character.equipment.armor.bonus * 0.25);
                    absorbedAgility += absorbed;
                    absorptionMessage += `<br><span style='color: #43ea7c'>Absorbed ${absorbed} Agility from ${gameState.character.equipment.armor.name}!</span>`;
                }
                if (gameState.character.equipment.accessory) {
                    const absorbed = Math.ceil(gameState.character.equipment.accessory.bonus * 0.25);
                    const statType = gameState.character.equipment.accessory.stat;
                    if (statType === 'agility') {
                        absorbedAgility += absorbed;
                        absorptionMessage += `<br><span style='color: #43ea7c'>Absorbed ${absorbed} Agility from ${gameState.character.equipment.accessory.name}!</span>`;
                    } else if (statType === 'power') {
                        absorbedPower += absorbed;
                        absorptionMessage += `<br><span style='color: #43ea7c'>Absorbed ${absorbed} Power from ${gameState.character.equipment.accessory.name}!</span>`;
                    }
                }
                
                // Become a vampire - permanent transformation
                gameState.character.isVampire = true;
                gameState.character.strength += 10 + absorbedStrength;
                gameState.character.agility += 8 + absorbedAgility;
                gameState.character.power += 10 + absorbedPower; // +10 base power bonus
                gameState.character.maxHp += 40; // Increased from 20 to 40
                gameState.character.maxMana -= 10; // Vampires have -10 max mana
                gameState.character.hp = gameState.character.maxHp;
                gameState.character.mana = Math.min(gameState.character.mana, gameState.character.maxMana); // Cap mana to new max
                
                // Transfer 1% of physical mastery to magical mastery
                const physicalToTransfer = Math.floor(gameState.character.combatSpecialization.physicalMastery * 0.01);
                if (physicalToTransfer > 0) {
                    gameState.character.combatSpecialization.physicalMastery -= physicalToTransfer;
                    gameState.character.combatSpecialization.magicalMastery += physicalToTransfer;
                }
                
                // Clear normal spells - player will choose vampire spells via UI
                gameState.character.knownSpells = [];
                gameState.character.selectedSpell = null;
                
                // Force unequip all equipment
                const hadEquipment = gameState.character.equipment.weapon || gameState.character.equipment.armor || gameState.character.equipment.accessory;
                gameState.character.equipment = {
                    weapon: null,
                    armor: null,
                    accessory: null
                };
                
                UI.updateDisplay();
                let totalStr = 10 + absorbedStrength;
                let totalAgi = 8 + absorbedAgility;
                let totalPow = 10 + absorbedPower;
                let message = `<i class='fas fa-moon'></i> TRANSFORMATION! Dark power courses through your veins! You are now a VAMPIRE!<br>+${totalStr} Strength, +${totalAgi} Agility, +${totalPow} Power, +40 Max HP, -10 Max Mana!`;
                
                if (physicalToTransfer > 0) {
                    message += `<br><span style='color: #9b59b6'><i class='fas fa-exchange-alt'></i> ${physicalToTransfer} Physical Mastery converted to Magical Mastery!</span>`;
                }
                
                message += `<br><span style='color: #ff6b6b'><i class='fas fa-exclamation-triangle'></i> Your equipment falls away - vampires cannot use mortal tools!<br><i class='fas fa-exclamation-triangle'></i> Your physical attacks now use Power and cost 8 mana!<br><i class='fas fa-exclamation-triangle'></i> You take increased damage, especially from holy/light/fire!<br><i class='fas fa-exclamation-triangle'></i> Your spells are replaced with vampiric abilities!</span>`;
                
                if (hadEquipment) {
                    message += absorptionMessage;
                    message += "<br><span style='color: #888'>Your vampire blood has absorbed a portion of your equipment's power!</span>";
                }
                
                // Show vampire spell selection UI
                setTimeout(() => {
                    UI.showVampireSpellSelectionUI();
                }, 500);
                
                return message;
            },
            rightOutcome: () => {
                if (gameState.character.isVampire) {
                    // Safe option for vampires - just gold
                    gameState.addGold(100);
                    return "You sense the coffin's power but decide to leave it undisturbed. +100 gold from your cautious wisdom.";
                }
                gameState.addGold(50);
                return "You resist the dark temptation. Your mortal soul remains intact. +50 gold for your wisdom.";
            }
        }
    ],
    
    // High-risk, high-reward events with proper probability distributions
    riskEvents: [
        {
            text: "You find a pulsing magical artifact. It radiates immense power but feels extremely dangerous to touch. The energy could transform you... or destroy you.",
            risk: "Touch the artifact (HIGH RISK - 25% success)",
            safe: "Leave it alone (safe)",
            riskOutcome: () => {
                const roll = Math.random();
                if (roll < 0.25) {
                    // Amazing reward (25% chance)
                    gameState.character.maxHp += 40;
                    gameState.character.maxMana += 15;
                    gameState.character.strength += 8;
                    gameState.character.agility += 8;
                    gameState.addGold(500);
                    UI.updateDisplay();
                    return "LEGENDARY TRANSFORMATION! The artifact reshapes your very essence! +40 Max HP, +15 Max Mana, +8 to all stats, +500 points!";
                } else {
                    // Severe punishment (75% chance)
                    const damage = Math.floor(gameState.character.maxHp * 0.5);
                    gameState.character.takeDamage(damage);
                    gameState.character.mana = Math.max(0, gameState.character.mana - 25);
                    return `The artifact explodes with chaotic energy! You take ${damage} damage and lose 25 Mana!`;
                }
            },
            safeOutcome: () => {
                const roll = Math.random();
                if (roll < 0.7) {
                    gameState.addGold(30);
                    return "You resist temptation and move on safely. Your wisdom is rewarded. +30 points.";
                } else {
                    gameState.addGold(10);
                    return "You leave the artifact, but feel you may have missed something important. +10 points.";
                }
            }
        },
        {
            text: "A demonic altar offers to trade your very soul for ultimate combat mastery. The power would be incredible, but the cost... final.",
            risk: () => {
                // Vampires have better odds with dark powers
                if (gameState.character.isVampire) {
                    return "Make the blood pact (HIGH RISK - 35% success, Vampire affinity!)";
                }
                return "Make the blood pact (EXTREME RISK - 20% success)";
            },
            safe: "Reject the offer (safe)",
            riskOutcome: () => {
                // Vampires have better success rate and bonus rewards
                const isVampire = gameState.character.isVampire;
                const successRate = isVampire ? 0.35 : 0.20;
                const roll = Math.random();
                
                if (roll < successRate) {
                    // Incredible knowledge
                    const masteryBonus = isVampire ? 12 : 10;
                    const agilityBonus = isVampire ? 18 : 15;
                    const strengthBonus = isVampire ? 12 : 10;
                    const goldBonus = isVampire ? 1000 : 800;
                    
                    if (isVampire) {
                        // Vampires convert half of physical mastery to magical
                        const physicalGain = Math.floor(masteryBonus * 0.5);
                        const magicalGain = Math.floor(masteryBonus * 0.5);
                        gameState.character.combatSpecialization.physicalMastery += physicalGain;
                        gameState.character.combatSpecialization.magicalMastery += magicalGain;
                    } else {
                        gameState.character.combatSpecialization.physicalMastery += masteryBonus;
                        gameState.character.combatSpecialization.magicalMastery += masteryBonus;
                    }
                    gameState.character.agility += agilityBonus;
                    gameState.character.strength += strengthBonus;
                    gameState.addGold(goldBonus);
                    UI.updateDisplay();
                    
                    if (isVampire) {
                        return `<i class="fas fa-moon"></i> DARK COVENANT! Your vampire nature resonates with demonic power! +${masteryBonus} to both masteries, +${agilityBonus} Agility, +${strengthBonus} Strength, +${goldBonus} gold!`;
                    } else {
                        return `FORBIDDEN MASTERY! Demonic power flows through you! +${masteryBonus} to both masteries, +${agilityBonus} Agility, +${strengthBonus} Strength, +${goldBonus} gold!`;
                    }
                } else {
                    // Lose a life but gain some compensation
                    gameState.lives--;
                    if (gameState.lives <= 0) {
                        gameState.gameOver("death");
                        return "The demon claims your soul! GAME OVER!";
                    } else {
                        gameState.character.hp = Math.floor(gameState.character.maxHp * 0.2);
                        const masteryCompensation = isVampire ? 3 : 2;
                        if (isVampire) {
                            // Vampires convert half of physical mastery to magical
                            const physicalGain = Math.floor(masteryCompensation * 0.5);
                            const magicalGain = Math.ceil(masteryCompensation * 0.5);
                            gameState.character.combatSpecialization.physicalMastery += physicalGain;
                            gameState.character.combatSpecialization.magicalMastery += magicalGain + masteryCompensation; // Full magical + half of physical
                        } else {
                            gameState.character.combatSpecialization.physicalMastery += masteryCompensation;
                            gameState.character.combatSpecialization.magicalMastery += masteryCompensation;
                        }
                        UI.updateDisplay();
                        return `The demon takes one of your lives! You have ${gameState.lives} lives remaining, but gain combat knowledge as consolation.`;
                    }
                }
            },
            safeOutcome: () => {
                const roll = Math.random();
                if (roll < 0.6) {
                    gameState.addGold(50);
                    gameState.character.heal(15);
                    return "You reject evil and feel spiritually cleansed. +50 points, +15 HP.";
                } else {
                    gameState.addGold(25);
                    gameState.character.heal(8);
                    return "You turn away from the altar, feeling slightly uneasy. +25 points, +8 HP.";
                }
            }
        },
        {
            text: "An ancient gambling demon appears, offering a game of chance. 'Bet your current power against unimaginable strength!' he cackles.",
            risk: "Accept the wager (VERY HIGH RISK - 30% success)",
            safe: "Decline the game (safe)",
            riskOutcome: () => {
                const roll = Math.random();
                if (roll < 0.30) {
                    // Great success (30% chance)
                    const strengthGain = Math.floor(gameState.character.strength * 0.8);
                    const agilityGain = Math.floor(gameState.character.agility * 0.6);
                    const hpGain = Math.floor(gameState.character.maxHp * 0.4);
                    
                    gameState.character.strength += strengthGain;
                    gameState.character.agility += agilityGain;
                    gameState.character.maxHp += hpGain;
                    gameState.character.heal(hpGain);
                    gameState.addGold(400);
                    UI.updateDisplay();
                    return `JACKPOT! The demon honors the wager! +${strengthGain} Strength, +${agilityGain} Agility, +${hpGain} Max HP, +400 points!`;
                } else {
                    // Major loss (70% chance)
                    const strengthLoss = Math.floor(gameState.character.strength * 0.4);
                    const agilityLoss = Math.floor(gameState.character.agility * 0.3);
                    const damage = Math.floor(gameState.character.maxHp * 0.3);
                    
                    gameState.character.strength = Math.max(5, gameState.character.strength - strengthLoss);
                    gameState.character.agility = Math.max(5, gameState.character.agility - agilityLoss);
                    gameState.character.takeDamage(damage);
                    UI.updateDisplay();
                    return `You lose! The demon takes his payment! -${strengthLoss} Strength, -${agilityLoss} Agility, -${damage} HP!`;
                }
            },
            safeOutcome: () => {
                const roll = Math.random();
                if (roll < 0.8) {
                    gameState.addGold(20);
                    return "You wisely avoid the demon's game. Sometimes the best bet is not to bet. +20 points.";
                } else {
                    gameState.addGold(40);
                    gameState.character.agility += 1;
                    UI.updateDisplay();
                    return "The demon respects your caution and grants a small boon. +40 points, +1 Agility.";
                }
            }
        },
        {
            text: "A crystalline pool reflects not your image, but your potential. 'Dive deep for greatness, or stay shallow in safety,' whispers the water itself.",
            risk: "Dive into the depths (HIGH RISK - 35% success)",
            safe: "Wade in the shallows (safe)",
            riskOutcome: () => {
                const roll = Math.random();
                if (roll < 0.35) {
                    // Excellent reward (35% chance)
                    gameState.character.maxMana += 12;
                    gameState.character.mana = gameState.character.maxMana;
                    gameState.character.combatSpecialization.magicalMastery += 5;
                    if (gameState.character.isVampire) {
                        // Vampires convert half of physical mastery to magical
                        const magicalGain = Math.floor(3 * 0.5);
                        gameState.character.combatSpecialization.magicalMastery += magicalGain;
                        gameState.addGold(300);
                        UI.updateDisplay();
                        return `DEEP ENLIGHTENMENT! The pool reveals hidden potential! +12 Max Mana, +${5 + magicalGain} Magical Mastery (vampiric conversion), +300 points!`;
                    } else {
                        gameState.character.combatSpecialization.physicalMastery += 3;
                        gameState.addGold(300);
                        UI.updateDisplay();
                        return "DEEP ENLIGHTENMENT! The pool reveals hidden potential! +12 Max Mana, +5 Magical Mastery, +3 Physical Mastery, +300 points!";
                    }
                } else {
                    // Dangerous outcome (65% chance)
                    const damage = Math.floor(gameState.character.maxHp * 0.35);
                    const manaLoss = Math.floor(gameState.character.maxMana * 0.4);
                    gameState.character.takeDamage(damage);
                    gameState.character.maxMana = Math.max(20, gameState.character.maxMana - manaLoss);
                    gameState.character.mana = Math.min(gameState.character.mana, gameState.character.maxMana);
                    UI.updateDisplay();
                    return `The depths are treacherous! You nearly drown in visions! -${damage} HP, -${manaLoss} Max Mana!`;
                }
            },
            safeOutcome: () => {
                const roll = Math.random();
                if (roll < 0.75) {
                    gameState.character.heal(20);
                    gameState.character.restoreMana(15);
                    gameState.addGold(35);
                    return "The shallow waters are refreshing and safe. +20 HP, +15 Mana, +35 points.";
                } else {
                    gameState.character.heal(10);
                    gameState.addGold(15);
                    return "The waters are lukewarm and unremarkable. +10 HP, +15 points.";
                }
            }
        }
    ],
    
    // Progress events (separate category with mandatory rewards)
    progressEvents: [
        {
            text: "You find a hidden staircase leading deeper into the dungeon!",
            effect: () => {
                const depthGain = 1;
                const pointReward = 20;  // Reduced from 50
                const xpReward = 25;
                const hpReward = 20;
                
                // Cap depth at target depth to ensure final boss encounter
                gameState.dungeonDepth = Math.min(gameState.dungeonDepth + depthGain, gameState.targetDepth);
                gameState.addGold(pointReward);
                gameState.addExp(xpReward);
                gameState.character.heal(hpReward);
                
                if (gameState.dungeonDepth >= gameState.targetDepth) {
                    return `You descend to depth ${gameState.dungeonDepth}! This feels like the final chamber... (+${pointReward} gold, +${xpReward} XP, +${hpReward} HP)`;
                }
                return `You descend to depth ${gameState.dungeonDepth}/${gameState.targetDepth}! The air grows thicker with ancient magic... (+${pointReward} gold, +${xpReward} XP, +${hpReward} HP)`;
            }
        },
        {
            text: "A mysterious map fragment reveals part of the dungeon layout!",
            effect: () => {
                const progress = Math.floor(Math.random() * 2) + 1;
                const pointReward = 16 * progress;  // Reduced from 40
                const xpReward = 20 * progress;
                const manaReward = 15;
                
                // Cap depth at target depth to ensure final boss encounter
                gameState.dungeonDepth = Math.min(gameState.dungeonDepth + progress, gameState.targetDepth);
                gameState.addGold(pointReward);
                gameState.addExp(xpReward);
                gameState.character.restoreMana(manaReward);
                
                if (gameState.dungeonDepth >= gameState.targetDepth) {
                    return `The map leads you ${progress} levels deeper to depth ${gameState.dungeonDepth}! You sense the final chamber nearby! (+${pointReward} gold, +${xpReward} XP, +${manaReward} Mana)`;
                }
                return `The map guides you ${progress} levels deeper to depth ${gameState.dungeonDepth}/${gameState.targetDepth}! (+${pointReward} gold, +${xpReward} XP, +${manaReward} Mana)`;
            }
        },
        {
            text: "You discover a forgotten elevator shaft with working mechanisms!",
            effect: () => {
                const progress = 2;
                const pointReward = 30;  // Reduced from 75
                const xpReward = 40;
                const statBonus = 2;
                
                // Cap depth at target depth to ensure final boss encounter
                gameState.dungeonDepth = Math.min(gameState.dungeonDepth + progress, gameState.targetDepth);
                gameState.addGold(pointReward);
                gameState.addExp(xpReward);
                gameState.character.strength += statBonus;
                gameState.character.agility += statBonus;
                UI.updateDisplay();
                
                if (gameState.dungeonDepth >= gameState.targetDepth) {
                    return `The elevator carries you ${progress} levels deeper to depth ${gameState.dungeonDepth}! The final chamber awaits! (+${pointReward} gold, +${xpReward} XP, +${statBonus} to all stats)`;
                }
                return `The elevator carries you ${progress} levels deeper to depth ${gameState.dungeonDepth}/${gameState.targetDepth}! (+${pointReward} gold, +${xpReward} XP, +${statBonus} to all stats)`;
            }
        },
        {
            text: "A magical portal shimmers before you, offering passage to lower levels!",
            effect: () => {
                const progress = Math.floor(Math.random() * 3) + 1;
                const pointReward = 60;
                const maxHpBonus = 15;
                const maxManaBonus = 10;
                
                // Cap depth at target depth to ensure final boss encounter
                gameState.dungeonDepth = Math.min(gameState.dungeonDepth + progress, gameState.targetDepth);
                gameState.addGold(pointReward);
                gameState.character.maxHp += maxHpBonus;
                gameState.character.maxMana += maxManaBonus;
                gameState.character.heal(maxHpBonus);
                gameState.character.restoreMana(maxManaBonus);
                UI.updateDisplay();
                
                if (gameState.dungeonDepth >= gameState.targetDepth) {
                    return `The portal transports you ${progress} levels deeper to depth ${gameState.dungeonDepth}! The final chamber calls to you! (+${pointReward} gold, +${maxHpBonus} Max HP, +${maxManaBonus} Max Mana)`;
                }
                return `The portal transports you ${progress} levels deeper to depth ${gameState.dungeonDepth}/${gameState.targetDepth}! (+${pointReward} gold, +${maxHpBonus} Max HP, +${maxManaBonus} Max Mana)`;
            }
        }
    ],
    
    getAvailableEnemies(dungeonDepth) {
        // Return enemies appropriate for current dungeon depth
        const availableEnemies = this.enemyTypes.filter(enemy => {
            return dungeonDepth >= enemy.minDepth && dungeonDepth <= enemy.maxDepth;
        });
        
        // Fallback to early enemies if no enemies match current depth
        return availableEnemies.length > 0 ? availableEnemies : this.enemyTypes.slice(0, 3);
    },
    
    // Helper function to get spell from any spell pool
    getSpell(spellName, isVampire = false) {
        if (isVampire) {
            return this.vampireSpells[spellName];
        }
        
        // Check all spell pools
        if (this.genericSpells[spellName]) return this.genericSpells[spellName];
        if (this.warriorSpells[spellName]) return this.warriorSpells[spellName];
        if (this.mageSpells[spellName]) return this.mageSpells[spellName];
        if (this.rogueSpells[spellName]) return this.rogueSpells[spellName];
        if (this.paladinSpells[spellName]) return this.paladinSpells[spellName];
        if (this.spells[spellName]) return this.spells[spellName];
        
        return null;
    }
};

// ===============================================
// CLASS SELECTION SYSTEM (Handles character class selection UI and initialization)
// ===============================================
const ClassSelection = {
    showClassSelection: function() {
        const screen = document.getElementById('class-selection-screen');
        const container = document.getElementById('class-cards-container');
        container.innerHTML = '';
        
        for (const className in CLASS_DESCRIPTIONS) {
            const classInfo = CLASS_DESCRIPTIONS[className];
            const card = this.createClassCard(className, classInfo);
            container.appendChild(card);
        }
        
        screen.classList.remove('hidden');
        document.getElementById('game-story').parentElement.classList.add('hidden');
    },
    
    createClassCard: function(className, classInfo) {
        const card = document.createElement('div');
        card.className = 'bg-black/50 border-2 rounded-lg p-4 hover:border-cyan-400 transition-all cursor-pointer';
        card.style.borderColor = classInfo.color;

        // Get passive and preferred stats from CHARACTER_CLASSES
        const ClassCtor = CHARACTER_CLASSES[className];
        const tempInstance = new ClassCtor();
        const passiveName = tempInstance.passiveName || '';
        const passiveDesc = tempInstance.passiveDescription || '';
        const prefStats = tempInstance.preferredStats ? tempInstance.preferredStats.join(', ') : '';

        card.innerHTML = `
            <div class="flex items-center mb-3">
                <i class="fas ${classInfo.icon} text-3xl mr-3" style="color: ${classInfo.color}"></i>
                <h3 class="text-2xl font-bold" style="color: ${classInfo.color}">${classInfo.name}</h3>
            </div>
            <p class="text-gray-300 mb-3">${classInfo.description}</p>
            <p class="text-sm text-gray-400 mb-2">${classInfo.startingStats}</p>
            <div class="mb-2">
                <p class="text-green-400 font-bold mb-1">Strengths:</p>
                <ul class="text-sm text-gray-300">
                    ${classInfo.strengths.map(s => `<li>• ${s}</li>`).join('')}
                </ul>
            </div>
            <div class="mb-3">
                <p class="text-red-400 font-bold mb-1">Weaknesses:</p>
                <ul class="text-sm text-gray-300">
                    ${classInfo.weaknesses.map(w => `<li>• ${w}</li>`).join('')}
                </ul>
            </div>
            <p class="text-xs text-cyan-300 italic mb-2">${classInfo.playstyle}</p>
            <div class="mb-2">
                <span class="font-bold text-yellow-300">Passive:</span> <span class="text-yellow-200">${passiveName}</span><br>
                <span class="text-xs text-gray-300">${passiveDesc}</span>
            </div>
            <div class="mb-2">
                <span class="font-bold text-green-300">Preferred Stats:</span> <span class="text-xs text-gray-200">${prefStats}</span>
            </div>
        `;
        card.onclick = () => this.selectClass(className);
        return card;
    },
    
    selectClass: function(className) {
        gameState.selectedClass = className;
        const ClassConstructor = CHARACTER_CLASSES[className];
        gameState.character = new ClassConstructor();
        
        document.getElementById('class-selection-screen').classList.add('hidden');
        document.getElementById('game-story').parentElement.classList.remove('hidden');
        
        UI.addToLog(`<span style="color: ${CLASS_DESCRIPTIONS[className].color}">You have chosen the ${className} class!</span>`, "levelup");
        UI.updateClassTips(className);
        UI.updateDisplay();
        GameController.continueGameStart();
    }
};

// ===============================================
// WORLD SYSTEM (Handles exploration, events, and world state)
// ===============================================
const World = {
    explore() {
        if (gameState.isGameOver || gameState.inCombat) return;
        
        if (!gameState.character) {
            UI.addToLog("Select a class first!", "error");
            return;
        }
        
        // Increment turn counter for time limit tracking
        gameState.incrementTurn();
        
        // Check if game ended due to turn limit
        if (gameState.isGameOver) return;
        
        gameState.discoveries++;
        
        // Determine encounter type using balanced system
        const encounterType = this.determineEncounterType();
        
        switch (encounterType) {
            case 'combat':
                this.spawnEnemy();
                gameState.encounterHistory.combatsSinceProgress++;
                break;
            case 'item':
                this.triggerItemEvent();
                break;
            case 'progress':
                this.triggerProgressEvent();
                gameState.encounterHistory.combatsSinceProgress = 0;
                break;
            case 'choice':
                this.triggerChoiceEvent();
                break;
            case 'risk':
                this.triggerRiskEvent();
                break;
        }
        
        // Update encounter history for future balancing
        gameState.encounterHistory.lastEventType = encounterType;
    },
    
    determineEncounterType() {
        const history = gameState.encounterHistory;
        let weights = { ...history.eventWeights };
        
        // Reduce weight of last event type to prevent repetition
        if (history.lastEventType) {
            weights[history.lastEventType] *= history.repeatedTypeModifier;
        }
        
        // Prevent progress events if not enough combat encounters have occurred
        if (history.combatsSinceProgress < history.minCombatsBetweenProgress) {
            weights.progress = 0;
        }
        
        // Weighted random selection
        const totalWeight = weights.combat + weights.item + weights.progress + weights.choice + weights.risk;
        const random = Math.random() * totalWeight;
        
        if (random < weights.combat) return 'combat';
        if (random < weights.combat + weights.item) return 'item';
        if (random < weights.combat + weights.item + weights.progress) return 'progress';
        if (random < weights.combat + weights.item + weights.progress + weights.choice) return 'choice';
        return 'risk';
    },
    
    spawnEnemy() {
        // Use dungeon depth instead of player level for enemy selection
        const availableEnemies = GameData.getAvailableEnemies(gameState.dungeonDepth);
        const enemyData = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
        
        this.createEnemyInstance(enemyData);
    },
    
    spawnSpecificEnemy(enemyData) {
        // Force specific enemy encounter (used by choice events)
        this.createEnemyInstance(enemyData);
    },
    
    createEnemyInstance(enemyData) {
        // Create enemy instance with methods for self-contained behavior
        gameState.currentEnemy = {
            ...enemyData,
            maxHp: enemyData.hp,
            turnsToSkip: 0, // Track consecutive player turns from agility advantage
            
            // Enemy methods (encapsulate enemy behavior)
            takeDamage: function(damage, damageType = 'physical', magicalVictory = false, physicalVictory = false, isCritical = false) {
                // Apply resistance multiplier based on damage type
                const resistance = this.resistances && this.resistances[damageType] ? this.resistances[damageType] : 1.0;
                const resistedDamage = damage * resistance;
                
                // Apply defense (after resistance calculation)
                const actualDamage = Math.max(resistedDamage - this.defense, 1);
                this.hp -= actualDamage;
                
                // Show damage feedback with critical hit flavor
                let damageText = '';
                if (isCritical) {
                    const critMessages = [
                        `<span style='color: #ffd700'><i class="fas fa-star"></i> CRITICAL HIT!</span> A devastating blow strikes true for ${Math.floor(actualDamage)} damage!`,
                        `<span style='color: #ffd700'><i class="fas fa-star"></i> CRITICAL HIT!</span> You find a weak point and deal ${Math.floor(actualDamage)} damage!`,
                        `<span style='color: #ffd700'><i class="fas fa-star"></i> CRITICAL HIT!</span> A brutal strike tears through for ${Math.floor(actualDamage)} damage!`,
                        `<span style='color: #ffd700'><i class="fas fa-star"></i> CRITICAL HIT!</span> Your attack cuts deep, dealing ${Math.floor(actualDamage)} damage!`
                    ];
                    damageText = critMessages[Math.floor(Math.random() * critMessages.length)];
                } else {
                    damageText = `You attack for ${Math.floor(actualDamage)} damage!`;
                }
                
                if (resistance < 0.9) {
                    damageText += ` <span style="color: #4CAF50;">(Resisted!)</span>`;
                } else if (resistance > 1.1) {
                    damageText += ` <span style="color: #FF6B6B;">(Super Effective!)</span>`;
                }
                UI.addToLog(damageText, "combat");
                
                // Show lore explanation on first resistance encounter
                if (this.resistances && (resistance < 0.9 || resistance > 1.1) && !this.shownLore) {
                    UI.addToLog(`<i class="fas fa-book"></i> ${this.lore}`, "lore");
                    this.shownLore = true;
                }
                
                if (this.hp <= 0) {
                    // Different rewards based on victory type
                    // Vampires always increase magical mastery regardless of attack type
                    if (magicalVictory || gameState.character.isVampire) {
                        gameState.character.combatSpecialization.magicalMastery += 1;
                        UI.addToLog(`Magical mastery increased! Spell effectiveness improved.`, "victory");
                    } else if (physicalVictory) {
                        // Physical scaling spells increase physical mastery
                        gameState.character.combatSpecialization.physicalMastery += 1;
                        UI.addToLog(`Physical mastery increased! Physical techniques improved.`, "victory");
                    } else {
                        // Regular physical attacks
                        gameState.character.combatSpecialization.physicalMastery += 1;
                        UI.addToLog(`Physical mastery increased! Attack accuracy improved.`, "victory");
                    }
                    
                    gameState.inventory.enemyKills++;
                    
                    // Gems provide bonus gold rewards (20% chance per gem, consume 1 gem)
                    let gemBonus = 0;
                    if (gameState.inventory.gems > 0 && Math.random() < 0.2) {
                        gemBonus = Math.floor(this.reward * 0.2); // Reduced from 0.5
                        gameState.addGold(gemBonus);
                        gameState.inventory.gems--;
                        UI.addToLog(`A gem you're carrying attracts extra treasure! +${gemBonus} bonus gold!`, "gold");
                    }
                    
                    // Reduce gold rewards by 60%, add XP system
                    const goldReward = Math.floor(this.reward * 0.4); // 40% of original
                    const xpReward = Math.floor(this.reward * 0.8); // XP based on enemy strength
                    gameState.addGold(goldReward);
                    gameState.addExp(xpReward);
                    UI.addToLog(`${this.name} defeated! +${goldReward} gold, +${xpReward} XP!`, "victory");
                    UI.updateStory(`<i class="fas fa-trophy"></i> Victory! The ${this.name} falls before your might!`);
                    
                    // Check for equipment drop - pass enemy for context-specific drops
                    Equipment.rollForDrop(this);
                    
                    Combat.endBattle();
                } else {
                    // Enemy counter-attack only if enemy is still alive
                    // Don't counter-attack if player has haste active OR turnsToSkip remaining
                    const hasExtraTurns = this.turnsToSkip && this.turnsToSkip > 0;
                    const hasHaste = gameState.character.activeEffects.hasteTurns && gameState.character.activeEffects.hasteTurns > 0;
                    
                    if (this.hp > 0 && !hasExtraTurns && !hasHaste) {
                        setTimeout(() => {
                            // Double-check enemy is still alive and combat is active
                            if (gameState.inCombat && gameState.currentEnemy && gameState.currentEnemy.hp > 0 && !gameState.isGameOver) {
                                Combat.enemyAttack();
                            }
                        }, 500);
                    }
                }
                
                UI.updateDisplay();
            },
            
            performAttack: function() {
                // Check for rogue surprise defense (can dodge first attack if enemy goes first)
                if (gameState.character.surpriseDefenseActive) {
                    UI.addToLog(`<i class="fas fa-user-ninja" style="color: #9775fa"></i> <strong>Surprise Defense!</strong> You dodge the attack with ease!`, "victory");
                    gameState.character.surpriseDefenseActive = false;
                    // Apply permanent agility bonus for this fight
                    gameState.character.agility += gameState.character.surpriseDefenseBonus;
                    UI.addToLog(`Your reflexes sharpen! +${gameState.character.surpriseDefenseBonus} Agility for this battle!`, "victory");
                    gameState.character.surpriseDefenseBonus = 0;
                    return; // Skip the attack
                }
                
                // Check for dodge first (Shadow Meld)
                if (gameState.character.activeEffects.dodgeChance && gameState.character.activeEffects.dodgeDuration > 0) {
                    if (Math.random() < gameState.character.activeEffects.dodgeChance) {
                        UI.addToLog(`<i class="fas fa-user-ninja"></i> You meld into the shadows and dodge the attack!`, "victory");
                        gameState.character.activeEffects.dodgeDuration--;
                        if (gameState.character.activeEffects.dodgeDuration <= 0) {
                            gameState.character.activeEffects.dodgeChance = 0;
                            UI.addToLog(`Shadow Meld fades...`, "combat");
                        }
                        return; // Attack dodged, skip damage
                    } else {
                        gameState.character.activeEffects.dodgeDuration--;
                        if (gameState.character.activeEffects.dodgeDuration <= 0) {
                            gameState.character.activeEffects.dodgeChance = 0;
                            UI.addToLog(`Shadow Meld fades...`, "combat");
                        }
                    }
                }
                
                // Spell-casting enemies have a chance to use spells instead
                if (this.canCastSpells && Math.random() < 0.4) {
                    // Cast spell instead of physical attack - uses magical defense (agility only)
                    let spellDamage = Math.floor(this.attack * 0.9 + Math.random() * 12);
                    
                    // Apply weaken debuff
                    if (this.weakened > 0) {
                        spellDamage = Math.floor(spellDamage * (1 - this.weakenAmount));
                    }
                    
                    const actualDamage = Math.max(spellDamage - gameState.character.getMagicalDefense(), 1);
                    const playerDied = gameState.character.takeDamage(actualDamage, 'magical');
                    
                    // Check for Battle Hardened trigger
                    if (gameState.character.characterClass === 'Warrior' && gameState.character.battleHardenedTriggered && !gameState.character.battleHardenedAnnounced) {
                        UI.addToLog(`<i class="fas fa-sword" style="color: #ff6b6b"></i> <strong>Battle Hardened!</strong> Your warrior spirit awakens! +5 Strength, +3 Defense!`, "victory");
                        gameState.character.battleHardenedAnnounced = true;
                        UI.updateDisplay();
                    }
                    
                    // Check for Divine Intervention trigger
                    if (gameState.character.characterClass === 'Paladin' && gameState.character.divineInterventionUsed && !gameState.character.divineInterventionAnnounced) {
                        UI.addToLog(`<i class="fas fa-shield-halved" style="color: #ffd43b"></i> <strong>Divine Intervention!</strong> Divine power saves you from death!`, "victory");
                        gameState.character.divineInterventionAnnounced = true;
                        UI.updateDisplay();
                    }
                    
                    // Tiebreaker: if player would die but enemy is already dead, player survives with 1 HP
                    if (playerDied && this.hp <= 0) {
                        gameState.character.hp = 1;
                        gameState.character.combatSpecialization.physicalMastery += 0.5;
                        gameState.character.combatSpecialization.magicalMastery += 0.5;
                        UI.addToLog(`<i class="fas fa-shield-alt" style="color: gold;"></i> You struck the killing blow first! You survive with 1 HP!`, "victory");
                        UI.addToLog(`Narrow victory grants insight! +0.5 to both masteries!`, "victory");
                        return; // Don't call playerDeath
                    }
                    
                    let logMessage = `${this.name} casts a devastating spell for ${actualDamage} magical damage!`;
                    if (this.weakened > 0) {
                        logMessage += ` <i class="fas fa-shield-alt" style="color: cyan;"></i> (Weakened)`;
                    }
                    UI.addToLog(logMessage, "damage");
                    
                    // Decrement weaken duration
                    if (this.weakened > 0) {
                        this.weakened--;
                    }
                    
                    UI.updateDisplay();
                    
                    if (playerDied) {
                        gameState.playerDeath();
                    }
                    return;
                }
                
                let enemyDamage = Math.floor(this.attack + Math.random() * 10);
                
                // Apply weaken debuff
                if (this.weakened > 0) {
                    enemyDamage = Math.floor(enemyDamage * (1 - this.weakenAmount));
                }
                
                // Physical attacks use physical defense (defense + agility/2)
                const actualDamage = Math.max(enemyDamage - gameState.character.getPhysicalDefense(), 1);
                
                // Determine damage type based on enemy (default to physical)
                const damageType = this.damageType || 'physical';
                const playerDied = gameState.character.takeDamage(actualDamage, damageType);
                
                // Check for Battle Hardened trigger
                if (gameState.character.characterClass === 'Warrior' && gameState.character.battleHardenedTriggered && !gameState.character.battleHardenedAnnounced) {
                    UI.addToLog(`<i class="fas fa-sword" style="color: #ff6b6b"></i> <strong>Battle Hardened!</strong> Your warrior spirit awakens! +5 Strength, +3 Defense!`, "victory");
                    gameState.character.battleHardenedAnnounced = true;
                    UI.updateDisplay();
                }
                
                // Check for Divine Intervention trigger
                if (gameState.character.characterClass === 'Paladin' && gameState.character.divineInterventionUsed && !gameState.character.divineInterventionAnnounced) {
                    UI.addToLog(`<i class="fas fa-shield-halved" style="color: #ffd43b"></i> <strong>Divine Intervention!</strong> Divine power saves you from death!`, "victory");
                    gameState.character.divineInterventionAnnounced = true;
                    UI.updateDisplay();
                }
                
                // Tiebreaker: if player would die but enemy is already dead, player survives with 1 HP
                if (playerDied && this.hp <= 0) {
                    gameState.character.hp = 1;
                    gameState.character.combatSpecialization.physicalMastery += 0.5;
                    gameState.character.combatSpecialization.magicalMastery += 0.5;
                    UI.addToLog(`<i class="fas fa-shield-alt" style="color: gold;"></i> You struck the killing blow first! You survive with 1 HP!`, "victory");
                    UI.addToLog(`Narrow victory grants insight! +0.5 to both masteries!`, "victory");
                    return; // Don't call playerDeath
                }
                
                let logMessage = `${this.name} attacks you for ${actualDamage} damage!`;
                if (this.weakened > 0) {
                    logMessage += ` <i class="fas fa-shield-alt" style="color: cyan;"></i> (Weakened)`;
                }
                UI.addToLog(logMessage, "damage");
                
                // Decrement weaken duration
                if (this.weakened > 0) {
                    this.weakened--;
                }
                
                UI.updateDisplay();
                
                if (playerDied) {
                    gameState.playerDeath();
                }
            }
        };
        
        gameState.inCombat = true;
        
        // Reset battle-specific passive flags
        if (gameState.character.characterClass === 'Warrior') {
            gameState.character.battleHardenedTriggered = false;
            gameState.character.battleHardenedAnnounced = false;
        } else if (gameState.character.characterClass === 'Paladin') {
            gameState.character.divineInterventionUsed = false;
            gameState.character.divineInterventionAnnounced = false;
        }
        
        // Calculate agility-based turn system
        const playerAgility = gameState.character.getEffectiveAgility();
        const enemyAgility = enemyData.agility || 10;
        const agilityDifference = playerAgility - enemyAgility;
        
        // Rogue passive: Surprise Attack
        let rogueSurpriseAttack = false;
        let rogueSurpriseDefense = false;
        if (gameState.character.characterClass === 'Rogue') {
            if (agilityDifference > 0) {
                // Rogue is faster - gets guaranteed crit on first attack
                rogueSurpriseAttack = true;
                gameState.character.surpriseAttackReady = true;
                UI.addToLog(`<i class="fas fa-user-ninja" style="color: #9775fa"></i> <strong>Surprise Attack!</strong> Your superior agility grants a guaranteed critical hit!`, "victory");
            } else if (agilityDifference < 0) {
                // Enemy is faster - rogue gets defensive bonuses
                rogueSurpriseDefense = true;
                gameState.character.surpriseDefenseActive = true;
                gameState.character.surpriseDefenseBonus = 3;
                UI.addToLog(`<i class="fas fa-shield-alt" style="color: #9775fa"></i> <strong>Defensive Stance!</strong> You're ready to dodge and gain +3 agility for this fight!`, "victory");
            }
        }
        
        // Determine turn advantage: player gets extra turns if significantly faster (10 agility = 1 extra turn, max 2)
        if (agilityDifference > 0) {
            gameState.currentEnemy.turnsToSkip = Math.min(Math.floor(agilityDifference / 10), 2);
            
            // Rogue passive adds +1 extra turn when they have higher agility
            if (rogueSurpriseAttack) {
                gameState.currentEnemy.turnsToSkip += 1;
                const totalTurns = gameState.currentEnemy.turnsToSkip + 1;
                UI.addToLog(`<i class="fas fa-bolt" style="color: #9775fa"></i> Surprise advantage! You get ${totalTurns} consecutive action(s)!`, "victory");
            } else if (gameState.currentEnemy.turnsToSkip > 0) {
                UI.addToLog(`<i class="fas fa-bolt" style="color: #43ea7c"></i> Your superior agility grants ${gameState.currentEnemy.turnsToSkip + 1} consecutive action(s) per turn!`, "victory");
            }
        } else {
            gameState.currentEnemy.turnsToSkip = 0;
        }
        
        const enemyGoesFirst = agilityDifference < 0;
        const initiativeWarning = enemyGoesFirst ? " <i class='fas fa-bolt'></i> The enemy's superior agility allows them to strike first!" : "";
        
        UI.updateStory(`<i class="fas fa-swords"></i> Combat! You encounter a ${enemyData.name}! ${enemyData.description}${initiativeWarning}`);
        UI.addToLog(`A wild ${enemyData.name} appears!${initiativeWarning}`, "combat");
        UI.updateDisplay();
        
        // Handle initiative - enemy attacks first if they have higher agility
        if (enemyGoesFirst) {
            // Hide exploration buttons immediately before enemy attacks
            UI.hideAllActionButtons();
            UI.addToLog(`The ${enemyData.name} strikes before you can react!`, "damage");
            setTimeout(() => {
                // Only attack if still in combat
                if (gameState.inCombat && gameState.currentEnemy && gameState.currentEnemy.hp > 0 && !gameState.isGameOver) {
                    gameState.currentEnemy.performAttack();
                }
                if (!gameState.isGameOver && gameState.inCombat) {
                    UI.showCombatButtons();
                }
            }, 800);
        } else {
            // Player acts first - show combat buttons immediately
            UI.showCombatButtons();
        }
    },
    
    triggerItemEvent() {
        const event = GameData.itemEvents[Math.floor(Math.random() * GameData.itemEvents.length)];
        const result = event.effect();
        
        UI.updateStory(`<i class="fas fa-search"></i> Discovery: ${event.text} ${result}`);
        UI.addToLog(`Discovery #${gameState.discoveries}: ${event.text} ${result}`, "event");
        gameState.addGold(4); // Reduced from 10 (60% reduction)
        gameState.addExp(5); // Small XP for exploring
    },
    
    triggerProgressEvent() {
        // Check if player has reached the final depth
        if (gameState.dungeonDepth >= gameState.targetDepth) {
            this.triggerFinalBoss();
            return;
        }
        
        // Filter events that pass their rarity check
        const availableEvents = GameData.progressEvents.filter(event => {
            // If event has rarity defined, check if it should appear
            if (event.rarity) {
                return Math.random() < event.rarity;
            }
            // Events without rarity always available
            return true;
        });
        
        // If no events pass rarity check, use all events (fallback)
        const eventPool = availableEvents.length > 0 ? availableEvents : GameData.progressEvents;
        const event = eventPool[Math.floor(Math.random() * eventPool.length)];
        const result = event.effect();
        
        UI.updateStory(`<i class="fas fa-map"></i> Major Discovery: ${event.text} ${result}`);
        UI.addToLog(`MAJOR DISCOVERY #${gameState.discoveries}: ${event.text} ${result}`, "progress");
    },
    
    triggerFinalBoss() {
        // Final boss encounter at maximum depth
        const finalBoss = {
            name: "The Dungeon Lord",
            hp: 400,        // Increased HP for longer fight (8-12 turns)
            maxHp: 400,     
            attack: 35,     // Reduced attack - player should survive 10-15 hits with 250+ HP and defense
            defense: 10,    // Moderate defense - reduces incoming damage by 10
            reward: 1000,
            speed: 8,
            agility: 32,    // High agility - challenges even maxed rogues (player ~32-40 agility)
            description: "The ancient master of this cursed dungeon, wreathed in dark magic and wielding powers beyond mortal comprehension",
            resistances: { physical: 0.70, magical: 0.70 }, // 30% damage reduction from both types - fair for both builds
            lore: "The Dungeon Lord's ancient power grants resistance to all mortal attacks - only persistent assault can break his defenses",
            
            // Special boss abilities
            isAlive: function() { return this.hp > 0; },
            
            takeDamage: function(damage, damageType = 'physical', magicalVictory = false, physicalVictory = false, isCritical = false) {
                // Apply resistance multiplier based on damage type
                const resistance = this.resistances && this.resistances[damageType] ? this.resistances[damageType] : 1.0;
                const resistedDamage = damage * resistance;
                
                // Apply defense (after resistance calculation)
                const actualDamage = Math.max(resistedDamage - this.defense, 1);
                this.hp -= actualDamage;
                
                // Show damage feedback with critical hit flavor
                let damageText = '';
                if (isCritical) {
                    const critMessages = [
                        `<span style='color: #ffd700'><i class="fas fa-star"></i> CRITICAL HIT!</span> A devastating blow strikes the Dungeon Lord for ${Math.floor(actualDamage)} damage!`,
                        `<span style='color: #ffd700'><i class="fas fa-star"></i> CRITICAL HIT!</span> You find a weak point in the Dungeon Lord's armor for ${Math.floor(actualDamage)} damage!`,
                        `<span style='color: #ffd700'><i class="fas fa-star"></i> CRITICAL HIT!</span> A brutal strike tears through the Dungeon Lord for ${Math.floor(actualDamage)} damage!`,
                        `<span style='color: #ffd700'><i class="fas fa-star"></i> CRITICAL HIT!</span> Your attack cuts deep into the Dungeon Lord, dealing ${Math.floor(actualDamage)} damage!`
                    ];
                    damageText = critMessages[Math.floor(Math.random() * critMessages.length)];
                } else {
                    damageText = `You strike the Dungeon Lord for ${Math.floor(actualDamage)} damage!`;
                }
                
                if (resistance < 0.9) {
                    damageText += ` <span style="color: #4CAF50;">(Resisted!)</span>`;
                } else if (resistance > 1.1) {
                    damageText += ` <span style="color: #FF6B6B;">(Super Effective!)</span>`;
                }
                UI.addToLog(damageText, "combat");
                
                if (this.hp <= 0) {
                    // Victory over final boss
                    gameState.finalBossDefeated = true;
                    const goldReward = Math.floor(this.reward * 0.4); // Reduced to match other enemies
                    const xpReward = Math.floor(this.reward * 1.5); // Boss gives more XP
                    gameState.addGold(goldReward);
                    gameState.addExp(xpReward);
                    UI.addToLog(`THE DUNGEON LORD FALLS! +${goldReward} gold, +${xpReward} XP!`, "victory");
                    UI.updateStory(`<i class="fas fa-crown"></i> VICTORY! The Dungeon Lord crumbles to dust! You have conquered the depths and emerged as the ultimate champion!`);
                    
                    // Boss always drops epic equipment
                    Equipment.rollForDrop(); // Give normal drop chance plus...
                    if (Math.random() < 0.5) Equipment.rollForDrop(); // 50% chance for second drop
                    
                    gameState.gameOver("victory");
                } else {
                    // Boss special abilities at different health thresholds
                    if (this.hp <= 150 && !this.enraged) {
                        this.enraged = true;
                        this.attack += 10;  // Moderate increase - from 35 to 45
                        UI.addToLog(`The Dungeon Lord enters a berserker rage! Attack increased!`, "damage");
                    }
                    
                    // Boss counter-attack with potential special abilities
                    // Only counter-attack if still in combat
                    if (gameState.inCombat && this.hp > 0) {
                        setTimeout(() => this.performSpecialAttack(), 500);
                    }
                }
                
                UI.updateDisplay();
            },
            
            performSpecialAttack: function() {
                // Don't attack if combat has ended
                if (!gameState.inCombat || !gameState.currentEnemy || this.hp <= 0) return;
                
                // Check for dodge first (Shadow Meld)
                if (gameState.character.activeEffects.dodgeChance && gameState.character.activeEffects.dodgeDuration > 0) {
                    if (Math.random() < gameState.character.activeEffects.dodgeChance) {
                        UI.addToLog(`<i class="fas fa-user-ninja"></i> You meld into the shadows and dodge the Dungeon Lord's attack!`, "victory");
                        gameState.character.activeEffects.dodgeDuration--;
                        if (gameState.character.activeEffects.dodgeDuration <= 0) {
                            gameState.character.activeEffects.dodgeChance = 0;
                            UI.addToLog(`Shadow Meld fades...`, "combat");
                        }
                        return; // Attack dodged, skip damage
                    } else {
                        gameState.character.activeEffects.dodgeDuration--;
                        if (gameState.character.activeEffects.dodgeDuration <= 0) {
                            gameState.character.activeEffects.dodgeChance = 0;
                            UI.addToLog(`Shadow Meld fades...`, "combat");
                        }
                    }
                }
                
                const attackType = Math.random();
                
                if (attackType < 0.3) {
                    // Dark magic attack - uses magical defense (agility only)
                    let magicDamage = Math.floor(this.attack * 0.8 + Math.random() * 15);
                    
                    // Apply weaken debuff
                    if (this.weakened > 0) {
                        magicDamage = Math.floor(magicDamage * (1 - this.weakenAmount));
                    }
                    
                    const actualDamage = Math.max(magicDamage - gameState.character.getMagicalDefense(), 1);
                    const playerDied = gameState.character.takeDamage(actualDamage, 'magical');
                    
                    // Tiebreaker: if player would die but boss is already dead, player survives with 1 HP
                    if (playerDied && this.hp <= 0) {
                        gameState.character.hp = 1;
                        gameState.character.combatSpecialization.physicalMastery += 0.5;
                        gameState.character.combatSpecialization.magicalMastery += 0.5;
                        UI.addToLog(`<i class="fas fa-shield-alt" style="color: gold;"></i> You struck the killing blow first! You survive with 1 HP!`, "victory");
                        UI.addToLog(`Narrow victory grants insight! +0.5 to both masteries!`, "victory");
                        return;
                    }
                    
                    let logMessage = `The Dungeon Lord unleashes DARK MAGIC for ${actualDamage} damage!`;
                    if (this.weakened > 0) {
                        logMessage += ` <i class="fas fa-shield-alt" style="color: cyan;"></i> (Weakened)`;
                    }
                    UI.addToLog(logMessage, "damage");
                    
                    UI.updateDisplay();
                    
                    if (playerDied) gameState.playerDeath();
                } else if (attackType < 0.6) {
                    // Life drain attack - heals boss while damaging player (physical)
                    let drainDamage = Math.floor(this.attack * 0.6 + Math.random() * 10);
                    
                    // Apply weaken debuff
                    if (this.weakened > 0) {
                        drainDamage = Math.floor(drainDamage * (1 - this.weakenAmount));
                    }
                    
                    const actualDamage = Math.max(drainDamage - gameState.character.getPhysicalDefense(), 1);
                    const playerDied = gameState.character.takeDamage(actualDamage, 'physical');
                    
                    // Tiebreaker: if player would die but boss is already dead, player survives with 1 HP
                    if (playerDied && this.hp <= 0) {
                        gameState.character.hp = 1;
                        gameState.character.combatSpecialization.physicalMastery += 0.5;
                        gameState.character.combatSpecialization.magicalMastery += 0.5;
                        UI.addToLog(`<i class="fas fa-shield-alt" style="color: gold;"></i> You struck the killing blow first! You survive with 1 HP!`, "victory");
                        UI.addToLog(`Narrow victory grants insight! +0.5 to both masteries!`, "victory");
                        return;
                    }
                    
                    this.hp = Math.min(this.hp + Math.floor(actualDamage / 2), this.maxHp);
                    
                    let logMessage = `The Dungeon Lord drains your life force! ${actualDamage} damage dealt, boss heals ${Math.floor(actualDamage / 2)}!`;
                    if (this.weakened > 0) {
                        logMessage += ` <i class="fas fa-shield-alt" style="color: cyan;"></i> (Weakened)`;
                    }
                    UI.addToLog(logMessage, "damage");
                    
                    UI.updateDisplay();
                    
                    if (playerDied) gameState.playerDeath();
                } else {
                    // Normal attack (physical)
                    let enemyDamage = Math.floor(this.attack + Math.random() * 12);
                    
                    // Apply weaken debuff
                    if (this.weakened > 0) {
                        enemyDamage = Math.floor(enemyDamage * (1 - this.weakenAmount));
                    }
                    
                    const actualDamage = Math.max(enemyDamage - gameState.character.getPhysicalDefense(), 1);
                    const playerDied = gameState.character.takeDamage(actualDamage, 'physical');
                    
                    // Tiebreaker: if player would die but boss is already dead, player survives with 1 HP
                    if (playerDied && this.hp <= 0) {
                        gameState.character.hp = 1;
                        gameState.character.combatSpecialization.physicalMastery += 0.5;
                        gameState.character.combatSpecialization.magicalMastery += 0.5;
                        UI.addToLog(`<i class="fas fa-shield-alt" style="color: gold;"></i> You struck the killing blow first! You survive with 1 HP!`, "victory");
                        UI.addToLog(`Narrow victory grants insight! +0.5 to both masteries!`, "victory");
                        return;
                    }
                    
                    let logMessage = `The Dungeon Lord attacks with crushing force for ${actualDamage} damage!`;
                    if (this.weakened > 0) {
                        logMessage += ` <i class="fas fa-shield-alt" style="color: cyan;"></i> (Weakened)`;
                    }
                    UI.addToLog(logMessage, "damage");
                    
                    UI.updateDisplay();
                    
                    if (playerDied) gameState.playerDeath();
                }
                
                // Decrement weaken duration after any attack type
                if (this.weakened > 0) {
                    this.weakened--;
                }
            },
            
            performAttack: function() {
                this.performSpecialAttack();
            }
        };
        
        gameState.currentEnemy = finalBoss;
        gameState.inCombat = true;
        
        UI.updateStory(`<i class="fas fa-skull"></i> FINAL BOSS! You have reached the heart of the dungeon! The Dungeon Lord rises from his throne, dark energy crackling around his form! <i class='fas fa-bolt'></i> He strikes first!`);
        UI.addToLog(`THE FINAL CONFRONTATION! The Dungeon Lord appears!`, "combat");
        
        // Boss always gets first strike
        setTimeout(() => {
            finalBoss.performSpecialAttack();
            if (!gameState.isGameOver) {
                UI.showCombatButtons();
            }
        }, 1500);
        
        UI.updateDisplay();
    },
    
    triggerChoiceEvent: function() {
        // Filter events by requirements (e.g., minStrength)
        const availableEvents = GameData.choiceEvents.filter(event => {
            if (event.minStrength && gameState.character.strength < event.minStrength) {
                return false;
            }
            return true;
        });
        
        // Fall back to all events if none available
        const eventPool = availableEvents.length > 0 ? availableEvents : GameData.choiceEvents;
        const event = eventPool[Math.floor(Math.random() * eventPool.length)];
        
        UI.updateStory(`<i class="fas fa-crossroads"></i> Choice: ${event.text}`);
        UI.addToLog(`CHOICE EVENT: ${event.text}`, "event");
        
        // Show choice buttons
        UI.showChoiceButtons(event.leftOption, event.rightOption, event.leftOutcome, event.rightOutcome);
    },
    
    triggerRiskEvent: function() {
        const event = GameData.riskEvents[Math.floor(Math.random() * GameData.riskEvents.length)];
        
        UI.updateStory(`<i class="fas fa-exclamation-triangle"></i> Risk vs Reward: ${event.text}`);
        UI.addToLog(`HIGH RISK EVENT: ${event.text}`, "event");
        
        // Show risk/safe buttons
        UI.showRiskButtons(event.risk, event.safe, event.riskOutcome, event.safeOutcome);
    }
};

// ===============================================
// EQUIPMENT SYSTEM (Manages equipment drops and equipping)
// ===============================================
const Equipment = {
    // Roll for equipment drop after combat
    rollForDrop: function(enemy = null) {
        // 15% chance for mana potion drop
        if (Math.random() < 0.15) {
            gameState.inventory.manaPotions++;
            UI.addToLog("<i class='fas fa-flask' style='color: #4169E1'></i> Found a <span style='color: #4169E1'>Mana Potion</span>!", "victory");
        }
        
        const dropChance = 0.30;
        if (Math.random() > dropChance) return;
        
        let equipmentType, equipmentArray;
        
        // Use class preferences if available
        if (gameState.character && gameState.character.equipmentPreferences) {
            const prefs = gameState.character.equipmentPreferences;
            const roll = Math.random();
            
            if (roll < prefs.weapon) {
                equipmentType = 'weapon';
            } else if (roll < prefs.weapon + prefs.armor) {
                equipmentType = 'armor';
            } else {
                equipmentType = 'accessory';
            }
        } else {
            // Fallback: Use enemy preference or default distribution
            if (enemy && enemy.dropPreference) {
                equipmentType = enemy.dropPreference;
            } else {
                const typeRoll = Math.random();
                if (typeRoll < 0.4) {
                    equipmentType = 'weapon';
                } else if (typeRoll < 0.8) {
                    equipmentType = 'armor';
                } else {
                    equipmentType = 'accessory';
                }
            }
        }
        
        // Set equipment array based on type
        if (equipmentType === 'weapon') {
            equipmentArray = GameData.weapons;
        } else if (equipmentType === 'armor') {
            equipmentArray = GameData.armor;
        } else {
            equipmentArray = GameData.accessories;
        }
        
        // Filter by class preference (80% chance for preferred, 20% for any)
        // Depth-based rarity and bonus logic (see above)
            const depth = gameState.dungeonDepth || 1;
            let allowedRarities = ['common'];
            if (depth >= 3) allowedRarities.push('uncommon');
            if (depth >= 6) allowedRarities.push('rare');
            if (depth >= 9) allowedRarities.push('epic');

            // Weighted rarity selection based on depth
            const rarityWeights = {
                common: depth < 3 ? 0.7 : 0.4,
                uncommon: depth < 3 ? 0.3 : depth < 6 ? 0.5 : 0.3,
                rare: depth < 6 ? 0 : depth < 9 ? 0.2 : 0.3,
                epic: depth < 9 ? 0 : 0.1
            };
            const weightedRarities = allowedRarities.flatMap(rarity => Array(Math.floor(rarityWeights[rarity] * 10)).fill(rarity));
            const targetRarity = weightedRarities[Math.floor(Math.random() * weightedRarities.length)];

            // Filter items by allowed rarity and reasonable bonus for depth
            const maxBonusByDepth = Math.max(2, Math.floor(depth * 1.5) + 2); // e.g., depth 1: 3, depth 5: 9, depth 10: 17
            const availableItems = equipmentArray.filter(item => allowedRarities.includes(item.rarity) && item.bonus <= maxBonusByDepth && item.rarity === targetRarity);
            if (availableItems.length === 0) return;
            const droppedItem = availableItems[Math.floor(Math.random() * availableItems.length)];
            this.offerEquipment(equipmentType, droppedItem);
    },
    
    offerEquipment: function(type, item) {
        // Determine stat type - use item's statType if present, otherwise default by equipment type
        const statType = item.statType || (type === 'weapon' ? 'strength' : 'agility');
        const statName = statType === 'strength' ? 'Strength' : (statType === 'power' ? 'Power' : 'Agility');
        const currentItem = gameState.character.equipment[type];
        const rarityColors = {
            common: '#aaa',
            uncommon: '#1eff00',
            rare: '#0070dd',
            epic: '#a335ee'
        };

        let message = `<div style="color: ${rarityColors[item.rarity]}"><strong>${item.name}</strong> <span class="text-xs">[${item.rarity.toUpperCase()}]</span> (+${item.bonus} ${statName})</div>`;
        message += `<div class="text-xs text-gray-300">Type: ${type.charAt(0).toUpperCase()+type.slice(1)}, Stat: ${statName}</div>`;

        // Add special property descriptions
        if (item.vampiric) {
            message += `<div style="color: #ff6b6b"><i class="fas fa-tint"></i> ${item.description}</div>`;
        }
        if (item.cursed) {
            message += `<div style="color: #a020f0"><i class="fas fa-skull"></i> CURSED! ${item.description}</div>`;
        }

        if (gameState.character.isVampire) {
            message += `<div style="color: #ff6b6b">Your vampire nature prevents you from using equipment!</div>`;
            UI.updateStory(message);
            UI.addToLog(message, "item");
            return;
        }

        // Check if current item is cursed
        if (currentItem && currentItem.cursed) {
            message += `<div style="color: #ff6b6b">Your ${currentItem.name} is cursed and cannot be removed!</div>`;
            UI.updateStory(message);
            UI.addToLog(message, "item");
            return;
        }

        if (currentItem) {
            const currentStatName = currentItem.stat === 'strength' ? 'Strength' : (currentItem.stat === 'power' ? 'Power' : 'Agility');
            message += `<div>Currently equipped: ${currentItem.name} (+${currentItem.bonus} ${currentStatName})</div>`;
            let upgradeMsg = '';
            if (item.bonus > currentItem.bonus) {
                upgradeMsg = `<div style="color: #43ea7c">This is an upgrade!</div>`;
            } else {
                upgradeMsg = `<div style="color: #ff6b6b">This is worse than your current equipment.</div>`;
            }
            message += upgradeMsg;
        }

        // Always show full details in event panel
        UI.updateStory(message);
        UI.addToLog(message, "item");
        // Ensure equip/keep buttons always show, even if UI state changes
        setTimeout(() => {
            UI.showChoiceButtons(
                `Equip ${item.name}`,
                currentItem ? `Keep ${currentItem.name}` : 'Discard it',
                () => {
                    gameState.character.equipment[type] = { ...item, stat: statType };
                    if (item.cursed) {
                        UI.addToLog(`<span style="color: #a020f0">The ${item.name} binds to you! You cannot remove it!</span>`, "error");
                    }
                    UI.addToLog(`Equipped ${item.name}!`, "victory");
                    UI.updateDisplay();
                    UI.removeChoiceButtons();
                    // Resume appropriate buttons after choice
                    if (gameState.inCombat) {
                        UI.showCombatButtons();
                    } else if (!gameState.isGameOver) {
                        UI.showExplorationButtons();
                    }
                },
                () => {
                    UI.addToLog(currentItem ? `Kept ${currentItem.name}.` : 'Discarded the equipment.', "info");
                    UI.removeChoiceButtons();
                    // Resume appropriate buttons after choice
                    if (gameState.inCombat) {
                        UI.showCombatButtons();
                    } else if (!gameState.isGameOver) {
                        UI.showExplorationButtons();
                    }
                }
            );
        }, 0);
    }
};

// ===============================================
// COMBAT SYSTEM (Manages all combat interactions)
// ===============================================
const Combat = {
    playerAttack: function() {
        if (!gameState.inCombat || !gameState.currentEnemy) return;
        
        // Paladin's Divine Intervention healing at start of turn
        if (gameState.character.characterClass === 'Paladin' && gameState.character.divineInterventionHealing) {
            const healAmount = gameState.character.divineInterventionHealing;
            gameState.character.heal(healAmount);
            gameState.character.divineInterventionHealing = 0;
            UI.addToLog(`<i class="fas fa-shield-halved" style="color: #ffd43b"></i> <strong>Divine Intervention!</strong> You heal for ${healAmount} HP!`, "victory");
        }
        
        // Reset Mage's spell combo when using basic attack
        if (gameState.character.characterClass === 'Mage') {
            gameState.character.spellComboCount = 0;
        }
        
        let damage;
        
        // Vampires use Power for physical attacks and cost mana (or HP if no mana)
        if (gameState.character.isVampire) {
            const manaCost = 8; // Increased from 5
            
            // Check mana cost - if not enough, consume HP instead
            if (!gameState.character.consumeMana(manaCost)) {
                const hpCost = Math.floor(manaCost * 1.5); // 12 HP when mana depleted
                if (gameState.character.hp <= hpCost) {
                    UI.addToLog("Not enough HP or mana for vampire attack!", "error");
                    return;
                }
                gameState.character.takeDamage(hpCost);
                UI.addToLog(`<span style="color: #ff6b6b"><i class="fas fa-heart-broken"></i> Blood sacrifice! Lost ${hpCost} HP to fuel attack!</span>`, "combat");
            }
            
            // Hit roll for vampire magical attack (agility only)
            const attackerPower = gameState.character.getEffectivePower();
            const enemyAgility = gameState.currentEnemy.agility;
            const agilityHitRoll = Math.random() * (attackerPower + 30);
            const agilityDefense = Math.random() * (enemyAgility + 5);
            
            if (agilityHitRoll <= agilityDefense) {
                UI.addToLog(`<i class="fas fa-running" style="color: #43ea7c"></i> The ${gameState.currentEnemy.name} swiftly evades your vampiric strike!`, "combat");
                // Enemy still gets to counter-attack
                setTimeout(() => {
                    if (gameState.inCombat && !gameState.isGameOver) {
                        this.enemyAttack();
                    }
                }, 500);
                return;
            }
            
            const basePower = gameState.character.getEffectivePower();
            const masteryBonus = gameState.character.combatSpecialization.magicalMastery * 1.5; // Changed from physicalMastery
            damage = Math.floor(basePower + masteryBonus + Math.random() * 10);
            
            // Vampire life drain (15% - tactical survival, not full sustain)
            const lifeDrain = Math.floor(damage * 0.15);
            gameState.character.heal(lifeDrain);
            UI.addToLog(`<i class="fas fa-moon"></i> Vampiric strike drains ${lifeDrain} HP!`, "victory");
        } else {
            // Hit roll for physical attack - first against defense, then against agility
            // Rogues use Agility for attacks, other classes use Strength
            const isRogue = gameState.character.characterClass === 'Rogue';
            const attackingStat = isRogue ? gameState.character.getEffectiveAgility() : gameState.character.getEffectiveStrength();
            const enemyDefense = gameState.currentEnemy.defense;
            const enemyAgility = gameState.currentEnemy.agility;
            
            // Rogue surprise attack guarantees hit on first attack
            const surpriseAttackActive = gameState.character.surpriseAttackReady;
            
            if (!surpriseAttackActive) {
                // Rogues have better hit formula (more favorable)
                const hitBonus = isRogue ? 40 : 30;
                const defenseReduction = isRogue ? 3 : 5;
                
                // First roll: Attacking stat vs Defense (more favorable to rogues)
                const defenseHitRoll = Math.random() * (attackingStat + hitBonus);
                const defenseValue = Math.random() * (enemyDefense + defenseReduction);
                
                if (defenseHitRoll <= defenseValue) {
                    UI.addToLog(`<i class="fas fa-shield-alt" style="color: #888"></i> Your attack bounces harmlessly off the ${gameState.currentEnemy.name}'s armor!`, "combat");
                    
                    // Check if player has extra turns remaining before enemy can counter
                    if (gameState.currentEnemy && gameState.currentEnemy.turnsToSkip > 0) {
                        // Player still has extra turns, don't let enemy counter-attack
                        return;
                    }
                    
                    // Enemy counter-attack only if no extra turns remaining
                    setTimeout(() => {
                        if (gameState.inCombat && !gameState.isGameOver) {
                            this.enemyAttack();
                        }
                    }, 500);
                    return;
                }
                
                // Second roll: Attacking stat vs Agility (more favorable to rogues)
                const agilityHitRoll = Math.random() * (attackingStat + hitBonus);
                const enemyAgilityValue = Math.random() * (gameState.currentEnemy.agility + defenseReduction);
                
                if (agilityHitRoll <= enemyAgilityValue) {
                    UI.addToLog(`<i class="fas fa-running" style="color: #43ea7c"></i> The ${gameState.currentEnemy.name} nimbly dodges your attack!`, "combat");
                    
                    // Check if player has extra turns remaining before enemy can counter
                    if (gameState.currentEnemy && gameState.currentEnemy.turnsToSkip > 0) {
                        // Player still has extra turns, don't let enemy counter-attack
                        return;
                    }
                    
                    // Enemy counter-attack only if no extra turns remaining
                    setTimeout(() => {
                        if (gameState.inCombat && !gameState.isGameOver) {
                            this.enemyAttack();
                        }
                    }, 500);
                    return;
                }
            }
            
            // Damage calculation: Rogues use Agility (0.75x multiplier) with +5 bonus, others use Strength
            const baseDamage = isRogue ? Math.floor(gameState.character.getEffectiveAgility() * 0.75) + 5 : gameState.character.getEffectiveStrength();
            const masteryBonus = gameState.character.combatSpecialization.physicalMastery * 1.5;
            damage = Math.floor(baseDamage + masteryBonus + Math.random() * 10);
            
            // Check for vampiric equipment life drain
            if (gameState.character.equipment.accessory && gameState.character.equipment.accessory.vampiric) {
                const lifeDrain = Math.floor(damage * gameState.character.equipment.accessory.lifeDrain);
                gameState.character.heal(lifeDrain);
                UI.addToLog(`<i class="fas fa-tint"></i> ${gameState.character.equipment.accessory.name} drains ${lifeDrain} HP!`, "victory");
            }
        }
        
        // Critical hit roll for physical attacks (not vampire magic)
        let isCritical = false;
        if (!gameState.character.isVampire) {
            // Rogue surprise attack guarantees critical hit
            if (gameState.character.surpriseAttackReady) {
                isCritical = true;
                damage = Math.floor(damage * gameState.character.critMultiplier);
                gameState.character.surpriseAttackReady = false; // Use it up
                UI.addToLog(`<span style='color: #9775fa'><i class="fas fa-star"></i> SURPRISE CRITICAL! You strike from the shadows!</span>`, "combat");
            } else {
                const critRoll = Math.random();
                if (critRoll < gameState.character.critChance) {
                    damage = Math.floor(damage * gameState.character.critMultiplier);
                    isCritical = true;
                }
            }
        }
        
        // Apply vulnerability amplification
        if (gameState.character.activeEffects.vulnerableNext) {
            damage = Math.floor(damage * gameState.character.activeEffects.vulnerableNext);
            gameState.character.activeEffects.vulnerableNext = false;
            UI.addToLog(`<span style='color: #ff6b6b'>VULNERABILITY TRIGGERED!</span>`, "combat");
        }
        
        // Vampire attacks count as magical damage
        const damageType = gameState.character.isVampire ? 'vampiric' : 'physical';
        const isMagicalVictory = gameState.character.isVampire;
        const isPhysicalVictory = !gameState.character.isVampire;
        gameState.currentEnemy.takeDamage(damage, damageType, isMagicalVictory, isPhysicalVictory, isCritical);
        
        // Handle multi-turn system from agility advantage
        if (gameState.currentEnemy && gameState.currentEnemy.turnsToSkip > 0) {
            gameState.currentEnemy.turnsToSkip--;
            if (gameState.currentEnemy.turnsToSkip > 0) {
                UI.addToLog(`<i class="fas fa-bolt" style="color: #43ea7c"></i> Your superior agility allows another attack! (${gameState.currentEnemy.turnsToSkip} turn(s) remaining)`, "victory");
            }
            // Don't trigger enemy attack if turns remain
            return;
        }
        
        // Handle haste duration - allow extra attack without enemy counter
        if (gameState.character.activeEffects.hasteTurns > 0) {
            gameState.character.activeEffects.hasteTurns--;
            if (gameState.character.activeEffects.hasteTurns > 0) {
                UI.addToLog(`<i class="fas fa-bolt" style="color: #ffd700"></i> Haste grants you another action! (${gameState.character.activeEffects.hasteTurns} turn(s) remaining)`, "victory");
            } else {
                UI.addToLog(`<i class="fas fa-hourglass-end" style="color: #aaa"></i> Haste fades...`, "combat");
            }
            // Only show combat buttons if enemy is still alive and combat is active
            if (gameState.inCombat && gameState.currentEnemy && gameState.currentEnemy.hp > 0) {
                UI.showCombatButtons();
            }
            return;
        }
        
        // Note: Victory handling is now done in the enemy's takeDamage method
        UI.updateDisplay();
    },
    
    playerCastSpell: function() {
        if (!gameState.inCombat || !gameState.currentEnemy) {
            UI.addToLog("No enemy to cast spell on!", "error");
            return;
        }
        
        // Get the selected spell from appropriate spell list
        const spell = GameData.getSpell(gameState.character.selectedSpell, gameState.character.isVampire);
        if (!spell) {
            UI.addToLog("No spell selected!", "error");
            return;
        }
        
        // Track Mage's spell combo for Arcane Surge
        let arcaneSurgeActive = false;
        if (gameState.character.characterClass === 'Mage') {
            gameState.character.spellComboCount = (gameState.character.spellComboCount || 0) + 1;
            if (gameState.character.spellComboCount >= 3) {
                arcaneSurgeActive = true;
                gameState.character.spellComboCount = 0;
                UI.addToLog(`<i class="fas fa-magic" style="color: #4dabf7"></i> <strong>Arcane Surge!</strong> Your next spell is empowered! (+50% damage, -50% mana cost)`, "victory");
            }
        }
        
        // Apply Arcane Surge mana cost reduction
        let manaCost = spell.manaCost;
        if (arcaneSurgeActive && spell.spellType === 'damage') {
            manaCost = Math.floor(manaCost * 0.5);
        }
        
        // Check mana cost before casting - vampires can use HP if no mana
        if (!gameState.character.consumeMana(manaCost)) {
            if (gameState.character.isVampire) {
                // Vampires can sacrifice HP to cast spells
                const hpCost = Math.floor(spell.manaCost * 1.5);
                if (gameState.character.hp <= hpCost) {
                    UI.addToLog(`Not enough HP or mana to cast ${spell.name}!`, "error");
                    return;
                }
                gameState.character.takeDamage(hpCost);
                UI.addToLog(`<span style="color: #ff6b6b"><i class="fas fa-heart-broken"></i> Blood sacrifice! Lost ${hpCost} HP to cast ${spell.name}!</span>`, "combat");
            } else {
                UI.addToLog(`Not enough mana to cast ${spell.name}! (Requires ${spell.manaCost} mana)`, "error");
                return;
            }
        }
        
        // Handle different spell types
        if (spell.spellType === 'utility') {
            // Utility spells (Mana Drain, Hemomancy)
            if (spell.name === 'Mana Drain') {
                const manaRestored = spell.manaDrain;
                gameState.character.restoreMana(manaRestored);
                UI.addToLog(`<i class="fas fa-magic"></i> ${spell.name} siphons magical energy! Restored ${manaRestored} mana!`, "victory");
                UI.updateDisplay();
                // No enemy counter for utility spells
                return;
            } else if (spell.name === 'Hemomancy') {
                const manaRestored = spell.manaDrain;
                gameState.character.restoreMana(manaRestored);
                UI.addToLog(`<i class="fas fa-tint"></i> ${spell.name} converts blood to mana! Restored ${manaRestored} mana!`, "victory");
                UI.updateDisplay();
                // No enemy counter for utility spells
                return;
            }
        }
        
        if (spell.spellType === 'heal') {
            // Healing spell
            let healAmount = spell.healAmount;
            
            // Sanguine Pact has HP cost
            if (spell.name === 'Sanguine Pact' && spell.hpCost) {
                gameState.character.takeDamage(spell.hpCost);
                UI.addToLog(`<i class="fas fa-skull"></i> ${spell.name} requires a blood sacrifice! Lost ${spell.hpCost} HP!`, "combat");
            }
            
            gameState.character.heal(healAmount);
            
            // Cleanse also removes debuffs
            if (spell.name === 'Cleanse') {
                // Clear any debuffs (currently we don't have player debuffs, but structure for future)
                UI.addToLog(`<i class="fas fa-sun"></i> ${spell.name} purifies you! Restored ${healAmount} HP and removed debuffs!`, "victory");
            } else if (spell.name === 'Crimson Regeneration') {
                UI.addToLog(`<i class="fas fa-heart"></i> ${spell.name} channels vampiric essence! Restored ${healAmount} HP!`, "victory");
            } else if (spell.name === 'Sanguine Pact') {
                UI.addToLog(`<i class="fas fa-heart"></i> ${spell.name} completes the ritual! Restored ${healAmount} HP!`, "victory");
            } else {
                UI.addToLog(`<i class="fas fa-heart"></i> ${spell.name} restores ${healAmount} HP!`, "victory");
            }
            UI.updateDisplay();
            
            // Enemy still gets to attack after healing
            setTimeout(() => {
                if (gameState.inCombat && !gameState.isGameOver) {
                    this.enemyAttack();
                }
            }, 500);
            return;
        }
        
        if (spell.spellType === 'buff') {
            // Buff spells
            if (spell.name === 'Shield') {
                gameState.character.activeEffects.shield = spell.duration;
                gameState.character.activeEffects.shieldAmount = spell.defenseBoost;
                UI.addToLog(`<i class="fas fa-shield-alt"></i> ${spell.name} creates a protective barrier! (Blocks ${spell.defenseBoost} damage for ${spell.duration} turns)`, "victory");
            } else if (spell.name === 'Fortify') {
                gameState.character.activeEffects.fortify = spell.duration;
                gameState.character.activeEffects.fortifyAmount = spell.defenseBoost;
                UI.addToLog(`<i class="fas fa-fist-raised"></i> ${spell.name} hardens your body! (+${spell.defenseBoost} defense for ${spell.duration} turns)`, "victory");
            } else if (spell.name === 'Nightfall') {
                gameState.character.activeEffects.fortify = spell.duration;
                gameState.character.activeEffects.fortifyAmount = spell.defenseBoost;
                UI.addToLog(`<i class="fas fa-moon"></i> ${spell.name} embraces the darkness! (+${spell.defenseBoost} defense for ${spell.duration} turns)`, "victory");
            } else if (spell.name === 'Haste') {
                gameState.character.activeEffects.hasteTurns = spell.hasteDuration;
                UI.addToLog(`<i class="fas fa-bolt"></i> ${spell.name} grants supernatural speed! You gain an extra attack for ${spell.hasteDuration} turns!`, "victory");
            } else if (spell.name === 'Vampiric Ascension') {
                gameState.character.activeEffects.hasteTurns = spell.hasteDuration;
                UI.addToLog(`<i class="fas fa-dragon"></i> ${spell.name} transcends mortality! You gain an extra attack for ${spell.hasteDuration} turns!`, "victory");
            } else if (spell.name === 'Shadow Meld') {
                gameState.character.activeEffects.dodgeChance = spell.dodgeChance;
                gameState.character.activeEffects.dodgeDuration = spell.duration;
                UI.addToLog(`<i class="fas fa-user-ninja"></i> ${spell.name} lets you blend into shadows! ${Math.floor(spell.dodgeChance * 100)}% chance to dodge next attack!`, "victory");
            }
            UI.updateDisplay();
            
            // If haste or ascension, allow immediate attack without enemy counter
            if (spell.name === 'Haste' || spell.name === 'Vampiric Ascension') {
                UI.showCombatButtons();
                return;
            }
            
            // Other buffs - enemy gets to attack
            setTimeout(() => {
                if (gameState.inCombat && !gameState.isGameOver) {
                    this.enemyAttack();
                }
            }, 500);
            return;
        }
        
        if (spell.spellType === 'debuff') {
            // Debuff spells
            if (spell.name === 'Weaken') {
                gameState.currentEnemy.weakened = spell.duration;
                gameState.currentEnemy.weakenAmount = spell.attackReduction;
                UI.addToLog(`<i class="fas fa-skull-crossbones"></i> ${spell.name} curses the enemy! Attack reduced by ${Math.floor(spell.attackReduction * 100)}% for ${spell.duration} turns!`, "combat");
            } else if (spell.name === 'Slow') {
                gameState.currentEnemy.slowed = spell.duration;
                gameState.currentEnemy.slowAmount = spell.agilityReduction;
                
                // Recalculate turn advantage with Slow effect applied
                const playerAgility = gameState.character.getEffectiveAgility();
                const enemyAgilityAfterSlow = Math.floor(gameState.currentEnemy.agility * (1 - spell.agilityReduction));
                const newAgilityDifference = playerAgility - enemyAgilityAfterSlow;
                
                // Update turnsToSkip with new advantage (capped at 2)
                const newTurnsToSkip = newAgilityDifference > 0 ? Math.min(Math.floor(newAgilityDifference / 10), 2) : 0;
                const turnsGained = newTurnsToSkip - gameState.currentEnemy.turnsToSkip;
                gameState.currentEnemy.turnsToSkip = newTurnsToSkip;
                
                if (turnsGained > 0) {
                    UI.addToLog(`<i class="fas fa-hourglass-half"></i> ${spell.name} warps time! Agility halved for ${spell.duration} turns! <span style="color: #43ea7c">Gained ${turnsGained} additional turn(s)!</span>`, "combat");
                } else {
                    UI.addToLog(`<i class="fas fa-hourglass-half"></i> ${spell.name} warps time! Agility halved for ${spell.duration} turns!`, "combat");
                }
            } else if (spell.name === 'Vulnerability') {
                gameState.character.activeEffects.vulnerableNext = spell.damageAmplify;
                UI.addToLog(`<i class="fas fa-crosshairs"></i> ${spell.name} hexes the enemy! Your next attack will deal ${Math.floor((spell.damageAmplify - 1) * 100)}% more damage!`, "combat");
            } else if (spell.name === 'Chrono Lock') {
                gameState.currentEnemy.chronoLocked = spell.skipTurns;
                UI.addToLog(`<i class="fas fa-clock"></i> ${spell.name} freezes the enemy in time! They will skip their next turn!`, "combat");
            } else if (spell.name === 'Bat Swarm') {
                gameState.currentEnemy.weakened = spell.duration;
                gameState.currentEnemy.weakenAmount = spell.attackReduction;
                UI.addToLog(`<i class="fas fa-crow"></i> ${spell.name} obscures the enemy's vision! Attack reduced by ${Math.floor(spell.attackReduction * 100)}% for ${spell.duration} turns!`, "combat");
            } else if (spell.name === 'Dread Gaze') {
                gameState.currentEnemy.weakened = spell.duration;
                gameState.currentEnemy.weakenAmount = spell.attackReduction;
                UI.addToLog(`<i class="fas fa-eye"></i> ${spell.name} paralyzes the enemy with fear! Attack reduced by ${Math.floor(spell.attackReduction * 100)}% for ${spell.duration} turns!`, "combat");
            }
            UI.updateDisplay();
            
            // Check if enemy is chrono locked - if so, skip their attack
            if (gameState.currentEnemy.chronoLocked && gameState.currentEnemy.chronoLocked > 0) {
                gameState.currentEnemy.chronoLocked--;
                UI.addToLog(`The enemy is frozen in time and cannot act!`, "victory");
                return; // Skip enemy attack
            }
            
            // Enemy still gets to attack after other debuffs
            setTimeout(() => {
                if (gameState.inCombat && !gameState.isGameOver) {
                    this.enemyAttack();
                }
            }, 500);
            return;
        }
        
        // Damage spell
        // Calculate base damage based on spell scaling type
        let baseDamage;
        let masteryBonus;
        let attackingStat;
        
        if (spell.physicalScaling === 'strengthPower') {
            // Physical spells for Warrior/Paladin scale with both Strength and Power
            const strength = gameState.character.getEffectiveStrength();
            const power = gameState.character.getEffectivePower();
            baseDamage = Math.floor((strength + power) / 2);
            masteryBonus = gameState.character.combatSpecialization.physicalMastery * 1.5;
            attackingStat = Math.floor((strength + power) / 2);
        } else if (spell.physicalScaling === 'agility') {
            // Physical spells for Rogue scale with Agility only
            baseDamage = gameState.character.getEffectiveAgility();
            masteryBonus = gameState.character.combatSpecialization.physicalMastery * 1.5;
            attackingStat = gameState.character.getEffectiveAgility();
        } else {
            // Pure magical spells scale with Power
            baseDamage = gameState.character.getEffectivePower();
            masteryBonus = gameState.character.combatSpecialization.magicalMastery * 1.5;
            attackingStat = gameState.character.getEffectivePower();
        }
        
        // Hit roll system for damage spells
        const enemyDefense = gameState.currentEnemy.defense;
        const enemyAgility = gameState.currentEnemy.agility;
        
        if (spell.physicalScaling) {
            // Physical scaling spells: roll against defense then agility
            const defenseHitRoll = Math.random() * (attackingStat + 30);
            const defenseValue = Math.random() * (enemyDefense + 5);
            
            if (defenseHitRoll <= defenseValue) {
                UI.addToLog(`<i class="fas fa-shield-alt" style="color: #888"></i> ${spell.name} glances off the ${gameState.currentEnemy.name}'s armor!`, "combat");
                setTimeout(() => {
                    if (gameState.inCombat && !gameState.isGameOver) {
                        this.enemyAttack();
                    }
                }, 500);
                return;
            }
            
            const agilityHitRoll = Math.random() * (attackingStat + 30);
            const agilityDefense = Math.random() * (enemyAgility + 5);
            
            if (agilityHitRoll <= agilityDefense) {
                UI.addToLog(`<i class="fas fa-running" style="color: #43ea7c"></i> The ${gameState.currentEnemy.name} evades ${spell.name}!`, "combat");
                setTimeout(() => {
                    if (gameState.inCombat && !gameState.isGameOver) {
                        this.enemyAttack();
                    }
                }, 500);
                return;
            }
        } else {
            // Magical spells: roll against agility only
            const agilityHitRoll = Math.random() * (attackingStat + 30);
            const agilityDefense = Math.random() * (enemyAgility + 5);
            
            if (agilityHitRoll <= agilityDefense) {
                UI.addToLog(`<i class="fas fa-running" style="color: #43ea7c"></i> The ${gameState.currentEnemy.name} dodges ${spell.name}!`, "combat");
                setTimeout(() => {
                    if (gameState.inCombat && !gameState.isGameOver) {
                        this.enemyAttack();
                    }
                }, 500);
                return;
            }
        }
        
        let totalDamage = Math.floor(baseDamage * spell.damageMultiplier + masteryBonus + spell.bonusDamage + Math.random() * 10);
        
        // Apply Arcane Surge damage bonus
        if (arcaneSurgeActive && spell.spellType === 'damage') {
            totalDamage = Math.floor(totalDamage * 1.5);
        }
        
        // Critical hit roll for physical scaling spells
        let isCritical = false;
        if (spell.physicalScaling) {
            let effectiveCritChance = gameState.character.critChance;
            let effectiveCritMultiplier = gameState.character.critMultiplier;
            
            // Add spell-specific crit bonuses (Backstab, Assassinate)
            if (spell.critBonus) {
                effectiveCritChance += spell.critBonus;
            }
            if (spell.critMultiplier) {
                effectiveCritMultiplier = spell.critMultiplier;
            }
            
            const critRoll = Math.random();
            if (critRoll < effectiveCritChance) {
                totalDamage = Math.floor(totalDamage * effectiveCritMultiplier);
                isCritical = true;
            }
        }
        
        // Apply vulnerability amplification
        if (gameState.character.activeEffects.vulnerableNext) {
            totalDamage = Math.floor(totalDamage * gameState.character.activeEffects.vulnerableNext);
            gameState.character.activeEffects.vulnerableNext = false;
            UI.addToLog(`<span style='color: #ff6b6b'>VULNERABILITY TRIGGERED!</span>`, "combat");
        }
        
        // Multi-hit spells (like Bat Swarm) do multiple smaller hits
        if (spell.multiHit) {
            const hits = 3;
            totalDamage = Math.floor(totalDamage / hits);
            const isPhysicalVictory = spell.physicalScaling ? true : false;
            const isMagicalVictory = !isPhysicalVictory;
            UI.addToLog(`<i class="fas fa-magic"></i> ${spell.name} strikes ${hits} times!`, "combat");
            for (let i = 0; i < hits; i++) {
                gameState.currentEnemy.takeDamage(Math.floor(totalDamage + Math.random() * 5), spell.damageType || 'magical', isMagicalVictory, isPhysicalVictory, false);
            }
        }
        
        // Check for effectiveness bonuses/penalties
        const enemyName = gameState.currentEnemy.name;
        let effectivenessMessage = "";
        if (spell.effectiveAgainst && spell.effectiveAgainst.includes(enemyName)) {
            totalDamage = Math.floor(totalDamage * 1.5);
            effectivenessMessage = " <span style='color: #43ea7c'>SUPER EFFECTIVE!</span>";
        } else if (spell.weakAgainst && spell.weakAgainst.includes(enemyName)) {
            totalDamage = Math.floor(totalDamage * 0.5);
            effectivenessMessage = " <span style='color: #ff6b6b'>Not very effective...</span>";
        }
        
        if (!spell.multiHit) {
            UI.addToLog(`<i class="fas fa-magic"></i> You cast ${spell.name}!${effectivenessMessage}`, "combat");
            
            // Apply damage with resistance calculation
            // Physical scaling spells count as physical victory for mastery purposes
            const damageType = spell.damageType || 'magical';
            const isPhysicalVictory = spell.physicalScaling ? true : false;
            const isMagicalVictory = !isPhysicalVictory;
            gameState.currentEnemy.takeDamage(totalDamage, damageType, isMagicalVictory, isPhysicalVictory, isCritical);
        }
        
        // Vampire spells have life drain
        if (spell.lifeDrain && gameState.character.isVampire) {
            const lifeDrain = Math.floor(totalDamage * spell.lifeDrain);
            gameState.character.heal(lifeDrain);
            UI.addToLog(`<i class="fas fa-tint"></i> Drained ${lifeDrain} HP from the enemy!`, "victory");
        }
        
        // Night Terror stun chance
        if (spell.stunChance && Math.random() < spell.stunChance) {
            gameState.currentEnemy.stunned = true;
            UI.addToLog(`<i class="fas fa-moon"></i> ${spell.name} terrifies the enemy! They are stunned and cannot attack this turn!`, "victory");
        }
        
        // Check if enemy is stunned - if so, skip their attack
        if (gameState.currentEnemy.stunned) {
            gameState.currentEnemy.stunned = false; // Clear stun after skipping their turn
            UI.updateDisplay();
            return; // Don't call enemyAttack
        }
        
        // Handle haste duration for damage spells - allow another spell cast without enemy counter
        if (gameState.character.activeEffects.hasteTurns > 0) {
            gameState.character.activeEffects.hasteTurns--;
            if (gameState.character.activeEffects.hasteTurns > 0) {
                UI.addToLog(`<i class="fas fa-bolt" style="color: #ffd700"></i> Haste grants you another action! (${gameState.character.activeEffects.hasteTurns} turn(s) remaining)`, "victory");
            } else {
                UI.addToLog(`<i class="fas fa-hourglass-end" style="color: #aaa"></i> Haste fades...`, "combat");
            }
            // Only show combat buttons if enemy is still alive and combat is active
            if (gameState.inCombat && gameState.currentEnemy && gameState.currentEnemy.hp > 0) {
                UI.showCombatButtons();
            }
            return;
        }
        
        // Note: Victory handling is now done in the enemy's takeDamage method
        UI.updateDisplay();
    },
    
    attemptEscape: function() {
        if (!gameState.inCombat) return;
        
        // Guaranteed escape - no death possible
        UI.addToLog("You successfully escaped!", "escape");
        UI.updateStory("<i class='fas fa-running'></i> You manage to escape from the enemy! You live to fight another day.");
        
        // Increment turn counter for fleeing (costs a turn)
        gameState.incrementTurn();
        
        this.endBattle();
        UI.updateDisplay();
    },
    
    enemyAttack: function() {
        if (!gameState.currentEnemy || !gameState.inCombat) return;
        gameState.currentEnemy.performAttack();
        
        // Decrement buff durations after enemy attacks
        if (gameState.character.activeEffects.fortify > 0) {
            gameState.character.activeEffects.fortify--;
            if (gameState.character.activeEffects.fortify <= 0) {
                gameState.character.activeEffects.fortifyAmount = 0;
                UI.addToLog(`Fortify fades...`, "combat");
            }
        }
        
        // Apply cursed equipment drains after enemy turn
        if (gameState.character.equipment.accessory && gameState.character.equipment.accessory.cursed) {
            const cursedItem = gameState.character.equipment.accessory;
            if (cursedItem.hpDrain) {
                const died = gameState.character.takeDamage(cursedItem.hpDrain, 'cursed');
                UI.addToLog(`<span style="color: #a020f0">${cursedItem.name} drains ${cursedItem.hpDrain} HP!</span>`, "error");
                if (died) {
                    UI.addToLog("The curse consumes you!", "death");
                    gameState.playerDeath();
                }
            }
            if (cursedItem.manaDrain) {
                gameState.character.mana = Math.max(0, gameState.character.mana - cursedItem.manaDrain);
                UI.addToLog(`<span style="color: #a020f0">${cursedItem.name} drains ${cursedItem.manaDrain} mana!</span>`, "error");
                UI.updateDisplay();
            }
        }
    },
    
    endBattle: function() {
        // Reset Warrior's Battle Hardened bonuses
        if (gameState.character.characterClass === 'Warrior' && gameState.character.battleHardenedBonus) {
            gameState.character.strength -= gameState.character.battleHardenedBonus.strength;
            gameState.character.defense -= gameState.character.battleHardenedBonus.defense;
            gameState.character.battleHardenedBonus = null;
        }
        
        // Reset Rogue's surprise defense agility bonus
        if (gameState.character.characterClass === 'Rogue' && gameState.character.surpriseDefenseBonus > 0) {
            gameState.character.agility -= gameState.character.surpriseDefenseBonus;
            gameState.character.surpriseDefenseBonus = 0;
        }
        
        // End combat state
        gameState.inCombat = false;
        gameState.currentEnemy = null;
        
        // Hide combat UI and show exploration buttons
        UI.hideAllActionButtons();
        UI.showExplorationButtons();
        UI.updateDisplay();
    }
};

// ===============================================
// USER INTERFACE SYSTEM (Centralizes all UI operations)
// ===============================================
const UI = {
    elements: {}, // Cache for DOM elements to improve performance
    
    initialize: function() {
        // Cache DOM elements to avoid repeated getElementById calls
        this.elements = {
            playerGoldMain: document.getElementById('player-gold-main'),
            level: document.getElementById('level'),
            lives: document.getElementById('lives'),
            turnCounter: document.getElementById('turn-counter'),
            depthDisplay: document.getElementById('depth-display'),
            playerHp: document.getElementById('player-hp'),
            playerMaxHp: document.getElementById('player-max-hp'),
            playerMana: document.getElementById('player-mana'),
            playerMaxMana: document.getElementById('player-max-mana'),
            playerStrength: document.getElementById('player-strength'),
            playerAgility: document.getElementById('player-agility'),
            playerDefense: document.getElementById('player-defense'),
            playerPower: document.getElementById('player-power'),
            physicalMastery: document.getElementById('physical-mastery'),
            magicalMastery: document.getElementById('magical-mastery'),
            playerHpBar: document.getElementById('player-hp-bar'),
            playerManaBar: document.getElementById('player-mana-bar'),
            enemyPanel: document.getElementById('enemy-panel'),
            enemyName: document.getElementById('enemy-name'),
            enemyHp: document.getElementById('enemy-hp'),
            enemyMaxHp: document.getElementById('enemy-max-hp'),
            enemyAttack: document.getElementById('enemy-attack'),
            enemyDefense: document.getElementById('enemy-defense'),
            enemyHpBar: document.getElementById('enemy-hp-bar'),
            gameStory: document.getElementById('game-story'),
            gameLog: document.getElementById('game-log'),
            exploreBtn: document.getElementById('explore-btn'),
            restBtn: document.getElementById('rest-btn'),
            potionBtn: document.getElementById('potion-btn'),
            shopBtn: document.getElementById('shop-btn'),
            attackBtn: document.getElementById('attack-btn'),
            spellBtn: document.getElementById('spell-btn'),
            runBtn: document.getElementById('run-btn'),
            // Desktop panel elements
            potionCount: document.getElementById('potion-count'),
            gemCount: document.getElementById('gem-count'),
            enemyKills: document.getElementById('enemy-kills'),
            explorationPercent: document.getElementById('exploration-percent'),
            explorationBar: document.getElementById('exploration-bar'),
            floorName: document.getElementById('floor-name')
        };
        
        this.updateDisplay();
        this.hideAllActionButtons();
        
        // Hide exploration buttons on initial load
        if (this.elements.exploreBtn) this.elements.exploreBtn.classList.add('hidden');
        if (this.elements.restBtn) this.elements.restBtn.classList.add('hidden');
        if (this.elements.shopBtn) this.elements.shopBtn.classList.add('hidden');
        
        this.addToLog("Welcome to Dungeon Crawler! Click 'Start New Game' to begin your journey!", "start");
    },
    
    // Updates all game UI elements to reflect current gameState
    updateDisplay: function() {
        this.elements.playerGoldMain.textContent = gameState.inventory.gold;
        this.elements.level.textContent = gameState.level;
        this.elements.lives.textContent = gameState.lives;
        
        // Update XP display
        if (this.elements.exp && this.elements.expNeeded) {
            this.elements.exp.textContent = gameState.exp;
            this.elements.expNeeded.textContent = gameState.getExpForLevel(gameState.level + 1);
        }
        
        // Update turn counter with color coding based on time remaining
        
        // Update turn counter with color coding based on time remaining
        if (this.elements.turnCounter) {
            this.elements.turnCounter.textContent = gameState.turnCounter;
            const turnsRemaining = gameState.maxTurns - gameState.turnCounter;
            const turnCounterElement = document.getElementById('turn-counter');
            if (turnCounterElement) {
                if (turnsRemaining <= 15) {
                    turnCounterElement.style.color = '#ff4444'; // Red for danger
                } else if (turnsRemaining <= 35) {
                    turnCounterElement.style.color = '#ffaa00'; // Orange for warning
                } else {
                    turnCounterElement.style.color = '#ffffff'; // White for normal
                }
            }
        }
        
        // Update depth display with color coding based on progress
        if (this.elements.depthDisplay) {
            this.elements.depthDisplay.textContent = gameState.dungeonDepth;
            const depthElement = document.getElementById('depth-display');
            if (depthElement) {
                const depthProgress = gameState.dungeonDepth / gameState.targetDepth;
                if (depthProgress >= 0.8) {
                    depthElement.style.color = '#00ff44'; // Green for near victory
                } else if (depthProgress >= 0.5) {
                    depthElement.style.color = '#ffaa00'; // Orange for good progress
                } else {
                    depthElement.style.color = '#ffffff'; // White for early game
                }
            }
        }
        
        // Update player stats display
        if (gameState.character) {
            this.elements.playerHp.textContent = gameState.character.hp;
            this.elements.playerMaxHp.textContent = gameState.character.maxHp;
            this.elements.playerMana.textContent = gameState.character.mana;
            this.elements.playerMaxMana.textContent = gameState.character.maxMana;
            this.elements.playerStrength.textContent = gameState.character.strength;
            this.elements.playerAgility.textContent = gameState.character.agility;
            this.elements.playerDefense.textContent = Math.floor(gameState.character.getPhysicalDefense());
            this.elements.playerPower.textContent = gameState.character.power;
            
            // Update mastery displays
            if (this.elements.physicalMastery) {
                this.elements.physicalMastery.textContent = gameState.character.combatSpecialization.physicalMastery;
            }
            if (this.elements.magicalMastery) {
                this.elements.magicalMastery.textContent = gameState.character.combatSpecialization.magicalMastery;
            }
            
            // Update visual progress bars
            const hpPercent = (gameState.character.hp / gameState.character.maxHp) * 100;
            const manaPercent = (gameState.character.mana / gameState.character.maxMana) * 100;
            this.elements.playerHpBar.style.width = `${hpPercent}%`;
            this.elements.playerManaBar.style.width = `${manaPercent}%`;
        } else {
            // Show default values if no character yet
            this.elements.playerHp.textContent = 0;
            this.elements.playerMaxHp.textContent = 0;
            this.elements.playerMana.textContent = 0;
            this.elements.playerMaxMana.textContent = 0;
            this.elements.playerStrength.textContent = 0;
            this.elements.playerAgility.textContent = 0;
            this.elements.playerDefense.textContent = 0;
            this.elements.playerPower.textContent = 0;
            this.elements.playerHpBar.style.width = '0%';
            this.elements.playerManaBar.style.width = '0%';
        }
        
        // Update desktop inventory panel
        if (this.elements.potionCount) {
            this.elements.potionCount.textContent = gameState.inventory.potions;
        }
        // Update mana potion count
        const manaPotionCount = document.getElementById('mana-potion-count');
        if (manaPotionCount) {
            manaPotionCount.textContent = gameState.inventory.manaPotions;
        }
        if (this.elements.gemCount) {
            this.elements.gemCount.textContent = gameState.inventory.gems;
        }
        if (this.elements.enemyKills) {
            this.elements.enemyKills.textContent = gameState.inventory.enemyKills;
        }
        
        // Update equipment display
        const weaponSlot = document.getElementById('weapon-slot');
        const armorSlot = document.getElementById('armor-slot');
        const accessorySlot = document.getElementById('accessory-slot');
        const vampireStatus = document.getElementById('vampire-status');
        
        if (gameState.character) {
            if (weaponSlot) {
                const weapon = gameState.character.equipment.weapon;
                weaponSlot.textContent = weapon ? `Weapon: ${weapon.name} (+${weapon.bonus})` : 'Weapon: None';
                weaponSlot.className = weapon ? 'text-xs text-yellow-300' : 'text-xs text-gray-400';
            }
            if (armorSlot) {
                const armor = gameState.character.equipment.armor;
                armorSlot.textContent = armor ? `Armor: ${armor.name} (+${armor.bonus})` : 'Armor: None';
                armorSlot.className = armor ? 'text-xs text-yellow-300' : 'text-xs text-gray-400';
            }
            if (accessorySlot) {
                const accessory = gameState.character.equipment.accessory;
                accessorySlot.textContent = accessory ? `Accessory: ${accessory.name} (+${accessory.bonus})` : 'Accessory: None';
                accessorySlot.className = accessory ? 'text-xs text-yellow-300' : 'text-xs text-gray-400';
            }
            if (vampireStatus) {
                vampireStatus.classList.toggle('hidden', !gameState.character.isVampire);
            }
        } else {
            if (weaponSlot) weaponSlot.textContent = 'Weapon: None';
            if (armorSlot) armorSlot.textContent = 'Armor: None';
            if (accessorySlot) accessorySlot.textContent = 'Accessory: None';
            if (vampireStatus) vampireStatus.classList.add('hidden');
        }
        
        // Update quick tips based on vampire status
        this.updateQuickTips();
        
        // Update desktop progress panel
        if (this.elements.explorationPercent && this.elements.explorationBar) {
            const explorationPercent = Math.floor((gameState.dungeonDepth / gameState.targetDepth) * 100);
            this.elements.explorationPercent.textContent = `${explorationPercent}%`;
            this.elements.explorationBar.style.width = `${explorationPercent}%`;
        }
        if (this.elements.floorName) {
            const floorNames = ['Entrance', 'Dark Halls', 'Ancient Ruins', 'Crypts', 'Deep Caverns', 
                               'Shadow Realm', 'Cursed Depths', 'Abyssal Pit', 'Infernal Chamber', 'Throne Room'];
            this.elements.floorName.textContent = floorNames[gameState.dungeonDepth] || 'Unknown';
        }
        
        // Update enemy panel only when in combat
        if (gameState.inCombat && gameState.currentEnemy) {
            this.elements.enemyPanel.style.display = 'block';
            this.elements.enemyName.textContent = gameState.currentEnemy.name;
            this.elements.enemyHp.textContent = Math.max(0, gameState.currentEnemy.hp);
            this.elements.enemyMaxHp.textContent = gameState.currentEnemy.maxHp;
            this.elements.enemyAttack.textContent = gameState.currentEnemy.attack;
            this.elements.enemyDefense.textContent = gameState.currentEnemy.defense;
            
            // Show enemy debuffs
            let enemyStatusText = '';
            if (gameState.currentEnemy.weakened > 0) {
                enemyStatusText += ` <i class="fas fa-shield-alt" style="color: cyan;" title="Weakened"></i> -30% ATK (${gameState.currentEnemy.weakened})`;
            }
            if (gameState.currentEnemy.vulnerableNext) {
                enemyStatusText += ` <i class="fas fa-crosshairs" style="color: yellow;" title="Vulnerable"></i> +50% DMG`;
            }
            
            // Update or create enemy status display
            let enemyStatusElement = document.getElementById('enemy-status');
            if (!enemyStatusElement) {
                enemyStatusElement = document.createElement('p');
                enemyStatusElement.id = 'enemy-status';
                enemyStatusElement.className = 'text-sm mt-2';
                // Insert after enemy defense stat
                const enemyDefenseP = this.elements.enemyDefense.parentElement;
                enemyDefenseP.parentElement.appendChild(enemyStatusElement);
            }
            enemyStatusElement.innerHTML = enemyStatusText || '';
            
            const enemyHpPercent = Math.max(0, (gameState.currentEnemy.hp / gameState.currentEnemy.maxHp) * 100);
            this.elements.enemyHpBar.style.width = `${enemyHpPercent}%`;
        } else {
            this.elements.enemyPanel.style.display = 'none';
        }
        
        // Show player active buffs near HP/stats
        let playerStatusText = '';
        if (gameState.character && gameState.character.activeEffects) {
            if (gameState.character.activeEffects.shield > 0) {
                playerStatusText += `<i class="fas fa-shield" style="color: lightblue;" title="Shield"></i> Shield (${gameState.character.activeEffects.shieldAmount} HP for ${gameState.character.activeEffects.shield} turns) `;
            }
            if (gameState.character.activeEffects.fortify > 0) {
                playerStatusText += `<i class="fas fa-fist-raised" style="color: orange;" title="Fortify"></i> Fortify (+${gameState.character.activeEffects.fortifyAmount} DEF for ${gameState.character.activeEffects.fortify} turns) `;
            }
            if (gameState.character.activeEffects.haste) {
                playerStatusText += `<i class="fas fa-running" style="color: lime;" title="Haste"></i> Haste (Extra Attack) `;
            }
            if (gameState.character.activeEffects.vulnerableNext) {
                playerStatusText += `<i class="fas fa-crosshairs" style="color: yellow;" title="Vulnerability Charged"></i> Next attack +50% `;
            }
            if (gameState.character.activeEffects.dodgeChance > 0 && gameState.character.activeEffects.dodgeDuration > 0) {
                playerStatusText += `<i class="fas fa-user-ninja" style="color: purple;" title="Shadow Meld"></i> Dodge ${Math.floor(gameState.character.activeEffects.dodgeChance * 100)}% (${gameState.character.activeEffects.dodgeDuration} turns) `;
            }
        }
        
        // Update or create player status display
        let playerStatusElement = document.getElementById('player-status');
        if (!playerStatusElement) {
            playerStatusElement = document.createElement('p');
            playerStatusElement.id = 'player-status';
            playerStatusElement.className = 'text-sm mt-2 text-center';
            // Insert after HP bar
            const hpBarParent = this.elements.playerHpBar.parentElement.parentElement;
            hpBarParent.parentElement.insertBefore(playerStatusElement, hpBarParent.nextSibling);
        }
        playerStatusElement.innerHTML = playerStatusText || '';
    },
    
    updateQuickTips: function() {
        // Find all divs with the border-green-400 class (unique to quick tips panel)
        const allDivs = document.querySelectorAll('div.border-green-400');
        let tipsContainer = null;
        
        // Find the one with "Quick Tips" heading
        for (const container of allDivs) {
            const heading = container.querySelector('h3');
            if (heading && heading.textContent.includes('Quick Tips')) {
                tipsContainer = container;
                break;
            }
        }
        
        if (!tipsContainer) {
            return;
        }
        
        // Always rebuild the tips based on vampire status
        if (gameState.character && gameState.character.isVampire) {
            // Vampire-specific tips
            tipsContainer.innerHTML = `
                <h3 class="text-xl font-bold mb-2"><i class="fas fa-lightbulb"></i> Quick Tips</h3>
                <p class="text-xs text-red-300 mb-1"><i class="fas fa-moon"></i> You are a VAMPIRE!</p>
                <p class="text-xs text-gray-300 mb-1"><i class="fas fa-check"></i> Physical attacks cost 5 mana and use Power</p>
                <p class="text-xs text-gray-300 mb-1"><i class="fas fa-check"></i> Use vampiric spells for life drain</p>
                <p class="text-xs text-gray-300 mb-1"><i class="fas fa-check"></i> Vulnerable to holy, fire, and light damage</p>
                <p class="text-xs text-gray-300 mb-1"><i class="fas fa-check"></i> Cannot use equipment</p>
                <p class="text-xs text-gray-300"><i class="fas fa-check"></i> Rest to recover HP/Mana</p>
            `;
        } else {
            // Normal tips
            tipsContainer.innerHTML = `
                <h3 class="text-xl font-bold mb-2"><i class="fas fa-lightbulb"></i> Quick Tips</h3>
                <p class="text-xs text-gray-300 mb-1"><i class="fas fa-check"></i> Rest to recover HP/Mana</p>
                <p class="text-xs text-gray-300 mb-1"><i class="fas fa-check"></i> Equipment drops from enemies</p>
                <p class="text-xs text-gray-300 mb-1"><i class="fas fa-check"></i> Spells cost mana but deal more damage</p>
                <p class="text-xs text-gray-300 mb-1"><i class="fas fa-check"></i> Higher agility = attack first</p>
                <p class="text-xs text-gray-300 mb-1"><i class="fas fa-check"></i> Mana potions restore 30 mana instantly</p>
                <div id="class-tips" class="mt-2">
                    <!-- Class-specific tips appear here -->
                </div>
                <p class="text-xs text-gray-300 mt-2"><i class="fas fa-check"></i> Reach depth 10 and defeat the boss to win!</p>
            `;
            // Restore class-specific tips if a class is selected
            if (gameState.selectedClass) {
                this.updateClassTips(gameState.selectedClass);
            }
        }
    },
    
    updateStory: function(text) {
        this.elements.gameStory.innerHTML = `<h3><i class="fas fa-book-open"></i> Current Situation</h3><p>${text}</p>`;
    },
    
    addToLog: function(message, type = 'normal') {
        const timestamp = new Date().toLocaleTimeString();
        let colorClass = this.getLogColorClass(type);
        
        // Create and append log entry with timestamp for better debugging
        const entry = document.createElement('p');
        entry.innerHTML = `<span style="color: #888;">[${timestamp}]</span> <span style="${colorClass}">${message}</span>`;
        this.elements.gameLog.appendChild(entry);
        this.elements.gameLog.scrollTop = this.elements.gameLog.scrollHeight;
    },
    
    getLogColorClass: function(type) {
        // Color-coded messages for better visual feedback
        const colors = {
            'combat': 'color: #ff6b6b;',
            'victory': 'color: #51cf66;',
            'damage': 'color: #ff8cc8;',
            'score': 'color: #74c0fc;',
            'levelup': 'color: #ffd43b;',
            'event': 'color: #d0bfff;',
            'rest': 'color: #8ce99a;',
            'escape': 'color: #a9e34b;',
            'death': 'color: #ff6b6b;',
            'gameover': 'color: #ff6b6b; font-weight: bold;',
            'start': 'color: #69db7c; font-weight: bold;',
            'error': 'color: #ffa8a8;'
        };
        return colors[type] || '';
    },
    
    createButton: (text, colorFrom, colorTo, className, onclick) => {
        const btn = document.createElement('button');
        btn.innerHTML = typeof text === 'function' ? text() : text;
        btn.className = `bg-gradient-to-r from-${colorFrom}-500 to-${colorTo}-400 text-white px-5 py-3 rounded-full font-bold transition-all hover:from-${colorFrom}-600 hover:to-${colorTo}-500 hover:-translate-y-0.5 hover:shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none ${className}`;
        btn.onclick = onclick;
        return btn;
    },
    
    toggleButtons: (show, hide) => {
        show.forEach(btn => btn?.classList.remove('hidden'));
        hide.forEach(btn => btn?.classList.add('hidden'));
    },
    
    showExplorationButtons: function() {
        UI.toggleButtons(
            [this.elements.exploreBtn, this.elements.restBtn, this.elements.shopBtn],
            [this.elements.attackBtn, this.elements.spellBtn, this.elements.runBtn]
        );
        document.getElementById('spell-selector')?.classList.add('hidden');
        const showPotion = gameState.inventory.potions > 0 && gameState.character.hp < gameState.character.maxHp;
        this.elements.potionBtn.classList[showPotion ? 'remove' : 'add']('hidden');
        
        // Show/hide mana potion button
        const manaPotionBtn = document.getElementById('mana-potion-btn');
        if (manaPotionBtn) {
            const showManaPotion = gameState.inventory.manaPotions > 0 && gameState.character.mana < gameState.character.maxMana;
            manaPotionBtn.classList[showManaPotion ? 'remove' : 'add']('hidden');
        }
    },
    
    showCombatButtons: function() {
        UI.toggleButtons(
            [this.elements.attackBtn, this.elements.spellBtn, this.elements.runBtn],
            [this.elements.exploreBtn, this.elements.restBtn, this.elements.shopBtn]
        );
        this.hideSpellButtons();
        const showPotion = gameState.inventory.potions > 0 && gameState.character.hp < gameState.character.maxHp;
        this.elements.potionBtn.classList[showPotion ? 'remove' : 'add']('hidden');
        
        // Show/hide mana potion button
        const manaPotionBtn = document.getElementById('mana-potion-btn');
        if (manaPotionBtn) {
            const showManaPotion = gameState.inventory.manaPotions > 0 && gameState.character.mana < gameState.character.maxMana;
            manaPotionBtn.classList[showManaPotion ? 'remove' : 'add']('hidden');
        }
    },
    
    showSpellSelectionButtons: function() {
        UI.toggleButtons([], [this.elements.attackBtn, this.elements.spellBtn, this.elements.runBtn, this.elements.potionBtn]);
        const buttonContainer = this.elements.attackBtn.parentElement;
        if (!buttonContainer) return;
        
        // Clear any existing spell buttons
        this.hideSpellButtons();
        
        // Create button for each known spell
        let buttonCount = 0;
        gameState.character.knownSpells.forEach(spellName => {
            const spell = GameData.getSpell(spellName, gameState.character.isVampire);
            if (!spell) {
                return;
            }
            
            const button = document.createElement('button');
            button.className = 'spell-choice-btn bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-3 rounded-lg font-bold transition-all hover:from-purple-500 hover:to-purple-400 hover:-translate-y-0.5 hover:shadow-lg';
            // Add inline styles with !important to ensure background shows
            button.style.cssText = 'background: linear-gradient(to right, rgb(147, 51, 234), rgb(168, 85, 247)) !important; color: white !important;';
            button.onclick = () => {
                // Set selected spell and cast it
                gameState.character.selectedSpell = spellName;
                this.hideSpellButtons();
                Combat.playerCastSpell();
                // Only show combat buttons again if still in combat
                if (gameState.inCombat && !gameState.isGameOver) {
                    this.showCombatButtons();
                }
            };
            
            // Show effectiveness indicator if applicable
            let effectivenessIcon = '';
            if (gameState.currentEnemy) {
                if (spell.effectiveAgainst && spell.effectiveAgainst.includes(gameState.currentEnemy.name)) {
                    effectivenessIcon = ' <i class="fas fa-bolt" style="color: #43ea7c;"></i>';
                } else if (spell.weakAgainst && spell.weakAgainst.includes(gameState.currentEnemy.name)) {
                    effectivenessIcon = ' <i class="fas fa-exclamation-triangle" style="color: #ff6b6b;"></i>';
                }
            }
            
            button.innerHTML = `<i class="fas fa-magic"></i> ${spellName}${effectivenessIcon} (${spell.manaCost} mana)`;
            buttonContainer.appendChild(button);
            buttonCount++;
        });
        
        // Add cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'spell-choice-btn bg-gradient-to-r from-gray-600 to-gray-500 text-white px-4 py-3 rounded-lg font-bold transition-all hover:from-gray-500 hover:to-gray-400 hover:-translate-y-0.5 hover:shadow-lg';
        cancelBtn.onclick = () => {
            this.hideSpellButtons();
            this.showCombatButtons();
        };
        cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
        buttonContainer.appendChild(cancelBtn);
    },
    
    hideSpellButtons: function() {
        // Remove all spell selection buttons
        const spellButtons = document.querySelectorAll('.spell-choice-btn');
        spellButtons.forEach(btn => btn.remove());
    },
    
    showChoiceButtons: function(leftOption, rightOption, leftOutcome, rightOutcome) {
        this.hideAllActionButtons();
        const handleOutcome = (result, icon) => {
            UI.addToLog(`Choice made: ${result}`, "event");
            UI.updateStory(`<i class="fas fa-${icon}"></i> ${result}`);
            UI.removeChoiceButtons();
            if (!gameState.inCombat && !gameState.isGameOver) UI.showExplorationButtons();
            UI.updateDisplay();
        };
        const actionsDiv = this.elements.exploreBtn.parentElement;
        actionsDiv.appendChild(UI.createButton(leftOption, 'blue', 'blue', 'choice-btn left-choice', () => handleOutcome(leftOutcome(), 'arrow-left')));
        actionsDiv.appendChild(UI.createButton(rightOption, 'green', 'green', 'choice-btn right-choice', () => handleOutcome(rightOutcome(), 'arrow-right')));
    },
    
    showRiskButtons: function(riskOption, safeOption, riskOutcome, safeOutcome) {
        this.hideAllActionButtons();
        const actionsDiv = this.elements.exploreBtn.parentElement;
        actionsDiv.appendChild(UI.createButton(riskOption, 'orange', 'orange', 'risk-btn dangerous', () => {
            const result = riskOutcome();
            UI.addToLog(`Risky choice: ${result}`, "event");
            UI.updateStory(`<i class="fas fa-dice"></i> ${result}`);
            UI.removeChoiceButtons();
            if (!gameState.isGameOver) UI.showExplorationButtons();
            UI.updateDisplay();
        }));
        actionsDiv.appendChild(UI.createButton(safeOption, 'cyan', 'cyan', 'risk-btn safe', () => {
            const result = safeOutcome();
            UI.addToLog(`Safe choice: ${result}`, "event");
            UI.updateStory(`<i class="fas fa-shield"></i> ${result}`);
            UI.removeChoiceButtons();
            UI.showExplorationButtons();
            UI.updateDisplay();
        }));
    },
    
    removeChoiceButtons: function() {
        // Remove any temporary choice/risk buttons
        document.querySelectorAll('.choice-btn, .risk-btn, .spell-choice-btn, .vampire-spell-btn, #confirm-vampire-spells-btn').forEach(btn => btn.remove());
    },
    
    showSpellChoiceUI: function(spellChoices) {
        // Hide normal buttons
        this.hideAllActionButtons();
        
        // Create story text for spell choices
        let storyText = `<i class="fas fa-magic"></i> <span style="color: #ffd700; font-weight: bold;">Choose a New Spell!</span><br><br>`;
        storyText += `Select one spell to learn:`;
        UI.updateStory(storyText);
        
        // Create buttons for each spell choice
        const actionsDiv = this.elements.exploreBtn.parentElement;
        
        spellChoices.forEach((spellName, index) => {
            const spell = GameData.getSpell(spellName, gameState.character.isVampire);
            if (!spell) {
                console.error(`Failed to find spell: ${spellName}, isVampire: ${gameState.character.isVampire}`);
                return; // Skip this spell if not found
            }
            const btn = document.createElement('button');
            btn.innerHTML = `<i class="fas fa-wand-magic"></i> ${spellName}<br><small>${spell.description}</small>`;
            btn.className = 'bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-3 rounded-lg font-bold transition-all hover:from-purple-500 hover:to-purple-400 hover:-translate-y-0.5 hover:shadow-lg';
            btn.onclick = () => {
                const needsReplacement = gameState.learnSpell(spellName);
                if (!needsReplacement) {
                    // Only remove buttons and show exploration if we don't need replacement UI
                    this.removeChoiceButtons();
                    if (!gameState.inCombat && !gameState.isGameOver) {
                        this.showExplorationButtons();
                    }
                }
                // If needsReplacement is true, showSpellReplaceUI will handle the UI
            };
            actionsDiv.appendChild(btn);
        });
        
        // Add skip button
        const skipBtn = document.createElement('button');
        skipBtn.innerHTML = `<i class="fas fa-forward"></i> Skip`;
        skipBtn.className = 'bg-gradient-to-r from-gray-500 to-gray-400 text-white px-4 py-3 rounded-lg font-bold transition-all hover:from-gray-600 hover:to-gray-500 hover:-translate-y-0.5 hover:shadow-lg spell-choice-btn w-full mb-2';
        skipBtn.onclick = () => {
            UI.addToLog("Decided to skip learning a new spell this time.", "info");
            this.removeChoiceButtons();
            if (!gameState.inCombat && !gameState.isGameOver) {
                this.showExplorationButtons();
            }
        };
        actionsDiv.appendChild(skipBtn);
    },
    
    showVampireSpellSelectionUI: function() {
        // Hide normal buttons
        this.hideAllActionButtons();
        
        const vampireSpells = GameData.vampireSpells;
        const playerLevel = gameState.level;
        
        // Get all vampire spells available at current level
        const availableSpells = Object.keys(vampireSpells).filter(spellName => {
            const spell = vampireSpells[spellName];
            return spell.unlockLevel && spell.unlockLevel <= playerLevel;
        });
        
        // Create story text
        let storyText = `<i class="fas fa-moon"></i> <span style="color: #c41e3a; font-weight: bold;">Choose Your Vampiric Powers!</span><br><br>`;
        storyText += `Select up to 4 spells from the available vampire powers:<br>`;
        storyText += `<small style="color: #888;">(Selected: <span id="vampire-spell-count">0</span>/4)</small>`;
        UI.updateStory(storyText);
        
        // Track selected spells
        const selectedSpells = [];
        
        // Create buttons for each available spell
        const actionsDiv = this.elements.exploreBtn.parentElement;
        
        availableSpells.forEach(spellName => {
            const spell = vampireSpells[spellName];
            const btn = document.createElement('button');
            btn.innerHTML = `<i class="fas fa-wand-magic"></i> ${spellName}<br><small>${spell.description}</small>`;
            btn.className = 'bg-gradient-to-r from-gray-600 to-gray-500 text-white px-4 py-3 rounded-lg font-bold transition-all hover:from-gray-700 hover:to-gray-600 hover:-translate-y-0.5 hover:shadow-lg vampire-spell-btn w-full mb-2';
            btn.dataset.spellName = spellName;
            
            btn.onclick = () => {
                // Toggle selection
                if (selectedSpells.includes(spellName)) {
                    // Deselect
                    selectedSpells.splice(selectedSpells.indexOf(spellName), 1);
                    btn.className = 'bg-gradient-to-r from-gray-600 to-gray-500 text-white px-4 py-3 rounded-lg font-bold transition-all hover:from-gray-700 hover:to-gray-600 hover:-translate-y-0.5 hover:shadow-lg';
                    btn.innerHTML = `<i class="fas fa-wand-magic"></i> ${spellName}<br><small>${spell.description}</small>`;
                } else {
                    // Select (if under limit)
                    if (selectedSpells.length < 4) {
                        selectedSpells.push(spellName);
                        btn.className = 'bg-gradient-to-r from-red-700 to-red-600 text-white px-4 py-3 rounded-lg font-bold transition-all hover:from-red-800 hover:to-red-700 hover:-translate-y-0.5 hover:shadow-lg vampire-spell-btn w-full mb-2 border-4 border-yellow-400';
                        btn.innerHTML = `<i class="fas fa-check-circle"></i> ${spellName} <span style="color: #ffd700;">✓</span><br><small>${spell.description}</small>`;
                    } else {
                        UI.addToLog("You can only select 4 spells!", "error");
                        return;
                    }
                }
                
                // Update counter
                const counterEl = document.getElementById('vampire-spell-count');
                if (counterEl) counterEl.textContent = selectedSpells.length;
                
                // Show/hide confirm button
                let confirmBtn = document.getElementById('confirm-vampire-spells-btn');
                if (selectedSpells.length > 0 && selectedSpells.length <= 4) {
                    if (!confirmBtn) {
                        confirmBtn = document.createElement('button');
                        confirmBtn.id = 'confirm-vampire-spells-btn';
                        confirmBtn.innerHTML = `<i class="fas fa-check"></i> Confirm Selection`;
                        confirmBtn.className = 'bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-3 rounded-lg font-bold transition-all hover:from-purple-700 hover:to-purple-600 hover:-translate-y-0.5 hover:shadow-lg w-full mb-2 mt-4';
                        confirmBtn.onclick = function() {
                            gameState.character.knownSpells = [...selectedSpells];
                            gameState.character.selectedSpell = selectedSpells[0];
                            UI.addToLog(`<i class="fas fa-moon"></i> Vampire powers awakened: ${selectedSpells.join(', ')}!`, "victory");
                            UI.removeChoiceButtons();
                            if (!gameState.inCombat && !gameState.isGameOver) {
                                UI.showExplorationButtons();
                            }
                        };
                        actionsDiv.appendChild(confirmBtn);
                    }
                } else {
                    if (confirmBtn) {
                        confirmBtn.remove();
                    }
                }
            };
            actionsDiv.appendChild(btn);
        });
        
        // Add skip button
        const skipBtn = document.createElement('button');
        skipBtn.innerHTML = `<i class="fas fa-times"></i> Keep Current Spells`;
        skipBtn.className = 'bg-gradient-to-r from-gray-500 to-gray-400 text-white px-4 py-3 rounded-lg font-bold transition-all hover:from-gray-600 hover:to-gray-500 hover:-translate-y-0.5 hover:shadow-lg spell-choice-btn w-full mb-2';
        skipBtn.onclick = () => {
            UI.addToLog(`Decided not to learn ${newSpell}.`, "info");
            this.removeChoiceButtons();
            if (!gameState.inCombat && !gameState.isGameOver) {
                this.showExplorationButtons();
            }
        };
        actionsDiv.appendChild(skipBtn);
    },
    
    showSpellReplaceUI: function(newSpell) {
        // Hide normal buttons
        this.hideAllActionButtons();
        
        const newSpellData = GameData.getSpell(newSpell, gameState.character.isVampire);
        if (!newSpellData) {
            console.error(`Failed to find new spell: ${newSpell}, isVampire: ${gameState.character.isVampire}`);
            UI.addToLog(`Error: Could not find spell data for ${newSpell}`, "error");
            this.showExplorationButtons();
            return;
        }
        
        // Create story text
        let storyText = `<i class="fas fa-magic"></i> <span style="color: #ffd700; font-weight: bold;">Spell Limit Reached!</span><br><br>`;
        storyText += `You already know 4 spells (maximum capacity).<br>`;
        storyText += `<span style="color: #ffaa00;">New spell: ${newSpell}</span><br>`;
        storyText += `<small>${newSpellData.description}</small><br><br>`;
        storyText += `Choose a spell to replace, or skip learning this spell:`;
        UI.updateStory(storyText);
        
        // Create buttons for each known spell
        const actionsDiv = this.elements.exploreBtn.parentElement;
        
        gameState.character.knownSpells.forEach(spellName => {
            const spell = GameData.getSpell(spellName, gameState.character.isVampire);
            if (!spell) {
                console.error(`Failed to find spell: ${spellName}, isVampire: ${gameState.character.isVampire}`);
                return; // Skip this spell if not found
            }
            const btn = document.createElement('button');
            btn.innerHTML = `<i class="fas fa-exchange-alt"></i> Replace ${spellName}<br><small>${spell.description}</small>`;
            btn.className = 'bg-gradient-to-r from-red-500 to-red-400 text-white px-4 py-3 rounded-lg font-bold transition-all hover:from-red-600 hover:to-red-500 hover:-translate-y-0.5 hover:shadow-lg spell-choice-btn w-full mb-2';
            btn.onclick = () => {
                gameState.replaceSpell(spellName, newSpell);
                this.removeChoiceButtons();
                if (!gameState.inCombat && !gameState.isGameOver) {
                    this.showExplorationButtons();
                }
            };
            actionsDiv.appendChild(btn);
        });
        
        // Add skip button
        const skipBtn = document.createElement('button');
        skipBtn.innerHTML = `<i class="fas fa-times"></i> Keep Current Spells`;
        skipBtn.className = 'bg-gradient-to-r from-gray-500 to-gray-400 text-white px-4 py-3 rounded-lg font-bold transition-all hover:from-gray-600 hover:to-gray-500 hover:-translate-y-0.5 hover:shadow-lg spell-choice-btn w-full mb-2';
        skipBtn.onclick = () => {
            UI.addToLog(`Decided not to learn ${newSpell}.`, "info");
            this.removeChoiceButtons();
            if (!gameState.inCombat && !gameState.isGameOver) {
                this.showExplorationButtons();
            }
        };
        actionsDiv.appendChild(skipBtn);
    },
    
    showVictoryShareButton: function() {
        // Create a special share button for victory
        const shareBtn = document.createElement('button');
        shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> Share Your Victory!';
        shareBtn.className = 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-white px-5 py-3 rounded-full font-bold transition-all hover:from-yellow-600 hover:to-yellow-500 hover:-translate-y-0.5 hover:shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none victory-share-btn';
        shareBtn.onclick = () => {
            this.shareVictory();
        };
        
        // Find the button container (parent of explore button)
        const controlsDiv = this.elements.exploreBtn.parentElement;
        controlsDiv.appendChild(shareBtn);
    },
    
    shareVictory: function() {
        // Build comprehensive victory stats
        let shareText = `I just conquered the Dungeon Lord!\n\n`;
        
        // Basic stats
        shareText += `Final Stats:\n`;
        shareText += `Gold: ${gameState.inventory.gold}\n`;
        shareText += `Turns: ${gameState.turnCounter}\n`;
        shareText += `Level: ${gameState.level}\n`;
        shareText += `Enemies Slain: ${gameState.enemyKills}\n`;
        shareText += `Max Depth: ${gameState.dungeonDepth}/10\n\n`;
        
        // Character build
        shareText += `⚔️ Character Build:\n`;
        if (gameState.character.isVampire) {
            shareText += `🧛 VAMPIRE LORD\n`;
        }
        shareText += `💪 STR: ${gameState.character.strength} | `;
        shareText += `🏃 AGI: ${gameState.character.agility} | `;
        shareText += `✨ POW: ${gameState.character.power}\n`;
        shareText += `❤️ HP: ${gameState.character.hp}/${gameState.character.maxHp} | `;
        shareText += `💙 Mana: ${gameState.character.mana}/${gameState.character.maxMana}\n\n`;
        
        // Equipment
        shareText += `🎒 Equipment:\n`;
        if (gameState.character.equipment.weapon) {
            shareText += `⚔️ ${gameState.character.equipment.weapon.name}\n`;
        }
        if (gameState.character.equipment.armor) {
            shareText += `🛡️ ${gameState.character.equipment.armor.name}\n`;
        }
        if (gameState.character.equipment.accessory) {
            shareText += `💍 ${gameState.character.equipment.accessory.name}\n`;
        }
        if (!gameState.character.equipment.weapon && !gameState.character.equipment.armor && !gameState.character.equipment.accessory) {
            shareText += `(No equipment - vampire or bare-handed victory!)\n`;
        }
        shareText += `\n`;
        
        // Spells known
        shareText += `📜 Spells Mastered: `;
        if (gameState.character.knownSpells.length > 0) {
            shareText += gameState.character.knownSpells.join(', ');
        } else {
            shareText += 'None';
        }
        shareText += `\n\n`;
        
        shareText += `🎮 Dungeon Depths RPG\n`;
        shareText += `Think you can beat my run? 😉`;
        
        // Try to use the modern Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: 'Dungeon Depths Victory!',
                text: shareText,
                url: window.location.href
            }).then(() => {
                UI.addToLog("Victory shared successfully! 🎉", "victory");
            }).catch(() => {
                // Fallback if share is cancelled
                this.fallbackShare(shareText);
            });
        } else {
            // Fallback for browsers without Web Share API
            this.fallbackShare(shareText);
        }
    },
    
    fallbackShare: function(shareText) {
        // Copy to clipboard as fallback
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareText).then(() => {
                UI.addToLog("Victory stats copied to clipboard! 📋", "victory");
                UI.addToLog("Paste anywhere to share your achievement! 🎊", "victory");
            }).catch(() => {
                // Final fallback - show text in a popup
                this.showSharePopup(shareText);
            });
        } else {
            // Final fallback for older browsers
            this.showSharePopup(shareText);
        }
    },
    
    showSharePopup: function(shareText) {
        // Create a popup with the shareable text
        alert(`Victory Achievement Unlocked!\n\n${shareText}\n\nCopy this text to share your victory!`);
        UI.addToLog("Share your victory with friends! 🏆", "victory");
    },
    
    hideAllActionButtons: function() {
        // Hide all action buttons (for game over states)
        this.elements.exploreBtn.classList.add('hidden');
        this.elements.restBtn.classList.add('hidden');
        this.elements.potionBtn.classList.add('hidden');
        this.elements.shopBtn.classList.add('hidden');
        this.elements.attackBtn.classList.add('hidden');
        this.elements.spellBtn.classList.add('hidden');
        this.elements.runBtn.classList.add('hidden');
        
        // Also remove any temporary buttons
        this.removeChoiceButtons();
        document.querySelectorAll('.victory-share-btn').forEach(btn => btn.remove());
    },
    
    updateClassTips: function(className) {
        const classTipsContainer = document.getElementById('class-tips');
        if (!classTipsContainer) return;

        // Show only passive and preferred stats in quick tips
        const ClassCtor = CHARACTER_CLASSES[className];
        const tempInstance = new ClassCtor();
        const passiveName = tempInstance.passiveName || '';
        const passiveDesc = tempInstance.passiveDescription || '';
        const prefStats = tempInstance.preferredStats ? tempInstance.preferredStats.join(', ') : '';

        classTipsContainer.innerHTML = `
            <p class="text-xs text-yellow-300 mb-1"><span class="font-bold">Passive:</span> ${passiveName}</p>
            <p class="text-xs text-gray-300 mb-1">${passiveDesc}</p>
            <p class="text-xs text-green-300 mb-1"><span class="font-bold">Preferred Stats:</span> ${prefStats}</p>
        `;
    }
};

// ===============================================
// SHOP SYSTEM (Handles upgrade purchases)
// ===============================================
const Shop = {
    upgrades: {
        health: { cost: 250, benefit: "+15 Max HP", icon: "fas fa-heart", baseCost: 250 },
        mana: { cost: 200, benefit: "+10 Max Mana", icon: "fas fa-magic", baseCost: 200 },
        strength: { cost: 150, benefit: "+2 Strength", icon: "fas fa-fist-raised", baseCost: 150 },
        agility: { cost: 150, benefit: "+2 Agility", icon: "fas fa-wind", baseCost: 150 },
        power: { cost: 150, benefit: "+2 Power", icon: "fas fa-wand-magic-sparkles", baseCost: 150 },
        mastery: { cost: 300, benefit: "+1 to both masteries", icon: "fas fa-shield-alt", baseCost: 300 },
        potion: { cost: 100, benefit: "Buy 1 Healing Potion", icon: "fas fa-flask", baseCost: 100 },
        manaPotion: { cost: 80, benefit: "Buy 1 Mana Potion", icon: "fas fa-flask", baseCost: 80 },
        life: { cost: 800, benefit: "+1 Life (Max 5)", icon: "fas fa-heart-broken", baseCost: 800 }
    },
    
    openShop: function() {
        if (gameState.inCombat) {
            UI.addToLog("Cannot access shop during combat!", "damage");
            return;
        }
        
        document.getElementById('shop-panel').style.display = 'block';
        this.updateShopDisplay();
        UI.addToLog("Welcome to the Mystical Shop! Spend your gold wisely.", "event");
    },
    
    closeShop: function() {
        document.getElementById('shop-panel').style.display = 'none';
        UI.addToLog("You leave the mystical shop.", "event");
    },
    
    updateShopDisplay: function() {
        // Update shop button states and costs
        for (const [upgradeType, upgrade] of Object.entries(this.upgrades)) {
            const button = document.getElementById(`shop-${upgradeType}`);
            const costElement = document.getElementById(`cost-${upgradeType}`);
            const currentGold = gameState.inventory.gold;
            const canAfford = currentGold >= upgrade.cost;
            const isMaxedOut = this.isUpgradeMaxedOut(upgradeType);
            
            // Update cost display
            if (costElement) {
                costElement.textContent = upgrade.cost;
            }
            
            if (!button) continue;
            
            if (isMaxedOut) {
                button.textContent = "MAXED OUT";
                button.disabled = true;
                button.classList.add('opacity-50');
            } else if (!canAfford) {
                const shortage = upgrade.cost - currentGold;
                button.textContent = `Need ${shortage} more gold`;
                button.disabled = true;
                button.classList.add('opacity-50');
            } else {
                button.textContent = `Buy (${upgrade.cost}g)`;
                button.disabled = false;
                button.classList.remove('opacity-50');
            }
        }
    },
    
    isUpgradeMaxedOut: function(upgradeType) {
        switch (upgradeType) {
            case 'life':
                return gameState.lives >= 5;
            case 'health':
                return gameState.character.maxHp >= gameState.character.maxMaxHp;
            case 'mana':
                return gameState.character.maxMana >= gameState.character.maxMaxMana;
            case 'strength':
                return gameState.character.strength >= gameState.character.getMaxStrengthCap();
            case 'agility':
                return gameState.character.agility >= gameState.character.getMaxAgilityCap();
            case 'power':
                return gameState.character.power >= gameState.character.getMaxPowerCap();
            case 'mastery':
                return gameState.character.combatSpecialization.physicalMastery >= gameState.character.combatSpecialization.maxPhysicalMastery &&
                       gameState.character.combatSpecialization.magicalMastery >= gameState.character.combatSpecialization.maxMagicalMastery;
            case 'potion':
                return false; // Can always buy potions
            case 'manaPotion':
                return false; // Can always buy mana potions
            default:
                return false;
        }
    },
    
    buyUpgrade: function(upgradeType) {
        const upgrade = this.upgrades[upgradeType];
        
        if (gameState.inventory.gold < upgrade.cost) {
            UI.addToLog("Not enough gold for this upgrade!", "damage");
            return;
        }
        
        if (this.isUpgradeMaxedOut(upgradeType)) {
            UI.addToLog("This upgrade is already at maximum!", "damage");
            return;
        }
        
        // Deduct cost
        gameState.inventory.gold -= upgrade.cost;
        
        // Apply upgrade with stat caps enforced
        switch (upgradeType) {
            case 'health':
                const healthIncrease = Math.min(15, gameState.character.maxMaxHp - gameState.character.maxHp);
                if (healthIncrease > 0) {
                    gameState.character.maxHp += healthIncrease;
                    gameState.character.heal(healthIncrease);
                    UI.addToLog(`Health increased! +${healthIncrease} Max HP (and healed to full)`, "victory");
                } else {
                    UI.addToLog("Health is already at maximum!", "damage");
                    gameState.inventory.gold += upgrade.cost; // Refund
                    return;
                }
                break;
                
            case 'mana':
                const manaIncrease = Math.min(10, gameState.character.maxMaxMana - gameState.character.maxMana);
                if (manaIncrease > 0) {
                    gameState.character.maxMana += manaIncrease;
                    gameState.character.restoreMana(manaIncrease);
                    UI.addToLog(`Mana increased! +${manaIncrease} Max Mana (and restored to full)`, "victory");
                } else {
                    UI.addToLog("Mana is already at maximum!", "damage");
                    gameState.inventory.gold += upgrade.cost; // Refund
                    return;
                }
                break;
                
            case 'strength':
                const strengthIncrease = Math.min(2, gameState.character.getMaxStrengthCap() - gameState.character.strength);
                if (strengthIncrease > 0) {
                    gameState.character.strength += strengthIncrease;
                    UI.addToLog(`Strength training complete! +${strengthIncrease} Strength`, "victory");
                } else {
                    UI.addToLog("Strength is already at maximum!", "damage");
                    gameState.inventory.gold += upgrade.cost; // Refund
                    return;
                }
                break;
                
            case 'agility':
                const agilityIncrease = Math.min(2, gameState.character.getMaxAgilityCap() - gameState.character.agility);
                if (agilityIncrease > 0) {
                    gameState.character.agility += agilityIncrease;
                    UI.addToLog(`Agility training complete! +${agilityIncrease} Agility (Defense)`, "victory");
                } else {
                    UI.addToLog("Agility is already at maximum!", "damage");
                    gameState.inventory.gold += upgrade.cost; // Refund
                    return;
                }
                break;
                
            case 'power':
                const powerIncrease = Math.min(2, gameState.character.getMaxPowerCap() - gameState.character.power);
                if (powerIncrease > 0) {
                    gameState.character.power += powerIncrease;
                    UI.addToLog(`Power training complete! +${powerIncrease} Power (Magic Damage)`, "victory");
                } else {
                    UI.addToLog("Power is already at maximum!", "damage");
                    gameState.inventory.gold += upgrade.cost; // Refund
                    return;
                }
                break;
                
            case 'mastery':
                const physicalIncrease = Math.min(1, gameState.character.combatSpecialization.maxPhysicalMastery - gameState.character.combatSpecialization.physicalMastery);
                const magicalIncrease = Math.min(1, gameState.character.combatSpecialization.maxMagicalMastery - gameState.character.combatSpecialization.magicalMastery);
                
                if (physicalIncrease > 0 || magicalIncrease > 0) {
                    gameState.character.combatSpecialization.physicalMastery += physicalIncrease;
                    gameState.character.combatSpecialization.magicalMastery += magicalIncrease;
                    UI.addToLog(`Combat mastery enhanced! +${physicalIncrease} Physical, +${magicalIncrease} Magical Mastery`, "victory");
                } else {
                    UI.addToLog("Combat mastery is already at maximum!", "damage");
                    gameState.inventory.gold += upgrade.cost; // Refund
                    return;
                }
                break;
                
            case 'life':
                if (gameState.lives < 5) {
                    gameState.lives++;
                    UI.addToLog("Extra life granted! You feel more resilient.", "victory");
                } else {
                    UI.addToLog("You already have maximum lives!", "damage");
                    gameState.inventory.gold += upgrade.cost; // Refund
                    return;
                }
                break;
                
            case 'potion':
                gameState.inventory.potions++;
                UI.addToLog("Healing potion purchased! It's been added to your inventory.", "victory");
                break;
                
            case 'manaPotion':
                gameState.inventory.manaPotions++;
                UI.addToLog("Mana potion purchased! It's been added to your inventory.", "victory");
                break;
        }
        
        // Increase cost for next purchase (scaling difficulty) - except potions stay same price
        if (upgradeType !== 'potion' && upgradeType !== 'manaPotion') {
            upgrade.cost = Math.floor(upgrade.cost * 1.4);
        }
        
        UI.updateDisplay();
        this.updateShopDisplay();
        UI.addToLog(`Purchase complete! Remaining gold: ${gameState.inventory.gold}`, "event");
    }
};

// ===============================================
// GAME CONTROLLER (Handles input and coordinates between systems)
// ===============================================
const GameController = {
    startNewGame: function() {
        console.log('=== START NEW GAME CALLED ===');
        console.log('gameState:', gameState);
        console.log('ClassSelection:', typeof ClassSelection);
        
        gameState.reset();
        
        // Remove any leftover buttons from previous game
        UI.removeChoiceButtons();
        document.querySelectorAll('.victory-share-btn').forEach(btn => btn.remove());
        
        // Show class selection instead of starting immediately
        ClassSelection.showClassSelection();
        UI.hideAllActionButtons();
    },
    
    continueGameStart: function() {
        // This runs after class selection
        UI.updateStory("<i class='fas fa-door-open'></i> You enter the dungeon depths. The air grows cold as darkness surrounds you...");
        UI.addToLog("=== GAME START ===", "start");
        UI.addToLog(`Welcome, ${gameState.selectedClass}! Your adventure begins...`, "start");
        UI.showExplorationButtons();
        UI.updateDisplay();
    },
    
    exploreDungeon: function() {
        World.explore();
    },
    
    restAtCamp: function() {
        if (gameState.inCombat) {
            UI.addToLog("You cannot rest during combat!", "error");
            return;
        }
        
        if (!gameState.character) {
            UI.addToLog("Select a class first!", "error");
            return;
        }
        
        // Increment turn counter - resting takes time
        gameState.incrementTurn();
        
        // Check if game ended due to turn limit
        if (gameState.isGameOver) return;
        
        const hpRestore = Math.floor(gameState.character.maxHp * 0.3);
        const manaRestore = Math.floor(gameState.character.maxMana * 0.5);
        gameState.character.heal(hpRestore);
        gameState.character.restoreMana(manaRestore);
        
        // Gems provide a small gold bonus when resting (selling minor gems)
        if (gameState.inventory.gems > 0 && Math.random() < 0.3) {
            const gemValue = Math.floor(Math.random() * 20) + 10;
            gameState.addGold(gemValue);
            UI.addToLog(`You sold a small gem for ${gemValue} gold!`, "gold");
            gameState.inventory.gems--;
        }
        
        // Update display immediately so player sees healed HP/mana
        UI.updateDisplay();
        
        UI.updateStory("<i class=\"fas fa-bed\"></i> You rest at your camp, recovering strength and mana...");
        UI.addToLog(`Resting... Recovered ${hpRestore} HP and ${manaRestore} mana.`, "rest");
    },
    
    usePotion: function() {
        if (gameState.inventory.potions <= 0) {
            UI.addToLog("You don't have any potions!", "error");
            return;
        }
        
        if (gameState.character.hp >= gameState.character.maxHp) {
            UI.addToLog("You're already at full health!", "error");
            return;
        }
        
        // Use potion for instant healing
        const healAmount = 40;
        gameState.inventory.potions--;
        gameState.character.heal(healAmount);
        
        UI.updateStory("<i class=\"fas fa-flask\"></i> You drink a healing potion, feeling revitalized!");
        UI.addToLog(`Potion used! Restored ${healAmount} HP!`, "victory");
        UI.updateDisplay();
        
        // Update button visibility
        if (gameState.inCombat) {
            UI.showCombatButtons();
        } else {
            UI.showExplorationButtons();
        }
    },
    
    useManaPotion: function() {
        if (gameState.inventory.manaPotions <= 0) {
            UI.addToLog("You don't have any mana potions!", "error");
            return;
        }
        
        if (gameState.character.mana >= gameState.character.maxMana) {
            UI.addToLog("You're already at full mana!", "error");
            return;
        }
        
        // Use mana potion for instant restoration
        const restoreAmount = 30;
        gameState.inventory.manaPotions--;
        gameState.character.restoreMana(restoreAmount);
        
        UI.updateStory("<i class='fas fa-flask'></i> You drink a mana potion, feeling magical energy surge through you!");
        UI.addToLog(`Mana potion used! Restored ${restoreAmount} mana!`, "victory");
        UI.updateDisplay();
        
        // Update button visibility
        if (gameState.inCombat) {
            UI.showCombatButtons();
        } else {
            UI.showExplorationButtons();
        }
    },
    
    attackEnemy: function() {
        Combat.playerAttack();
    },
    
    castSpell: function() {
        // Show spell selection buttons instead of casting directly
        console.log('GameController.castSpell called - showing spell buttons');
        UI.showSpellSelectionButtons();
    },
    
    runAway: function() {
        Combat.attemptEscape();
    }
};

// ===============================================
// GLOBAL FUNCTIONS (Interface for HTML button clicks)
// ===============================================
// Expose functions to global window object for HTML onclick handlers
console.log('>>> Exposing functions to window object <<<');
window.startNewGame = function() {
    console.log('>>> window.startNewGame called <<<');
    console.log('GameController exists:', typeof GameController);
    GameController.startNewGame();
};

window.exploreDungeon = function() {
    GameController.exploreDungeon();
};

window.restAtCamp = function() {
    GameController.restAtCamp();
};

window.usePotion = function() {
    GameController.usePotion();
};

window.attackEnemy = function() {
    GameController.attackEnemy();
};

window.castSpell = function() {
    console.log('>>> Global castSpell() function called <<<');
    GameController.castSpell();
};

window.runAway = function() {
    GameController.runAway();
};

window.useManaPotion = function() {
    GameController.useManaPotion();
};

// Expose Shop object to global window
window.Shop = Shop;

// Spell selection functions
window.selectSpell = function() {
    const dropdown = document.getElementById('spell-dropdown');
    const selectedSpell = dropdown.value;
    gameState.character.selectedSpell = selectedSpell;
    updateSpellInfo();
};

function updateSpellInfo() {
    // Get spell from appropriate list based on vampire status
    const spell = GameData.getSpell(gameState.character.selectedSpell, gameState.character.isVampire);
    if (!spell) return;
    
    document.getElementById('spell-cost').textContent = spell.manaCost;
    document.getElementById('spell-description').textContent = spell.description;
    
    // Show effectiveness if in combat
    if (gameState.inCombat && gameState.currentEnemy) {
        const enemyName = gameState.currentEnemy.name;
        const effectivenessEl = document.getElementById('spell-effectiveness');
        
        if (spell.effectiveAgainst.includes(enemyName)) {
            effectivenessEl.innerHTML = '<i class="fas fa-star"></i> <span style="color: #43ea7c">Super effective vs ' + enemyName + '!</span>';
            effectivenessEl.classList.remove('hidden');
        } else if (spell.weakAgainst.includes(enemyName)) {
            effectivenessEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span style="color: #ff6b6b">Weak vs ' + enemyName + '...</span>';
            effectivenessEl.classList.remove('hidden');
        } else {
            effectivenessEl.classList.add('hidden');
        }
    } else {
        document.getElementById('spell-effectiveness').classList.add('hidden');
    }
}

function updateSpellDropdown() {
    const dropdown = document.getElementById('spell-dropdown');
    if (!dropdown) {
        console.error('Spell dropdown element not found!');
        return;
    }
    if (!gameState.character.knownSpells || gameState.character.knownSpells.length === 0) {
        console.error('No known spells available!');
        return;
    }
    
    dropdown.innerHTML = '';
    
    for (const spellName of gameState.character.knownSpells) {
        const option = document.createElement('option');
        option.value = spellName;
        option.textContent = spellName;
        if (spellName === gameState.character.selectedSpell) {
            option.selected = true;
        }
        dropdown.appendChild(option);
    }
    
    updateSpellInfo();
}

// ===============================================
// GAME INITIALIZATION (Sets up all systems when page loads)
// ===============================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all systems in proper order
    UI.initialize();
    
    // Game is ready to play
    console.log("Dungeon Crawler initialized successfully!");
});