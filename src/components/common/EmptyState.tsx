import { FileQuestion, Inbox, Search, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type EmptyStateAction = {
  label: string;
  onClick: () => void;
};

type EmptyStateProps = {
  icon?: 'inbox' | 'search' | 'file' | 'error';
  title: string;
  description?: string;
  action?: EmptyStateAction | React.ReactNode;
  className?: string;
};

const icons = {
  inbox: Inbox,
  search: Search,
  file: FileQuestion,
  error: AlertCircle,
};

function isActionObject(action: EmptyStateAction | React.ReactNode): action is EmptyStateAction {
  return (
    typeof action === 'object' &&
    action !== null &&
    'label' in action &&
    'onClick' in action
  );
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = icons[icon];

  const renderAction = () => {
    if (!action) return null;

    if (isActionObject(action)) {
      return (
        <Button onClick={action.onClick}>{action.label}</Button>
      );
    }

    return action;
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
    >
      <div className="mb-4 rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{renderAction()}</div>}
    </div>
  );
}
