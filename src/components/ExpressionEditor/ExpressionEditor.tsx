import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FunctionSquare, Table2 } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const operators = [
  '+', '-', '*', '/', '%', '=', '!=', '>', '>=', '<', '<=', 'AND', 'OR', 'NOT', 'IN',
];

const functionGroups = [
  { group: 'aggregation', items: ['SUM', 'AVERAGE', 'COUNT', 'MIN', 'MAX'] },
];

const columns = [
  'PositionId', 'Cusip', 'Isin', 'Issuer', 'Currency', 'Sector', // Add more as needed
];

const functionHelp = {
  COUNT: {
    signature: 'COUNT(column)',
    description: 'Counts the number of non-empty values',
    example: 'COUNT(product.id) // Returns total number of products',
    type: 'number',
  },
  // Add other function help as needed
};

export interface ExpressionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExpressionEditor: React.FC<ExpressionEditorProps> = ({ open, onOpenChange }) => {
  const [expression, setExpression] = useState('COUNT(column)');
  const [expressionName, setExpressionName] = useState('');
  const [type, setType] = useState('Boolean');
  const [selectedFunction, setSelectedFunction] = useState('COUNT');
  const [functionGroup, setFunctionGroup] = useState('aggregation');
  const [functionSearch, setFunctionSearch] = useState('');
  const [columnSearch, setColumnSearch] = useState('');

  const filteredFunctions = functionGroups
    .find(g => g.group === functionGroup)?.items.filter(fn => fn.toLowerCase().includes(functionSearch.toLowerCase())) || [];
  const filteredColumns = columns.filter(col => col.toLowerCase().includes(columnSearch.toLowerCase()));

  const handleInsert = (val: string) => {
    setExpression(expr => expr + val);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] p-0 bg-background rounded-xl shadow-lg border border-border/80">
        <DialogHeader className="px-8 pt-8 pb-2 border-b">
          <DialogTitle className="text-[20px] font-semibold text-foreground">Expression Editor</DialogTitle>
          <div className="text-[13px] text-muted-foreground mt-1">Create and edit expressions for data manipulation</div>
        </DialogHeader>
        <div className="px-8 pb-0 pt-2 flex flex-col gap-3">
          {/* Type & Name */}
          <div className="flex gap-2 items-center">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-8 text-[13px] bg-card min-w-[100px] w-fit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Boolean">Boolean</SelectItem>
                <SelectItem value="Number">Number</SelectItem>
                <SelectItem value="String">String</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Expression name"
              value={expressionName}
              onChange={e => setExpressionName(e.target.value)}
              className="text-[13px] h-8 bg-card border border-border/80 rounded text-foreground placeholder:text-muted-foreground flex-1 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {/* Operators Row */}
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="font-medium text-[13px] text-muted-foreground mr-2">Operators</span>
            {operators.map(op => (
              <Button
                key={op}
                variant="outline"
                size="sm"
                className="px-2 py-1 text-[13px] font-mono"
                type="button"
                onClick={() => handleInsert(op)}
              >
                {op}
              </Button>
            ))}
          </div>
          {/* Main 3-column layout */}
          <div className="grid grid-cols-[180px_1fr_180px] gap-4 min-h-[350px]">
            {/* Functions Card */}
            <Card className="bg-card border border-border/80 shadow-none rounded-lg flex flex-col">
              <CardHeader className="px-4 pt-4 pb-2 flex flex-col gap-2 border-b">
                <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                  <FunctionSquare size={16} className="text-muted-foreground" /> Functions
                </div>
                <Select value={functionGroup} onValueChange={setFunctionGroup}>
                  <SelectTrigger className="h-8 text-[13px] bg-card min-w-[100px] mb-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {functionGroups.map(g => (
                      <SelectItem key={g.group} value={g.group}>{g.group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search functions..."
                  value={functionSearch}
                  onChange={e => setFunctionSearch(e.target.value)}
                  className="h-8 text-[13px] bg-card border border-border/80 rounded placeholder:text-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </CardHeader>
              <CardContent className="flex-1 max-h-[340px] min-h-[220px] overflow-y-auto p-0">
                <div className="flex-1 overflow-y-auto">
                  {filteredFunctions.map(fn => {
                    const isSelected = selectedFunction === fn;
                    return (
                      <Button
                        key={fn}
                        variant={isSelected ? "secondary" : "ghost"}
                        size="sm"
                        className={`w-full justify-start gap-2 px-4 py-2 text-[13px] font-normal ${isSelected ? 'font-semibold' : ''}`}
                        type="button"
                        onClick={() => setSelectedFunction(fn)}
                      >
                        <FunctionSquare size={15} className="text-muted-foreground" />
                        {fn}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            {/* Expression Card (with Function Helper inside) */}
            <Card className="bg-card border border-border/80 shadow-none rounded-lg flex flex-col min-h-[340px]">
              <CardHeader className="pb-2 px-4 pt-4 border-b">
                <div className="text-[13px] font-medium text-muted-foreground">Expression</div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col px-4 pb-4 pt-0 min-h-0">
                <div className="flex-1 flex flex-col min-h-0">
                  <Textarea
                    className="w-full"
                    placeholder="Enter expression..."
                    value={expression}
                    onChange={e => setExpression(e.target.value)}
                    rows={6}
                  />
                </div>
                {/* Function Helper occupies bottom 1/3 */}
                <div className="mt-4 flex flex-col border-t border-border/80 pt-3 flex-shrink-0 min-h-[90px]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[13px] font-semibold text-foreground">
                      {functionHelp[selectedFunction as keyof typeof functionHelp]?.signature || functionHelp.COUNT.signature}
                    </span>
                    <span className="text-[12px] px-2 py-0.5 rounded bg-card border border-border/80 text-muted-foreground ml-2">
                      {functionHelp[selectedFunction as keyof typeof functionHelp]?.type || functionHelp.COUNT.type}
                    </span>
                  </div>
                  <div className="pt-2">
                    <div className="text-[13px] text-foreground mb-1">{functionHelp[selectedFunction as keyof typeof functionHelp]?.description || functionHelp.COUNT.description}</div>
                    <div className="text-[12px] mt-2 text-muted-foreground"><b>Example:</b> <span className="font-mono">{functionHelp[selectedFunction as keyof typeof functionHelp]?.example || functionHelp.COUNT.example}</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Columns Card */}
            <Card className="bg-card border border-border/80 shadow-none rounded-lg flex flex-col">
              <CardHeader className="px-4 pt-4 pb-2 flex flex-col gap-2 border-b">
                <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                  <Table2 size={16} className="text-muted-foreground" /> Columns
                </div>
                <Input
                  placeholder="Search columns..."
                  value={columnSearch}
                  onChange={e => setColumnSearch(e.target.value)}
                  className="h-8 text-[13px] bg-card border border-border/80 rounded placeholder:text-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </CardHeader>
              <CardContent className="flex-1 max-h-[340px] min-h-[220px] overflow-y-auto p-0">
                <div className="flex-1 overflow-y-auto">
                  {filteredColumns.map(col => {
                    const isSelected = expression.includes(col);
                    return (
                      <Button
                        key={col}
                        variant={isSelected ? "secondary" : "ghost"}
                        size="sm"
                        className={`w-full justify-start gap-2 px-4 py-2 text-[13px] font-normal ${isSelected ? 'font-semibold' : ''}`}
                        type="button"
                        onClick={() => handleInsert(col)}
                      >
                        <Table2 size={15} className="text-muted-foreground" />
                        {col}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Footer Buttons */}
          <div className="flex justify-between border-t border-border/80" style={{ minHeight: '48px', display: 'flex', alignItems: 'center', padding: '10px 16px' }}>
            <Button variant="outline" className="h-8 px-5 text-[13px] border border-border/80 bg-card text-foreground hover:bg-accent hover:text-foreground" onClick={() => onOpenChange(false)}>Cancel</Button>
            <div className="flex gap-2">
              <Button variant="outline" className="h-8 px-5 text-[13px] border border-border/80 bg-card text-foreground hover:bg-accent hover:text-foreground">Test</Button>
              <Button className="h-8 px-5 text-[13px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">Save</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpressionEditor;
