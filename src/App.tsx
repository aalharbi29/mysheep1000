import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LivestockProvider } from "@/context/LivestockContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import DebtReminder from "@/components/DebtReminder";
import SellerOrderNotification from "@/components/SellerOrderNotification";
import VaccinationReminder from "@/components/VaccinationReminder";
import SyncStatusIndicator from "@/components/SyncStatusIndicator";
import SplashScreen from "@/components/SplashScreen";
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
import SummaryFlockPage from "./pages/SummaryFlockPage";
import SummaryBirthsPage from "./pages/SummaryBirthsPage";
import SummarySalesPage from "./pages/SummarySalesPage";
import SummaryPurchasesPage from "./pages/SummaryPurchasesPage";
import SummaryExpensesPage from "./pages/SummaryExpensesPage";
import ReportsPage from "./pages/ReportsPage";
import MarketPage from "./pages/MarketPage";
import MarketSellPage from "./pages/MarketSellPage";
import MarketBuyPage from "./pages/MarketBuyPage";
import SellLivestockPage from "./pages/SellLivestockPage";
import SellCarPage from "./pages/SellCarPage";
import SellGoodsPage from "./pages/SellGoodsPage";
import MyListingsPage from "./pages/MyListingsPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import ConversationsPage from "./pages/ConversationsPage";
import ChatPage from "./pages/ChatPage";
import StorePage from "./pages/StorePage";
import StoreProductPage from "./pages/StoreProductPage";
import StoreCartPage from "./pages/StoreCartPage";
import StoreOrdersPage from "./pages/StoreOrdersPage";
import StoreAddProductPage from "./pages/StoreAddProductPage";
import MyProductsPage from "./pages/MyProductsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashComplete = useCallback(() => setSplashDone(true), []);

  if (!splashDone) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

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
      <VaccinationReminder />
      <SellerOrderNotification />
      <SyncStatusIndicator />
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
          <Route path="/summary/flock" element={<SummaryFlockPage />} />
          <Route path="/summary/births" element={<SummaryBirthsPage />} />
          <Route path="/summary/sales" element={<SummarySalesPage />} />
          <Route path="/summary/purchases" element={<SummaryPurchasesPage />} />
          <Route path="/summary/expenses" element={<SummaryExpensesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/market/sell" element={<MarketSellPage />} />
          <Route path="/market/buy" element={<MarketBuyPage />} />
          <Route path="/market/sell/livestock" element={<SellLivestockPage />} />
          <Route path="/market/sell/car" element={<SellCarPage />} />
          <Route path="/market/sell/goods" element={<SellGoodsPage />} />
          <Route path="/market/my-listings" element={<MyListingsPage />} />
          <Route path="/market/listing/:id" element={<ListingDetailPage />} />
          <Route path="/market/conversations" element={<ConversationsPage />} />
          <Route path="/market/chat/:conversationId" element={<ChatPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/store/product/:id" element={<StoreProductPage />} />
          <Route path="/store/cart" element={<StoreCartPage />} />
          <Route path="/store/orders" element={<StoreOrdersPage />} />
          <Route path="/store/add-product" element={<StoreAddProductPage />} />
          <Route path="/store/my-products" element={<MyProductsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
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
