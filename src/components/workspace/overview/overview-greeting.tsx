export default async function OverviewGreeting({
  getUserName,
}: {
  getUserName?: () => Promise<string | null>;
}) {
  const userName = getUserName ? await getUserName() : null;
  return userName ? `Welcome back, ${userName}` : "Welcome back";
}
