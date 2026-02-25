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
    <header className="mb-6 rounded-full shadow-2xl opacity-100 border border-solid border-sidebar-border py-0 px-[50px] ml-[200px] pr-[50px] mt-[10px] mr-[80px] my-px mx-[100px]">
      {backTo &&
      <button
        onClick={() => navigate(backTo)}
        className="gap-2 transition-colors mb-3 text-sm text-destructive border-none opacity-100 rounded shadow-xl flex items-center justify-center my-[10px] mx-[15px] px-[15px]">رجـــــــوع

        <ArrowRight className="w-4 h-4 text-destructive" />
          رجوع
        </button>
      }
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
    </header>);

};

export default PageHeader;