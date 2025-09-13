import { PlayerPosition } from "@prisma/client";

export class PriceService {
  // Base prices for different positions (in DKK) - 2x higher for better balance
  private static readonly BASE_PRICES = {
    [PlayerPosition.GOALKEEPER]: 200000, // 200k kr
    [PlayerPosition.DEFENDER]: 240000,  // 240k kr
    [PlayerPosition.MIDFIELDER]: 300000, // 300k kr
    [PlayerPosition.ATTACKER]: 360000,  // 360k kr
  };

  // Age multipliers
  private static readonly AGE_MULTIPLIERS = {
    young: { min: 16, max: 22, multiplier: 1.2 }, // Young players are more valuable
    prime: { min: 23, max: 28, multiplier: 1.0 }, // Prime age
    experienced: { min: 29, max: 32, multiplier: 0.9 }, // Experienced but aging
    veteran: { min: 33, max: 40, multiplier: 0.7 }, // Veterans
  };

  /**
   * Calculate minimum price for a player based on stats, age, and position
   */
  public static calculateMinimumPrice(
    speed: number,
    shooting: number,
    passing: number,
    defending: number,
    stamina: number,
    reflexes: number,
    age: number,
    position: PlayerPosition
  ): number {
    // Calculate rating as average of all stats
    const rating = Math.round((speed + shooting + passing + defending + stamina + reflexes) / 6);
    
    // Base price for position
    const basePrice = this.BASE_PRICES[position];
    
    // Rating multiplier (0.5x to 2.0x based on rating 50-100)
    const ratingMultiplier = 0.5 + ((rating - 50) / 50) * 1.5;
    
    // Age multiplier
    const ageMultiplier = this.getAgeMultiplier(age);
    
    // Calculate minimum price
    const minimumPrice = Math.round(basePrice * ratingMultiplier * ageMultiplier);
    
    // Ensure minimum price is at least 50,000 DKK (5x higher for balance)
    return Math.max(minimumPrice, 50000);
  }

  /**
   * Get age multiplier based on player age
   */
  private static getAgeMultiplier(age: number): number {
    if (age >= this.AGE_MULTIPLIERS.young.min && age <= this.AGE_MULTIPLIERS.young.max) {
      return this.AGE_MULTIPLIERS.young.multiplier;
    } else if (age >= this.AGE_MULTIPLIERS.prime.min && age <= this.AGE_MULTIPLIERS.prime.max) {
      return this.AGE_MULTIPLIERS.prime.multiplier;
    } else if (age >= this.AGE_MULTIPLIERS.experienced.min && age <= this.AGE_MULTIPLIERS.experienced.max) {
      return this.AGE_MULTIPLIERS.experienced.multiplier;
    } else {
      return this.AGE_MULTIPLIERS.veteran.multiplier;
    }
  }

  /**
   * Calculate suggested price (slightly above minimum)
   */
  public static calculateSuggestedPrice(
    speed: number,
    shooting: number,
    passing: number,
    defending: number,
    stamina: number,
    reflexes: number,
    age: number,
    position: PlayerPosition
  ): number {
    const minimumPrice = this.calculateMinimumPrice(speed, shooting, passing, defending, stamina, reflexes, age, position);
    // Suggest 20% above minimum price
    return Math.round(minimumPrice * 1.2);
  }

  /**
   * Format price for display
   */
  public static formatPrice(price: number): string {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }
}
