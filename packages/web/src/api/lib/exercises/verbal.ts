import type { Solved } from "./types";
import { placeAnswer, type Rng } from "./rng";

interface Analogy {
  a: string;
  b: string;
  c: string;
  d: string;
  wrong: string[];
  rel: string;
  level: number;
}

const BANK: Analogy[] = [
  { a: "Pássaro", b: "Ninho", c: "Abelha", d: "Colmeia", wrong: ["Mel", "Flor", "Ferrão"], rel: "habitação do animal", level: 1 },
  { a: "Pé", b: "Sapato", c: "Mão", d: "Luva", wrong: ["Dedo", "Anel", "Braço"], rel: "o que veste/cobre a parte do corpo", level: 1 },
  { a: "Dia", b: "Sol", c: "Noite", d: "Lua", wrong: ["Escuro", "Sono", "Estrela"], rel: "astro associado ao período", level: 1 },
  { a: "Livro", b: "Ler", c: "Música", d: "Ouvir", wrong: ["Cantar", "Nota", "Rádio"], rel: "ação com que se usa", level: 1 },
  { a: "Frio", b: "Quente", c: "Alto", d: "Baixo", wrong: ["Grande", "Longe", "Largo"], rel: "antónimos", level: 1 },
  { a: "Médico", b: "Hospital", c: "Professor", d: "Escola", wrong: ["Aluno", "Livro", "Aula"], rel: "local de trabalho", level: 1 },
  { a: "Pintor", b: "Pincel", c: "Escritor", d: "Caneta", wrong: ["Livro", "Papel", "Leitor"], rel: "instrumento de trabalho", level: 2 },
  { a: "Semente", b: "Árvore", c: "Ovo", d: "Galinha", wrong: ["Ninho", "Gema", "Casca"], rel: "fase inicial → fase adulta", level: 2 },
  { a: "Termómetro", b: "Temperatura", c: "Balança", d: "Peso", wrong: ["Prato", "Equilíbrio", "Metro"], rel: "instrumento → grandeza que mede", level: 2 },
  { a: "Página", b: "Livro", c: "Tecla", d: "Teclado", wrong: ["Dedo", "Ecrã", "Letra"], rel: "parte → todo", level: 2 },
  { a: "Lobo", b: "Alcateia", c: "Peixe", d: "Cardume", wrong: ["Aquário", "Rio", "Barbatana"], rel: "animal → grupo coletivo", level: 2 },
  { a: "Água", b: "Sede", c: "Comida", d: "Fome", wrong: ["Prato", "Cozinha", "Sabor"], rel: "o que satisfaz → necessidade", level: 2 },
  { a: "Efémero", b: "Duradouro", c: "Escasso", d: "Abundante", wrong: ["Raro", "Pequeno", "Pobre"], rel: "antónimos (vocabulário avançado)", level: 3 },
  { a: "Cronómetro", b: "Tempo", c: "Odómetro", d: "Distância", wrong: ["Velocidade", "Carro", "Combustível"], rel: "instrumento → grandeza que mede", level: 3 },
  { a: "Arquiteto", b: "Planta", c: "Compositor", d: "Partitura", wrong: ["Orquestra", "Concerto", "Piano"], rel: "profissional → documento que produz", level: 3 },
  { a: "Erosão", b: "Rocha", c: "Ferrugem", d: "Ferro", wrong: ["Água", "Oxigénio", "Cor"], rel: "processo de desgaste → material afetado", level: 3 },
  { a: "Prólogo", b: "Livro", c: "Prelúdio", d: "Sinfonia", wrong: ["Maestro", "Final", "Nota"], rel: "introdução → obra", level: 3 },
  { a: "Sede", b: "Desidratação", c: "Cansaço", d: "Exaustão", wrong: ["Sono", "Descanso", "Cama"], rel: "estado leve → estado extremo", level: 3 },
];

export function genAnalogy(r: Rng, difficulty: number, seed: number): Solved {
  const pool = BANK.filter((x) => x.level === Math.min(3, Math.max(1, difficulty)));
  const item = r.pick(pool.length ? pool : BANK);
  const { options, answer } = placeAnswer(r, item.d, item.wrong, String);
  return {
    category: "analogies",
    difficulty,
    seed,
    prompt: "Completa a analogia:",
    visual: { kind: "text", text: `${item.a} está para ${item.b} assim como ${item.c} está para ___` },
    options: options.map((text) => ({ kind: "text", text })),
    answer,
    rule: `Relação: ${item.rel}.`,
    steps: [
      `Identifica a relação entre o primeiro par: ${item.a} → ${item.b} (${item.rel}).`,
      `Aplica a mesma relação a «${item.c}».`,
      `${item.c} → ${item.d}. As outras opções estão relacionadas com «${item.c}», mas não pela mesma relação.`,
    ],
  };
}
