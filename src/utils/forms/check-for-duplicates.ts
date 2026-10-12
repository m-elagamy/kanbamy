const hasDuplicateTitle = (
  title: string,
  items: { id: string; title: string }[],
  entityId?: string,
): boolean => {
  if (!title) return false;

  const normalizedTitle = title.trim().toLowerCase();

  return items.some(
    (item) =>
      item.id !== entityId && item.title.toLowerCase() === normalizedTitle,
  );
};

export default hasDuplicateTitle;
