import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Camera, Loader2, Save, User, Mail, Calendar, LogOut, Share2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPlan } from '@/hooks/useUserPlan';
import { PLAN_NAMES } from '@/lib/planAuthorization';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SocialMediaLinks } from '@/components/SocialMediaLinks';

export default function Settings() {
  const { user, profile, updateProfile, uploadAvatar, signOut } = useAuth();
  const { plan, isPremium, loading: planLoading } = useUserPlan();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [username, setUsername] = useState(profile?.username || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (profile?.username) return profile.username.slice(0, 2).toUpperCase();
    if (user?.email) return user.email.slice(0, 2).toUpperCase();
    return 'U';
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setIsUploadingAvatar(true);
    try {
      await uploadAvatar(file);
    } finally {
      setIsUploadingAvatar(false);
      // Clear the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        username: username.trim() || undefined,
        full_name: fullName.trim() || undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = 
    username !== (profile?.username || '') || 
    fullName !== (profile?.full_name || '');

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona tu perfil y configuración de la cuenta
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Perfil</CardTitle>
            <CardDescription>
              Actualiza tu información personal y foto de perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Foto de perfil</h3>
                <p className="text-sm text-muted-foreground">
                  Formatos permitidos: JPG, PNG. Tamaño máximo: 5MB
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Cambiar foto
                    </>
                  )}
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <Separator />

            {/* Profile Form */}
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de usuario</Label>
                  <Input
                    id="username"
                    placeholder="usuario123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tu nombre de usuario único en la plataforma
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullname">Nombre completo</Label>
                  <Input
                    id="fullname"
                    placeholder="Juan Pérez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tu nombre real completo
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={!hasChanges || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar cambios
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
            <CardDescription>
              Detalles de tu cuenta y datos de registro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Correo electrónico</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Badge variant="secondary">Verificado</Badge>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">ID de usuario</p>
                  <p className="text-sm text-muted-foreground font-mono">{user?.id}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Fecha de registro</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.created_at ? 
                      format(new Date(user.created_at), "PPP", { locale: es }) :
                      'No disponible'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tu Plan Actual</CardTitle>
            <CardDescription>
              Administra tu suscripción y accede a más contenido
            </CardDescription>
          </CardHeader>
          <CardContent>
            {planLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Plan: {plan ? PLAN_NAMES[plan] : 'Sin plan'}</p>
                    <p className="text-sm text-muted-foreground">
                      {isPremium ? 'Acceso completo a contenido premium' : 'Acceso limitado'}
                    </p>
                  </div>
                  <Badge variant={isPremium ? 'default' : 'secondary'}>
                    {plan ? PLAN_NAMES[plan] : 'Sin plan'}
                  </Badge>
                </div>
                
                {!isPremium && (
                  <Button asChild className="w-full">
                    <a href="https://wa.me/5491133333333" target="_blank" rel="noopener noreferrer">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Actualizar a Premium
                    </a>
                  </Button>
                )}

                {isPremium && (
                  <div className="rounded-lg bg-primary/10 p-4">
                    <p className="text-sm font-medium text-primary">
                      ✨ Disfrutás de todos los beneficios premium
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <li>• Acceso al Curso Inicial Completo</li>
                      <li>• Reportes y análisis avanzados</li>
                      <li>• Soporte prioritario</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
            <CardDescription>
              Gestiona la seguridad de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Cambiar contraseña</p>
                  <p className="text-sm text-muted-foreground">
                    Actualiza tu contraseña regularmente para mayor seguridad
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Próximamente
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Autenticación de dos factores</p>
                  <p className="text-sm text-muted-foreground">
                    Añade una capa extra de seguridad a tu cuenta
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Próximamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Comunidad BDI
            </CardTitle>
            <CardDescription>
              Síguenos en nuestras redes sociales para contenido exclusivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SocialMediaLinks variant="expanded" showLabels={true} />
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </CardTitle>
            <CardDescription>
              Cierra tu sesión actual en la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Salir de la aplicación</p>
                <p className="text-sm text-muted-foreground">
                  Se cerrará tu sesión y tendrás que volver a iniciar sesión
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="ml-4"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}