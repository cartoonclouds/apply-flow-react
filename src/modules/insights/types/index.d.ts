import type { LucideIcon } from "lucide-react";

export type InsightDirection = "up" | "down" | "neutral";

export interface InsightViewSubValueDefinition {
  /**
   * The label for the subvalue, providing context for what the subvalue represents.
   */
  text: string;
  /**
   * The direction of the subvalue, indicating whether it represents an increase, decrease, or neutral change compared to a previous value. This can be used to visually indicate trends or changes in the data.
   */
  direction: InsightDirection;
  /**
   * The icon associated with the subvalue, which can be used to visually represent the trend or change indicated by the direction. This is typically a string that corresponds to an icon name or identifier in the UI framework being used.
   */
  icon: LucideIcon;
}

export interface InsightViewDefinition {
  /**
   * The title of the insight card.
   */
  title: string;
  /**
   * The description of the insight card.
   */
  description: string;
  /**
   * The value of the insight card, typically a number or string representing the calculated insight.
   */
  value: number | string;
  /**
   * The subvalue of the insight card, providing additional context or information about the main value. This is optional and can be used to display trends, comparisons, or other relevant data.
   * */
  subValue?: InsightViewSubValueDefinition;
  /**
   * The icon associated with the insight card, which can be used to visually represent the insight in the UI. This is typically a string that corresponds to an icon name or identifier in the UI framework being used.
   */
  icon: LucideIcon;
  /**
   * The color associated with the insight card, which can be used to visually represent the insight in the UI. This is typically a string that corresponds to a color name or identifier in the UI framework being used.
   */
  color?: string;
}

/**
 * Represents an executable insight class that will calculate a specific insight when executed.
 */
export interface IInsight {
  // /**
  //  * The database instance that will be used to execute the insight. This is typically an instance of a database connection or ORM that allows the insight to query and manipulate data as needed.
  //  */
  //  constructor(private readonly db: DrizzleAppDatabase);

  /**
   * Execute the logic to calculate the insight. The result will be used for rendering and may also be persisted depending on the repository implementation.
   * @returns The calculated insight value.
   */
  execute(): Promise<number>;
  /**
   * Convert the executed insight into a view definition for presentation in the UI. This typically includes formatting and additional metadata for rendering.
   * @returns The view definition of the executed insight.
   */
  toView(): InsightViewDefinition;
}
