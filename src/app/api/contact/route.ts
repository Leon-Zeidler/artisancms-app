import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Log attempt to read the key *immediately*
const resendApiKey = process.env.RESEND_API_KEY;
console.log(`[API Contact] Attempting to read RESEND_API_KEY. Found: ${resendApiKey ? 'Yes (length: ' + resendApiKey.length + ')' : 'No (undefined or null)'}`);

// Check if the key exists before initializing
if (!resendApiKey) {
    console.error("[API Contact] FATAL: RESEND_API_KEY environment variable is not set or accessible in this environment.");
    // Optionally, throw an error during build/initialization if the key is essential
    // throw new Error("Server configuration error: Missing RESEND_API_KEY.");
    // Or handle it gracefully depending on whether Resend is optional at build time
}

// Initialize Resend - This line will now only run if the key *might* exist,
// but the error might still occur here if the value is invalid (e.g., empty string)
const resend = new Resend(resendApiKey); // Pass the variable directly
const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

// --- Supabase Clients ---
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
  console.log("Contact API route hit");
  // Check the key again at runtime (might be different from build time)
  console.log(`[API Contact - POST] Runtime check RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'Exists' : 'MISSING'}`);

  let requestData;
  try { /* ... parsing ... */ requestData = await request.json(); }
  catch (error) { /* ... error handling ... */ return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

  const { name, email: senderEmail, message, profileId } = requestData;

  // --- Validation ---
  if (!name || !senderEmail || !message || !profileId) { /* ... */ return NextResponse.json({ error: "Name, email, message, and profileId are required" }, { status: 400 }); }
  if (typeof name !== 'string' || typeof senderEmail !== 'string' || typeof message !== 'string' || typeof profileId !== 'string') { /* ... */ return NextResponse.json({ error: "Invalid data types provided" }, { status: 400 }); }

  // --- Main Logic ---
  try {
    // 1. Fetch Recipient Email
    console.log(`Fetching user email for profileId: ${profileId}`);
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profileId);
    if (userError || !userData?.user?.email) { /* ... error handling ... */ console.error("Error fetching recipient user data:", userError); return NextResponse.json({ error: "Could not identify recipient." }, { status: 500 }); }
    const recipientEmail = userData.user.email;
    const recipientBusinessName = userData.user.user_metadata?.business_name || 'Ihrer Webseite';
    console.log(`Recipient email found: ${recipientEmail}`);

    // 2. Save Submission to DB
    console.log("Inserting submission into DB...");
    const { error: insertError } = await supabase.from('contact_submissions').insert({ profile_id: profileId, sender_name: name, sender_email: senderEmail, message: message, is_read: false });
    if (insertError) console.error("Error saving contact submission to DB:", insertError); // Log but continue
    else console.log("Submission saved to DB successfully.");

    // 3. Send Email
    // Add another check right before sending
     if (!process.env.RESEND_API_KEY) {
        console.error("[API Contact - POST] Resend API Key is missing just before sending email!");
        return NextResponse.json({ error: "Server configuration error prevents sending email." }, { status: 500 });
     }
    console.log(`Sending email via Resend from ${fromEmail} to ${recipientEmail}`);
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `Kontaktformular <${fromEmail}>`,
      to: [recipientEmail],
      replyTo: senderEmail,
      subject: `Neue Kontaktanfrage von ${name} über ${recipientBusinessName}`,
      html: ` <p>Sie haben eine neue Kontaktanfrage erhalten:</p> <ul> <li><strong>Name:</strong> ${name}</li> <li><strong>Email:</strong> ${senderEmail}</li> </ul> <p><strong>Nachricht:</strong></p> <p>${message.replace(/\n/g, '<br>')}</p> `,
    });

    if (emailError) { /* ... error handling ... */ console.error("Error sending email via Resend:", emailError); return NextResponse.json({ error: "Failed to send message email notification." }, { status: 500 }); }
    console.log("Email sent successfully:", emailData);

    // Success
    return NextResponse.json({ message: "Nachricht erfolgreich gesendet!" });

  } catch (error) { /* ... error handling ... */ console.error("Unhandled error in contact API:", error); const message = error instanceof Error ? error.message : "An internal server error occurred."; return NextResponse.json({ error: message }, { status: 500 }); }
}