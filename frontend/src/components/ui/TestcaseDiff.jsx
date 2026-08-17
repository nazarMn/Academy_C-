import { useState } from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Terminal, ChevronRight, Eye, Code } from 'lucide-react';
import Badge from './Badge';

/**
 * Compute line-by-line difference between expected and actual strings
 */
function computeDiff(expected = '', actual = '') {
  const expLines = String(expected).split('\n');
  const actLines = String(actual).split('\n');
  const maxLines = Math.max(expLines.length, actLines.length);

  const diffLines = [];
  for (let i = 0; i < maxLines; i++) {
    const exp = expLines[i] ?? null;
    const act = actLines[i] ?? null;

    if (exp === act) {
      diffLines.push({ type: 'same', text: exp, lineNum: i + 1 });
    } else {
      if (exp !== null) {
        diffLines.push({ type: 'expected', text: exp, lineNum: i + 1 });
      }
      if (act !== null) {
        diffLines.push({ type: 'actual', text: act, lineNum: i + 1 });
      }
    }
  }
  return diffLines;
}

/**
 * Detect invisible whitespace issues (e.g. trailing space or missing newline)
 */
function getWhitespaceNote(expected = '', actual = '') {
  const expNorm = expected.trim();
  const actNorm = actual.trim();

  if (expected !== actual && expNorm === actNorm) {
    return 'Увага: Текст збігається за змістом, але відрізняється невидимими пробілами або переносами рядків (\\n).';
  }
  return null;
}

export default function TestcaseDiff({
  results = [], // Array<{ input, expected, actual, passed, error, timedOut, timeMs }>
  status = 'accepted', // 'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error' | 'compile_error'
  compileError = null,
  className = '',
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [viewMode, setViewMode] = useState('diff'); // 'diff' | 'raw'

  if (status === 'compile_error' || compileError) {
    return (
      <div className={`p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger space-y-2 ${className}`}>
        <div className="flex items-center gap-2 font-semibold text-sm">
          <XCircle size={16} />
          <span>Помилка компіляції (Compile Error)</span>
        </div>
        <pre className="font-mono text-xs bg-surface-950 p-3 rounded-lg overflow-x-auto text-surface-200 border border-surface-800 whitespace-pre-wrap">
          {compileError || 'Помилка компіляції коду.'}
        </pre>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const currentResult = results[activeIdx] || results[0];
  const whitespaceNote = getWhitespaceNote(currentResult.expected, currentResult.actual);
  const diffLines = computeDiff(currentResult.expected, currentResult.actual);

  return (
    <div className={`flex flex-col rounded-xl bg-surface-900 border border-surface-800 overflow-hidden ${className}`}>
      {/* Header Summary */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800 bg-surface-950/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-sm">
            {passedCount === totalCount ? (
              <CheckCircle2 size={18} className="text-emerald-400" />
            ) : (
              <XCircle size={18} className="text-danger" />
            )}
            <span className={passedCount === totalCount ? 'text-emerald-400' : 'text-danger'}>
              {passedCount === totalCount ? 'Усі тести пройдено!' : 'Тести не пройдено'}
            </span>
          </div>
          <Badge
            color={passedCount === totalCount ? 'success' : 'danger'}
            size="sm"
          >
            {passedCount} / {totalCount} пройдено
          </Badge>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-surface-800 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setViewMode('diff')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 font-medium ${
              viewMode === 'diff' ? 'bg-surface-700 text-surface-100' : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            <Eye size={12} /> Diff
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 font-medium ${
              viewMode === 'raw' ? 'bg-surface-700 text-surface-100' : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            <Code size={12} /> Raw
          </button>
        </div>
      </div>

      {/* Test Tabs */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-surface-800 bg-surface-950/30 overflow-x-auto">
        {results.map((r, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeIdx === idx
                ? 'bg-surface-800 text-surface-100 shadow-sm border border-surface-700'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
            }`}
          >
            {r.passed ? (
              <CheckCircle2 size={13} className="text-emerald-400" />
            ) : (
              <XCircle size={13} className="text-danger" />
            )}
            <span>Тест {idx + 1}</span>
            {r.timeMs !== undefined && (
              <span className="text-[10px] text-surface-500 font-mono">
                {r.timeMs}ms
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Test Case Detail */}
      <div className="p-4 space-y-4">
        {/* Input Block */}
        {currentResult.input && (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
              Вхідні дані (Input)
            </span>
            <pre className="font-mono text-xs p-2.5 rounded-lg bg-surface-950 border border-surface-800 text-surface-200 overflow-x-auto whitespace-pre-wrap">
              {currentResult.input}
            </pre>
          </div>
        )}

        {/* Runtime Error / Timeout Alert */}
        {currentResult.timedOut && (
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning text-xs flex items-center gap-2">
            <Clock size={14} className="shrink-0" />
            <span>Перевищено ліміт часу виконання (Time Limit Exceeded). Можливо, нескінченний цикл.</span>
          </div>
        )}

        {currentResult.error && !currentResult.timedOut && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs flex items-start gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Помилка виконання (Runtime Error):</span>
              <pre className="font-mono text-[11px] whitespace-pre-wrap">{currentResult.error}</pre>
            </div>
          </div>
        )}

        {whitespaceNote && (
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{whitespaceNote}</span>
          </div>
        )}

        {/* Comparison: Diff vs Raw */}
        {viewMode === 'diff' ? (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
              Порівняння виводу (Diff)
              <span className="text-[10px] lowercase font-normal text-surface-500">
                (<span className="text-emerald-400 font-bold">+</span> очікувано, <span className="text-danger font-bold">-</span> отримано)
              </span>
            </span>

            <div className="font-mono text-xs rounded-lg border border-surface-800 bg-surface-950 overflow-hidden divide-y divide-surface-800/50">
              {diffLines.map((line, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1.5 flex items-start gap-3 ${
                    line.type === 'expected'
                      ? 'bg-emerald-950/30 text-emerald-300 border-l-2 border-emerald-500'
                      : line.type === 'actual'
                      ? 'bg-red-950/30 text-red-300 border-l-2 border-danger'
                      : 'text-surface-300'
                  }`}
                >
                  <span className="select-none font-bold shrink-0 w-3">
                    {line.type === 'expected' ? '+' : line.type === 'actual' ? '-' : ' '}
                  </span>
                  <span className="whitespace-pre-wrap break-all">{line.text === '' ? '<порожній рядок>' : line.text}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={12} /> Очікуваний результат (Expected)
              </span>
              <pre className="font-mono text-xs p-2.5 rounded-lg bg-surface-950 border border-emerald-900/40 text-emerald-200 overflow-x-auto whitespace-pre-wrap min-h-[60px]">
                {currentResult.expected || '<порожній вивід>'}
              </pre>
            </div>

            <div className="space-y-1.5">
              <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1 ${
                currentResult.passed ? 'text-emerald-400' : 'text-danger'
              }`}>
                {currentResult.passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />} Фактичний результат (Actual)
              </span>
              <pre className={`font-mono text-xs p-2.5 rounded-lg bg-surface-950 border overflow-x-auto whitespace-pre-wrap min-h-[60px] ${
                currentResult.passed ? 'border-surface-800 text-surface-200' : 'border-danger/40 text-red-200'
              }`}>
                {currentResult.actual || '<порожній вивід>'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
