export default function DashboardGreeting({
  userName,
}: {
  userName: string | null;
}) {
  return userName ? `Welcome back, ${userName}` : "Welcome back";
}
