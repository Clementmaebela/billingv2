import { useState, useEffect } from "react";
import { useNavigate, Navigate, useSearchParams, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Facebook, Mail, Twitter, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Provider } from "@supabase/supabase-js";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const returnTo = location.state?.from || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [firm, setFirm] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session, signIn, signUp, signInWithOAuth } = useAuth();

  // Update active tab when URL parameters change
  useEffect(() => {
    if (searchParams.get('tab') === 'signup') {
      setActiveTab('signup');
    } else if (searchParams.get('tab') === 'login') {
      setActiveTab('login');
    }
  }, [searchParams]);

  // If already logged in, redirect to the return URL or dashboard
  if (session) {
    return <Navigate to={returnTo} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoginLoading(true);
    try {
      await signIn(email, password);
      navigate(returnTo);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !firm) return;
    
    setSignupLoading(true);
    try {
      await signUp(email, password);
      // Show success message and switch to login tab
      setActiveTab('login');
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setSignupLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: Provider) => {
    setSocialLoading(provider);
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      console.error(`${provider} login error:`, error);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Legal Bill App</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loginLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loginLoading}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In with Email"
                  )}
                </Button>
                
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleOAuthLogin('google')}
                    disabled={!!socialLoading}
                  >
                    {socialLoading === 'google' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="mr-2 h-4 w-4" />
                    )}
                    Google
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleOAuthLogin('facebook')}
                    disabled={!!socialLoading}
                  >
                    {socialLoading === 'facebook' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Facebook className="mr-2 h-4 w-4" />
                    )}
                    Facebook
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleOAuthLogin('twitter')}
                    disabled={!!socialLoading}
                  >
                    {socialLoading === 'twitter' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Twitter className="mr-2 h-4 w-4" />
                    )}
                    Twitter
                  </Button>
                </div>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    type="text" 
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={signupLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firm">Law Firm Name</Label>
                  <Input 
                    id="firm" 
                    type="text" 
                    placeholder="Enter your law firm name"
                    value={firm}
                    onChange={(e) => setFirm(e.target.value)}
                    required
                    disabled={signupLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea 
                    id="address" 
                    placeholder="Enter your business address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={signupLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={signupLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    type="url" 
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    disabled={signupLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={signupLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={signupLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={signupLoading}>
                  {signupLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account with Email"
                  )}
                </Button>
                
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or sign up with
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleOAuthLogin('google')}
                    disabled={!!socialLoading}
                  >
                    {socialLoading === 'google' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="mr-2 h-4 w-4" />
                    )}
                    Google
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleOAuthLogin('facebook')}
                    disabled={!!socialLoading}
                  >
                    {socialLoading === 'facebook' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Facebook className="mr-2 h-4 w-4" />
                    )}
                    Facebook
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleOAuthLogin('twitter')}
                    disabled={!!socialLoading}
                  >
                    {socialLoading === 'twitter' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Twitter className="mr-2 h-4 w-4" />
                    )}
                    Twitter
                  </Button>
                </div>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
