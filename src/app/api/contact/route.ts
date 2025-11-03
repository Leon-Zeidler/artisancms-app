import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Log attempt to read the key (for build/initialization comparison)
const initialResendApiKeyCheck = process.env.RESEND_API_KEY;
console.log(`[API Contact - Top Level] Initial RESEND_API_KEY check. Found: ${initialResendApiKeyCheck ? 'Yes' : 'No'}`);

// Use non-prefixed variable name
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
    console.warn("[API Contact - Top Level] WARNING: RESEND_API_KEY missing during initial load.");
}
// *** Log Service Key Check ***
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log(`[API Contact - Top Level] Initial SUPABASE_SERVICE_ROLE_KEY check. Found: ${serviceRoleKey ? 'Yes (length: ' + serviceRoleKey.length + ')' : 'No'}`);


const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

// --- Supabase Admin Client ---
// Ensure this key is available
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[API Contact - Top Level] FATAL: SUPABASE_SERVICE_ROLE_KEY environment variable is missing!");
    // Throwing here might break builds depending on usage, but indicates a critical config error
    // throw new Error("Server configuration error: Missing SUPABASE_SERVICE_ROLE_KEY.");
}
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use the variable
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Regular client (not used for insert in this route)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  console.log("Contact API route POST handler started");

  // Runtime check for keys
  const resendApiKeyRuntime = process.env.RESEND_API_KEY;
  const serviceKeyRuntime = process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log(`[API Contact - POST] Runtime check RESEND_API_KEY: ${resendApiKeyRuntime ? 'Exists' : 'MISSING'}`);
  console.log(`[API Contact - POST] Runtime check SUPABASE_SERVICE_ROLE_KEY: ${serviceKeyRuntime ? 'Exists' : 'MISSING'}`);


  if (!resendApiKeyRuntime) {
      console.error("[API Contact - POST] FATAL: RESEND_API_KEY missing at runtime.");
      return NextResponse.json({ error: "Server configuration error: Email service key missing." }, { status: 500 });
  }
   if (!serviceKeyRuntime) {
       console.error("[API Contact - POST] FATAL: SUPABASE_SERVICE_ROLE_KEY missing at runtime.");
       return NextResponse.json({ error: "Server configuration error: Database service key missing." }, { status: 500 });
   }

  // Initialize Resend
  const resend = new Resend(resendApiKeyRuntime);

  let requestData;
  try { requestData = await request.json(); }
  catch (error) { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

  const { name, email: senderEmail, message, profileId } = requestData;

  // --- Validation ---
  if (!name || !senderEmail || !message || !profileId) { return NextResponse.json({ error: "Name, email, message, and profileId are required" }, { status: 400 }); }
  if (typeof name !== 'string' || typeof senderEmail !== 'string' || typeof message !== 'string' || typeof profileId !== 'string') { return NextResponse.json({ error: "Invalid data types provided" }, { status: 400 }); }

  // --- Main Logic ---
  try {
    // 1. Fetch Recipient Email AND Business Name
    console.log(`Fetching user email and profile for profileId: ${profileId}`);

    // ---
    // --- THIS IS THE FIX (Part 1) ---
    // ---
    // We fetch auth data AND profile data in parallel
    const [authResponse, profileResponse] = await Promise.all([
        supabaseAdmin.auth.admin.getUserById(profileId),
        supabaseAdmin.from('profiles').select('business_name').eq('id', profileId).single()
    ]);

    const { data: userData, error: userError } = authResponse;
    const { data: profileData, error: profileError } = profileResponse;

    if (userError) {
      console.error("Error fetching recipient user data:", userError); 
      return NextResponse.json({ error: "Could not identify recipient auth." }, { status: 500 }); 
    }
    if (profileError) {
      console.error("Error fetching recipient profile data:", profileError); 
      return NextResponse.json({ error: "Could not identify recipient profile." }, { status: 500 }); 
    }
    if (!userData?.user?.email) {
      console.error("Recipient email not found for ID:", profileId);
      return NextResponse.json({ error: "Could not find recipient email." }, { status: 500 });
    }

    const recipientEmail = userData.user.email;
    const recipientBusinessName = profileData?.business_name || 'Ihrer Webseite';
    // ---
    // --- END OF FIX (Part 1) ---
    // ---
    console.log(`Recipient email found: ${recipientEmail}, Business: ${recipientBusinessName}`);


    // *** 2. Save Submission to DB (with detailed error logging) ***
    const submissionData = {
        profile_id: profileId,
        sender_name: name, // Use `name` from request body
        sender_email: senderEmail, // Use `senderEmail` from request body
        message: message,
        is_read: false
    };
    console.log("Attempting DB insert with data:", JSON.stringify(submissionData, null, 2)); // Log data before insert
    const { error: insertError } = await supabaseAdmin
        .from('contact_submissions')
        .insert(submissionData);

    if (insertError) {
        // *** LOG THE DETAILED ERROR OBJECT ***
        console.error("--- DATABASE INSERT FAILED ---");
        console.error("Supabase Insert Error Code:", insertError.code);
        console.error("Supabase Insert Error Message:", insertError.message);
        console.error("Supabase Insert Error Details:", insertError.details);
        console.error("Supabase Insert Error Hint:", insertError.hint);
        // ***************************************
        // Return an error to the frontend
        return NextResponse.json({ error: "Failed to save submission to database." }, { status: 500 });
    }
    console.log("Submission saved to DB successfully.");


    // 3. Send Email (Only if DB insert succeeded)
    console.log(`Sending email via Resend from ${fromEmail} to ${recipientEmail}`);
    const emailHtml = ` <p>Sie haben eine neue Kontaktanfrage erhalten:</p> <ul> <li><strong>Name:</strong> ${name}</li> <li><strong>Email:</strong> ${senderEmail}</li> </ul> <p><strong>Nachricht:</strong></p> <p>${message.replace(/\n/g, '<br>')}</p> `;
    
    // ---
    // --- THIS IS THE FIX (Part 2) ---
    // ---
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `Kontaktformular <${fromEmail}>`,
      to: [recipientEmail],
      replyTo: senderEmail,
      subject: `Neue Kontaktanfrage von ${name} über ${recipientBusinessName}`, // <-- Business name is now correct
      html: emailHtml,
    });
    // ---
    // --- END OF FIX (Part 2) ---
    // ---

    if (emailError) { console.error("Error sending email via Resend:", emailError); return NextResponse.json({ error: "Failed to send message email notification." }, { status: 500 }); }
    console.log("Email sent successfully:", emailData);

    // Success
    return NextResponse.json({ message: "Nachricht erfolgreich gesendet!" });

  } catch (error) {
       // Catch errors from fetching email or other unexpected issues
      console.error("Unhandled error in contact API:", error);
      const message = error instanceof Error ? error.message : "An internal server error occurred.";
      return NextResponse.json({ error: message }, { status: 500 });
  }
}
