// Character class - base class for all player character types
class Character {
    constructor(characterClass) {
        this.characterClass = characterClass;
        
        // Base stats (will be modified by class)
        this.hp = 80;
        this.maxHp = 80;
        this.mana = 40;
        this.maxMana = 40;
        this.strength = 18;
        this.agility = 12;
        this.power = 10;
        this.defense = 5;
        
        // Stat caps
        this.maxStrength = 50;
        this.maxAgility = 60;
        this.maxPower = 50;
        this.maxDefense = 40;
        this.maxMaxHp = 200;
        this.maxMaxMana = 120;
        
        // Vampire state
        this.isVampire = false;
        
        // Equipment system
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };
        
        // Spell system
        this.knownSpells = ['Magic Missile'];
        this.selectedSpell = 'Magic Missile';
        
        // Active effects
        this.activeEffects = {
            shield: 0,
            shieldAmount: 0,
            haste: false,
            vulnerableNext: false,
            dodgeChance: 0,
            dodgeDuration: 0,
            fortify: 0,
            fortifyAmount: 0
        };
        
        // Combat specialization
        this.combatSpecialization = {
            physicalMastery: 0,
            magicalMastery: 0,
            maxPhysicalMastery: 30,
            maxMagicalMastery: 30
        };
        
        // Critical hit system
        this.critChance = 0.05;      // 5% base crit chance
        this.critMultiplier = 1.5;   // 1.5x damage on crit (50% bonus)
    }
    
    // Apply class-specific modifications (called by subclasses)
    applyClassModifiers(modifiers) {
        this.hp = modifiers.startingHp;
        this.maxHp = modifiers.startingHp;
        this.mana = modifiers.startingMana;
        this.maxMana = modifiers.startingMana;
        this.strength = modifiers.startingStrength;
        this.agility = modifiers.startingAgility;
        this.power = modifiers.startingPower;
        this.defense = modifiers.startingDefense;
        
        // Set starting equipment if provided
        if (modifiers.startingEquipment) {
            this.equipment.weapon = modifiers.startingEquipment.weapon || null;
            this.equipment.armor = modifiers.startingEquipment.armor || null;
            this.equipment.accessory = modifiers.startingEquipment.accessory || null;
        }
        
        // Set starting spells
        if (modifiers.startingSpells) {
            this.knownSpells = [...modifiers.startingSpells];
            this.selectedSpell = modifiers.startingSpells[0];
        }
    }
    
    // Combat methods
    takeDamage(damage, damageType = 'physical') {
        let finalDamage = damage;
        
        // Apply shield first
        if (this.activeEffects.shield > 0) {
            const blocked = Math.min(finalDamage, this.activeEffects.shieldAmount);
            finalDamage -= blocked;
            this.activeEffects.shieldAmount -= blocked;
            
            if (this.activeEffects.shieldAmount <= 0) {
                this.activeEffects.shield = 0;
                this.activeEffects.shieldAmount = 0;
            }
        }
        
        // Apply dodge chance
        if (this.activeEffects.dodgeChance > 0 && Math.random() < this.activeEffects.dodgeChance) {
            return 0;
        }
        
        // Apply defense based on damage type
        if (damageType === 'physical') {
            const defense = this.getPhysicalDefense();
            finalDamage = Math.max(1, finalDamage - defense);
        } else if (damageType === 'magical') {
            const defense = this.getMagicalDefense();
            finalDamage = Math.max(1, finalDamage - defense);
        }
        
        this.hp = Math.max(0, this.hp - finalDamage);
        
        // Check for fatal damage and Paladin's Divine Intervention
        if (this.hp <= 0 && this.characterClass === 'Paladin' && !this.divineInterventionUsed) {
            this.hp = 1;
            this.divineInterventionUsed = true;
            this.divineInterventionHealing = Math.floor(this.maxHp * 0.25);
            return false; // Prevent death
        }
        
        // Warrior's Battle Hardened passive - triggers at 30% HP
        if (this.characterClass === 'Warrior' && !this.battleHardenedTriggered) {
            const hpThreshold = Math.floor(this.maxHp * 0.3);
            if (this.hp <= hpThreshold && this.hp > 0) {
                this.battleHardenedTriggered = true;
                this.battleHardenedBonus = { strength: 5, defense: 3 };
                this.strength += 5;
                this.defense += 3;
            }
        }
        
        return this.hp <= 0; // Return true if player died
    }
    
    heal(amount) {
        const oldHp = this.hp;
        this.hp = Math.min(this.maxHp, this.hp + amount);
        return this.hp - oldHp;
    }
    
    restoreMana(amount) {
        const oldMana = this.mana;
        this.mana = Math.min(this.maxMana, this.mana + amount);
        return this.mana - oldMana;
    }
    
    consumeMana(amount) {
        if (this.mana >= amount) {
            this.mana -= amount;
            return true;
        }
        return false;
    }
    
    // Stat getters with equipment bonuses
    getEffectiveStrength() {
        let str = this.strength;
        if (this.equipment.weapon && this.equipment.weapon.statType === 'strength') {
            str += this.equipment.weapon.bonus;
        }
        if (this.equipment.armor && this.equipment.armor.statType === 'strength') {
            str += this.equipment.armor.bonus;
        }
        if (this.equipment.accessory && this.equipment.accessory.statType === 'strength') {
            str += this.equipment.accessory.bonus;
        }
        return str;
    }
    
    getEffectiveAgility() {
        let agi = this.agility;
        if (this.equipment.weapon && this.equipment.weapon.statType === 'agility') {
            agi += this.equipment.weapon.bonus;
        }
        if (this.equipment.armor && this.equipment.armor.statType === 'agility') {
            agi += this.equipment.armor.bonus;
        }
        if (this.equipment.accessory && this.equipment.accessory.statType === 'agility') {
            agi += this.equipment.accessory.bonus;
        }
        return agi;
    }
    
    getEffectivePower() {
        let pow = this.power;
        if (this.equipment.weapon && this.equipment.weapon.statType === 'power') {
            pow += this.equipment.weapon.bonus;
        }
        if (this.equipment.armor && this.equipment.armor.statType === 'power') {
            pow += this.equipment.armor.bonus;
        }
        if (this.equipment.accessory && this.equipment.accessory.statType === 'power') {
            pow += this.equipment.accessory.bonus;
        }
        return pow;
    }
    
    getEffectiveDefense() {
        let def = this.defense;
        if (this.equipment.weapon && this.equipment.weapon.statType === 'defense') {
            def += this.equipment.weapon.bonus;
        }
        if (this.equipment.armor && this.equipment.armor.statType === 'defense') {
            def += this.equipment.armor.bonus;
        }
        if (this.equipment.accessory && this.equipment.accessory.statType === 'defense') {
            def += this.equipment.accessory.bonus;
        }
        return def;
    }
    
    getPhysicalDefense() {
        return Math.floor(this.getEffectiveDefense() + (this.getEffectiveAgility() * 0.15) + this.activeEffects.fortifyAmount);
    }
    
    getMagicalDefense() {
        return Math.floor((this.getEffectiveAgility() * 0.2) + this.activeEffects.fortifyAmount);
    }
    
    getMaxStrengthCap() {
        return this.maxStrength;
    }
    
    getMaxAgilityCap() {
        return this.maxAgility;
    }
    
    getMaxPowerCap() {
        return this.maxPower;
    }
    
    getMaxManaCap() {
        return this.maxMaxMana;
    }
}

export default Character;
