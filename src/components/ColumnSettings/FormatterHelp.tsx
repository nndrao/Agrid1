import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const FormatterHelpContent: React.FC = () => {
  return (
    <div className="max-h-[400px] overflow-y-auto pr-1 text-sm">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-2">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-3 mt-2">
          <div>
            <h5 className="font-medium mb-1">Number Formats</h5>
            <ul className="ml-4 text-xs space-y-1">
              <li><code className="bg-muted px-1 rounded">0</code> - Digit placeholder (displays 0 if no digit)</li>
              <li><code className="bg-muted px-1 rounded">#</code> - Digit placeholder (shows nothing if no digit)</li>
              <li><code className="bg-muted px-1 rounded">.</code> - Decimal point</li>
              <li><code className="bg-muted px-1 rounded">,</code> - Thousands separator</li>
              <li><code className="bg-muted px-1 rounded">%</code> - Percentage format (multiplies by 100)</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">Date Formats</h5>
            <ul className="ml-4 text-xs space-y-1">
              <li><code className="bg-muted px-1 rounded">yyyy</code> - 4-digit year (2025)</li>
              <li><code className="bg-muted px-1 rounded">yy</code> - 2-digit year (25)</li>
              <li><code className="bg-muted px-1 rounded">mm</code> - Month (01-12)</li>
              <li><code className="bg-muted px-1 rounded">dd</code> - Day (01-31)</li>
              <li><code className="bg-muted px-1 rounded">hh</code> - Hour (00-23)</li>
              <li><code className="bg-muted px-1 rounded">mm</code> - Minutes (00-59)</li>
              <li><code className="bg-muted px-1 rounded">ss</code> - Seconds (00-59)</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">Basic Examples</h5>
            <ul className="ml-4 text-xs space-y-1">
              <li><code className="bg-muted px-1 rounded">#,##0.00</code> - Number with 2 decimal places</li>
              <li><code className="bg-muted px-1 rounded">$#,##0.00</code> - Currency format</li>
              <li><code className="bg-muted px-1 rounded">0.00%</code> - Percentage with 2 decimal places</li>
              <li><code className="bg-muted px-1 rounded">dd/mm/yyyy</code> - Date as 31/12/2025</li>
              <li><code className="bg-muted px-1 rounded">yyyy-mm-dd</code> - ISO date (2025-12-31)</li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-3 mt-2">
          <div>
            <h5 className="font-medium mb-1">Section Formatting</h5>
            <ul className="ml-4 text-xs space-y-1">
              <li><code className="bg-muted px-1 rounded">#,##0.00;(#,##0.00);0;@</code></li>
              <li>Sections separated by semicolons for different value types:
                <ul className="ml-4 mt-1">
                  <li>First: positive values</li>
                  <li>Second: negative values</li>
                  <li>Third: zero values</li>
                  <li>Fourth: text values</li>
                </ul>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">Conditional Formatting</h5>
            <ul className="ml-4 text-xs space-y-1">
              <li><code className="bg-muted px-1 rounded">[&gt;100]"Large":"Small"</code></li>
              <li>Format: <code>[condition]true_format:false_format</code></li>
              <li>Operators: &gt;, &gt;=, &lt;, &lt;=, =, &lt;&gt; (not equal)</li>
              <li>Can nest other formats in each part</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">Switch/Case Formatting</h5>
            <ul className="ml-4 text-xs space-y-1">
              <li><code className="bg-muted px-1 rounded">[1]"One";[2]"Two";"Other"</code></li>
              <li>Format: <code>[value1]format1;[value2]format2;default</code></li>
              <li>The last section is the default (fallback)</li>
              <li>Each case can contain any valid format</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">Color Formatting</h5>
            <ul className="ml-4 text-xs space-y-1">
              <li><code className="bg-muted px-1 rounded">[Red]0.00</code> - Red text</li>
              <li><code className="bg-muted px-1 rounded">[#FF5500]0.00</code> - Custom hex color</li>
              <li><code className="bg-muted px-1 rounded">[#39C]0.00</code> - 3-digit hex (#3399CC)</li>
              <li>Named colors: Red, Green, Blue, Yellow, Cyan, Magenta, etc.</li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="examples" className="space-y-3 mt-2">
          <div>
            <h5 className="font-medium mb-1">Color & Conditionals</h5>
            <ul className="ml-4 text-xs space-y-1">
              <li><code className="bg-muted px-1 rounded text-wrap">[&gt;0][Green]"▲"$#,##0.00;[&lt;0][Red]"▼"$#,##0.00;$0.00</code></li>
              <li className="ml-4">Green up arrow for positive, red down arrow for negative</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">Status Indicators</h5>
            <ul className="ml-4 text-xs space-y-1">
              <li><code className="bg-muted px-1 rounded">[=1][Green]"✓";[=0][Red]"✗";"N/A"</code></li>
              <li className="ml-4">Green checkmark for 1, red X for 0, N/A for others</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">Score Ranges</h5>
            <ul className="ml-4 text-xs space-y-1">
              <li><code className="bg-muted px-1 rounded text-wrap">[&gt;=90][#00BB00]0"%";[&gt;=70][#0070C0]0"%";[Red]0"%"</code></li>
              <li className="ml-4">Custom colors based on score ranges:
                <ul className="ml-2 mt-1">
                  <li>≥90% in green</li>
                  <li>≥70% in blue</li>
                  <li>Others in red</li>
                </ul>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">Text with Values</h5>
            <ul className="ml-4 text-xs space-y-1">
              <li><code className="bg-muted px-1 rounded">{"{value} units"}</code> - Add text with value</li>
              <li><code className="bg-muted px-1 rounded">"$"#,##0.00" USD"</code> - Currency with suffix</li>
              <li><code className="bg-muted px-1 rounded">[&gt;1000]"High: "$#,##0.00;$#,##0.00</code> - Conditional prefix</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const FormatterHelp: React.FC = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <QuestionMarkCircledIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="p-4 w-[350px] max-w-[96vw]">
        <h4 className="font-medium mb-2">Excel-Like Format Codes</h4>
        <FormatterHelpContent />
      </PopoverContent>
    </Popover>
  );
};

export default FormatterHelp;
