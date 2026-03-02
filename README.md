# Gisela Pilates · Website completo com Supabase

Website multi-página para estúdio de Pilates com design premium/minimalista (inspirado em estúdios modernos), responsivo e área de cliente com autenticação.

## Stack sugerida e usada
- **Frontend:** HTML5, CSS3 e JavaScript (vanilla)
- **Backend & DB:** Supabase (Auth + PostgreSQL + RLS)

## Estrutura do projeto
- `index.html` — Página inicial
- `servicos.html` — Serviços, planos e promoções
- `marcacoes.html` — Fluxo de marcações
- `cliente.html` — Login/registo, recuperação de senha, criar/listar/cancelar marcações
- `sobre.html` — História e equipa
- `contacto.html` — Formulário, mapa e contactos
- `assets/styles.css` — Estilos globais
- `js/main.js` — Conteúdo reutilizável (serviços/planos + navegação)
- `js/supabaseClient.js` — Configuração Supabase client
- `js/booking.js` — Autenticação + marcações
- `supabase/schema.sql` — SQL completo (tabelas, triggers, RLS e seed)

## Configuração rápida
1. Criar projeto no Supabase.
2. Abrir SQL Editor e executar `supabase/schema.sql`.
3. Em `js/supabaseClient.js`, preencher:
   - `YOUR_SUPABASE_URL`
   - `YOUR_SUPABASE_ANON_KEY`
4. Ativar envio de e-mail no Supabase Auth (templates e SMTP).
5. Servir localmente:

```bash
python -m http.server 4173
```

Aceder em `http://localhost:4173`.

## Funcionalidades implementadas
- Landing page profissional com CTAs para marcação e planos.
- Página de serviços com preços editáveis (via `js/main.js`).
- Área do cliente:
  - registo e login por e-mail/senha;
  - recuperação de senha;
  - criação de marcação (tipo de aula, professor, data, hora);
  - listagem de próximas aulas;
  - cancelamento da aula.
- Página Sobre com história + imagem do estúdio.
- Página Contacto com formulário + mapa + redes/telefone/e-mail.

## Notas importantes
- Reagendamento pode ser feito facilmente alterando o estado atual para permitir update de data/hora no `booking.js`.
- Confirmação por e-mail pode ser automatizada com **Supabase Edge Functions** + trigger em `appointments` (opcional).
