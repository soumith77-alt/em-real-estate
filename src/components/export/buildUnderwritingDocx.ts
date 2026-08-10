import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  WidthType,
} from "docx";
import type { Deal, ExtractedField, RedFlag } from "@/types";

interface Input {
  deal: Deal;
  fields: ExtractedField[];
  redFlags: RedFlag[];
  narrative: {
    executiveSummary: string;
    assetAndMarket: string;
    financialSummary: string;
    recommendation: string;
  };
  rentRoll: { unit: string; tenant: string; sqft: number; rentPsf: number; end: string }[];
  comps: { property: string; town: string; date: string; price: number; capRate: number }[];
}

export async function buildUnderwritingDocx(input: Input): Promise<Blob> {
  const { deal, fields, redFlags, narrative, rentRoll, comps } = input;

  const doc = new Document({
    creator: "EM Real Estate Workspace",
    title: `Underwriting — ${deal.propertyName}`,
    sections: [
      {
        properties: {},
        children: [
          h1(`Underwriting: ${deal.propertyName}`),
          p(`${deal.town}, ${deal.province} · Prepared 10 August 2026`),
          h2("Executive summary"),
          p(narrative.executiveSummary),
          h2("Extracted deal facts"),
          kvTable(fields.map((f) => [f.label, String(f.value)])),
          h2("Asset and market"),
          p(narrative.assetAndMarket),
          h2("Rent roll (summary)"),
          simpleTable(
            ["Unit", "Tenant", "GLA (sf)", "Rent PSF", "Expiry"],
            rentRoll.map((r) => [r.unit, r.tenant, r.sqft.toString(), `$${r.rentPsf.toFixed(2)}`, r.end]),
          ),
          h2("Financial summary"),
          p(narrative.financialSummary),
          h2("Comparable sales"),
          simpleTable(
            ["Property", "Town", "Date", "Price", "Cap rate"],
            comps.map((c) => [
              c.property,
              c.town,
              c.date,
              `$${(c.price / 1_000_000).toFixed(1)}M`,
              `${(c.capRate * 100).toFixed(2)}%`,
            ]),
          ),
          h2("Red flags"),
          ...redFlags.map(
            (f) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `[${f.severity.toUpperCase()}] `,
                    bold: true,
                  }),
                  new TextRun({ text: f.title, bold: true }),
                  new TextRun({ text: ` — ${f.detail}` }),
                ],
              }),
          ),
          h2("Recommendation"),
          p(narrative.recommendation),
          p(
            "Every extracted figure in this report is traceable to a source document and page in the data room.",
          ),
        ],
      },
    ],
  });

  const buf = await Packer.toBlob(doc);
  return buf;
}

function h1(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.LEFT,
  });
}

function h2(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2 });
}

function p(text: string) {
  return new Paragraph({ children: [new TextRun(text)] });
}

function simpleTable(headers: string[], rows: string[][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: headers.map(
          (h) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: h, bold: true })],
                }),
              ],
            }),
        ),
      }),
      ...rows.map(
        (r) =>
          new TableRow({
            children: r.map(
              (c) =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun(c)] })],
                }),
            ),
          }),
      ),
    ],
  });
}

function kvTable(rows: string[][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      ([k, v]) =>
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: k, bold: true })],
                }),
              ],
              width: { size: 35, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun(v)] })],
            }),
          ],
        }),
    ),
  });
}
