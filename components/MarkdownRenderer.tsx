
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Enhanced citation helper
  const renderCitations = (text: string) => {
    const citationRegex = /\[([^\]]*(Page|p\.)\s\d+[^\]]*)\]/gi;
    const parts = text.split(citationRegex);
    const matches = text.match(citationRegex);

    return (
      <>
        {parts.map((part, i) => {
          if (part === 'Page' || part === 'p.') return null; 
          
          return (
            <React.Fragment key={i}>
              {part}
              {matches && matches[i] && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold mx-1 align-baseline hover:bg-indigo-500/20 transition-colors cursor-help">
                  {matches[i].replace(/[\[\]]/g, '')}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </>
    );
  };

  const renderContent = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      // Handle Table blocks
      if (line.startsWith('|')) {
        const tableRows: string[][] = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          const row = lines[i]
            .split('|')
            .filter((cell) => cell.trim() !== '')
            .map((cell) => cell.trim());
          
          if (!row.every(cell => cell.match(/^-+$/))) {
            tableRows.push(row);
          }
          i++;
        }

        if (tableRows.length > 0) {
          elements.push(
            <div key={`table-${i}`} className="my-8 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-800/80">
                      {tableRows[0].map((header, idx) => (
                        <th key={idx} className="p-4 text-[11px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {tableRows.slice(1).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-zinc-800/10 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-4 text-sm text-zinc-300 leading-relaxed font-medium">
                            {renderCitations(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }
        continue;
      }

      // Handle Headers
      if (line.startsWith('#')) {
        const level = (line.match(/^#+/) || ['#'])[0].length;
        const text = line.replace(/^#+\s*/, '');
        const Tag = `h${Math.min(level + 1, 6)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        const className = level === 1 
          ? "text-2xl font-black text-white mt-12 mb-6 tracking-tight border-b border-zinc-800 pb-4" 
          : level === 2
          ? "text-xl font-bold text-indigo-400 mt-8 mb-4 tracking-tight"
          : "text-lg font-bold text-zinc-200 mt-6 mb-3 tracking-tight";
        
        elements.push(<Tag key={i} className={className}>{text}</Tag>);
      } 
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={i} className="ml-6 list-disc text-zinc-300 mb-2 pl-2 marker:text-indigo-500 leading-relaxed">
            {renderCitations(line.substring(2))}
          </li>
        );
      }
      else if (line) {
        const boldParts = line.split(/(\*\*.*?\*\*)/g);
        elements.push(
          <p key={i} className="mb-4 text-zinc-300 leading-relaxed text-base font-normal">
            {boldParts.map((part, idx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx} className="text-white font-bold">{renderCitations(part.slice(2, -2))}</strong>;
              }
              return renderCitations(part);
            })}
          </p>
        );
      }

      i++;
    }

    return elements;
  };

  return (
    <div className="prose prose-invert max-w-none w-full animate-in fade-in duration-1000">
      {renderContent()}
    </div>
  );
};
