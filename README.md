# 🧭 Sistema de Gestão Acadêmica — Professor, Secretaria e Coordenação

![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-lightblue?style=for-the-badge&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-API-grey?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-darkgreen?style=for-the-badge&logo=mongodb)
![Vite](https://img.shields.io/badge/Vite-React_App-purple?style=for-the-badge&logo=vite)
![Axios](https://img.shields.io/badge/Axios-Interceptor-yellow?style=for-the-badge&logo=axios)

---

## 📘 Descrição Geral

Este sistema acadêmico foi projetado para **integrar as três principais jornadas da vida escolar** — o **professor**, a **secretaria** e a **coordenação pedagógica** — dentro de uma plataforma web unificada, moderna e escalável.

O foco é **otimizar fluxos pedagógicos e administrativos**, oferecendo **dashboards inteligentes**, **visualização analítica de dados educacionais**, e **painéis específicos para cada perfil de usuário**.

O projeto foi desenvolvido de forma incremental, com decisões cuidadosamente validadas a cada etapa, priorizando **segurança**, **consistência de dados** e **reuso de componentes** entre módulos.

---

## 🧩 Arquitetura Geral

```text
┌───────────────────────┐
│       Frontend        │  →  React + TypeScript + Vite
│  (Painéis Dinâmicos)  │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│        Backend         │  →  Node.js + Express + Mongoose
│ (APIs / Auth / Dados)  │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│       Banco de Dados   │  →  MongoDB (Atlas ou local)
│ (Turmas / Alunos / ...)│
└───────────────────────┘

---

## 🎓 Jornada do Professor

O Painel do Professor permite visualizar disciplinas atribuídas, turmas, e atividades geradas.
Cada professor acessa apenas suas próprias turmas, garantindo segurança e isolamento de dados.

## ✳️ Funcionalidades Principais

Exibição das disciplinas atribuídas.

Acesso às turmas e suas respectivas notas.

Visualização e controle de atividades.

Comunicação com a coordenação via painel.

Feedback instantâneo sobre validações realizadas.

## 🧠 Decisões Técnicas

Integração via Axios com interceptador JWT (renovação automática de token).

Estrutura de estado em ProfessorDashboard.tsx usando useState e useEffect otimizados.

Comunicação reativa com o backend através de rotas REST /api/professor/....

Renderização condicional e fallback seguro para cenários sem dados.

___

## 🗂️ Jornada da Secretaria Acadêmica

A Secretaria é o núcleo administrativo do sistema, responsável pela gestão de alunos, turmas e disciplinas.
Seu painel exibe métricas quantitativas e taxas agregadas de desempenho.

## ✳️ Funcionalidades Principais

Exibição consolidada de número de turmas, alunos ativos, transferidos e evadidos.

Gerenciamento de turmas: criação, atualização e vínculo de alunos.

Gerenciamento de alunos: atualização de status (ativo, transferido, evadido).

Taxas de aprovação por turma: visualizadas em gráficos dinâmicos.

Relatórios dinâmicos com cálculos percentuais de aprovação, reprovação e evasão.

___

## ⚙️ Estrutura Técnica Unificada (stats)

Durante o desenvolvimento, a Secretaria passou por várias iterações até atingir o padrão atual, inspirado no painel da Coordenação.
A versão final consolida todas as métricas em um objeto de estado unificado:

```javascript
const [stats, setStats] = useState({
  resumo: {},
  taxas: {},
});
```

Esse modelo garante:

Reuso de componentes visuais.

Sincronização entre painéis.

Padronização das chamadas assíncronas (Promise.all).

Maior robustez em atualizações simultâneas.

___

## 📊 Visualização de Dados

Utilização de Recharts (BarChart, ResponsiveContainer) para visualização das taxas de aprovação.

Cores e feedbacks visuais padronizados.

Fallbacks informativos para ausência de dados.

Compatibilidade retroativa com diferentes formatos de resposta da API.

___

## 🧭 Jornada da Coordenação Pedagógica

A Coordenação Pedagógica é o centro analítico e avaliativo da instituição, acompanhando o desempenho docente e validando atividades geradas pelos professores.

## ✳️ Funcionalidades Principais

Exibição de indicadores gerais:

Atividades geradas

Atividades validadas

Pendentes

Professores ativos

Distribuição analítica de atividades por turma.

Visualização detalhada e revisão de atividades via modal (AiActivityModal).

Integração direta com os serviços de IA para análise de atividades.

____

## 🧩 Arquitetura do Painel

O CoordinationDashboard.tsx centraliza os dados no objeto stats:

const [stats, setStats] = useState<any>({});

Com ele, o painel:

Unifica informações vindas de múltiplas rotas (getCoordDashboard, getCoordActivities).

Renderiza dashboards dinâmicos baseados em stats.turmasAnalytics.

Garante consistência visual com a Secretaria via componentes compartilhados (AnalyticsCard, ClassAnalytics).

___

## 🧠 Decisões Técnicas Centrais

| Tema | Estratégia | Benefício |
| :--- | :--- | :--- |
| **Estado global (stats)** | Unificação de `resumo` + `taxas` | Consistência e manutenção simplificada |
| **Async Parallel Load** | `Promise.all([...])` em ambos dashboards | Reduz latência e melhora performance |
| **Interceptadores Axios** | Renovação automática de tokens | Fluxo seguro e contínuo |
| **Tipagem genérica segura** | `useState<any>` e `Record<string, any>` | Flexibilidade controlada |
| **Fallbacks visuais** | Mensagens condicionais ("Nenhuma atividade...") | Experiência amigável |
| **Recharts** | Visualização moderna e responsiva | Clareza e impacto visual |
| **Padrão REST seguro** | Rotas com `requireUser()` e papéis (`admin`, `secretaria`, `professor`) | Controle de acesso refinado |

___

## 🧮 Backend — SecretariaService

A API da Secretaria evoluiu para incluir cálculos inteligentes de desempenho:

getDashboardGeral() → retorna totais de alunos, turmas e status.

getTaxasAprovacao() → calcula percentuais de aprovação, reprovação e evasão por turma.

Populações Mongoose otimizadas:

A rota busca uma turma específica e popula os dados dos alunos, retornando apenas os campos necessários para a exibição na interface.

```javascript
// Exemplo de busca em um controller
const turma = await Turma.findById(req.params.id)
  .populate("alunos", "nome ativo transferido abandono status");
```
Compatibilidade com múltiplos formatos de dados (status, abandono, transferido).

## 🧠 Evolução e Ciclo de Iterações

- **Fase inicial:** Dashboards isolados (dash, taxas separados).
- **Fase intermediária:** Correções de regressões e tratamento de 404 (rotas não existentes).
- **Fase de consolidação:** Padronização de stats com `Promise.all`.
- **Fase analítica:** Integração visual de gráficos dinâmicos (Recharts).
- **Fase de integração total:** Sincronização entre coordenação e secretaria.

---

## 🧪 Estado Atual

- ✅ **CoordinationDashboard:** Exibe análises completas por turma e pendências.
- ✅ **SecretariaDashboard:** Exibe dados gerais e gráficos de aprovação.
- ✅ **ProfessorDashboard:** Exibe disciplinas e atividades corretamente.
- ✅ **API:** Protegida por papéis (`auth.requireUser`).
- ✅ **Rotas REST:** Unificadas sob `/api/secretaria` e `/api/coordenacao`.
- ✅ **Autenticação:** Interceptors Axios funcionando com refresh de token.

---

## 🚀 Próximas Etapas
- ✅ **Dashboard consolidado da instituição (visão global).**
- ✅ **Geração automática de relatórios PDF (exportação).**
- ✅ **Integração com módulos financeiros e de frequência.**
- ✅ **Indicadores pedagógicos (IDEB, notas médias, evasão histórica).**

___

## 🧩 Estrutura de Pastas (Frontend)

client/
├── src/
│   ├── api/
│   │   ├── api.ts                 # Axios + interceptores
│   │   ├── secretaria.ts          # Rotas da Secretaria
│   │   └── coord.ts               # Rotas da Coordenação
│   ├── pages/
│   │   ├── ProfessorDashboard.tsx
│   │   ├── SecretariaDashboard.tsx
│   │   └── CoordinationDashboard.tsx
│   ├── components/
│   │   ├── grades/
│   │   │   ├── AnalyticsCard.tsx
│   │   │   └── ClassAnalytics.tsx
│   │   ├── ui/
│   │   │   ├── card.tsx
│   │   │   └── button.tsx
│   │   └── AiActivityModal.tsx
│   └── utils/
│       └── authContext.tsx

___

## 🧠 Conclusão

Este sistema representa a convergência entre gestão acadêmica, análise pedagógica e automação inteligente.
Ele reflete um desenvolvimento iterativo, com decisões técnicas maduras, padrões reutilizáveis e integração profunda entre áreas administrativas e pedagógicas.

___

**Autor:** Leonardo Maximino Bernardo
**Stack:** React • TypeScript • Express • MongoDB • Axios • Recharts
**Ano:** 2025

___
