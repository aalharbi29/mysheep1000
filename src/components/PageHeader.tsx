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
    <header className="mb-6 bg-zinc-300">
      {backTo &&
      <button
        onClick={() => navigate(backTo)}
        className="gap-2 transition-colors text-center text-accent font-extrabold text-2xl bg-zinc-300 hover:bg-zinc-200 border-solid rounded-full opacity-100 shadow-2xl border-foreground border mx-[25px] my-[10px] px-[25px] py-[5px] pb-[5px] mb-px mr-[15px] ml-0 mt-0 items-center justify-center flex flex-row">

          <ArrowRight className="w-4 h-4" />
          رجوع
        </button>
      }
      <h1 className="text-2xl font-bold text-foreground text-center">{title}</h1>
      {subtitle && <p className="text-muted-foreground mt-1 text-center">{subtitle}</p>}
    </header>);

};

export default PageHeader;