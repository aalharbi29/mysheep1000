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
    <header className="rounded-full shadow-2xl opacity-100 border pt-0 px-[15px] pr-0 pl-0 mx-0 ml-[15px] mr-[15px] my-[15px] py-px border-dashed border-secondary-foreground mt-[20px] mb-[20px]">
      {backTo &&
      <button
        onClick={() => navigate(backTo)}
        className="transition-colors mb-3 text-primary border-none opacity-100 rounded mx-[15px] px-[15px] pr-[15px] mr-[25px] hover:opacity-80 text-center font-extrabold text-2xl pt-[5px] shadow-2xl flex-row flex items-center justify-center gap-[8px] my-0 py-px pb-0">
          رجوع <ArrowRight className="w-5 h-5 text-primary" />
        </button>
      }
      <h1 className="text-foreground font-extrabold text-center mx-[50px] text-2xl">{title}</h1>
      {subtitle && <p className="text-muted-foreground mt-1 text-center mx-[50px] mb-[5px] mr-[50px] font-extrabold text-sm">{subtitle}</p>}
    </header>);

};

export default PageHeader;