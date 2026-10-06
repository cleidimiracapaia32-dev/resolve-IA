import type { Solved } from "./types";
import { placeAnswer, type Rng } from "./rng";

const textOpts = (vals: (string | number)[]) => vals.map((v) => ({ kind: "text" as const, text: String(v) }));

function numberDistractors(r: Rng, correct: number, hints: number[]) {
  const pool = [...hints, correct + 1, correct - 1, correct + 2, correct - 2, correct * 2, correct + r.int(3, 9)];
  return r.shuffle(pool.filter((v) => v !== correct)).slice(0, 6);
}

export function genSeries(r: Rng, difficulty: number, seed: number): Solved {
  type Kind = "arith" | "geom" | "growing" | "alternate" | "fib" | "squares";
  const kinds: Kind[] =
    difficulty <= 1 ? ["arith", "geom"] : difficulty === 2 ? ["growing", "geom", "alternate"] : ["fib", "squares", "alternate", "growing"];
  const kind = r.pick(kinds);
  let terms: number[] = [];
  let rule = "";
  let steps: string[] = [];

  if (kind === "arith") {
    const a = r.int(2, 30);
    const d = r.pick([2, 3, 4, 5, 6, 7, 9, 11, -3, -4]);
    terms = Array.from({ length: 6 }, (_, i) => a + d * i);
    rule = `Progressão aritmética: soma-se ${d} a cada termo.`;
    steps = [`Diferenças: ${terms.slice(1, 5).map((t, i) => t - terms[i]!).join(", ")} — sempre ${d}.`, `${terms[4]} + (${d}) = ${terms[5]}.`];
  } else if (kind === "geom") {
    const a = r.int(1, 5);
    const q = r.pick([2, 3]);
    terms = Array.from({ length: 6 }, (_, i) => a * q ** i);
    rule = `Progressão geométrica: multiplica-se por ${q}.`;
    steps = [`Cada termo é o anterior × ${q}.`, `${terms[4]} × ${q} = ${terms[5]}.`];
  } else if (kind === "growing") {
    const a = r.int(1, 15);
    const d0 = r.int(1, 4);
    const inc = r.pick([1, 2]);
    terms = [a];
    for (let i = 1; i < 6; i++) terms.push(terms[i - 1]! + d0 + inc * (i - 1));
    const diffs = terms.slice(1).map((t, i) => t - terms[i]!);
    rule = `As diferenças entre termos crescem ${inc} de cada vez.`;
    steps = [`Diferenças: ${diffs.slice(0, 4).join(", ")} → próxima diferença ${diffs[4]}.`, `${terms[4]} + ${diffs[4]} = ${terms[5]}.`];
  } else if (kind === "alternate") {
    const a = r.int(2, 20);
    const p = r.int(2, 6);
    const q = r.pick([-1, -2, 2]);
    terms = [a];
    for (let i = 1; i < 7; i++) terms.push(i % 2 === 1 ? terms[i - 1]! + p : q > 0 ? terms[i - 1]! * q : terms[i - 1]! + q);
    terms = terms.slice(0, 6);
    const op2 = q > 0 ? `× ${q}` : `${q}`;
    rule = `Duas operações alternadas: +${p}, depois ${op2}.`;
    steps = [`Padrão: +${p}, ${op2}, +${p}, ${op2}…`, `O último passo foi «${op2}», então agora é «+${p}»: ${terms[4]} + ${p} = ${terms[5]}.`];
  } else if (kind === "fib") {
    const a = r.int(1, 5);
    const b = r.int(a, a + 5);
    terms = [a, b];
    for (let i = 2; i < 6; i++) terms.push(terms[i - 1]! + terms[i - 2]!);
    rule = "Cada termo é a soma dos dois anteriores (tipo Fibonacci).";
    steps = [`${terms[2]} = ${terms[0]} + ${terms[1]}, ${terms[3]} = ${terms[1]} + ${terms[2]}…`, `${terms[3]} + ${terms[4]} = ${terms[5]}.`];
  } else {
    const off = r.int(0, 4);
    const k = r.pick([0, 1, -1, 2]);
    terms = Array.from({ length: 6 }, (_, i) => (i + 1 + off) ** 2 + k);
    rule = `Quadrados perfeitos${k ? ` ${k > 0 ? "+" : "−"} ${Math.abs(k)}` : ""}.`;
    steps = [`Os termos são n² ${k ? (k > 0 ? `+ ${k}` : `− ${-k}`) : ""} para n = ${1 + off}, ${2 + off}, …`, `n = ${6 + off}: ${(6 + off) ** 2}${k ? (k > 0 ? ` + ${k}` : ` − ${-k}`) : ""} = ${terms[5]}.`];
  }

  const correct = terms[5]!;
  const nOpts = difficulty <= 1 ? 4 : 5;
  const { options, answer } = placeAnswer(r, correct, numberDistractors(r, correct, [terms[4]! * 2 - terms[3]!]).slice(0, nOpts - 1), String);

  return {
    category: "series",
    difficulty,
    seed,
    prompt: "Qual é o próximo número da sequência?",
    visual: { kind: "sequence", terms: [...terms.slice(0, 5).map(String), "?"] },
    options: textOpts(options),
    answer,
    rule,
    steps,
  };
}

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function genLetters(r: Rng, difficulty: number, seed: number): Solved {
  const step = difficulty <= 1 ? r.pick([1, 2, 3]) : r.pick([2, 3, 4, 5]);
  const start = r.int(0, 25 - step * 5 < 0 ? 0 : 25 - step * 5);
  const growing = difficulty >= 3 && r.next() < 0.6;
  const pos: number[] = [start];
  for (let i = 1; i < 6; i++) pos.push(pos[i - 1]! + (growing ? i : step));
  const wrap = (n: number) => ((n % 26) + 26) % 26;
  const letters = pos.map((p) => ALPHA[wrap(p)]!);
  const correct = letters[5]!;
  const cIdx = wrap(pos[5]!);
  const distract = [cIdx + 1, cIdx - 1, cIdx + 2, wrap(pos[4]!) + step - 1, cIdx - 2].map((p) => ALPHA[wrap(p)]!);
  const nOpts = difficulty <= 1 ? 4 : 5;
  const { options, answer } = placeAnswer(r, correct, distract.slice(0, nOpts - 1), String);

  return {
    category: "letters",
    difficulty,
    seed,
    prompt: "Qual letra continua a série?",
    visual: { kind: "sequence", terms: [...letters.slice(0, 5), "?"] },
    options: textOpts(options),
    answer,
    rule: growing ? "O salto entre letras aumenta 1 posição de cada vez (+1, +2, +3…)." : `Avança-se ${step} posições no alfabeto a cada termo.`,
    steps: [
      `Posições no alfabeto (A=1): ${pos.slice(0, 5).map((p) => wrap(p) + 1).join(", ")}.`,
      growing ? `Saltos: +1, +2, +3, +4 → o próximo é +5.` : `Saltos constantes de +${step}.`,
      `Posição ${cIdx + 1} = ${correct}${pos[5]! > 25 ? " (o alfabeto recomeça depois do Z)" : ""}.`,
    ],
  };
}

export function genCalc(r: Rng, difficulty: number, seed: number): Solved {
  let text = "";
  let correct = 0;
  let steps: string[] = [];
  if (difficulty <= 1) {
    const a = r.int(12, 99);
    const b = r.int(11, 89);
    const c = r.int(2, 9);
    correct = a + b - c;
    text = `${a} + ${b} − ${c}`;
    steps = [`${a} + ${b} = ${a + b}`, `${a + b} − ${c} = ${correct}`];
  } else if (difficulty === 2) {
    const a = r.int(6, 19);
    const b = r.int(3, 9);
    const c = r.int(10, 60);
    correct = a * b + c;
    text = `${a} × ${b} + ${c}`;
    steps = ["Multiplicação antes da soma.", `${a} × ${b} = ${a * b}`, `${a * b} + ${c} = ${correct}`];
  } else {
    const pct = r.pick([15, 20, 25, 30, 40, 60, 75]);
    const base = r.pick([40, 60, 80, 120, 160, 200, 240, 360]);
    const add = r.int(3, 30);
    correct = (pct * base) / 100 + add;
    text = `${pct}% de ${base} + ${add}`;
    steps = [`${pct}% de ${base} = ${base} × ${pct / 100} = ${(pct * base) / 100}`, `${(pct * base) / 100} + ${add} = ${correct}`];
  }
  const { options, answer } = placeAnswer(r, correct, numberDistractors(r, correct, [correct + 10, correct - 10]).slice(0, 3), String);
  return {
    category: "calc",
    difficulty,
    seed,
    prompt: "Calcula mentalmente:",
    visual: { kind: "text", text: `${text} = ?` },
    options: textOpts(options),
    answer,
    rule: "Respeita a ordem das operações e decompõe em passos simples.",
    steps,
  };
}
