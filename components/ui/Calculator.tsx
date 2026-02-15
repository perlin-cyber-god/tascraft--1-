import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Delete, Equal } from 'lucide-react';

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [isResult, setIsResult] = useState(false);

  const handlePress = (val: string) => {
    if (isResult) {
      if (['+', '-', '*', '/'].includes(val)) {
        setExpression(display + val);
        setIsResult(false);
      } else {
        setDisplay(val);
        setExpression(val);
        setIsResult(false);
      }
      return;
    }

    if (display === '0' && !['+', '-', '*', '/'].includes(val)) {
      setDisplay(val);
      setExpression(val);
    } else {
      setDisplay(display + val);
      setExpression(expression + val);
    }
  };

  const safeCalculate = (input: string) => {
    try {
      // 1. Tokenize: Match numbers (including decimals) or operators
      const tokens = input.match(/(\d+(\.\d+)?)|[+\-*/]/g);
      if (!tokens) return 'Err';

      // 2. Handle Unary operations (e.g. 5 * - 3 -> 5 * -3)
      const mergedTokens: string[] = [];
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        
        // Check if this token is a unary minus
        // Occurs if t is '-' and (it's the first token OR previous token was an operator)
        if (t === '-' && (mergedTokens.length === 0 || ['+', '-', '*', '/'].includes(mergedTokens[mergedTokens.length - 1]))) {
            const nextNum = tokens[i + 1];
            if (nextNum && !['+', '-', '*', '/'].includes(nextNum)) {
                mergedTokens.push('-' + nextNum);
                i++; // Skip next since we consumed it
            } else {
                throw new Error('Syntax');
            }
        } else {
            mergedTokens.push(t);
        }
      }

      // 3. Pass 1: Multiplication and Division
      let pass1: string[] = [];
      for (let i = 0; i < mergedTokens.length; i++) {
          const t = mergedTokens[i];
          if (t === '*' || t === '/') {
              const prev = pass1.pop();
              const next = mergedTokens[i+1];
              if (!prev || !next) throw new Error('Syntax');
              
              const a = parseFloat(prev);
              const b = parseFloat(next);
              
              let res = 0;
              if (t === '*') res = a * b;
              if (t === '/') res = b === 0 ? Infinity : a / b;
              
              pass1.push(res.toString());
              i++; // skip next
          } else {
              pass1.push(t);
          }
      }

      if (pass1.length === 0) return '0';

      // 4. Pass 2: Addition and Subtraction
      let result = parseFloat(pass1[0]);
      for (let i = 1; i < pass1.length; i += 2) {
          const op = pass1[i];
          const next = parseFloat(pass1[i+1]);
          if (isNaN(next)) throw new Error('Syntax');
          
          if (op === '+') result += next;
          else if (op === '-') result -= next;
      }
      
      return isFinite(result) ? String(result) : 'Err';
    } catch (e) {
      return 'Err';
    }
  };

  const calculate = () => {
    const res = safeCalculate(expression.replace(/x/g, '*'));
    setDisplay(res);
    setExpression(res);
    setIsResult(true);
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
    setIsResult(false);
  };

  const btnClass = "h-8 sm:h-10 text-lg sm:text-xl font-bold border-b-4 border-r-2 border-t-2 border-l-2 active:translate-y-1 active:border-b-2 transition-all flex items-center justify-center";
  const numBtn = "bg-mc-stone border-b-mc-stoneDark border-r-mc-stoneDark border-t-mc-stoneLight border-l-mc-stoneLight text-white hover:bg-[#555]";
  const opBtn = "bg-[#4a3219] border-b-[#2d1b0d] border-r-[#2d1b0d] border-t-[#6b4522] border-l-[#6b4522] text-[#e0e0e0] hover:bg-[#5c3e20]";
  const actionBtn = "bg-mc-red border-b-[#550000] border-r-[#550000] border-t-[#ff5555] border-l-[#ff5555] text-white hover:bg-[#cc0000]";
  const equalBtn = "bg-mc-green border-b-[#2d4415] border-r-[#2d4415] border-t-[#83d656] border-l-[#83d656] text-white hover:bg-[#4a6b28]";

  return (
    <div className="bg-[#222] p-2 sm:p-3 border-4 border-[#111] shadow-pixel w-full max-w-[300px] font-pixel">
      {/* Display Screen */}
      <div className="bg-[#8b8b8b] border-4 border-[#555] shadow-inner mb-3 p-2 text-right">
        <div className="h-6 sm:h-8 text-black text-xl sm:text-2xl font-mono overflow-hidden whitespace-nowrap">
          {display}
        </div>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        <button onClick={clear} className={`${btnClass} ${actionBtn} col-span-1`}>C</button>
        <button onClick={() => handlePress('/')} className={`${btnClass} ${opBtn}`}>/</button>
        <button onClick={() => handlePress('*')} className={`${btnClass} ${opBtn}`}>*</button>
        <button onClick={() => {
            const newExp = expression.slice(0, -1);
            setExpression(newExp || '');
            setDisplay(newExp || '0');
        }} className={`${btnClass} ${opBtn}`}><Delete className="w-4 h-4" /></button>

        {['7', '8', '9'].map(n => (
          <button key={n} onClick={() => handlePress(n)} className={`${btnClass} ${numBtn}`}>{n}</button>
        ))}
        <button onClick={() => handlePress('-')} className={`${btnClass} ${opBtn}`}>-</button>

        {['4', '5', '6'].map(n => (
          <button key={n} onClick={() => handlePress(n)} className={`${btnClass} ${numBtn}`}>{n}</button>
        ))}
        <button onClick={() => handlePress('+')} className={`${btnClass} ${opBtn}`}>+</button>

        {['1', '2', '3'].map(n => (
          <button key={n} onClick={() => handlePress(n)} className={`${btnClass} ${numBtn}`}>{n}</button>
        ))}
        <button onClick={calculate} className={`${btnClass} ${equalBtn} row-span-2`}><Equal className="w-5 h-5" /></button>

        <button onClick={() => handlePress('0')} className={`${btnClass} ${numBtn} col-span-2`}>0</button>
        <button onClick={() => handlePress('.')} className={`${btnClass} ${numBtn}`}>.</button>
      </div>
    </div>
  );
};
