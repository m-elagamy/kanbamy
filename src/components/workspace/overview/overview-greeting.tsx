export default function OverviewGreeting({
  userName,
}: {
  userName: string | null;
}) {
  return userName ? `Welcome back, ${userName}` : "Welcome back";
}
