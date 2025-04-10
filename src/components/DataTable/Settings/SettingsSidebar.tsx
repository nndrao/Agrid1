import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface SettingsSidebarProps {
  sections: Array<{
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    description: string;
  }>;
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function SettingsSidebar({
  sections,
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  return (
    <div className="w-[240px] border-r bg-card flex flex-col">
      <div className="py-2 px-4 border-b">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10">
            <Settings2 className="h-3.5 w-3.5 text-primary" />
          </div>
          <h2 className="font-semibold text-[14px]">Settings</h2>
        </div>
      </div>
      <div className="flex-1 p-1.5">
        {sections.map((section, index) => (
          <div key={section.id}>
            <button
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "group flex items-start gap-2 w-full rounded-lg px-2 py-1.5 text-left transition-all duration-150",
                "hover:bg-accent/50",
                activeSection === section.id 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-md transition-colors duration-150",
                activeSection === section.id 
                  ? "bg-primary/20" 
                  : "bg-muted group-hover:bg-accent/70"
              )}>
                <section.icon className={cn(
                  "h-3.5 w-3.5 transition-colors duration-150",
                  activeSection === section.id 
                    ? "text-primary" 
                    : "text-muted-foreground/70 group-hover:text-foreground"
                )} />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="text-[14px] font-medium truncate">
                  {section.label}
                </div>
                <div className={cn(
                  "text-[11px] leading-tight opacity-90 line-clamp-1",
                  activeSection === section.id 
                    ? "text-accent-foreground/80" 
                    : "text-muted-foreground group-hover:text-foreground/80"
                )}>
                  {section.description}
                </div>
              </div>
            </button>
            {index < sections.length - 1 && (
              <Separator className="my-1.5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}