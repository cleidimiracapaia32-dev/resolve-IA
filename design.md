# Resolve-IA — Design

Plataforma web de treino para provas psicotécnicas e testes de aptidão. Banco infinito de exercícios gerados (matrizes, séries, letras, intrusa, analogias, cálculo), simulados cronometrados, Tutor IA que explica exercícios de estudo a partir de imagem, estatísticas por área e planos Free/Pro/Institucional.

Direção visual: **terminal de instrumentação** — escuro, azul elétrico, denso, com grelhas finas e dados em monoespaçada. Parece um painel de controlo, não um site de marketing.

## Brand & Colors (dark only)

| Token | Value | Use |
|-------|-------|-----|
| background | #070B14 | Fundo da página |
| surface / card | #0C1322 | Painéis |
| surface-2 | #111A2E | Painéis elevados, hover |
| border | #1C2A45 | Linhas finas (1px) |
| foreground | #E6EDF7 | Texto principal |
| muted | #7C8BA6 | Texto secundário, labels |
| primary | #2F7BFF | Ações, foco, seleção |
| primary-bright | #6AA6FF | Texto de destaque sobre escuro |
| cyan | #22D3EE | Acento secundário (dados, gráficos) |
| success | #22C55E | Resposta certa |
| danger | #F43F5E | Resposta errada / erros |
| warn | #F5B544 | Limites do plano |

Fundo: grelha de 32px em `#1C2A45` a 35% de opacidade + brilho radial azul no topo.

## Typography

- Display: **Sora** 600/700 — títulos, números grandes.
- Body: **IBM Plex Sans** 400/500.
- Data: **JetBrains Mono** 400/500 — contadores, percentagens, labels de sistema (uppercase, tracking 0.12em, 11px).

## Layout

- App: sidebar fixa 232px (ícone + label) à esquerda, conteúdo denso com painéis de borda 1px, raio 6px (pouco arredondado).
- Landing: hero assimétrico com uma matriz 3×3 animada a resolver-se, secção de categorias em lista tipo tabela, planos em colunas lado a lado.
- Espaçamento base 4px; painéis com padding 20px; gaps 12–16px.

## Components

- `Panel`: bg surface, border, header com label mono uppercase.
- `Stat`: número grande em Sora + label mono.
- Botões: primary sólido azul, ghost com border; altura 36px; raio 6px.
- Opções de exercício: grelha de botões com letra mono (A, B, C…) no canto; estado certo/errado com borda verde/vermelha.
- Figuras (matrizes): SVG gerado a partir de {shape, count, fill, rotation}; traço #E6EDF7, preenchimento sólido ou riscado (pattern).

## Pages

- `/` landing pública
- `/entrar` login/registo (Google + email/password)
- `/app` painel (stats, uso do plano, recomendações, simulados recentes)
- `/app/treino` treino livre por categoria e nível
- `/app/simulado` configurar simulado · `/app/simulado/:id` executar e ver resultados
- `/app/tutor` Tutor IA: carregar imagem de exercício de estudo → explicação passo a passo
- `/app/planos` planos e uso

## Motion

Uma entrada orquestrada por página (fade + 8px rise, stagger 40ms). Feedback de resposta instantâneo. Sem animações decorativas no app.

## Uso responsável

Resolve-IA é uma ferramenta de **preparação**. Texto visível na landing e no Tutor: feito para treinar antes da prova; não deve ser usado durante exames reais.
