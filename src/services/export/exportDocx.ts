import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } from 'docx';
import { saveAs } from 'file-saver';
import { GeneratedPaper, GeneratedSet, getBloomCode } from '../../types';

export async function exportPaperToDocx(paper: GeneratedPaper, activeSet?: GeneratedSet, exportAllSets = false) {
  const setsToExport = exportAllSets ? paper.sets : [activeSet || paper.sets[paper.activeSetIndex || 0]];

  const docSections = setsToExport.map((set) => {
    const children: any[] = [];

    // College / Institution Header
    if (paper.examDetails.collegeName) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: paper.examDetails.collegeName.toUpperCase(),
              bold: true,
              size: 28, // 14pt
              font: 'Times New Roman',
            }),
          ],
        })
      );
    }

    if (paper.examDetails.department) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: paper.examDetails.department,
              bold: true,
              size: 22,
              font: 'Times New Roman',
            }),
          ],
        })
      );
    }

    // Exam Name & Set
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 150 },
        children: [
          new TextRun({
            text: `${paper.examDetails.examName || 'SEMESTER EXAMINATION'} — (${set.setName.toUpperCase()})`,
            bold: true,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      })
    );

    // Metadata Table: Subject / Duration / Marks
    const metaTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Subject: ', bold: true, font: 'Times New Roman' }),
                    new TextRun({ text: paper.examDetails.subjectName || 'N/A', font: 'Times New Roman' }),
                    ...(paper.examDetails.subjectCode ? [new TextRun({ text: ` (${paper.examDetails.subjectCode})`, font: 'Times New Roman' })] : []),
                  ],
                }),
                ...(paper.examDetails.date ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Date: ', bold: true, font: 'Times New Roman' }),
                      new TextRun({ text: paper.examDetails.date, font: 'Times New Roman' }),
                    ],
                  })
                ] : []),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({ text: 'Duration: ', bold: true, font: 'Times New Roman' }),
                    new TextRun({ text: paper.examDetails.duration || 'N/A', font: 'Times New Roman' }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({ text: 'Max Marks: ', bold: true, font: 'Times New Roman' }),
                    new TextRun({ text: `${paper.examDetails.totalMarks || 0}`, font: 'Times New Roman' }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
    children.push(metaTable);

    // Instructions
    if (paper.examDetails.instructions && paper.examDetails.instructions.length > 0) {
      children.push(
        new Paragraph({
          spacing: { before: 200, after: 80 },
          children: [
            new TextRun({
              text: 'Instructions:',
              bold: true,
              italics: true,
              font: 'Times New Roman',
            }),
          ],
        })
      );
      paper.examDetails.instructions.forEach((ins, idx) => {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: ins,
                italics: true,
                font: 'Times New Roman',
              }),
            ],
          })
        );
      });
    }

    children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));

    // Sections & Questions with 5-Column Table matching PDF master format
    set.sections.forEach((section, sIdx) => {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 250, after: 60 },
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: section.sectionName.toUpperCase(),
              bold: true,
              size: 22,
              font: 'Times New Roman',
            }),
          ],
        })
      );

      const countedMarks = section.attemptAny * section.marksPerQuestion;
      const instructionText = `Q.${sIdx + 1} ${section.instruction || ''}`;

      // Instruction & Marks header paragraph
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: instructionText,
              bold: true,
              size: 20,
              font: 'Times New Roman',
            }),
            new TextRun({
              text: `\t\t\t\t[${countedMarks} Marks]`,
              bold: true,
              size: 20,
              font: 'Times New Roman',
            }),
          ],
        })
      );

      // Table rows (Header + Question Rows)
      const tableRows: TableRow[] = [];

      // Header row
      tableRows.push(
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 8, type: WidthType.PERCENTAGE },
              shading: { fill: 'F5F5F5', type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
                left: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
                right: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'Q. No.', bold: true, size: 18, font: 'Times New Roman' })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 64, type: WidthType.PERCENTAGE },
              shading: { fill: 'F5F5F5', type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
                left: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
                right: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
              },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Question Description', bold: true, size: 18, font: 'Times New Roman' })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 8, type: WidthType.PERCENTAGE },
              shading: { fill: 'F5F5F5', type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
                left: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
                right: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'Marks', bold: true, size: 18, font: 'Times New Roman' })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 8, type: WidthType.PERCENTAGE },
              shading: { fill: 'F5F5F5', type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
                left: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
                right: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'CO', bold: true, size: 18, font: 'Times New Roman' })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 12, type: WidthType.PERCENTAGE },
              shading: { fill: 'F5F5F5', type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
                left: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
                right: { style: BorderStyle.SINGLE, size: 4, color: '787878' },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'Bloom', bold: true, size: 18, font: 'Times New Roman' })],
                }),
              ],
            }),
          ],
        })
      );

      // Question Rows
      section.questions.forEach((q, qIdx) => {
        const qNumStr = (qIdx + 1).toString();
        const cellBorder = {
          top: { style: BorderStyle.SINGLE, size: 2, color: 'B4B4B4' },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: 'B4B4B4' },
          left: { style: BorderStyle.SINGLE, size: 2, color: 'B4B4B4' },
          right: { style: BorderStyle.SINGLE, size: 2, color: 'B4B4B4' },
        };

        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: 8, type: WidthType.PERCENTAGE },
                borders: cellBorder,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: qNumStr, bold: true, size: 18, font: 'Times New Roman' })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 64, type: WidthType.PERCENTAGE },
                borders: cellBorder,
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: q.text, size: 18, font: 'Times New Roman' })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 8, type: WidthType.PERCENTAGE },
                borders: cellBorder,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: q.marks.toString(), bold: true, size: 18, font: 'Times New Roman' })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 8, type: WidthType.PERCENTAGE },
                borders: cellBorder,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: q.co || 'CO1', bold: true, size: 18, font: 'Times New Roman' })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 12, type: WidthType.PERCENTAGE },
                borders: cellBorder,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: getBloomCode(q.bloomsLevel), bold: true, size: 18, font: 'Times New Roman' })],
                  }),
                ],
              }),
            ],
          })
        );
      });

      const sectionTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows,
      });

      children.push(sectionTable);
      children.push(new Paragraph({ spacing: { after: 150 }, children: [] }));
    });

    // End of Paper footer
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 300 },
        children: [
          new TextRun({
            text: '*** END OF QUESTION PAPER ***',
            bold: true,
            size: 18,
            font: 'Times New Roman',
          }),
        ],
      })
    );

    return {
      properties: {},
      children,
    };
  });

  const doc = new Document({
    sections: docSections,
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${paper.examDetails.subjectName || 'QuestionPaper'}_${paper.examDetails.examName || 'Exam'}_${activeSet?.setName || 'AllSets'}.docx`
    .replace(/[^a-zA-Z0-9_\-.]/g, '_');

  saveAs(blob, fileName);
}

export async function exportAnswerKeyToDocx(paper: GeneratedPaper, activeSet?: GeneratedSet) {
  const set = activeSet || paper.sets[paper.activeSetIndex || 0];
  const children: any[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `ANSWER KEY & SCHEME OF VALUATION — ${set.setName.toUpperCase()}`,
          bold: true,
          size: 26,
          font: 'Times New Roman',
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Subject: ${paper.examDetails.subjectName || 'N/A'} | Exam: ${paper.examDetails.examName || 'N/A'} | Max Marks: ${paper.examDetails.totalMarks}`,
          italics: true,
          font: 'Times New Roman',
        }),
      ],
    })
  );

  set.sections.forEach((section) => {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: section.sectionName,
            bold: true,
            size: 22,
            font: 'Times New Roman',
          }),
        ],
      })
    );

    section.questions.forEach((q) => {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: `${q.displayNumber} ${q.text} [${q.marks} Marks]`,
              bold: true,
              font: 'Times New Roman',
            }),
          ],
        })
      );

      children.push(
        new Paragraph({
          spacing: { after: 150 },
          children: [
            new TextRun({
              text: `Answer / Solution Outline:\n${q.answerKey || 'No solution added yet.'}`,
              font: 'Times New Roman',
            }),
          ],
        })
      );
    });
  });

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `AnswerKey_${paper.examDetails.subjectName || 'Exam'}_${set.setName}.docx`.replace(/[^a-zA-Z0-9_\-.]/g, '_');
  saveAs(blob, fileName);
}
