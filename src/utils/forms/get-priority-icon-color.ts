const getPriorityIconColor = (priority: string) => {
  const classes = {
    high: "text-destructive/80",
    medium: "text-amber-500/80",
    low: "text-sky-400/75",
  };
  return classes[priority as keyof typeof classes] || "text-muted-foreground";
};

export default getPriorityIconColor;
