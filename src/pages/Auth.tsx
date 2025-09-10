import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [user, authLoading, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(loginEmail, loginPassword);
      if (!error) {
        const redirectTo = location.state?.from?.pathname || '/dashboard';
        navigate(redirectTo, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    if (!isValid && email) {
      setEmailError('Usa un correo válido como ejemplo@gmail.com');
      return false;
    } else if (email.includes('test.com') || email.includes('example.com')) {
      setEmailError('Usa un correo real, no de prueba (ej: tu_nombre@gmail.com)');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    
    // Validate email
    if (!validateEmail(signupEmail)) {
      return;
    }
    
    if (signupPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    
    if (signupPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(signupEmail, signupPassword, {
        username: username.trim() || undefined,
        full_name: fullName.trim() || undefined
      });

      if (!error) {
        // Switch to login tab after successful signup
        setActiveTab('login');
        setLoginEmail(signupEmail);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForms = () => {
    setLoginEmail('');
    setLoginPassword('');
    setSignupEmail('');
    setSignupPassword('');
    setConfirmPassword('');
    setUsername('');
    setFullName('');
    setEmailError('');
    setPasswordError('');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-background rounded-lg mx-auto mb-4 flex items-center justify-center border">
            <img src="/lovable-uploads/2d8b7a93-0b3f-463a-a0eb-d828b39eff2b.png" alt="BDI Suite" className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">BDI Suite</h1>
          <p className="text-muted-foreground">Tu plataforma de inversiones</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bienvenido</CardTitle>
            <CardDescription>
              Inicia sesión o crea una nueva cuenta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value);
              resetForms();
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="signup">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Correo electrónico</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !loginEmail || !loginPassword}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <LogIn className="h-4 w-4 mr-2" />
                    )}
                    Iniciar Sesión
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Correo electrónico</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="tu_nombre@gmail.com"
                      value={signupEmail}
                      onChange={(e) => {
                        setSignupEmail(e.target.value);
                        if (emailError) validateEmail(e.target.value);
                      }}
                      onBlur={(e) => validateEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className={emailError ? 'border-red-500' : ''}
                    />
                    {emailError && (
                      <p className="text-sm text-red-600">{emailError}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Nombre de usuario</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="usuario123"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullname">Nombre completo</Label>
                      <Input
                        id="fullname"
                        type="text"
                        placeholder="Juan Pérez"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Contraseña</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => {
                        setSignupPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      required
                      disabled={isLoading}
                      minLength={6}
                      className={passwordError ? 'border-red-500' : ''}
                    />
                    {passwordError && (
                      <p className="text-sm text-red-600">{passwordError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                    {confirmPassword && signupPassword !== confirmPassword && (
                      <p className="text-sm text-red-600">Las contraseñas no coinciden</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Usa un correo real (como gmail.com) para poder confirmar tu cuenta
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      isLoading || 
                      !signupEmail || 
                      !signupPassword || 
                      !confirmPassword ||
                      signupPassword !== confirmPassword
                    }
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    Crear Cuenta
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />
            
            <p className="text-center text-sm text-muted-foreground">
              Al continuar, aceptas nuestros términos de servicio y política de privacidad.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}