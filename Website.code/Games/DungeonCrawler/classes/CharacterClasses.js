// AI Agent: Check AI_AGENT_GUIDE.md for project instructions including changelog requirements
// Character class definitions - each class extends the base Character class
// with unique stats, growth rates, equipment preferences, and spell lists

import Character from "./Character.js";
import EquipmentItem from "./Equipment.js";

class Warrior extends Character {
  constructor() {
    super("Warrior");

    // Warrior specializes in physical combat with high HP and strength
    this.applyClassModifiers({
      startingHp: 90, // Raised so Warrior has more HP than Rogue
      startingMana: 30,
      startingStrength: 22, // Lowered from 25
      startingAgility: 10,
      startingPower: 5,
      startingDefense: 2, // Lowered from 3
      startingEquipment: {
        weapon: new EquipmentItem("Iron Sword", 4, "common", "strength"),
        armor: new EquipmentItem("Chainmail Shirt", 8, "common", "defense", {
          armorType: "heavy",
        }),
        accessory: null,
      },
      startingSpells: ["Shield", "Fortify"],
    });

    // Growth rates per level
    this.growthRates = {
      hpPerLevel: 8, // Lowered from 12
      manaPerLevel: 3,
      strengthPerLevel: 0.3, // Lowered from 0.4
      agilityPerLevel: 0.15,
      powerPerLevel: 0.1,
      defensePerLevel: 0.18, // Lowered from 0.3
    };

    // Warrior passive: Battle Hardened
    this.hasPassiveAbility = true;
    this.passiveName = "Battle Hardened";
    this.passiveDescription =
      "When your HP drops below 30%, gain +5 strength and +3 defense until the end of combat. This can only trigger once per battle.";
    this.battleHardenedTriggered = false;

    // Equipment drop preferences (higher = more likely)
    this.equipmentPreferences = {
      weapon: 0.5, // 50% chance for weapons
      armor: 0.35, // 35% chance for armor
      accessory: 0.15, // 15% chance for accessories
    };

    // Preferred equipment stat types
    this.preferredStats = ["strength", "defense"];

    // Class-exclusive spells (unlocked as they level up)
    this.classSpells = [
      "Shield",
      "Fortify",
      "Battle Cry",
      "Cleave",
      "Warlord's Might",
    ];

    // Modified stat caps for warriors
    this.maxStrength = 70; // Increased from 50
    this.maxDefense = 60; // Increased from 40
    this.maxMaxHp = 250; // Increased from 200
  }
}

class Mage extends Character {
  constructor() {
    super("Mage");

    // Mage specializes in magical power with spell damage
    this.applyClassModifiers({
      startingHp: 75,
      startingMana: 60,
      startingStrength: 8,
      startingAgility: 12,
      startingPower: 20,
      startingDefense: 2,
      startingEquipment: {
        weapon: new EquipmentItem("Apprentice Wand", 2, "common", "power"),
        armor: null,
        accessory: new EquipmentItem("Arcane Pendant", 4, "uncommon", "power"),
      },
      startingSpells: ["Magic Missile", "Fireball", "Mana Drain"],
    });

    // Growth rates per level
    this.growthRates = {
      hpPerLevel: 6,
      manaPerLevel: 8,
      strengthPerLevel: 0.1,
      agilityPerLevel: 0.2,
      powerPerLevel: 0.5,
      defensePerLevel: 0.1,
    };

    // Mage passive: Arcane Surge
    this.hasPassiveAbility = true;
    this.passiveName = "Arcane Surge";
    this.passiveDescription =
      "When you cast 3 spells in a row without using a basic attack, your next spell deals 50% bonus damage and costs 50% less mana.";
    this.spellComboCount = 0;

    // Equipment drop preferences
    this.equipmentPreferences = {
      weapon: 0.4, // 40% chance for weapons (staffs/wands)
      armor: 0.15, // 15% chance for armor (robes)
      accessory: 0.45, // 45% chance for accessories (magical)
    };

    // Preferred equipment stat types
    this.preferredStats = ["power", "agility"];

    // Class-exclusive spells
    this.classSpells = [
      "Magic Missile",
      "Fireball",
      "Mana Drain",
      "Lightning Bolt",
      "Ice Storm",
      "Meteor",
      "Arcane Blast",
      "Time Stop",
    ];

    // Modified stat caps for mages
    this.maxPower = 80; // Increased from 50
    this.maxMaxMana = 180; // Increased from 120
    this.maxAgility = 50; // Decreased from 60
  }
}

class Rogue extends Character {
  constructor() {
    super("Rogue");

    // Rogue specializes in agility with high dodge and critical strikes
    this.applyClassModifiers({
      startingHp: 80,
      startingMana: 40,
      startingStrength: 15,
      startingAgility: 22,
      startingPower: 8,
      startingDefense: 3,
      startingEquipment: {
        weapon: new EquipmentItem("Rusty Dagger", 2, "common", "strength"),
        armor: new EquipmentItem("Leather Vest", 2, "common", "agility", {
          armorType: "light",
        }),
        accessory: new EquipmentItem("Silver Ring", 1, "common", "agility"),
      },
      startingSpells: ["Shadow Meld", "Weaken"],
    });

    // Growth rates per level
    this.growthRates = {
      hpPerLevel: 8,
      manaPerLevel: 5,
      strengthPerLevel: 0.25,
      agilityPerLevel: 0.5, // Back to full growth (damage scaling is reduced instead)
      powerPerLevel: 0.15,
      defensePerLevel: 0.15,
      physicalMasteryPerLevel: 0.25, // Rogue gains extra physical mastery
    };

    // Rogue passive: Surprise Attack
    this.hasPassiveAbility = true;
    this.passiveName = "Surprise Attack";
    this.passiveDescription =
      "When entering combat: If you have higher agility, gain a guaranteed critical hit. If enemy has higher agility, they attack first but you can dodge and gain +3 agility for that fight.";

    // Equipment drop preferences
    this.equipmentPreferences = {
      weapon: 0.35, // 35% chance for weapons (daggers)
      armor: 0.25, // 25% chance for armor (light)
      accessory: 0.4, // 40% chance for accessories (agility)
    };

    // Preferred equipment stat types
    this.preferredStats = ["agility", "strength"];

    // Class-exclusive spells
    this.classSpells = [
      "Shadow Meld",
      "Weaken",
      "Poison Strike",
      "Backstab",
      "Shadow Step",
      "Assassinate",
    ];

    // Modified stat caps for rogues
    this.maxAgility = 42; // 10 above highest enemy agility (Dungeon Lord: 32)
    this.maxStrength = 45; // Decreased from 50
    this.maxMaxHp = 180; // Decreased from 200

    // Rogue critical hit specialization
    this.critChance = 0.15; // 15% base crit chance (vs 5% for other classes)
  }
}

class Paladin extends Character {
  constructor() {
    super("Paladin");

    // Paladin is balanced with healing abilities and holy magic
    this.applyClassModifiers({
      startingHp: 85, // Raised so Paladin has more HP than Mage
      startingMana: 45,
      startingStrength: 16, // Lowered from 18
      startingAgility: 12,
      startingPower: 15,
      startingDefense: 1, // Lowered further to make Paladin take more damage
      startingEquipment: {
        weapon: new EquipmentItem("Iron Sword", 4, "common", "strength"),
        armor: new EquipmentItem("Chainmail Shirt", 8, "common", "defense", {
          armorType: "heavy",
        }), // Lowered starting armor
        accessory: new EquipmentItem(
          "Guardian Amulet",
          3,
          "uncommon",
          "defense",
        ),
      },
      startingSpells: ["Heal", "Shield", "Holy Light"],
    });

    // Growth rates per level
    this.growthRates = {
      hpPerLevel: 7, // Lowered from 10
      manaPerLevel: 6,
      strengthPerLevel: 0.22, // Lowered from 0.3
      agilityPerLevel: 0.2,
      powerPerLevel: 0.18, // Lowered from 0.25
      defensePerLevel: 0.12, // Lowered further to make Paladin take more damage
    };

    // Paladin passive: Divine Intervention
    this.hasPassiveAbility = true;
    this.passiveName = "Divine Intervention";
    this.passiveDescription =
      "Once per battle, when you would take fatal damage, survive with 1 HP and heal for 15% of your max HP at the start of your next turn."; // Nerfed healing
    this.divineInterventionUsed = false;

    // Equipment drop preferences
    this.equipmentPreferences = {
      weapon: 0.35, // 35% chance for weapons
      armor: 0.4, // 40% chance for armor
      accessory: 0.25, // 25% chance for accessories
    };

    // Preferred equipment stat types
    this.preferredStats = ["defense", "strength", "power"];

    // Class-exclusive spells
    this.classSpells = [
      "Heal",
      "Shield",
      "Holy Light",
      "Cleanse",
      "Divine Protection",
      "Smite",
      "Resurrection",
    ];

    // Modified stat caps for paladins (balanced)
    this.maxStrength = 45; // Lowered from 55
    this.maxDefense = 32; // Lowered from 50
    this.maxPower = 45; // Lowered from 55
    this.maxMaxHp = 150; // Lowered from 220
    this.maxMaxMana = 120; // Lowered from 140
  }
}

// Class registry for easy access
const CHARACTER_CLASSES = {
  Warrior: Warrior,
  Mage: Mage,
  Rogue: Rogue,
  Paladin: Paladin,
};

// Class descriptions for UI
const CLASS_DESCRIPTIONS = {
  Warrior: {
    name: "Warrior",
    icon: "fa-sword",
    color: "#ff6b6b",
    description: "A mighty fighter who excels in melee combat",
    strengths: [
      "High HP and defense",
      "Strong physical attacks",
      "Heavy armor proficiency",
      "Fortification buffs",
    ],
    weaknesses: [
      "Low mana pool",
      "Limited magic abilities",
      "Less agile than other classes",
    ],
    playstyle:
      "Tank and frontline fighter - absorb damage and deal heavy physical blows",
    startingStats: "HP: 100, Mana: 30, STR: 25, AGI: 10, POW: 5, DEF: 3",
  },
  Mage: {
    name: "Mage",
    icon: "fa-wand-magic",
    color: "#4dabf7",
    description: "A master of arcane arts with devastating spells",
    strengths: [
      "Massive spell damage",
      "Large mana pool",
      "Elemental mastery",
      "Range advantage",
    ],
    weaknesses: [
      "Low HP",
      "Weak physical defense",
      "Vulnerable in melee",
      "Mana dependent",
    ],
    playstyle:
      "Glass cannon - obliterate enemies with powerful spells before they reach you",
    startingStats: "HP: 75, Mana: 60, STR: 8, AGI: 12, POW: 20, DEF: 2",
  },
  Rogue: {
    name: "Rogue",
    icon: "fa-user-ninja",
    color: "#9775fa",
    description: "A cunning assassin who strikes from the shadows",
    strengths: [
      "Extremely high agility",
      "High dodge chance",
      "Critical strikes",
      "Fast attacks",
    ],
    weaknesses: [
      "Lower HP than warriors",
      "Dependent on positioning",
      "Limited healing",
    ],
    playstyle:
      "Hit-and-run tactics - dodge attacks and strike weak points for critical damage",
    startingStats: "HP: 80, Mana: 40, STR: 15, AGI: 22, POW: 8, DEF: 3",
  },
  Paladin: {
    name: "Paladin",
    icon: "fa-shield-halved",
    color: "#ffd43b",
    description: "A holy warrior who balances combat and healing",
    strengths: [
      "Balanced stats",
      "Healing abilities",
      "Holy magic",
      "Good defense",
    ],
    weaknesses: [
      "Jack of all trades, master of none",
      "No extreme specialization",
    ],
    playstyle:
      "Versatile hybrid - adapt to any situation with a mix of combat, magic, and healing",
    startingStats: "HP: 95, Mana: 45, STR: 18, AGI: 12, POW: 15, DEF: 4",
  },
};

export { Warrior, Mage, Rogue, Paladin, CHARACTER_CLASSES, CLASS_DESCRIPTIONS };
