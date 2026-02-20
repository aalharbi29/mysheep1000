import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LivestockProvider } from "@/context/LivestockContext";
import DebtReminder from "@/components/DebtReminder";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LivestockProvider>
        <Toaster />
        <Sonner />
        <DebtReminder />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/animal/:id" element={<AnimalDetailPage />} />
            {/* Sheep routes */}
            <Route path="/flock/sheep" element={<BreedPage />} />
            <Route path="/flock/sheep/:breed" element={<SubCategoryPage />} />
            <Route path="/flock/sheep/:breed/:subCategory" element={<AnimalCardsPage />} />
            {/* Goat routes */}
            <Route path="/flock/goat" element={<SubCategoryPage />} />
            <Route path="/flock/goat/:subCategory" element={<AnimalCardsPage />} />
            {/* Main */}
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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
