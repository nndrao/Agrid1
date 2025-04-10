import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          {/* Brand & Copyright */}
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}