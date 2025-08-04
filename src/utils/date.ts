import { format, differenceInDays, parseISO } from 'date-fns';

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy');
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy HH:mm');
};

export const formatDateForInput = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
};

export const getDaysUntilDeadline = (deadline: Date | string): number => {
  const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : deadline;
  return differenceInDays(deadlineDate, new Date());
};

export const isOverdue = (deadline: Date | string): boolean => {
  return getDaysUntilDeadline(deadline) < 0;
};