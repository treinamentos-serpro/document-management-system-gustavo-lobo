---
description: Revisar código de um módulo específico do backend.
name: revisar
argument-hint: caminho do modulo (ex. backend/src/services/documents.service.js)
agent: agent
---

# Revisar módulo do backend

Revisar código indicando problemas e sugerindo melhorias para o módulo `${input:modulo:caminho do modulo}`.

Requisitos:

- Revise códigos garantindo a legibilidade e padronização.
- Verifique a correta separação de responsabilidades entre camadas.
- Assegure que o fluxo de dependência `routes -> controllers -> services -> repositories` seja respeitado.
- Verifique se os testes estão cobrindo os casos principais de forma isolada e legível e indicam corretamente o comportamento esperado, estando este comportamento de acordo com o requisito.
- Garanta que os testes não dependam de serviços externos e utilizem o filesystem local quando necessário.
- Verifique se o módulo segue as convenções de codificação do projeto.
- Indique melhorias e correções necessárias para o módulo analisado.
- Verifique a possibilidade de diminuição de complexidade do módulo, buscando simplificação e clareza no código.
- Avalie se há oportunidades de refatoração para melhorar a manutenção e extensibilidade do módulo.
- Verifique se o módulo possui tratamento adequado de erros e validações necessárias.
- Avalie se o módulo está seguindo boas práticas de segurança, como validação de entrada e proteção contra vulnerabilidades comuns.
