import { FunctionDefinition } from './types';
import { getFunctionByName } from './functions';

export type TokenType = 
  | 'identifier'
  | 'number'
  | 'string'
  | 'operator'
  | 'function'
  | 'column'
  | 'parenthesis'
  | 'comma';

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

export interface ParseNode {
  type: 'operation' | 'function' | 'column' | 'literal';
  value: string;
  children?: ParseNode[];
  operator?: string;
}

export class ExpressionParser {
  private tokens: Token[] = [];
  private currentTokenIndex = 0;

  constructor(private expression: string) {
    this.tokenize();
  }

  private tokenize(): void {
    let currentPosition = 0;
    const regex = /(\s+)|([a-zA-Z_][a-zA-Z0-9_]*)|(\d+(?:\.\d+)?)|(['"][^'"]*['"])|([+\-*/=<>!&|]+)|([(),])|(\[[^\]]+\])/g;
    let match;

    while ((match = regex.exec(this.expression)) !== null) {
      if (match[1]) continue; // Skip whitespace

      let type: TokenType = 'identifier';
      let value = match[0];

      if (match[2]) {
        type = 'identifier';
        if (getFunctionByName(value)) {
          type = 'function';
        }
      } else if (match[3]) {
        type = 'number';
      } else if (match[4]) {
        type = 'string';
        value = value.slice(1, -1); // Remove quotes
      } else if (match[5]) {
        type = 'operator';
      } else if (match[6]) {
        type = 'parenthesis';
      } else if (match[7]) {
        type = 'column';
        value = value.slice(1, -1); // Remove brackets
      }

      this.tokens.push({
        type,
        value,
        position: currentPosition
      });

      currentPosition = match.index + match[0].length;
    }
  }

  private currentToken(): Token | null {
    return this.tokens[this.currentTokenIndex] || null;
  }

  private nextToken(): Token | null {
    this.currentTokenIndex++;
    return this.currentToken();
  }

  private expect(type: TokenType, value?: string): Token {
    const token = this.currentToken();
    if (!token || token.type !== type || (value && token.value !== value)) {
      throw new Error(`Expected ${value || type} at position ${token?.position}`);
    }
    this.nextToken();
    return token;
  }

  public parse(): ParseNode {
    return this.parseExpression();
  }

  private parseExpression(): ParseNode {
    return this.parseLogicalOr();
  }

  private parseLogicalOr(): ParseNode {
    let left = this.parseLogicalAnd();
    
    while (this.currentToken()?.value === '||') {
      const operator = this.currentToken().value;
      this.nextToken();
      const right = this.parseLogicalAnd();
      left = { type: 'operation', operator, children: [left, right] };
    }
    
    return left;
  }

  private parseLogicalAnd(): ParseNode {
    let left = this.parseComparison();
    
    while (this.currentToken()?.value === '&&') {
      const operator = this.currentToken().value;
      this.nextToken();
      const right = this.parseComparison();
      left = { type: 'operation', operator, children: [left, right] };
    }
    
    return left;
  }

  private parseComparison(): ParseNode {
    let left = this.parseAddSub();
    
    const comparisonOperators = ['==', '!=', '>', '<', '>=', '<=', 'IN'];
    while (comparisonOperators.includes(this.currentToken()?.value || '')) {
      const operator = this.currentToken().value;
      this.nextToken();
      const right = this.parseAddSub();
      left = { type: 'operation', operator, children: [left, right] };
    }
    
    return left;
  }

  private parseAddSub(): ParseNode {
    let left = this.parseMulDiv();
    
    while (this.currentToken()?.value === '+' || this.currentToken()?.value === '-') {
      const operator = this.currentToken().value;
      this.nextToken();
      const right = this.parseMulDiv();
      left = { type: 'operation', operator, children: [left, right] };
    }
    
    return left;
  }

  private parseMulDiv(): ParseNode {
    let left = this.parsePrimary();
    
    while (this.currentToken()?.value === '*' || this.currentToken()?.value === '/') {
      const operator = this.currentToken().value;
      this.nextToken();
      const right = this.parsePrimary();
      left = { type: 'operation', operator, children: [left, right] };
    }
    
    return left;
  }

  private parsePrimary(): ParseNode {
    const token = this.currentToken();
    if (!token) throw new Error('Unexpected end of expression');

    switch (token.type) {
      case 'number':
        this.nextToken();
        return { type: 'literal', value: token.value };
      
      case 'string':
        this.nextToken();
        return { type: 'literal', value: token.value };
      
      case 'column':
        this.nextToken();
        return { type: 'column', value: token.value };
      
      case 'function':
        return this.parseFunction();
      
      case 'parenthesis':
        if (token.value === '(') {
          this.nextToken();
          const expr = this.parseExpression();
          this.expect('parenthesis', ')');
          return expr;
        }
        break;
    }

    throw new Error(`Unexpected token ${token.value} at position ${token.position}`);
  }

  private parseFunction(): ParseNode {
    const funcName = this.currentToken().value;
    this.nextToken();
    this.expect('parenthesis', '(');

    const args: ParseNode[] = [];
    if (this.currentToken()?.value !== ')') {
      args.push(this.parseExpression());
      while (this.currentToken()?.value === ',') {
        this.nextToken();
        args.push(this.parseExpression());
      }
    }

    this.expect('parenthesis', ')');
    return { type: 'function', value: funcName, children: args };
  }
} 