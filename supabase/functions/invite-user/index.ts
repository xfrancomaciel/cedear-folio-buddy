import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteUserRequest {
  email: string;
  role: 'admin' | 'moderator' | 'user';
  plan: 'cliente' | 'bdi_inicial' | 'bdi_plus';
  customMessage?: string;
}

const DEFAULT_MESSAGE = `¡Bienvenido/a!

Has sido invitado/a a unirte a nuestra plataforma como {rol} con el plan {plan}.

Para comenzar, haz clic en el enlace de invitación que encontrarás más abajo. Este enlace estará activo durante 7 días.

Una vez que completes tu registro, tendrás acceso completo a todas las funcionalidades de tu plan.

Si tienes alguna pregunta, no dudes en contactarnos.

¡Esperamos verte pronto en la plataforma!`;

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

const processCustomMessage = (message: string, role: string, plan: string): string => {
  return message
    .replace(/{nombre_app}/g, 'FILABE')
    .replace(/{rol}/g, translateRole(role))
    .replace(/{plan}/g, translatePlan(plan));
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify the user is authenticated and is an admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      throw new Error("User is not an admin");
    }

    const { email, role, plan, customMessage }: InviteUserRequest = await req.json();

    console.log("Inviting user:", { email, role, plan });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.email === email);

    if (userExists) {
      throw new Error("User with this email already exists");
    }

    // Check if there's already a pending invitation
    const { data: existingInvitation } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('email', email)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingInvitation) {
      throw new Error("There's already a pending invitation for this email");
    }

    // Process the custom message
    const messageToSend = customMessage ? processCustomMessage(customMessage, role, plan) : processCustomMessage(DEFAULT_MESSAGE, role, plan);

    // Create invitation record
    const { data: invitation, error: invitationError } = await supabase
      .from('user_invitations')
      .insert({
        email,
        invited_by: user.id,
        role,
        plan,
        custom_message: customMessage || DEFAULT_MESSAGE
      })
      .select()
      .single();

    if (invitationError) {
      console.error("Error creating invitation:", invitationError);
      throw new Error("Failed to create invitation");
    }

    console.log("Invitation created:", invitation);

    // Generate magic link for signup
    const { data: magicLinkData, error: magicLinkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
    });

    if (magicLinkError) {
      console.error("Error generating magic link:", magicLinkError);
      throw new Error("Failed to generate invitation link");
    }

    const invitationLink = magicLinkData.properties.action_link;

    // Format expiration date
    const expirationDate = new Date(invitation.expires_at).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Send invitation email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">¡Has sido invitado!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; line-height: 1.6;">
            <p style="white-space: pre-line; color: #374151; margin: 0;">${messageToSend}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationLink}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 14px 32px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: bold;
                      font-size: 16px;
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              Aceptar Invitación
            </a>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #f3f4f6; border-radius: 8px; border-left: 4px solid #667eea;">
            <p style="color: #374151; font-weight: bold; margin: 0 0 10px 0;">Detalles de tu acceso:</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>Rol:</strong> ${translateRole(role)}</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>Plan:</strong> ${translatePlan(plan)}</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>Expira:</strong> ${expirationDate}</p>
          </div>
          
          <p style="color: #9ca3af; font-size: 13px; margin-top: 30px; text-align: center; line-height: 1.5;">
            Si no esperabas este correo, puedes ignorarlo de forma segura.<br>
            Este enlace expirará el ${expirationDate}.
          </p>
        </div>
      </div>
    `;

    const { error: emailError } = await resend.emails.send({
      from: "FILABE <onboarding@resend.dev>",
      to: [email],
      subject: "Has sido invitado a unirte a FILABE",
      html: emailHtml,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error("Failed to send invitation email");
    }

    console.log("Invitation email sent successfully");

    // Create user roles and plans entries
    // Note: These will be activated when the user accepts the invitation
    // For now, we'll just store the invitation

    return new Response(
      JSON.stringify({
        success: true,
        message: "Invitation sent successfully",
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          plan: invitation.plan,
          expires_at: invitation.expires_at
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in invite-user function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred while processing the invitation" 
      }),
      {
        status: error.message === "Unauthorized" || error.message === "User is not an admin" ? 403 : 400,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
