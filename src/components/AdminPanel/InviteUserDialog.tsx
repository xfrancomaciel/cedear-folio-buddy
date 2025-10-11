import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserPlus, RefreshCw } from 'lucide-react';
import { useUserInvitations } from '@/hooks/useUserInvitations';

const DEFAULT_MESSAGE = `¡Bienvenido/a!

Has sido invitado/a a unirte a nuestra plataforma como {rol} con el plan {plan}.

Para comenzar, haz clic en el enlace de invitación que te llegará por correo. Este enlace estará activo durante 7 días.

Una vez que completes tu registro, tendrás acceso completo a todas las funcionalidades de tu plan.

Si tienes alguna pregunta, no dudes en contactarnos.

¡Esperamos verte pronto en la plataforma!`;

const inviteFormSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  role: z.enum(['admin', 'moderator', 'user'], {
    required_error: 'Selecciona un rol',
  }),
  plan: z.enum(['cliente', 'bdi_inicial', 'bdi_plus'], {
    required_error: 'Selecciona un plan',
  }),
  customMessage: z.string().max(1000, {
    message: 'El mensaje no puede exceder 1000 caracteres',
  }).optional(),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

const translateRole = (role: string): string => {
  const translations: Record<string, string> = {
    'admin': 'Administrador',
    'moderator': 'Moderador',
    'user': 'Usuario'
  };
  return translations[role] || role;
};

const translatePlan = (plan: string): string => {
  const translations: Record<string, string> = {
    'cliente': 'Cliente',
    'bdi_inicial': 'BDI Inicial',
    'bdi_plus': 'BDI Plus'
  };
  return translations[plan] || plan;
};

interface InviteUserDialogProps {
  onInviteSent?: () => void;
}

export function InviteUserDialog({ onInviteSent }: InviteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const { inviteUser, loading } = useUserInvitations();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: 'user',
      plan: 'cliente',
      customMessage: DEFAULT_MESSAGE,
    },
  });

  const watchedMessage = form.watch('customMessage');
  const watchedRole = form.watch('role');
  const watchedPlan = form.watch('plan');

  const previewMessage = watchedMessage
    ? watchedMessage
        .replace(/{nombre_app}/g, 'FILABE')
        .replace(/{rol}/g, translateRole(watchedRole))
        .replace(/{plan}/g, translatePlan(watchedPlan))
    : '';

  const handleRestoreDefault = () => {
    form.setValue('customMessage', DEFAULT_MESSAGE);
  };

  const onSubmit = async (values: InviteFormValues) => {
    const result = await inviteUser(
      values.email,
      values.role,
      values.plan,
      values.customMessage
    );

    if (result.success) {
      form.reset();
      setOpen(false);
      onInviteSent?.();
    }
  };

  useEffect(() => {
    if (!open) {
      form.reset({
        email: '',
        role: 'user',
        plan: 'cliente',
        customMessage: DEFAULT_MESSAGE,
      });
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Invitar Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Envía una invitación por correo con el rol y plan asignados
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="usuario@ejemplo.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="moderator">Moderador</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cliente">Cliente</SelectItem>
                        <SelectItem value="bdi_inicial">BDI Inicial</SelectItem>
                        <SelectItem value="bdi_plus">BDI Plus</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customMessage"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Mensaje de Invitación</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRestoreDefault}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Restaurar mensaje
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe un mensaje personalizado..."
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Variables disponibles: {'{nombre_app}'}, {'{rol}'}, {'{plan}'}
                    • {field.value?.length || 0}/1000 caracteres
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {previewMessage && (
              <Card className="p-4 bg-muted/50">
                <h4 className="text-sm font-semibold mb-2">Vista previa del mensaje:</h4>
                <p className="text-sm whitespace-pre-line text-muted-foreground">
                  {previewMessage}
                </p>
              </Card>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Invitación'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
