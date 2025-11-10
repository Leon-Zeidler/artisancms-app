// src/app/api/request-testimonial/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// --- Define Profile type for the joined data ---
// (Dieser Typ wird nicht mehr benötigt, da wir den Join entfernen)
/*
type ProjectWithProfile = {
  title: string | null;
  profiles: {
    business_name: string | null;
  }[] | null; 
};
*/

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase service configuration for testimonial request route.');
      return NextResponse.json({ error: 'Server configuration error (database).' }, { status: 500 });
    }

    if (!resendApiKey || !fromEmail) {
      console.error('Missing Resend configuration for testimonial request route.');
      return NextResponse.json({ error: 'Server configuration error (email).' }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const resend = new Resend(resendApiKey);

    // 1. Get and authenticate the user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Parse request body
    const { projectId, clientEmail } = await request.json();
    if (!projectId || !clientEmail) {
      return NextResponse.json({ error: 'projectId and clientEmail are required' }, { status: 400 });
    }

    const projectIdNum = parseInt(projectId, 10);
    if (isNaN(projectIdNum)) {
      return NextResponse.json({ error: 'Invalid projectId format' }, { status: 400 });
    }

    // 3. Get Project and Profile info (for the email)
    // --- START DER KORREKTUR ---
    // Wir rufen Projekt- und Profildaten in zwei getrennten, robusten Abfragen ab,
    // anstatt uns auf einen potenziell fehlenden Foreign-Key-Join zu verlassen.

    // Abfrage 1: Das Projekt abrufen
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('title') // Nur das auswählen, was wir aus dieser Tabelle brauchen
      .eq('id', projectIdNum) 
      .eq('user_id', user.id) // Sicherheitsprüfung
      .single();

    if (projectError || !projectData) {
       console.error('Error fetching project data or no access:', projectError);
       // Das ist die Fehlermeldung, die Sie sehen
       return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }
    
    // Abfrage 2: Das Profil abrufen
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('business_name')
      .eq('id', user.id) // Profil basierend auf dem authentifizierten Benutzer abrufen
      .single();

    if (profileError || !profileData) {
        console.error('Error fetching profile data:', profileError);
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    const projectTitle = projectData.title || 'ein kürzliches Projekt';
    const businessName = profileData.business_name || 'Ihrem Handwerksbetrieb';
    // --- ENDE DER KORREKTUR ---


    // 4. Create the unique testimonial request token
    const { data: requestData, error: tokenError } = await supabaseAdmin
      .from('testimonial_requests')
      .insert({
        user_id: user.id,
        project_id: projectIdNum, // Die project_id wird jetzt korrekt gespeichert
        client_email: clientEmail
      })
      .select('id')
      .single();

    if (tokenError || !requestData) {
      console.error('Error creating testimonial token:', tokenError);
      return NextResponse.json({ error: 'Could not create testimonial request token.' }, { status: 500 });
    }

    const token = requestData.id;

    const resolvedOrigin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      request.headers.get('origin') ||
      new URL(request.url).origin;

    if (!resolvedOrigin) {
      console.error('Unable to resolve site URL for testimonial email.');
      return NextResponse.json({ error: 'Server configuration error (site url).' }, { status: 500 });
    }

    const reviewUrl = `${resolvedOrigin.replace(/\/$/, '')}/review/${token}`;

    // 5. Ask OpenAI to draft the email (The "Magic")
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error (AI)' }, { status: 500 });
    }

    const prompt = `Schreibe eine kurze, höfliche E-Mail (auf Deutsch) an einen Kunden, um nach einer Kundenstimme für ein abgeschlossenes Projekt zu fragen.
    - Absender (Betrieb): "${businessName}"
    - Projektname: "${projectTitle}"
    - E-Mail soll den Kunden direkt ansprechen (z.B. "Sehr geehrter Kunde," oder neutraler).
    - Mache es kurz und freundlich.
    - Erwähne, dass es nur ein paar Minuten dauert.
    - WICHTIG: Die E-Mail MUSS den folgenden Platzhalter GENAU SO enthalten, damit ich den Link einfügen kann: [REVIEW_LINK_URL]
`;

    let emailBody = `
      <p>Sehr geehrter Kunde,</p>
      <p>wir haben kürzlich das Projekt "${projectTitle}" für Sie abgeschlossen und hoffen, dass Sie mit unserer Arbeit zufrieden sind.</p>
      <p>Wir würden uns sehr geehrt fühlen, wenn Sie sich einen Moment Zeit nehmen könnten, um eine kurze Bewertung zu hinterlassen. Ihr Feedback hilft uns sehr.</p>
      <p>Sie können Ihre Bewertung hier abgeben:<br><a href="${reviewUrl}">Bewertung jetzt abgeben</a></p>
      <p>Vielen Dank!<br>Ihr Team von ${businessName}</p>
    `; // Fallback email body

    const subject = `Eine Bitte um Ihre Meinung zum Projekt: "${projectTitle}"`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiText = data.choices?.[0]?.message?.content?.trim();
        if (aiText && aiText.includes('[REVIEW_LINK_URL]')) {
          emailBody = aiText
            .replace('[REVIEW_LINK_URL]', `<a href="${reviewUrl}">Klicken Sie hier, um Ihre Bewertung abzugeben</a>`)
            .replace(/\n/g, '<br>');
        }
      }
    } catch (aiError) {
      console.warn('AI email generation failed, using fallback template.', aiError);
      // Fallback email body is already set
    }

    // 6. Send the email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${businessName} <${fromEmail}>`,
      to: [clientEmail],
      replyTo: user.email, // Use correct camelCase
      subject: subject,
      html: emailBody,
    });

    if (emailError) {
      console.error('Error sending testimonial request email via Resend:', emailError);
      return NextResponse.json({ error: 'Failed to send testimonial request email.' }, { status: 500 });
    }

    console.info('Testimonial request email queued successfully:', emailData?.id);

    return NextResponse.json({ success: true, message: 'Anfrage gesendet!' });

  } catch (error) {
    console.error('Error in /api/request-testimonial:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}