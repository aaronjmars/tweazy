"use client";

import type { messageVariants } from "@/components/ui/message";
import { EnhancedMessageInput } from "@/components/EnhancedMessageInput";
import {
  MessageSuggestions,
  MessageSuggestionsList,
  MessageSuggestionsStatus,
} from "@/components/ui/message-suggestions";
import { ScrollableMessageContainer } from "@/components/ui/scrollable-message-container";
import {
  ThreadContainer,
  useThreadContainerContext,
} from "@/components/ui/thread-container";
import {
  ThreadContent,
  ThreadContentMessages,
} from "@/components/ui/thread-content";
import {
  ThreadHistory,
  ThreadHistoryHeader,
  ThreadHistoryList,
  ThreadHistoryNewButton,
  ThreadHistorySearch,
} from "@/components/ui/thread-history";
import { useMergedRef } from "@/lib/thread-hooks";
import { Suggestion } from "@tambo-ai/react";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

/**
 * Props for the MessageThreadFull component
 */
export interface MessageThreadFullProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional context key for the thread */
  contextKey?: string;
  /**
   * Controls the visual styling of messages in the thread.
   * Possible values include: "default", "compact", etc.
   * These values are defined in messageVariants from "@/components/ui/message".
   * @example variant="compact"
   */
  variant?: VariantProps<typeof messageVariants>["variant"];
}

/**
 * A full-screen chat thread component with message history, input, and suggestions
 */
export const MessageThreadFull = React.forwardRef<
  HTMLDivElement,
  MessageThreadFullProps
>(({ className, contextKey, variant, ...props }, ref) => {
  const { containerRef, historyPosition } = useThreadContainerContext();
  const mergedRef = useMergedRef<HTMLDivElement | null>(ref, containerRef);

  const threadHistorySidebar = (
    <ThreadHistory contextKey={contextKey} position={historyPosition}>
      <ThreadHistoryHeader />
      <ThreadHistoryNewButton />
      <ThreadHistorySearch />
      <ThreadHistoryList />
    </ThreadHistory>
  );

  const populationSuggestions: Suggestion[] = [
    {
      id: "suggestion-1",
      title: "Who is the new Pope?",
      detailedSuggestion: "Who is the new Pope?",
      messageId: "current-events-query",
    },
    {
      id: "suggestion-2",
      title: "Iran-India conflict?",
      detailedSuggestion: "What is the status of the Iran-India conflict?",
      messageId: "current-events-query",
    },
    {
      id: "suggestion-3",
      title: "Latest on tariffs?",
      detailedSuggestion: "Whats the latest news on tariffs?",
      messageId: "economic-query",
    },
  ];

  return (
    <>
      {/* Thread History Sidebar - rendered first if history is on the left */}
      {historyPosition === "left" && threadHistorySidebar}

      <ThreadContainer ref={mergedRef} className={className} {...props}>
        <ScrollableMessageContainer className="p-4 pt-12">
          <ThreadContent variant={variant}>
            <ThreadContentMessages />
          </ThreadContent>
        </ScrollableMessageContainer>

        {/* Message suggestions status */}
        <MessageSuggestions>
          <MessageSuggestionsStatus />
        </MessageSuggestions>

        {/* Enhanced Message input with x402 support */}
        <div className="p-4">
          <EnhancedMessageInput contextKey={contextKey} />
        </div>

        {/* Message suggestions */}
        <MessageSuggestions initialSuggestions={populationSuggestions}>
          <MessageSuggestionsList />
        </MessageSuggestions>
      </ThreadContainer>

      {/* Thread History Sidebar - rendered last if history is on the right */}
      {historyPosition === "right" && threadHistorySidebar}
    </>
  );
});
MessageThreadFull.displayName = "MessageThreadFull";
