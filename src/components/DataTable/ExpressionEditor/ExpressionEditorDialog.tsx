import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Play, Save, X, Code, List } from 'lucide-react';
import { ExpressionEditorProps, ExpressionType } from './types';
import { ExpressionEditor } from './ExpressionEditor';
import { getFunctionsByCategory, functionCategories } from './functions';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const operators = [
  { label: '+', value: '+' },
  { label: '-', value: '-' },
  { label: '*', value: '*' },
  { label: '/', value: '/' },
  { label: '%', value: '%' },
  { label: '=', value: '=' },
  { label: '!=', value: '!=' },
  { label: '>', value: '>' },
  { label: '<', value: '<' },
  { label: '>=', value: '>=' },
  { label: '<=', value: '<=' },
  { label: 'AND', value: 'AND' },
  { label: 'OR', value: 'OR' },
  { label: 'NOT', value: 'NOT' },
];

export function ExpressionEditorDialog({
  open,
  onClose,
  onSave,
  columnDefs,
  initialExpression
}: ExpressionEditorProps) {
  const [expression, setExpression] = useState<ExpressionType>(initialExpression?.type || 'boolean');
  const [name, setName] = useState(initialExpression?.name || '');
  const [code, setCode] = useState(initialExpression?.expression || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(functionCategories[0]);
  const [functionSearch, setFunctionSearch] = useState('');
  const [columnSearch, setColumnSearch] = useState('');
  const [selectedFunction, setSelectedFunction] = useState<FunctionDefinition | null>(null);
  const [hoveredFunction, setHoveredFunction] = useState<FunctionDefinition | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: initialExpression?.id || crypto.randomUUID(),
      name,
      type: expression,
      expression: code,
      description: '',
      category: 'custom',
      createdAt: initialExpression?.createdAt || new Date(),
      updatedAt: new Date()
    });
    onClose();
  };

  const handleOperatorClick = (operator: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const spaced = ` ${operator} `;
    const newValue = code.substring(0, start) + spaced + code.substring(end);
    
    setCode(newValue);
    
    setTimeout(() => {
      if (editor) {
        editor.focus();
        editor.selectionStart = editor.selectionEnd = start + spaced.length;
      }
    }, 0);
  };

  const handleColumnClick = (col: any) => {
    const editor = editorRef.current;
    if (!editor) return;
    
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const columnRef = `product.${col.field}`;
    const newValue = code.substring(0, start) + columnRef + code.substring(end);
    
    setCode(newValue);
    
    setTimeout(() => {
      if (editor) {
        editor.focus();
        editor.selectionStart = editor.selectionEnd = start + columnRef.length;
      }
    }, 0);
  };

  const handleFunctionClick = (fn: FunctionDefinition) => {
    setSelectedFunction(fn);
    
    const editor = editorRef.current;
    if (!editor) return;
    
    const params = fn.parameters.map(p => p.name).join(', ');
    const functionCall = `${fn.name}(${params})`;
    
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const newValue = code.substring(0, start) + functionCall + code.substring(end);
    
    setCode(newValue);
    
    setTimeout(() => {
      if (editor) {
        editor.focus();
        const cursorPos = start + fn.name.length + 1;
        editor.selectionStart = editor.selectionEnd = cursorPos;
      }
    }, 0);
  };

  const filteredFunctions = getFunctionsByCategory(selectedCategory).filter(
    fn => fn.name.toLowerCase().includes(functionSearch.toLowerCase())
  );

  const filteredColumns = columnDefs.filter(
    col => (col.headerName || col.field).toLowerCase().includes(columnSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[66vw] h-[54vh] flex flex-col overflow-hidden p-0 gap-0 bg-background border-none shadow-lg">
        <div className="p-6 pb-3">
          <DialogTitle>Expression Editor</DialogTitle>
          <DialogDescription>Create and edit expressions for data manipulation</DialogDescription>
        </div>
        
        <div className="flex items-center gap-2 px-6 pb-4">
          <Select value={expression} onValueChange={(val) => setExpression(val as ExpressionType)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="value">Value</SelectItem>
              <SelectItem value="formatting">Formatting</SelectItem>
              <SelectItem value="aggregatedBoolean">Aggregated</SelectItem>
              <SelectItem value="observable">Observable</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Expression name"
            className="flex-1"
          />
        </div>

        {/* Operator Toolbar */}
        <div className="px-6 pb-4">
          <h4 className="text-sm font-medium mb-2">Operators</h4>
          <div className="flex flex-wrap gap-1">
            {operators.map(op => (
              <Button
                key={op.value}
                variant="outline"
                size="sm"
                onClick={() => handleOperatorClick(op.value)}
              >
                {op.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-4 px-6 pb-4 flex-1 min-h-0">
          {/* Left Panel - Functions */}
          <div className="col-span-3 border rounded-md overflow-hidden flex flex-col">
            <div className="p-2 border-b bg-muted flex items-center">
              <Code className="h-4 w-4 mr-2" />
              <h3 className="text-sm font-medium">Functions</h3>
            </div>
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search functions..."
                  value={functionSearch}
                  onChange={(e) => setFunctionSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="p-2 border-b">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {functionCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-1">
                {filteredFunctions.map(fn => (
                  <Button
                    key={fn.name}
                    variant="ghost"
                    className="w-full justify-start font-mono text-sm h-8"
                    onClick={() => handleFunctionClick(fn)}
                    onMouseEnter={() => setHoveredFunction(fn)}
                    onMouseLeave={() => setHoveredFunction(null)}
                  >
                    {fn.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Middle Panel - Expression Editor and Help */}
          <div className="col-span-6 flex flex-col gap-4">
            {/* Expression Editor */}
            <div className="border rounded-md overflow-hidden flex flex-col flex-1">
              <div className="p-2 border-b bg-muted">
                <h3 className="text-sm font-medium">Expression</h3>
              </div>
              <div className="flex-1 overflow-hidden">
                <ExpressionEditor
                  value={code}
                  onChange={setCode}
                  columnDefs={columnDefs}
                  ref={editorRef}
                />
              </div>
            </div>

            {/* Helper Prompt */}
            {(hoveredFunction || selectedFunction) && (
              <div className="border rounded-md overflow-hidden">
                <div className="p-2 border-b bg-muted flex items-center justify-between">
                  <h3 className="text-sm font-medium">Function Help</h3>
                  {(hoveredFunction || selectedFunction) && (
                    <Badge variant="secondary">{(hoveredFunction || selectedFunction).returnType}</Badge>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <pre className="bg-muted rounded-md p-2 text-xs font-mono overflow-auto">
                    {(hoveredFunction || selectedFunction).syntax}
                  </pre>
                  <p className="text-sm text-muted-foreground">
                    {(hoveredFunction || selectedFunction).description}
                  </p>
                  {(hoveredFunction || selectedFunction).example && (
                    <>
                      <h4 className="text-xs font-medium mt-2">Example:</h4>
                      <pre className="bg-muted rounded-md p-2 text-xs font-mono overflow-auto">
                        {(hoveredFunction || selectedFunction).example}
                      </pre>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Columns */}
          <div className="col-span-3 border rounded-md overflow-hidden flex flex-col">
            <div className="p-2 border-b bg-muted flex items-center">
              <List className="h-4 w-4 mr-2" />
              <h3 className="text-sm font-medium">Columns</h3>
            </div>
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search columns..."
                  value={columnSearch}
                  onChange={(e) => setColumnSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-1">
                {filteredColumns.map(col => (
                  <Button
                    key={col.field}
                    variant="ghost"
                    className="w-full justify-start font-mono text-sm h-8"
                    onClick={() => handleColumnClick(col)}
                  >
                    {col.headerName || col.field}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer - Now fixed at the bottom */}
        <div className="p-4 border-t mt-auto bg-background flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <Play className="mr-2 h-4 w-4" />
              Test
            </Button>
            <Button variant="default" size="sm" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 