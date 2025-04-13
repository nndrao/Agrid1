import * as React from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  language?: string;
  value: string;
}

export const CodeBlock = React.forwardRef<HTMLPreElement, CodeBlockProps>(
  ({ className, language, value, ...props }, ref) => {
    return (
      <pre
        ref={ref}
        className={cn(
          "rounded-md bg-muted px-4 py-3 font-mono text-sm text-foreground",
          "overflow-auto max-w-full",
          className
        )}
        {...props}
      >
        <code className={language ? `language-${language}` : undefined}>
          {value}
        </code>
      </pre>
    );
  }
);

CodeBlock.displayName = "CodeBlock";