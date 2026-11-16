export default function BackgroundEffect() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] bg-size-[18px_18px] opacity-[0.12] dark:bg-[radial-gradient(#4B5563_1px,transparent_1px)] dark:opacity-25" />
      <div className="from-primary/5 via-secondary/10 to-primary/5 dark:from-primary/10 dark:via-secondary/15 dark:to-primary/10 pointer-events-none absolute -top-12 left-1/2 -z-10 h-48 w-136 -translate-x-1/2 rounded-[50%] bg-linear-to-r blur-3xl" />
      <div className="via-primary/10 dark:via-primary/15 pointer-events-none absolute top-0 left-1/2 -z-10 h-20 w-88 -translate-x-1/2 rounded-[50%] bg-linear-to-r from-transparent to-transparent blur-2xl" />
      <div className="from-primary/5 via-background/30 to-secondary/5 dark:from-primary/10 dark:via-background/20 dark:to-secondary/10 absolute inset-0 -z-10 bg-linear-to-br" />
      <div className="auth-light-beam pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="auth-light-beam__atmosphere absolute top-[-16%] left-1/2 h-[125%] w-[min(78vw,58rem)] -translate-x-1/2" />
        <div className="auth-light-beam__diffusion absolute top-[-10%] left-1/2 h-[115%] w-[min(48vw,34rem)] -translate-x-1/2" />
        <div className="auth-light-beam__slit absolute top-[-8%] left-1/2 h-[108%] w-[min(24vw,13rem)] -translate-x-1/2" />
      </div>
    </div>
  );
}
