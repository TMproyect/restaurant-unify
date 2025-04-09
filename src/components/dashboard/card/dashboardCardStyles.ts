
export const getCardGradient = (icon: string): { bg: string, iconBg: string, textColor: string } => {
  switch (icon) {
    case 'dollar-sign':
      return {
        bg: 'from-blue-50 to-purple-50',
        iconBg: 'from-blue-500 to-purple-500',
        textColor: 'text-purple-800'
      };
    case 'clipboard-list':
      return {
        bg: 'from-green-50 to-teal-50',
        iconBg: 'from-green-500 to-teal-500',
        textColor: 'text-teal-800'
      };
    case 'package':
      return {
        bg: 'from-amber-50 to-orange-50',
        iconBg: 'from-amber-500 to-orange-500',
        textColor: 'text-amber-800'
      };
    case 'users':
      return {
        bg: 'from-indigo-50 to-violet-50',
        iconBg: 'from-indigo-500 to-violet-500',
        textColor: 'text-indigo-800'
      };
    default:
      return {
        bg: 'from-gray-50 to-gray-100',
        iconBg: 'from-gray-500 to-gray-600',
        textColor: 'text-gray-800'
      };
  }
};
