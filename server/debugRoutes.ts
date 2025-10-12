// server/debugRoutes.ts

import type { Express } from "express";

// ⚠️ Import com extensão .js por causa do Node16 ESM
import { app } from "./server.js";

/**
 * Percorre a stack do Express para listar rotas e métodos.
 * Suporta routers aninhados (app.use('/', basicRoutes) etc).
 */
function extractRoutes(stack: any, prefix = ""): Array<{ method: string; path: string }> {
  const routes: Array<{ method: string; path: string }> = [];

  if (!Array.isArray(stack)) return routes;

  for (const layer of stack) {
    if (layer.route && layer.route.path) {
      const path = prefix + layer.route.path;
      const methods = Object.keys(layer.route.methods || {}).map((m) => m.toUpperCase());
      for (const method of methods) {
        routes.push({ method, path });
      }
    } else if (layer.name === "router" && layer.handle?.stack) {
      const subPrefix = prefix + (layer.regexp?.fast_slash ? "" : layer.regexp?.toString().includes("\\/?(?=\\/|$)") ? "" : "");
      // Tenta obter o caminho montado se disponível
      const mountPath = (layer.regexp && layer.regexp.fast_star) ? "*" : (layer?.path || "");
      // Em muitos casos, o Express não expõe path direto; então seguimos sem prefix extra
      routes.push(...extractRoutes(layer.handle.stack, prefix));
    }
  }

  return routes;
}

function listAllRoutes(app: Express) {
  const routes = extractRoutes((app as any)?._router?.stack || []);
  console.log("📋 Rotas registradas:");
  if (routes.length === 0) {
    console.log("(nenhuma rota encontrada — verifique se o app montou os routers antes desta listagem)");
    return;
  }
  for (const r of routes) {
    console.log(`${r.method.padEnd(6)} ${r.path}`);
  }
}

// Execução
console.log("✅ Aplicação carregada com sucesso!");
listAllRoutes(app);
