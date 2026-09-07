interface AppHeaderProps {
  title?: string;
}

export function AppHeader({
  title = 'LinkedIn Profile Search',
}: AppHeaderProps) {
  return (
    <header className="border-b bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center px-4 py-5 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h1>
      </div>
    </header>
  );
}
