# 🔒 Security Notice

## Credenciais Expostas no Histórico do Git (Resolvido)

### O que Aconteceu
Durante o desenvolvimento, arquivo `.env.production` com credenciais de banco de dados foi acidentalmente commitado ao repositório Git.

### O que Foi Feito ✅
1. **Removido do rastreamento**: `git rm --cached .env.production` 
2. **Adicionado ao .gitignore**: `.env.production` agora está ignorado
3. **Commits subsequentes limpos**: Nenhuma credencial em commits recentes

### Status Atual
- ✅ Nenhuma credencial em código TypeScript/JavaScript
- ✅ `.env*` files estão no `.gitignore`
- ✅ Arquivo removido do HEAD (branch atual)
- ⚠️ Credenciais ainda podem estar no histórico antigo do git

### Recomendações de Segurança

1. **Revogar/Rotacionar Credenciais de Produção** (URGENTE)
   ```bash
   # No VPS ou no painel de controle:
   # - Trocar senha do usuário PostgreSQL "postgres"
   # - Regenerar AUTH_SECRET se necessário
   ```

2. **Se Necessário Limpar Histórico** (operação avançada)
   ```bash
   # Use bfg-repo-cleaner para remover dados sensíveis
   # Isso reescreve TODO o histórico do git
   bfg --replace-all 98e4b91c441a
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --mirror --force
   ```
   **AVISO**: Isso quebra branches existentes de outros usuários!

3. **Para Futuros Desenvolvimentos**
   - Sempre adicionar arquivos `.env*` ao `.gitignore` ANTES de commitar
   - Usar `git secrets` ou `pre-commit` hooks para detectar credenciais
   - Fazer code review antes de mergear

### Credenciais Expostas (DEVEM SER ROTACIONADAS)
- `DATABASE_URL` com password do PostgreSQL
- `AUTH_SECRET` (pode ser considerado "rotação padrão")

### Links Úteis
- [Git Secrets Prevention](https://github.com/awslabs/git-secrets)
- [Pre-commit Hooks](https://pre-commit.com/)
- [BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

---

**Data**: 2026-05-22
**Status**: ⚠️ Credenciais precisam ser rotacionadas na produção
**Ação Requirida**: Trocar senha do PostgreSQL e regenerar AUTH_SECRET
