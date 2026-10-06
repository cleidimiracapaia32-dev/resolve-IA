import type { Fill, Figure, Shape, Solved } from "./types";
import { placeAnswer, type Rng } from "./rng";

const SHAPES: Shape[] = ["circle", "square", "triangle", "diamond", "hexagon", "star"];
const FILLS: Fill[] = ["solid", "outline", "striped"];

const SHAPE_PT: Record<Shape, string> = {
  circle: "círculo",
  square: "quadrado",
  triangle: "triângulo",
  diamond: "losango",
  hexagon: "hexágono",
  star: "estrela",
};
const FILL_PT: Record<Fill, string> = {
  solid: "preenchido",
  outline: "contorno",
  striped: "riscado",
};

const figKey = (f: Figure) => `${f.shape}|${f.count}|${f.fill}|${f.rotation}`;

type AttrRule = "row" | "col" | "latinA" | "latinB" | "const";

function idx(rule: AttrRule, r: number, c: number) {
  switch (rule) {
    case "row":
      return r;
    case "col":
      return c;
    case "latinA":
      return (r + c) % 3;
    case "latinB":
      return (r + 2 * c) % 3;
    case "const":
      return 0;
  }
}

function describe(attr: string, rule: AttrRule, values: string[]) {
  const list = values.join(", ");
  switch (rule) {
    case "row":
      return `${attr}: é igual dentro de cada linha e muda de linha para linha (${list}).`;
    case "col":
      return `${attr}: é igual dentro de cada coluna e muda da esquerda para a direita (${list}).`;
    case "latinA":
    case "latinB":
      return `${attr}: cada linha e cada coluna contém exatamente uma vez cada valor (${list}).`;
    case "const":
      return `${attr}: é o mesmo em todas as células (${values[0]}).`;
  }
}

export function genMatrix(r: Rng, difficulty: number, seed: number): Solved {
  const shapes = r.shuffle(SHAPES).slice(0, 3);
  const fills = r.shuffle(FILLS);
  const base = r.int(1, 2);
  const counts = r.pick([
    [base, base + 1, base + 2],
    [1, 2, 3],
    [3, 2, 1],
    [1, 3, 5].map((v) => Math.min(v, 5)),
  ]);

  let shapeRule: AttrRule;
  let countRule: AttrRule;
  let fillRule: AttrRule;
  let useRotation = false;

  if (difficulty <= 1) {
    shapeRule = r.pick(["row", "col"] as const);
    countRule = shapeRule === "row" ? "col" : "row";
    fillRule = "const";
  } else if (difficulty === 2) {
    shapeRule = r.pick(["row", "col"] as const);
    countRule = shapeRule === "row" ? "col" : "row";
    fillRule = "latinA";
  } else {
    useRotation = r.next() < 0.4;
    if (useRotation) {
      shapeRule = "const";
      countRule = "latinA";
      fillRule = "latinB";
    } else {
      shapeRule = "latinA";
      countRule = "latinB";
      fillRule = r.pick(["row", "col"] as const);
    }
  }

  const rotations = [0, 90, 180];
  const rotShape: Shape = "triangle";

  const cell = (row: number, col: number): Figure => ({
    shape: useRotation ? rotShape : shapes[idx(shapeRule, row, col)]!,
    count: counts[idx(countRule, row, col)]!,
    fill: fills[idx(fillRule, row, col)]!,
    rotation: useRotation ? rotations[(row + col) % 3]! : 0,
  });

  const cells: (Figure | null)[] = [];
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) cells.push(cell(row, col));
  const correct = cells[8]!;
  cells[8] = null;

  const distractors: Figure[] = [];
  const otherShapes = SHAPES.filter((s) => s !== correct.shape);
  const otherCounts = [1, 2, 3, 4, 5].filter((n) => n !== correct.count);
  const otherFills = FILLS.filter((f) => f !== correct.fill);
  distractors.push({ ...correct, shape: useRotation ? "diamond" : r.pick(otherShapes) });
  distractors.push({ ...correct, count: r.pick(otherCounts) });
  distractors.push({ ...correct, fill: r.pick(otherFills) });
  if (useRotation) distractors.push({ ...correct, rotation: (correct.rotation + 90) % 360 });
  distractors.push({ ...correct, count: r.pick(otherCounts), fill: r.pick(otherFills) });
  distractors.push({ ...correct, shape: r.pick(otherShapes), count: r.pick(otherCounts) });
  distractors.push({ ...correct, fill: r.pick(otherFills), count: r.pick(otherCounts) });

  const nOptions = difficulty <= 1 ? 4 : 6;
  const { options, answer } = placeAnswer(r, correct, r.shuffle(distractors).slice(0, nOptions - 1), figKey);

  const rules = [
    useRotation
      ? `Forma: é sempre ${SHAPE_PT[rotShape]}, mas a rotação avança 90° a cada passo na diagonal (0°, 90°, 180°).`
      : describe("Forma", shapeRule, shapes.map((s) => SHAPE_PT[s])),
    describe("Quantidade", countRule, counts.map(String)),
    describe("Preenchimento", fillRule, fills.map((f) => FILL_PT[f])),
  ];

  return {
    category: "matrices",
    difficulty,
    seed,
    prompt: "Qual figura completa a matriz?",
    visual: { kind: "matrix", cells },
    options: options.map((figure) => ({ kind: "figure", figure })),
    answer,
    rule: "Cada atributo (forma, quantidade, preenchimento) segue a sua própria regra, independente dos outros.",
    steps: [
      ...rules,
      `Aplicando as três regras à última célula (linha 3, coluna 3): ${correct.count} × ${SHAPE_PT[correct.shape]}, ${FILL_PT[correct.fill]}${useRotation ? `, rodado ${correct.rotation}°` : ""}.`,
    ],
  };
}

export function genOddOne(r: Rng, difficulty: number, seed: number): Solved {
  type Attr = "shape" | "fill" | "parity";
  const ruleAttr: Attr = difficulty >= 3 ? r.pick(["parity", "shape", "fill"] as const) : r.pick(["shape", "fill"] as const);

  const n = 5;
  const oddPos = r.int(0, n - 1);
  const twoThree = (values: readonly [unknown, unknown]) => r.shuffle([values[0], values[0], values[1], values[1], values[1]]);

  const [sA, sB, sOdd] = r.shuffle(SHAPES);
  const [fA, fB, fOdd] = r.shuffle(FILLS);

  let shapes: Shape[];
  let fills: Fill[];
  let counts: number[];

  // Non-rule attributes: constant at difficulty 1, a 2+3 split otherwise (never singles out one figure).
  const vary = difficulty >= 2;
  shapes = vary ? (twoThree([sA, sB]) as Shape[]) : Array(n).fill(sA);
  fills = vary ? (twoThree([fA, fB]) as Fill[]) : Array(n).fill(fA);
  const cA = r.int(1, 2);
  counts = vary ? (twoThree([cA, cA + 2]) as number[]) : Array(n).fill(cA);

  let explanation: string;
  if (ruleAttr === "shape") {
    shapes = Array(n).fill(sA);
    shapes[oddPos] = sOdd!;
    explanation = `Todas as figuras são ${SHAPE_PT[sA!]}s, exceto uma, que é ${SHAPE_PT[sOdd!]}.`;
  } else if (ruleAttr === "fill") {
    fills = Array(n).fill(fA);
    fills[oddPos] = fOdd!;
    explanation = `Todas as figuras são «${FILL_PT[fA!]}», exceto uma, que é «${FILL_PT[fOdd!]}».`;
  } else {
    const evens = [2, 4];
    counts = Array.from({ length: n }, () => r.pick(evens));
    counts[oddPos] = r.pick([1, 3, 5]);
    explanation = `Todas as figuras têm um número par de elementos, exceto uma, que tem ${counts[oddPos]} (ímpar).`;
  }

  const figures: Figure[] = Array.from({ length: n }, (_, i) => ({
    shape: shapes[i]!,
    fill: fills[i]!,
    count: counts[i]!,
    rotation: 0,
  }));

  const label = "ABCDE"[oddPos]!;
  return {
    category: "oddone",
    difficulty,
    seed,
    prompt: "Qual figura não pertence ao grupo?",
    visual: { kind: "row", figures },
    options: figures.map((_, i) => ({ kind: "text", text: "ABCDE"[i]! })),
    answer: oddPos,
    rule: explanation,
    steps: [
      "Compara um atributo de cada vez: forma, preenchimento, quantidade (e a paridade da quantidade).",
      vary
        ? "Os atributos que variam aparecem sempre em pelo menos duas figuras — não servem para isolar nenhuma."
        : "Os outros atributos são iguais em todas as figuras.",
      explanation,
      `Resposta: figura ${label}.`,
    ],
  };
}
