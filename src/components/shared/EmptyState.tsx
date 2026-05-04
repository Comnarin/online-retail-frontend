export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: any;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center">
      <div className="w-14 h-14 rounded-xl bg-main-bg border border-surface-border flex items-center justify-center text-text-faint mb-4">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <p className="font-display text-[15px] font-bold text-main-text">{title}</p>
      {description && <p className="text-[13px] text-text-muted mt-1 max-w-[280px] leading-relaxed mb-6">{description}</p>}
      {action}
    </div>
  );
}
