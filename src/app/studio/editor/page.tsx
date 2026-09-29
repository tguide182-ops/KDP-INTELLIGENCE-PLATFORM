'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { WritingQualityEngine, QualityReport } from '@/services/quality/WritingQualityEngine';
import { StyleProfileService, StyleProfile } from '@/services/quality/StyleProfileService';
import { formatNumber } from '@/lib/utils';
import {
  PenTool,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Table as TableIcon,
  GitGraph,
  Sparkles,
  Save,
  Download,
  RotateCcw,
  RotateCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Maximize2,
  Layers,
  ChevronRight,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';

interface EditableTableBlock {
  headers: string[];
  rows: string[][];
}

interface EditableDiagramBlock {
  type: 'flowchart' | 'timeline' | 'comparison' | 'hierarchy';
  title: string;
  steps: { label: string; description: string }[];
}

function ManuscriptEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('id');

  const [marketplace, setMarketplace] = useState('amazon.com');
  const [book, setBook] = useState<any>(null);
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(0);
  const [selectedSectionIdx, setSelectedSectionIdx] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Active section content state
  const [sectionTitle, setSectionTitle] = useState('');
  const [editorText, setEditorText] = useState('');
  const [tableData, setTableData] = useState<EditableTableBlock | null>(null);
  const [diagramData, setDiagramData] = useState<EditableDiagramBlock | null>(null);

  // Editor formatting states
  const [fontFamily, setFontFamily] = useState('Georgia');
  const [fontSize, setFontSize] = useState('14');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'justify'>('justify');

  // AI Co-Pilot & QA States
  const [qaReport, setQaReport] = useState<QualityReport | null>(null);
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);

  const fetchBook = async (id?: string) => {
    setIsLoading(true);
    try {
      let targetId = id;
      if (!targetId) {
        const listRes = await fetch('/api/studio/books');
        const listData = await listRes.json();
        if (listData.books && listData.books.length > 0) {
          targetId = listData.books[0].id;
          router.replace(`/studio/editor?id=${targetId}`);
        }
      }

      if (targetId) {
        const res = await fetch(`/api/studio/books/${targetId}`);
        const data = await res.json();
        setBook(data.book);

        if (data.book) {
          const prof = StyleProfileService.getProfileForNiche(data.book.niche, data.book.targetAudience);
          setStyleProfile(prof);

          const firstCh = data.book.chapters?.[0];
          const firstSec = firstCh?.sections?.[0];
          if (firstSec) {
            initSectionEditor(firstSec);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load book for editor:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const initSectionEditor = (section: any) => {
    setSectionTitle(section.title || '');
    const blockContent = section.blocks?.map((b: any) => b.content).join('\n\n') || section.summary || '';
    setEditorText(blockContent);

    // Check if table exists in content
    if (blockContent.includes('| --- |') || blockContent.includes('|:---|')) {
      const lines = blockContent.split('\n').filter((l: string) => l.trim().startsWith('|') && l.trim().endsWith('|'));
      const headerLine = lines[0];
      const dataLines = lines.slice(2);
      if (headerLine) {
        const headers = headerLine.split('|').slice(1, -1).map((h: string) => h.trim());
        const rows = dataLines.map((l: string) => l.split('|').slice(1, -1).map((c: string) => c.trim()));
        setTableData({ headers, rows });
      }
    } else {
      setTableData(null);
    }

    // Run instant QA
    const report = WritingQualityEngine.analyzeText(blockContent);
    setQaReport(report);
    setSaveStatus('saved');
  };

  useEffect(() => {
    fetchBook(bookId || undefined);
  }, [bookId]);

  const handleSelectSection = (chIdx: number, sIdx: number) => {
    setSelectedChapterIdx(chIdx);
    setSelectedSectionIdx(sIdx);
    const sec = book?.chapters?.[chIdx]?.sections?.[sIdx];
    if (sec) {
      initSectionEditor(sec);
    }
  };

  // Text change handler with auto QA
  const handleTextChange = (newText: string) => {
    setEditorText(newText);
    setSaveStatus('unsaved');
    const report = WritingQualityEngine.analyzeText(newText);
    setQaReport(report);
  };

  // Insert Table Action
  const handleInsertTable = () => {
    const newTable: EditableTableBlock = {
      headers: ['Feature / Phase', 'Traditional Approach', 'Optimized Solution'],
      rows: [
        ['Protein Target', '15g per meal', '30g+ high-leverage protein'],
        ['Prep Time', '60 minutes', '20 minutes batch-prepped'],
        ['Metabolic Impact', 'Insulin spike & crash', 'Steady blood glucose'],
      ],
    };
    setTableData(newTable);

    // Append table markdown representation to text
    const tableMd = `\n\n| ${newTable.headers.join(' | ')} |\n| ${newTable.headers.map(() => '---').join(' | ')} |\n${newTable.rows.map((r) => `| ${r.join(' | ')} |`).join('\n')}\n\n`;
    handleTextChange(editorText + tableMd);
  };

  // Insert Diagram Action
  const handleInsertDiagram = () => {
    const newDiagram: EditableDiagramBlock = {
      type: 'flowchart',
      title: 'The 4-Stage Focus Implementation Loop',
      steps: [
        { label: '1. Friction Audit', description: 'Eliminate top 3 environmental distractions' },
        { label: '2. Sacred Block', description: 'Schedule non-negotiable 90-minute focus sprint' },
        { label: '3. Execution', description: 'Single-task with zero context switching' },
        { label: '4. Dopamine Reinforcement', description: 'Log completion immediately' },
      ],
    };
    setDiagramData(newDiagram);
  };

  // AI Co-Pilot Prompt Execution
  const handleRunAiAction = async (actionPrompt: string) => {
    setIsAiRunning(true);
    try {
      // Simulate intelligent AI transformation based on the request
      let transformed = editorText;

      if (actionPrompt.includes('table')) {
        handleInsertTable();
      } else if (actionPrompt.includes('diagram')) {
        handleInsertDiagram();
      } else if (actionPrompt.includes('em dash') || actionPrompt.includes('quality')) {
        // Clean up em dashes and generic clichés
        transformed = transformed
          .replace(/—/g, ', ')
          .replace(/--/g, ', ')
          .replace(/in today's fast-paced world/gi, 'in contemporary operating environments')
          .replace(/it's important to note that /gi, '')
          .replace(/let's dive in/gi, 'let us begin');
        handleTextChange(transformed);
      } else if (actionPrompt.includes('beginner')) {
        transformed = `> **Quick Foundation Note**: Before implementing this step, ensure you have completed the prerequisite checklist from Chapter 1.\n\n` + transformed;
        handleTextChange(transformed);
      }
    } finally {
      setIsAiRunning(false);
    }
  };

  const chapters = book?.chapters || [];
  const currentChapter = chapters[selectedChapterIdx];
  const currentSection = currentChapter?.sections?.[selectedSectionIdx];

  const wordCount = editorText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14]">
      <Header currentMarketplace={marketplace} onMarketplaceChange={setMarketplace} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Document Header & Professional Toolbar */}
          <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
            {/* Breadcrumb & Project Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <button onClick={() => router.push('/studio/books')} className="hover:text-brand-500">
                  Book Studio
                </button>
                <span>/</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {book?.title || 'Manuscript Editor'}
                </span>
                <span>/</span>
                <span className="text-brand-600 dark:text-brand-400 font-bold">
                  {currentChapter ? `Ch ${currentChapter.chapterNumber || selectedChapterIdx + 1}: ${currentSection?.title || 'Section'}` : 'Editor'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">
                  {formatNumber(wordCount)} words (Target: {currentSection?.targetWordCount || 600}w)
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    saveStatus === 'saved'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}
                >
                  {saveStatus === 'saved' ? 'Autosaved' : 'Unsaved Changes'}
                </span>
                <button
                  type="button"
                  onClick={() => router.push(`/studio/export?id=${book?.id}`)}
                  className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Center</span>
                </button>
              </div>
            </div>

            {/* Professional Document Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs">
              {/* Font Selector */}
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium text-xs outline-none"
              >
                <option value="Georgia">Georgia (Book Serif)</option>
                <option value="Bookerly">Bookerly (Kindle)</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Calibri">Calibri</option>
              </select>

              {/* Font Size */}
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="px-2 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium text-xs outline-none"
              >
                <option value="12">12pt</option>
                <option value="14">14pt</option>
                <option value="16">16pt</option>
                <option value="18">18pt (H3)</option>
                <option value="22">22pt (H2)</option>
                <option value="26">26pt (H1)</option>
              </select>

              <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

              {/* Inline Formatting */}
              <button
                type="button"
                onClick={() => setIsBold(!isBold)}
                className={`p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${
                  isBold ? 'bg-brand-500/20 text-brand-600 font-black' : ''
                }`}
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsItalic(!isItalic)}
                className={`p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${
                  isItalic ? 'bg-brand-500/20 text-brand-600 font-black' : ''
                }`}
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

              {/* Alignment */}
              <button
                type="button"
                onClick={() => setTextAlign('left')}
                className={`p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 ${
                  textAlign === 'left' ? 'bg-brand-500/20 text-brand-600' : ''
                }`}
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setTextAlign('justify')}
                className={`p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 ${
                  textAlign === 'justify' ? 'bg-brand-500/20 text-brand-600' : ''
                }`}
              >
                <AlignJustify className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

              {/* Insert Actions (+ Insert Table, + Insert Diagram) */}
              <button
                type="button"
                onClick={handleInsertTable}
                className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex items-center gap-1 transition-colors"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>+ Insert Table</span>
              </button>

              <button
                type="button"
                onClick={handleInsertDiagram}
                className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-600 dark:text-purple-400 font-semibold text-xs flex items-center gap-1 transition-colors"
              >
                <GitGraph className="w-3.5 h-3.5" />
                <span>+ Insert Diagram</span>
              </button>
            </div>
          </div>

          {/* Three-Panel Workstation */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel: Chapter & Section Navigation Tree (260px) */}
            <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 overflow-y-auto space-y-3 shrink-0 hidden md:block">
              <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Book Hierarchy</span>
                <span className="text-[10px] font-mono">{chapters.length} Chs</span>
              </div>

              <div className="space-y-2">
                {chapters.map((ch: any, chIdx: number) => (
                  <div key={ch.id || chIdx} className="space-y-1">
                    <div className="px-2 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span className="truncate">
                        {ch.type === 'CHAPTER' ? `Ch ${ch.chapterNumber}: ` : ''}{ch.title}
                      </span>
                    </div>

                    <div className="space-y-0.5 pl-2">
                      {ch.sections?.map((sec: any, sIdx: number) => {
                        const isSelected = chIdx === selectedChapterIdx && sIdx === selectedSectionIdx;
                        return (
                          <button
                            key={sec.id || sIdx}
                            type="button"
                            onClick={() => handleSelectSection(chIdx, sIdx)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all truncate flex items-center justify-between ${
                              isSelected
                                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <span className="truncate">{sec.title}</span>
                            <span className="text-[9px] font-mono opacity-50 shrink-0 ml-1">
                              {sec.targetWordCount}w
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center Panel: True Book Page Canvas */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-6 overflow-y-auto flex justify-center">
              <div
                className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 space-y-6 min-h-[840px] flex flex-col justify-between"
                style={{
                  fontFamily,
                  fontSize: `${fontSize}px`,
                  textAlign,
                  lineHeight: 1.6,
                }}
              >
                <div className="space-y-5">
                  {/* Section Title Heading */}
                  <input
                    type="text"
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    className="w-full text-2xl font-extrabold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-200 focus:border-brand-500 focus:outline-none transition-colors"
                    placeholder="Section Title..."
                  />

                  {/* Editable Main Text Area */}
                  <textarea
                    value={editorText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="Write your professional manuscript section here..."
                    className="w-full h-[420px] bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
                  />

                  {/* Interactive Structured Table Preview & Editor */}
                  {tableData && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <TableIcon className="w-4 h-4" />
                          <span>Structured Table Block</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setTableData(null)}
                          className="text-rose-500 hover:underline text-[11px]"
                        >
                          Remove Table
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-slate-200 dark:border-slate-800 text-xs">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white">
                              {tableData.headers.map((h, hIdx) => (
                                <th key={hIdx} className="border border-slate-200 dark:border-slate-800 p-2 text-left">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tableData.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="border border-slate-200 dark:border-slate-800 p-2">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Interactive Structured Diagram Preview */}
                  {diagramData && (
                    <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <GitGraph className="w-4 h-4" />
                          <span>{diagramData.title}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setDiagramData(null)}
                          className="text-rose-500 hover:underline text-[11px]"
                        >
                          Remove Diagram
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        {diagramData.steps.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-center space-y-1 shadow-xs"
                          >
                            <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center mx-auto">
                              {sIdx + 1}
                            </div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">
                              {step.label}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {step.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Page Footer / Running Header */}
                <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>{book?.title || 'KDP Operating System'}</span>
                  <span>Section {selectedSectionIdx + 1}</span>
                </div>
              </div>
            </div>

            {/* Right Panel: AI Co-Pilot & Editorial QA (300px) */}
            <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 overflow-y-auto space-y-5 shrink-0 hidden lg:block">
              {/* Editorial QA Score Card */}
              {qaReport && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Quality & Style QA</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {qaReport.overallScore}/100
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Em Dash Usage:</span>
                      <span className="font-mono font-semibold">
                        {qaReport.emDashStats.countPer1k}/1k (Limit: {qaReport.emDashStats.limit})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Bullet Ratio:</span>
                      <span className="font-mono font-semibold">
                        {qaReport.bulletStats.bulletRatioPct}% (Max: {qaReport.bulletStats.maxAllowedPct}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>AI Clichés Detected:</span>
                      <span className="font-mono font-semibold">
                        {qaReport.detectedAIPhrases.length}
                      </span>
                    </div>
                  </div>

                  {qaReport.issues.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1">
                      {qaReport.issues.map((iss, iIdx) => (
                        <div key={iIdx} className="text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>{iss.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Active Style Profile Parameters */}
              {styleProfile && (
                <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2 text-xs">
                  <div className="font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider text-[10px]">
                    Active Style Profile: {styleProfile.genre}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                    <strong>Tone:</strong> {styleProfile.tone}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                    <strong>Reading Level:</strong> {styleProfile.readingLevel}
                  </div>
                </div>
              )}

              {/* AI Co-Pilot Quick Actions */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                  <span>AI Co-Pilot Actions</span>
                </div>

                {[
                  { label: 'Clean Em Dashes & Clichés', prompt: 'clean em dash and ai clichés' },
                  { label: 'Convert to Comparison Table', prompt: 'table' },
                  { label: 'Generate Flowchart Diagram', prompt: 'diagram' },
                  { label: 'Add Foundation Note for Beginners', prompt: 'beginner' },
                ].map((act) => (
                  <button
                    key={act.label}
                    type="button"
                    onClick={() => handleRunAiAction(act.prompt)}
                    disabled={isAiRunning}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500/40 bg-slate-50/60 dark:bg-slate-950/40 hover:bg-white text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-between"
                  >
                    <span>{act.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ManuscriptEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14] text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      }
    >
      <ManuscriptEditorContent />
    </Suspense>
  );
}
