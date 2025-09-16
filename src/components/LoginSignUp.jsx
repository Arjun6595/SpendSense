import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

export default function LoginSignUpForm() {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    try {
      const emailTrimmed = email.trim();
      if (!emailTrimmed) {
        toast({
          title: "Enter your email",
          description: "Please type your account email first, then click 'Forgot password?'.",
          variant: "destructive",
        });
        return;
      }
      auth.languageCode = typeof navigator !== "undefined" ? navigator.language : "en";
      const actionCodeSettings = {
        url: new URL('/login', window.location.origin).toString(),
        handleCodeInApp: false,
      };
      try {
        await sendPasswordResetEmail(auth, emailTrimmed, actionCodeSettings);
      } catch (e) {
        // Fallback: if continue URL is not authorized, try without settings
        if (e?.code === "auth/invalid-continue-uri" || e?.code === "auth/unauthorized-continue-uri") {
          await sendPasswordResetEmail(auth, emailTrimmed);
        } else {
          throw e;
        }
      }
      toast({
        title: "Password reset email sent",
        description: `We sent a reset link to ${emailTrimmed}. Check your inbox (or spam).`,
        variant: "default",
        className: "bg-white",
      });
    } catch (err) {
      let message = "Please try again in a moment.";
      switch (err?.code) {
        case "auth/missing-email":
          message = "Please enter your email first."; break;
        case "auth/invalid-email":
          message = "Email address looks invalid."; break;
        case "auth/user-not-found":
          message = "No user found with this email."; break;
        case "auth/invalid-continue-uri":
          message = "Reset link URL is invalid. Contact support."; break;
        case "auth/unauthorized-continue-uri":
          message = "This domain is not authorized in Firebase Auth settings."; break;
        case "auth/too-many-requests":
          message = "Too many attempts. Please wait a few minutes and try again."; break;
        case "auth/network-request-failed":
          message = "Network error. Check your internet connection and try again."; break;
        case "auth/user-disabled":
          message = "This account is disabled. Contact support."; break;
        case "auth/quota-exceeded":
          message = "Email sending quota temporarily exceeded. Try later."; break;
      }
      toast({ title: "Could not send reset email", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Dollar bills background layer for this page */}
      <div className="money-bg money-bg--login" />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6 sm:p-8">
        <Card
          className={cn(
            "w-full max-w-[400px] mx-auto rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100",
            "bg-white"
          )}
        >
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
              {isLoginMode ? "Welcome Back!" : "Join SpendSense"}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {isLoginMode
                ? "Enter your credentials to access your account."
                : "Create your account to start managing your finances."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLoginMode && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLoginMode}
                    className="h-11 rounded-xl border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl pr-12 border-gray-300 focus:border-primary focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-700 text-sm text-center">{error}</p>
                </div>
              )}
              
              {/* Login/Sign Up Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full h-12 rounded-xl text-base font-semibold transition-all duration-200",
                    "bg-[var(--primary-green-dark)] hover:bg-[var(--primary-green-medium)] text-white",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--primary-green-light)] focus:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Please wait...
                    </span>
                  ) : (
                    isLoginMode ? "Sign In" : "Create Account"
                  )}
                </Button>
              </div>
            </form>
            
            {/* Forgot Password Link - Only show in login mode */}
            {isLoginMode && (
              <div className="pt-2 pb-4 text-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors focus:outline-none focus:underline"
                >
                  Forgot your password?
                </button>
              </div>
            )}
            
            {/* Account Toggle Section */}
            <div className="pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {isLoginMode ? "Don't have an account?" : "Already have an account?"}
                </p>
                <button
                  type="button"
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-base font-medium text-primary hover:text-primary/80 hover:underline transition-colors focus:outline-none focus:underline"
                >
                  {isLoginMode ? "Sign Up" : "Sign In"}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
