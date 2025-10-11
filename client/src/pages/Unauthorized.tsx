// client/src/pages/Unauthorized.tsx
export function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-4">
      <h1 className="text-4xl font-bold text-destructive">Acesso Negado</h1>
      <p className="text-muted-foreground">
        Você não tem permissão para acessar esta página.
      </p>
      <a
        href="/"
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
      >
        Voltar à Página Inicial
      </a>
    </div>
  );
}
