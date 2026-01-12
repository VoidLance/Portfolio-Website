// EquipmentItem class - encapsulates equipment data and behavior
// Named EquipmentItem to avoid conflict with Equipment system manager
class EquipmentItem {
    constructor(name, bonus, rarity, statType, extras = {}) {
        this.name = name;
        this.bonus = bonus;
        this.rarity = rarity;
        this.statType = statType;
        
        // Merge extra properties
        Object.assign(this, extras);
    }
    
    // Get equipment type (weapon, armor, accessory)
    getType() {
        if (this.armorType) return 'armor';
        if (this.statType === 'strength' || this.statType === 'power') return 'weapon';
        return 'accessory';
    }
    
    // Check if equipment can be equipped by character
    canEquip(character) {
        if (this.vampiric && !character.isVampire) return false;
        if (character.isVampire && !this.vampiric) return false;
        return true;
    }
    
    // Get rarity color for display
    getRarityColor() {
        const colors = {
            common: '#888888',
            uncommon: '#43ea7c',
            rare: '#3b82f6',
            epic: '#a855f7',
            legendary: '#f59e0b'
        };
        return colors[this.rarity] || '#888888';
    }
    
    // Check if equipment is cursed
    isCursed() {
        return this.cursed === true;
    }
    
    // Get equipment description
    getDescription() {
        let desc = `${this.name} (+${this.bonus} ${this.statType})`;
        if (this.description) desc += ` - ${this.description}`;
        return desc;
    }
}

export default EquipmentItem;
