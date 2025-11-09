export const getColors = (colorClass: string) => {
  const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
    'bg-green-500': { bg: '#10B981', border: '#10B981', icon: '#10B981' },
    'bg-blue-500': { bg: '#3B82F6', border: '#3B82F6', icon: '#3B82F6' },
    'bg-purple-500': { bg: '#8B5CF6', border: '#8B5CF6', icon: '#8B5CF6' },
  };
  return colorMap[colorClass] || { bg: '#4F46E5', border: '#4F46E5', icon: '#4F46E5' };
};