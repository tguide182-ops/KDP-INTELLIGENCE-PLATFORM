import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  ShadingType,
  convertInchesToTwip,
} from 'docx';

export interface BookExportData {
  title: string;
  subtitle?: string | null;
  author?: string | null;
  publisher?: string | null;
  targetAudience?: string | null;
  niche?: string | null;
  trimSize?: string | null;
  chapters: {
    orderIndex: number;
    chapterNumber: number | null;
    type: string; // "FRONT_MATTER" | "CHAPTER" | "BACK_MATTER"
    title: string;
    subtitle?: string | null;
    purpose?: string | null;
    sections: {
      orderIndex: number;
      title: string;
      summary?: string | null;
      blocks?: {
        type: string;
        content: string;
        metadata?: string | null;
      }[];
    }[];
  }[];
}

export class DOCXExportService {
  /**
   * Generates a fully-styled, professional Microsoft Word (.docx) document
   */
  static async generateDOCX(book: BookExportData): Promise<Buffer> {
    const docChildren: (Paragraph | Table)[] = [];

    // 1. TITLE PAGE / COVER SPREAD
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: convertInchesToTwip(1.5), after: 200 },
        children: [
          new TextRun({
            text: book.title,
            bold: true,
            size: 48, // 24pt
            font: 'Georgia',
            color: '1E1B4B',
          }),
        ],
      })
    );

    if (book.subtitle) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: convertInchesToTwip(1) },
          children: [
            new TextRun({
              text: book.subtitle,
              italics: true,
              size: 26, // 13pt
              font: 'Georgia',
              color: '475569',
            }),
          ],
        })
      );
    }

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: convertInchesToTwip(2), after: 100 },
        children: [
          new TextRun({
            text: book.author || 'Published with KDP Intelligence OS',
            bold: true,
            size: 24, // 12pt
            font: 'Georgia',
            color: '0F172A',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: book.publisher || 'Independent Publishing Edition',
            size: 20, // 10pt
            font: 'Georgia',
            color: '94A3B8',
          }),
        ],
      }),
      new Paragraph({
        children: [new PageBreak()],
      })
    );

    // 2. TABLE OF CONTENTS SUMMARY
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 300 },
        children: [
          new TextRun({
            text: 'Table of Contents',
            bold: true,
            size: 36, // 18pt
            font: 'Georgia',
            color: '1E1B4B',
          }),
        ],
      })
    );

    book.chapters.forEach((ch) => {
      const prefix = ch.type === 'CHAPTER' ? `Chapter ${ch.chapterNumber}: ` : '';
      docChildren.push(
        new Paragraph({
          spacing: { before: 80, after: 80 },
          children: [
            new TextRun({
              text: `${prefix}${ch.title}`,
              bold: ch.type === 'CHAPTER',
              size: 22,
              font: 'Georgia',
              color: '334155',
            }),
          ],
        })
      );
    });

    docChildren.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );

    // 3. CHAPTERS & CONTENT BLOCKS
    book.chapters.forEach((ch, chIdx) => {
      if (chIdx > 0) {
        docChildren.push(
          new Paragraph({
            children: [new PageBreak()],
          })
        );
      }

      // Chapter Heading
      const chPrefix = ch.type === 'CHAPTER' ? `Chapter ${ch.chapterNumber || ch.orderIndex}` : '';
      if (chPrefix) {
        docChildren.push(
          new Paragraph({
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({
                text: chPrefix.toUpperCase(),
                bold: true,
                size: 20, // 10pt
                font: 'Georgia',
                color: '6366F1', // Brand Indigo
              }),
            ],
          })
        );
      }

      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 80, after: 160 },
          children: [
            new TextRun({
              text: ch.title,
              bold: true,
              size: 38, // 19pt
              font: 'Georgia',
              color: '0F172A',
            }),
          ],
        })
      );

      if (ch.subtitle) {
        docChildren.push(
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: ch.subtitle,
                italics: true,
                size: 24, // 12pt
                font: 'Georgia',
                color: '64748B',
              }),
            ],
          })
        );
      }

      // Sections
      ch.sections.forEach((sec) => {
        docChildren.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: sec.title,
                bold: true,
                size: 28, // 14pt
                font: 'Georgia',
                color: '1E293B',
              }),
            ],
          })
        );

        if (sec.blocks && sec.blocks.length > 0) {
          sec.blocks.forEach((block) => {
            const paragraphs = this.convertContentToWordParagraphs(block.content, block.type);
            docChildren.push(...paragraphs);
          });
        } else if (sec.summary) {
          docChildren.push(
            new Paragraph({
              spacing: { before: 100, after: 140 },
              children: [
                new TextRun({
                  text: sec.summary,
                  size: 22,
                  font: 'Georgia',
                  color: '334155',
                }),
              ],
            })
          );
        }
      });
    });

    // Construct Document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
              },
            },
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      size: 18,
                      font: 'Georgia',
                      color: '94A3B8',
                    }),
                  ],
                }),
              ],
            }),
          },
          children: docChildren,
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * Converts markdown/structured block content into native Word paragraphs, tables, or callouts
   */
  private static convertContentToWordParagraphs(
    content: string,
    type: string
  ): (Paragraph | Table)[] {
    const results: (Paragraph | Table)[] = [];
    const lines = content.split('\n');

    let inTable = false;
    let tableLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Table Detection
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        tableLines.push(line.trim());
        continue;
      } else if (inTable) {
        inTable = false;
        const table = this.createWordTable(tableLines);
        if (table) results.push(table);
        tableLines = [];
      }

      const trimmed = line.trim();
      if (!trimmed) continue;

      // Heading 3
      if (trimmed.startsWith('### ')) {
        results.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: trimmed.replace(/^###\s+/, ''),
                bold: true,
                size: 24, // 12pt
                font: 'Georgia',
                color: '334155',
              }),
            ],
          })
        );
      }
      // Heading 4
      else if (trimmed.startsWith('#### ')) {
        results.push(
          new Paragraph({
            spacing: { before: 160, after: 60 },
            children: [
              new TextRun({
                text: trimmed.replace(/^####\s+/, ''),
                bold: true,
                size: 22, // 11pt
                font: 'Georgia',
                color: '4F46E5', // Indigo
              }),
            ],
          })
        );
      }
      // Blockquote / Callout
      else if (trimmed.startsWith('> ')) {
        results.push(
          new Paragraph({
            spacing: { before: 120, after: 120 },
            indent: { left: convertInchesToTwip(0.4) },
            shading: {
              type: ShadingType.SOLID,
              color: 'F8FAFC',
            },
            border: {
              left: {
                color: '6366F1',
                size: 24,
                style: BorderStyle.SINGLE,
              },
            },
            children: [
              new TextRun({
                text: trimmed.replace(/^>\s+/, ''),
                italics: true,
                size: 20,
                font: 'Georgia',
                color: '475569',
              }),
            ],
          })
        );
      }
      // Bullet list item
      else if (/^[-*•]\s+/.test(trimmed)) {
        results.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 40, after: 40 },
            children: this.parseInlineFormatting(trimmed.replace(/^[-*•]\s+/, '')),
          })
        );
      }
      // Numbered list item
      else if (/^\d+\.\s+/.test(trimmed)) {
        results.push(
          new Paragraph({
            spacing: { before: 40, after: 40 },
            indent: { left: convertInchesToTwip(0.25) },
            children: this.parseInlineFormatting(trimmed),
          })
        );
      }
      // Standard Paragraph
      else {
        results.push(
          new Paragraph({
            spacing: { before: 60, after: 100, line: 276 }, // 1.15 line spacing
            children: this.parseInlineFormatting(trimmed),
          })
        );
      }
    }

    if (inTable && tableLines.length > 0) {
      const table = this.createWordTable(tableLines);
      if (table) results.push(table);
    }

    return results;
  }

  /**
   * Builds real Microsoft Word Table from markdown-style lines
   */
  private static createWordTable(tableLines: string[]): Table | null {
    const validLines = tableLines.filter((l) => !l.includes('---'));
    if (validLines.length === 0) return null;

    const rows = validLines.map((line, rowIdx) => {
      const isHeader = rowIdx === 0;
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());

      return new TableRow({
        children: cells.map(
          (cellText) =>
            new TableCell({
              width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
              shading: isHeader
                ? { type: ShadingType.SOLID, color: 'EEF2F6' }
                : undefined,
              children: [
                new Paragraph({
                  spacing: { before: 80, after: 80 },
                  alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
                  children: [
                    new TextRun({
                      text: cellText.replace(/\*\*/g, ''),
                      bold: isHeader,
                      size: 20,
                      font: 'Georgia',
                      color: isHeader ? '0F172A' : '334155',
                    }),
                  ],
                }),
              ],
            })
        ),
      });
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows,
    });
  }

  /**
   * Parses bold (`**text**`) and italic (`*text*`) into styled TextRuns
   */
  private static parseInlineFormatting(text: string): TextRun[] {
    const runs: TextRun[] = [];
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

    parts.forEach((part) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        runs.push(
          new TextRun({
            text: part.slice(2, -2),
            bold: true,
            size: 22,
            font: 'Georgia',
            color: '1E293B',
          })
        );
      } else if (part.startsWith('*') && part.endsWith('*')) {
        runs.push(
          new TextRun({
            text: part.slice(1, -1),
            italics: true,
            size: 22,
            font: 'Georgia',
            color: '334155',
          })
        );
      } else if (part) {
        runs.push(
          new TextRun({
            text: part,
            size: 22,
            font: 'Georgia',
            color: '334155',
          })
        );
      }
    });

    return runs;
  }
}
