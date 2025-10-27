import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Log attempt to read the key (for build/initialization comparison)
const initialResendApiKeyCheck = process.env.RESEND_API_KEY;
console.log(`[API Contact - Top Level] Initial RESEND_API_KEY check. Found: ${initialResendApiKeyCheck ? 'Yes' : 'No'}`);

// Use non-prefixed variable name
const resendApiKey = process.env.RESEND_API_KEY;

// Check if the key exists before initializing (optional during build, crucial at runtime)
if (!resendApiKey) {
    console.warn("[API Contact - Top Level] WARNING: RESEND_API_KEY environment variable not found during initial module load. Ensure it's available at runtime.");
    // Do not throw here to allow build to pass, runtime check is important
}

const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

// --- Supabase Clients --- (Keep these here)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
// This client is fine for client-side use, but we'll use supabaseAdmin for inserts in this route
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  console.log("Contact API route POST handler started");

  // *** Access the NON-prefixed variable at runtime ***
  const resendApiKeyRuntime = process.env.RESEND_API_KEY; // Use non-prefixed
  console.log(`[API Contact - POST] Runtime check RESEND_API_KEY: ${resendApiKeyRuntime ? 'Exists' : 'MISSING'}`);

  if (!resendApiKeyRuntime) {
      console.error("[API Contact - POST] FATAL: RESEND_API_KEY environment variable is not available at runtime.");
      return NextResponse.json({ error: "Server configuration error: Email service key missing." }, { status: 500 });
  }

  // Initialize Resend using the NON-prefixed key checked at runtime
  const resend = new Resend(resendApiKeyRuntime);
  // *******************************************

  let requestData;
  try { requestData = await request.json(); }
  catch (error) { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

  const { name, email: senderEmail, message, profileId } = requestData;

  // --- Validation ---
  if (!name || !senderEmail || !message || !profileId) { return NextResponse.json({ error: "Name, email, message, and profileId are required" }, { status: 400 }); }
  if (typeof name !== 'string' || typeof senderEmail !== 'string' || typeof message !== 'string' || typeof profileId !== 'string') { return NextResponse.json({ error: "Invalid data types provided" }, { status: 400 }); }

  // --- Main Logic ---
  try {
    // 1. Fetch Recipient Email
    console.log(`Fetching user email for profileId: ${profileId}`);
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profileId);
    if (userError || !userData?.user?.email) { console.error("Error fetching recipient user data:", userError); return NextResponse.json({ error: "Could not identify recipient." }, { status: 500 }); }
    const recipientEmail = userData.user.email;
    const recipientBusinessName = userData.user.user_metadata?.business_name || 'Ihrer Webseite';
    console.log(`Recipient email found: ${recipientEmail}`);

    // *** MODIFIED: 2. Save Submission to DB (use supabaseAdmin) ***
    console.log("Inserting submission into DB using Admin client...");
    const { error: insertError } = await supabaseAdmin.from('contact_submissions').insert({ // <-- Use supabaseAdmin
        profile_id: profileId,
        sender_name: name,
        sender_email: senderEmail,
        message: message,
        is_read: false
    });

    // *** CRITICAL: Stop if DB insert fails ***
    if (insertError) {
        console.error("Error saving contact submission to DB:", insertError);
        // Return an error to the frontend
        return NextResponse.json({ error: "Failed to save submission to database." }, { status: 500 });
    }
    console.log("Submission saved to DB successfully.");


    // 3. Send Email
    // Check for the NON-prefixed variable before sending
     if (!process.env.RESEND_API_KEY) {
        console.error("[API Contact - POST] RESEND_API_KEY is missing just before sending email!");
        return NextResponse.json({ error: "Server configuration error prevents sending email." }, { status: 500 });
     }
    console.log(`Sending email via Resend from ${fromEmail} to ${recipientEmail}`);
    const emailHtml = ` <p>Sie haben eine neue Kontaktanfrage erhalten:</p> <ul> <li><strong>Name:</strong> ${name}</li> <li><strong>Email:</strong> ${senderEmail}</li> </ul> <p><strong>Nachricht:</strong></p> <p>${message.replace(/\n/g, '<br>')}</p> `;
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `Kontaktformular <${fromEmail}>`,
      to: [recipientEmail],
      replyTo: senderEmail,
      subject: `Neue Kontaktanfrage von ${name} über ${recipientBusinessName}`,
      html: emailHtml,
    });

    if (emailError) { console.error("Error sending email via Resend:", emailError); return NextResponse.json({ error: "Failed to send message email notification." }, { status: 500 }); }
    console.log("Email sent successfully:", emailData);

    // Success
    return NextResponse.json({ message: "Nachricht erfolgreich gesendet!" });

  } catch (error) { console.error("Unhandled error in contact API:", error); const message = error instanceof Error ? error.message : "An internal server error occurred."; return NextResponse.json({ error: message }, { status: 500 }); }
}

