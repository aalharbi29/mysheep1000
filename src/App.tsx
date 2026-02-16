import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LivestockProvider } from "@/context/LivestockContext";
import Dashboard from "./pages/Dashboard";
import FlockPage from "./pages/FlockPage";
import BreedPage from "./pages/BreedPage";
import AnimalCardsPage from "./pages/AnimalCardsPage";
import AnimalDetailPage from "./pages/AnimalDetailPage";
import ExpensesPage from "./pages/ExpensesPage";
import SalesPage from "./pages/SalesPage";
import PurchasesPage from "./pages/PurchasesPage";
import SummaryPage from "./pages/SummaryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LivestockProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/animal/:id" element={<AnimalDetailPage />} />
            <Route path="/flock/sheep/:breed" element={<AnimalCardsPage />} />
            <Route path="/flock/sheep" element={<BreedPage />} />
            <Route path="/flock/goat" element={<AnimalCardsPage />} />
            <Route path="/flock" element={<FlockPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LivestockProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
