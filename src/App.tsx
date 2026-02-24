import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LivestockProvider } from "@/context/LivestockContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import DebtReminder from "@/components/DebtReminder";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import FlockPage from "./pages/FlockPage";
import BreedPage from "./pages/BreedPage";
import SubCategoryPage from "./pages/SubCategoryPage";
import AnimalCardsPage from "./pages/AnimalCardsPage";
import AnimalDetailPage from "./pages/AnimalDetailPage";
import ExpensesPage from "./pages/ExpensesPage";
import SalesPage from "./pages/SalesPage";
import PurchasesPage from "./pages/PurchasesPage";
import SummaryPage from "./pages/SummaryPage";
import ReportsPage from "./pages/ReportsPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <LivestockProvider>
      <DebtReminder />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/animal/:id" element={<AnimalDetailPage />} />
          <Route path="/flock/sheep" element={<BreedPage />} />
          <Route path="/flock/sheep/:breed" element={<SubCategoryPage />} />
          <Route path="/flock/sheep/:breed/:subCategory" element={<AnimalCardsPage />} />
          <Route path="/flock/goat" element={<BreedPage />} />
          <Route path="/flock/goat/:breed" element={<SubCategoryPage />} />
          <Route path="/flock/goat/:breed/:subCategory" element={<AnimalCardsPage />} />
          <Route path="/flock" element={<FlockPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/purchases" element={<PurchasesPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </LivestockProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
