import { ArrowRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
}

const PageHeader = ({ title, subtitle, backTo }: PageHeaderProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <div className="mt-[20px] mb-[20px]">
      <div className="flex items-center justify-between mx-[15px] mb-2">
        {backTo ? (
          <button
            onClick={() => navigate(backTo)}
            className="transition-colors text-primary hover:opacity-80 font-extrabold text-xl flex items-center gap-1">
            رجوع <ArrowRight className="w-5 h-5 text-primary" />
          </button>
        ) : <div />}
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-destructive hover:opacity-80 transition-colors font-bold text-base px-3 py-2 rounded-lg border border-destructive/30 bg-destructive/10"
          title="تسجيل الخروج">
          <LogOut className="w-6 h-6" />
          خروج
        </button>
      </div>
      <header className="rounded-full shadow-2xl opacity-100 border pt-0 px-[15px] pr-0 pl-0 mx-0 ml-[15px] mr-[15px] py-px border-dashed border-secondary-foreground">
        <h1 className="text-foreground font-extrabold text-center mx-[50px] text-2xl">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1 text-center mx-[50px] mb-[5px] mr-[50px] font-extrabold text-sm">{subtitle}</p>}
      </header>
    </div>
  );
};

export default PageHeader;