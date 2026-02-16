import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
}

const PageHeader = ({ title, subtitle, backTo }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="mb-6">
      {backTo && (
        <button
          onClick={() => navigate(backTo)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3 text-sm"
        >
          <ArrowRight className="w-4 h-4" />
          رجوع
        </button>
      )}
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
    </header>
  );
};

export default PageHeader;
