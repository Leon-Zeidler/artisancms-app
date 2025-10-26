import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev'; // Use verified domain or Resend default

// Initialize Supabase Admin Client (needed to fetch user email bypassing RLS)
// Note: Use environment variables for URL and Service Role Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Initialize regular Supabase client for inserting submission (respects RLS if needed)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


export async function POST(request: Request) {
  console.log("Contact API route hit");
  let requestData;
  try {
    requestData = await request.json();
    console.log("Request data:", requestData);
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email: senderEmail, message, profileId } = requestData;

  // --- Basic Input Validation ---
  if (!name || !senderEmail || !message || !profileId) {
    console.error("Validation failed: Missing fields");
    return NextResponse.json({ error: "Name, email, message, and profileId are required" }, { status: 400 });
  }
  if (typeof name !== 'string' || typeof senderEmail !== 'string' || typeof message !== 'string' || typeof profileId !== 'string') {
      console.error("Validation failed: Invalid types");
      return NextResponse.json({ error: "Invalid data types provided" }, { status: 400 });
  }


  try {
    // --- 1. Fetch Recipient Email using Admin Client ---
    console.log(`Fetching user email for profileId: ${profileId}`);
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profileId);

    if (userError || !userData || !userData.user || !userData.user.email) {
        console.error("Error fetching recipient user data:", userError);
        // Do not expose detailed user errors to the client
        return NextResponse.json({ error: "Could not identify recipient." }, { status: 500 });
    }
    const recipientEmail = userData.user.email;
    const recipientBusinessName = userData.user.user_metadata?.business_name || 'Ihrer Webseite'; // Fallback
    console.log(`Recipient email found: ${recipientEmail}`);

    // --- 2. Save Submission to Database ---
    console.log("Inserting submission into DB...");
    const { error: insertError } = await supabase
      .from('contact_submissions')
      .insert({
        profile_id: profileId, // Link submission to the profile
        sender_name: name,
        sender_email: senderEmail,
        message: message,
        is_read: false // Default to unread
      });

    if (insertError) {
      // Log the error but proceed to sending email if critical
      console.error("Error saving contact submission to DB:", insertError);
      // Depending on requirements, you might want to return an error here
      // return NextResponse.json({ error: "Failed to save submission." }, { status: 500 });
    } else {
        console.log("Submission saved to DB successfully.");
    }

    // --- 3. Send Email using Resend ---
    console.log(`Sending email via Resend from ${fromEmail} to ${recipientEmail}`);
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `Kontaktformular <${fromEmail}>`, // e.g., "Contact Form <noreply@yourdomain.com>" or <onboarding@resend.dev>
      to: [recipientEmail], // Send to the website owner's email
      replyTo: senderEmail, // *** CORRECTED: Changed from reply_to to replyTo ***
      subject: `Neue Kontaktanfrage von ${name} über ${recipientBusinessName}`,
      html: `
        <p>Sie haben eine neue Kontaktanfrage erhalten:</p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${senderEmail}</li>
        </ul>
        <p><strong>Nachricht:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (emailError) {
      console.error("Error sending email via Resend:", emailError);
      // Even if DB insert worked, email failure is a problem
      return NextResponse.json({ error: "Failed to send message email notification." }, { status: 500 });
    }

    console.log("Email sent successfully:", emailData);

    // --- Success Response ---
    return NextResponse.json({ message: "Nachricht erfolgreich gesendet!" });

  } catch (error) {
    console.error("Unhandled error in contact API:", error);
    const message = error instanceof Error ? error.message : "An internal server error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

