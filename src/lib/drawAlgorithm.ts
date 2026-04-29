import type {
  Participant,
  DrawPot,
  Group,
  GroupsDrawConfig,
  GroupNamingFormat,
} from "../types/groupsDraw";

export class DrawAlgorithm {
  /**
   * Perform 100% random draw
   * Shuffles all participants and distributes them round-robin to groups
   */
  static randomDraw(
    participants: Participant[],
    numberOfGroups: number,
    groupNames: string[]
  ): Group[] {
    // Shuffle participants using Fisher-Yates algorithm
    const shuffled = this.shuffleArray([...participants]);

    // Create empty groups
    const groups: Group[] = groupNames.map((name) => ({
      id: crypto.randomUUID(),
      name,
      participants: [],
    }));

    // Distribute round-robin
    shuffled.forEach((participant, index) => {
      const groupIndex = index % numberOfGroups;
      groups[groupIndex].participants.push(participant);
    });

    return groups;
  }

  /**
   * Perform pots-based draw
   * One participant from each pot is drawn into each group sequentially
   */
  static potsDraw(
    pots: DrawPot[],
    numberOfGroups: number,
    groupNames: string[]
  ): Group[] {
    // Create empty groups
    const groups: Group[] = groupNames.map((name) => ({
      id: crypto.randomUUID(),
      name,
      participants: [],
    }));

    // For each pot, shuffle and distribute one to each group
    pots.forEach((pot) => {
      const shuffled = this.shuffleArray([...pot.participants]);

      shuffled.forEach((participant, index) => {
        if (index < numberOfGroups) {
          groups[index].participants.push(participant);
        }
      });
    });

    return groups;
  }

  /**
   * Generate group names based on format
   */
  static generateGroupNames(
    numberOfGroups: number,
    format: GroupNamingFormat,
    customNames?: string[]
  ): string[] {
    if (format === "custom" && customNames && customNames.length >= numberOfGroups) {
      return customNames.slice(0, numberOfGroups);
    }

    if (format === "A-Z") {
      return Array.from({ length: numberOfGroups }, (_, i) =>
        String.fromCharCode(65 + i)
      ).map((letter) => `Groupe ${letter}`);
    }

    // Default to 1-30 format
    return Array.from(
      { length: numberOfGroups },
      (_, i) => `Groupe ${i + 1}`
    );
  }

  /**
   * Validate configuration before draw
   */
  static validateConfig(config: GroupsDrawConfig): {
    valid: boolean;
    error?: string;
  } {
    // Check minimum participants
    if (config.participants.length < 4) {
      return {
        valid: false,
        error: "Minimum 4 participants requis",
      };
    }

    // Check number of groups
    if (config.numberOfGroups < 2 || config.numberOfGroups > 30) {
      return {
        valid: false,
        error: "Le nombre de groupes doit être entre 2 et 30",
      };
    }

    // Check participants per group
    if (config.participantsPerGroup < 1 || config.participantsPerGroup > 50) {
      return {
        valid: false,
        error: "Le nombre de participants par groupe doit être entre 1 et 50",
      };
    }

    // Check total capacity
    const totalCapacity = config.numberOfGroups * config.participantsPerGroup;
    if (totalCapacity < config.participants.length) {
      return {
        valid: false,
        error: `Capacité insuffisante : ${totalCapacity} places pour ${config.participants.length} participants`,
      };
    }

    // Check format-specific constraints
    if (config.groupNamingFormat === "A-Z" && config.numberOfGroups > 26) {
      return {
        valid: false,
        error: "Le format A-Z supporte maximum 26 groupes",
      };
    }

    if (config.groupNamingFormat === "1-30" && config.numberOfGroups > 30) {
      return {
        valid: false,
        error: "Le format 1-30 supporte maximum 30 groupes",
      };
    }

    if (
      config.groupNamingFormat === "custom" &&
      (!config.customGroupNames ||
        config.customGroupNames.length < config.numberOfGroups)
    ) {
      return {
        valid: false,
        error: "Tous les noms de groupe personnalisés doivent être fournis",
      };
    }

    // Pots-specific validation
    if (config.drawMode === "pots") {
      if (!config.pots || config.pots.length < 2) {
        return {
          valid: false,
          error: "Minimum 2 pots requis pour le mode chapeaux",
        };
      }

      // Check each pot has participants
      for (const pot of config.pots) {
        if (pot.participants.length === 0) {
          return {
            valid: false,
            error: `Le ${pot.name} ne contient aucun participant`,
          };
        }
      }

      // Check all pots have same count for balanced draw
      const participantsPerPot = config.pots[0].participants.length;
      const allSameCount = config.pots.every(
        (pot) => pot.participants.length === participantsPerPot
      );

      if (!allSameCount) {
        return {
          valid: false,
          error:
            "Tous les pots doivent avoir le même nombre de participants pour un tirage équilibré",
        };
      }

      // Check pots provide enough participants for groups
      if (participantsPerPot < config.numberOfGroups) {
        return {
          valid: false,
          error: `Chaque pot doit avoir au moins ${config.numberOfGroups} participants (un par groupe)`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Fisher-Yates shuffle algorithm
   * @private
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
