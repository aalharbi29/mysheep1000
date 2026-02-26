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
    <header className="mb-6 rounded-full shadow-2xl opacity-100 border border-solid border-sidebar-border py-0 mt-[10px] pt-0 px-[15px] my-0 pr-0 pl-0 mx-0 ml-[15px] mr-[15px]">
      {backTo &&
      <button
        onClick={() => navigate(backTo)}
        className="gap-2 transition-colors mb-3 text-primary border-none opacity-100 rounded shadow-md my-[10px] mx-[15px] px-[15px] flex items-center justify-center text-center pr-[15px] mr-[25px] text-lg font-bold hover:opacity-80">
          رجوع <ArrowRight className="w-5 h-5 text-primary" />
        </button>
      }
      <h1 className="text-foreground font-extrabold text-center mx-[50px] text-sm">{title}</h1>
      {subtitle && <p className="text-muted-foreground mt-1 text-sm font-medium text-center mx-[50px] mb-[5px] mr-[50px]">{subtitle}</p>}
    </header>);

};

export default PageHeader;