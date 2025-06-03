"use client";

import { cn } from "@/lib/utils";
import { useTamboComponentState } from "@tambo-ai/react";
import * as React from "react";
import { z } from "zod";

// Define option type for individual options in the multi-select
export type DataCardItem = {
  id: string;
  label: string;
  value: string;
  description?: string;
  url?: string;
};

// Define the component state type
export type DataCardState = {
  selectedValues: string[];
};

// Define the component props schema with Zod
export const dataCardSchema = z.object({
  title: z.string().describe("Title displayed above the data cards"),
  options: z
    .array(
      z.object({
        id: z.string().describe("Unique identifier for this card"),
        label: z.string().describe("Display text for the card title"),
        value: z.string().describe("Value associated with this card"),
        description: z
          .string()
          .optional()
          .describe("Optional summary for the card"),
        url: z
          .string()
          .optional()
          .describe("Optional URL for the card to navigate to"),
      })
    )
    .describe("Array of selectable cards to display"),
});

// Define the props type based on the Zod schema
export type DataCardProps = z.infer<typeof dataCardSchema> &
  React.HTMLAttributes<HTMLDivElement>;

/**
 * DataCard Component
 *
 * A component that displays options as clickable cards with links and summaries
 * with the ability to select multiple items.
 */
export const DataCard = React.forwardRef<HTMLDivElement, DataCardProps>(
  ({ title, options, className, ...props }, ref) => {
    // Initialize Tambo component state
    const [state, setState] = useTamboComponentState<DataCardState>(
      `data-card`,
      { selectedValues: [] }
    );

    // Handle option selection
    const handleToggleCard = (value: string) => {
      if (!state) return;

      const selectedValues = [...state.selectedValues];
      const index = selectedValues.indexOf(value);

      // Toggle selection
      if (index > -1) {
        // Remove if already selected
        selectedValues.splice(index, 1);
      } else {
        selectedValues.push(value);
      }

      // Update component state
      setState({ selectedValues });
    };

    // Handle navigation to URL
    const handleNavigate = (url?: string) => {
      if (url) {
        window.open(url, "_blank");
      }
    };

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {title && (
          <h2 className="text-lg font-medium text-foreground/80 dark:text-foreground/80 mb-3">{title}</h2>
        )}

        <div className="space-y-2">
          {options?.map((card) => (
            <div
              key={card.id}
              className="border-b border-border/50 dark:border-border/50 pb-2 last:border-0"
            >
              <div
                className={cn(
                  "group flex items-start p-1.5 rounded-md transition-colors",
                  state &&
                    state.selectedValues.includes(card.value) &&
                    "bg-muted/50 dark:bg-muted/50"
                )}
              >
                <div
                  className="flex-shrink-0 mr-3 mt-0.5 cursor-pointer"
                  onClick={() => handleToggleCard(card.value)}
                >
                  <div
                    className={cn(
                      "w-4 h-4 border rounded-sm flex items-center justify-center transition-colors",
                      state && state.selectedValues.includes(card.value)
                        ? "bg-blue-500 dark:bg-blue-600 border-blue-500 dark:border-blue-600 text-white dark:text-gray-100"
                        : "border-border dark:border-border hover:border-foreground/30 dark:hover:border-foreground/30"
                    )}
                  >
                    {state && state.selectedValues.includes(card.value) && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-2.5 w-2.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() =>
                    card.url
                      ? handleNavigate(card.url)
                      : handleToggleCard(card.value)
                  }
                >
                  <h3
                    className={cn(
                      "text-blue-600 dark:text-blue-400 font-medium text-sm",
                      "group-hover:text-blue-700 dark:group-hover:text-blue-500",
                      state &&
                        state.selectedValues.includes(card.value) &&
                        "text-blue-700 dark:text-blue-500"
                    )}
                  >
                    {card.label}
                  </h3>
                  {card.description && (
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-0.5 leading-relaxed">
                      {card.description}
                    </p>
                  )}
                  {card.url && (
                    <span className="text-xs text-green-600 dark:text-green-500 mt-1 block truncate opacity-80">
                      {card.url}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

DataCard.displayName = "DataCard";

export default DataCard;
