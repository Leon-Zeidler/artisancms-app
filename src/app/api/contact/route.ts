import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Log attempt to read the key *immediately* (for comparison)
const initialResendApiKeyCheck = process.env.RESEND_API_KEY;
console.log(`[API Contact - Top Level] Initial RESEND_API_KEY check. Found: ${initialResendApiKeyCheck ? 'Yes' : 'No'}`);

const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

// --- Supabase Clients --- (Keep these here)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  console.log("Contact API route POST handler started");

  // *** Initialize Resend INSIDE the handler ***
  const resendApiKeyRuntime = process.env.RESEND_API_KEY;
  console.log(`[API Contact - POST] Runtime check RESEND_API_KEY: ${resendApiKeyRuntime ? 'Exists' : 'MISSING'}`);

  if (!resendApiKeyRuntime) {
      console.error("[API Contact - POST] FATAL: RESEND_API_KEY environment variable is not available at runtime.");
      return NextResponse.json({ error: "Server configuration error: Email service key missing." }, { status: 500 });
  }

  // Now initialize Resend using the key checked at runtime
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

    // 2. Save Submission to DB
    console.log("Inserting submission into DB...");
    const { error: insertError } = await supabase.from('contact_submissions').insert({ profile_id: profileId, sender_name: name, sender_email: senderEmail, message: message, is_read: false });
    if (insertError) console.error("Error saving contact submission to DB:", insertError); // Log but continue
    else console.log("Submission saved to DB successfully.");

    // 3. Send Email
    console.log(`Sending email via Resend from ${fromEmail} to ${recipientEmail}`);

    // *** Corrected the html template literal syntax ***
    const emailHtml = `
      <p>Sie haben eine neue Kontaktanfrage erhalten:</p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${senderEmail}</li>
      </ul>
      <p><strong>Nachricht:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `; // Defined HTML content outside the send options for clarity

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `Kontaktformular <${fromEmail}>`,
      to: [recipientEmail],
      replyTo: senderEmail,
      subject: `Neue Kontaktanfrage von ${name} über ${recipientBusinessName}`,
      html: emailHtml, // Pass the defined HTML string here
    });

    if (emailError) { console.error("Error sending email via Resend:", emailError); return NextResponse.json({ error: "Failed to send message email notification." }, { status: 500 }); }
    console.log("Email sent successfully:", emailData);

    // Success
    return NextResponse.json({ message: "Nachricht erfolgreich gesendet!" });

  } catch (error) { console.error("Unhandled error in contact API:", error); const message = error instanceof Error ? error.message : "An internal server error occurred."; return NextResponse.json({ error: message }, { status: 500 }); }
}

