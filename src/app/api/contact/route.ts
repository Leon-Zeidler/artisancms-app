import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export async function POST(request: Request) {
  console.log('Contact API route POST handler started');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[API Contact - POST] FATAL: Supabase service configuration missing.');
    return NextResponse.json({ error: 'Server configuration error: Database service key missing.' }, { status: 500 });
  }

  if (!anonKey) {
    console.error('[API Contact - POST] FATAL: Supabase anon configuration missing.');
    return NextResponse.json({ error: 'Server configuration error: Database anon key missing.' }, { status: 500 });
  }

  if (!resendApiKey) {
    console.error('[API Contact - POST] FATAL: RESEND_API_KEY missing at runtime.');
    return NextResponse.json({ error: 'Server configuration error: Email service key missing.' }, { status: 500 });
  }

  const supabaseAdmin = createClient(
    supabaseUrl,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const supabase = createClient(
    supabaseUrl,
    anonKey,
  );

  const resend = new Resend(resendApiKey);

  let requestData;
  try {
    requestData = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, email: senderEmail, message, profileId } = requestData;

  // --- Validation ---
  if (!name || !senderEmail || !message || !profileId) {
    return NextResponse.json({ error: 'Name, email, message, and profileId are required' }, { status: 400 });
  }
  if (typeof name !== 'string' || typeof senderEmail !== 'string' || typeof message !== 'string' || typeof profileId !== 'string') {
    return NextResponse.json({ error: 'Invalid data types provided' }, { status: 400 });
  }

  try {
    console.log(`Fetching user email and profile for profileId: ${profileId}`);

    const [authResponse, profileResponse] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(profileId),
      supabaseAdmin.from('profiles').select('business_name').eq('id', profileId).single(),
    ]);

    const { data: userData, error: userError } = authResponse;
    const { data: profileData, error: profileError } = profileResponse;

    if (userError) {
      console.error('Error fetching recipient user data:', userError);
      return NextResponse.json({ error: 'Could not identify recipient auth.' }, { status: 500 });
    }
    if (profileError) {
      console.error('Error fetching recipient profile data:', profileError);
      return NextResponse.json({ error: 'Could not identify recipient profile.' }, { status: 500 });
    }
    if (!userData?.user?.email) {
      console.error('Recipient email not found for ID:', profileId);
      return NextResponse.json({ error: 'Could not find recipient email.' }, { status: 500 });
    }

    const recipientEmail = userData.user.email;
    const recipientBusinessName = profileData?.business_name || 'Ihrer Webseite';

    const submissionData = {
      profile_id: profileId,
      sender_name: name, // Use `name` from request body
      sender_email: senderEmail, // Use `senderEmail` from request body
      message: message,
      is_read: false,
    };
    const { error: insertError } = await supabaseAdmin
      .from('contact_submissions')
      .insert(submissionData);

    if (insertError) {
      console.error('--- DATABASE INSERT FAILED ---');
      console.error('Supabase Insert Error Code:', insertError.code);
      console.error('Supabase Insert Error Message:', insertError.message);
      console.error('Supabase Insert Error Details:', insertError.details);
      console.error('Supabase Insert Error Hint:', insertError.hint);
      return NextResponse.json({ error: 'Failed to save submission to database.' }, { status: 500 });
    }
    console.log(`Submission saved to DB for profile ${profileId}.`);

    const emailHtml = ` <p>Sie haben eine neue Kontaktanfrage erhalten:</p> <ul> <li><strong>Name:</strong> ${name}</li> <li><strong>Email:</strong> ${senderEmail}</li> </ul> <p><strong>Nachricht:</strong></p> <p>${message.replace(/\n/g, '<br>')}</p> `;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `Kontaktformular <${fromEmail}>`,
      to: [recipientEmail],
      replyTo: senderEmail,
      subject: `Neue Kontaktanfrage von ${name} über ${recipientBusinessName}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Error sending email via Resend:', emailError);
      return NextResponse.json({ error: 'Failed to send message email notification.' }, { status: 500 });
    }
    console.log('Email sent successfully via Resend request ID:', emailData?.id);

    return NextResponse.json({ message: 'Nachricht erfolgreich gesendet!' });

  } catch (error) {
    console.error('Unhandled error in contact API:', error);
    const messageText = error instanceof Error ? error.message : 'An internal server error occurred.';
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
