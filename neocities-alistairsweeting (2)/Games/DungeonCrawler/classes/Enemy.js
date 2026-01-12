// Enemy class - encapsulates enemy data and behavior
class Enemy {
    constructor(name, hp, attack, defense, reward, speed, agility, description, minDepth, maxDepth, resistances, lore, extras = {}) {
        this.name = name;
        this.maxHp = hp;
        this.hp = hp;
        this.attack = attack;
        this.defense = defense;
        this.reward = reward;
        this.speed = speed;
        this.agility = agility;
        this.description = description;
        this.minDepth = minDepth;
        this.maxDepth = maxDepth;
        this.resistances = resistances;
        this.lore = lore;
        
        // Merge extra properties
        Object.assign(this, extras);
        
        // Combat state
        this.turnsToSkip = 0;
        this.debuffs = {
            weakened: 0,
            slowed: 0,
            vulnerable: false,
            stunned: false
        };
    }
    
    // Check if enemy can spawn at current depth
    canSpawnAt(depth) {
        return depth >= this.minDepth && depth <= this.maxDepth;
    }
    
    // Get effective attack (with debuffs)
    getEffectiveAttack() {
        let effectiveAttack = this.attack;
        if (this.debuffs.weakened > 0) {
            effectiveAttack = Math.floor(effectiveAttack * 0.7);
        }
        return effectiveAttack;
    }
    
    // Get effective agility (with debuffs)
    getEffectiveAgility() {
        let effectiveAgility = this.agility;
        if (this.debuffs.slowed > 0) {
            effectiveAgility = Math.floor(effectiveAgility * 0.5);
        }
        return effectiveAgility;
    }
    
    // Take damage with resistance calculation
    takeDamage(amount, damageType = 'physical') {
        const resistance = this.resistances[damageType] || 1.0;
        let finalDamage = Math.floor(amount * resistance);
        
        // Apply vulnerability
        if (this.debuffs.vulnerable) {
            finalDamage = Math.floor(finalDamage * 1.5);
            this.debuffs.vulnerable = false;
        }
        
        this.hp = Math.max(0, this.hp - finalDamage);
        return finalDamage;
    }
    
    // Update debuff durations
    updateDebuffs() {
        if (this.debuffs.weakened > 0) this.debuffs.weakened--;
        if (this.debuffs.slowed > 0) this.debuffs.slowed--;
        if (this.debuffs.stunned) this.debuffs.stunned = false;
    }
    
    // Check if enemy is alive
    isAlive() {
        return this.hp > 0;
    }
    
    // Check if enemy should skip turn
    shouldSkipTurn() {
        return this.turnsToSkip > 0 || this.debuffs.stunned;
    }
    
    // Get health percentage
    getHealthPercent() {
        return (this.hp / this.maxHp) * 100;
    }
}

export default Enemy;
