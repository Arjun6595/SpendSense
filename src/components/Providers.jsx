import { useAuth } from "../contexts/AuthContext";
import { BudgetProvider } from "../contexts/BudgetContext";

export default function Providers({ children }) {
  const { user } = useAuth();

  return (
    <BudgetProvider user={user}>
      {children}
    </BudgetProvider>
  )
}
