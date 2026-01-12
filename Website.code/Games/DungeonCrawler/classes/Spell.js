// Spell class - encapsulates spell data and behavior
class Spell {
    constructor(name, manaCost, spellType, description, unlockLevel, extras = {}) {
        this.name = name;
        this.manaCost = manaCost;
        this.spellType = spellType;
        this.description = description;
        this.unlockLevel = unlockLevel;
        
        // Merge extra properties
        Object.assign(this, extras);
    }
    
    // Check if spell can be cast
    canCast(caster) {
        return caster.mana >= this.manaCost;
    }
    
    // Get spell damage (if damage spell)
    getDamage(caster, target) {
        if (this.spellType !== 'damage') return 0;
        
        const baseDamage = caster.getEffectivePower();
        const multiplier = this.damageMultiplier || 1.0;
        const bonus = this.bonusDamage || 0;
        
        let damage = Math.floor(baseDamage * multiplier) + bonus;
        
        // Apply effectiveness modifiers
        if (this.effectiveAgainst && this.effectiveAgainst.includes(target.name)) {
            damage = Math.floor(damage * 1.3);
        }
        if (this.weakAgainst && this.weakAgainst.includes(target.name)) {
            damage = Math.floor(damage * 0.7);
        }
        
        return damage;
    }
    
    // Get heal amount (if healing spell)
    getHealAmount() {
        return this.healAmount || 0;
    }
    
    // Check if spell has life drain
    hasLifeDrain() {
        return this.lifeDrain > 0;
    }
    
    // Get life drain percentage
    getLifeDrainPercent() {
        return this.lifeDrain || 0;
    }
}

export default Spell;
