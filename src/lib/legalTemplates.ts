// src/lib/legalTemplates.ts

/**
 * Erstellt eine Impressum-Vorlage mit Platzhaltern für Kontaktdaten.
 */
export const IMPRESSUM_TEMPLATE = (
  businessName: string,
  address: string | null,
  phone: string | null,
  email: string | null,
) => {
  // Ersetze Kommas in Adressen (falls einzeilig) durch Zeilenumbrüche für HTML
  const formattedAddress = address ? address.replace(/,\s*/g, "<br>") : "[Bitte Adresse eintragen]";
  const safeBusinessName = businessName || "[Bitte Betriebsname eintragen]";
  const safePhone = phone || "[Bitte Telefonnummer eintragen]";
  const safeEmail = email || "[Bitte E-Mail eintragen]";

  return `
<h2>Angaben gemäß § 5 TMG</h2>
<p>
  ${safeBusinessName}<br>
  ${formattedAddress}
</p>

<h2>Kontakt</h2>
<p>
  Telefon: ${safePhone}<br>
  E-Mail: ${safeEmail}
</p>

<h2>Vertreten durch</h2>
<p>${safeBusinessName}</p>

<h2>Haftungsausschluss (Disclaimer)</h2>
<h3>Haftung für Inhalte</h3>
<p>
  Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
  Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
  Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
  Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
  Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
</p>
<h3>Haftung für Links</h3>
<p>
  Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
  Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
  Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
  Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.
  Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
  Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar.
  Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
</p>
<h3>Urheberrecht</h3>
<p>
  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.
  Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
  Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
  Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet.
  Insbesondere werden Inhalte Dritter als solche gekennzeichnet.
  Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis.
  Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
</p>
<p>Quelle: <a href="https://www.e-recht24.de" target="_blank" rel="noopener noreferrer">e-recht24.de</a> (Angepasst)</p>
  `.trim();
};

/**
 * Erstellt eine Datenschutz-Vorlage.
 */
export const DATENSCHUTZ_TEMPLATE = (
  businessName: string,
  address: string | null,
  phone: string | null,
  email: string | null,
) => {
  const formattedAddress = address ? address.replace(/,\s*/g, "<br>") : "[Bitte Adresse eintragen]";
  const safeBusinessName = businessName || "[Bitte Betriebsname eintragen]";
  const safePhone = phone || "[Bitte Telefonnummer eintragen]";
  const safeEmail = email || "[Bitte E-Mail eintragen]";
  
  return `
<p>
  HINWEIS: Dies ist eine automatisch generierte Vorlage.
  Sie als Webseitenbetreiber sind rechtlich dafür verantwortlich, diese Angaben zu prüfen, zu vervollständigen und anwaltlich prüfen zu lassen.
  Sie müssen ebenfalls alle Dienste hinzufügen, die Sie selbst einbetten (z.B. Google Maps, YouTube, Calendly, etc.).
</p>
<hr>

<h2>Verantwortlicher</h2>
<p>
  Verantwortlicher im Sinne der Datenschutzgesetze, insbesondere der EU-Datenschutzgrundverordnung (DSGVO), ist:
  <br><br>
  ${safeBusinessName}<br>
  ${formattedAddress}<br>
  Telefon: ${safePhone}<br>
  E-Mail: ${safeEmail}<br>
  Webseite: [Ihre Webseite]
</p>

<h2>Allgemeine Hinweise</h2>
<p>
  Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst.
  Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
</p>

<h2>Hosting und Bereitstellung der Webseite (Auftragsverarbeitung)</h2>
<p>
  Diese Website wird im Rahmen einer Auftragsverarbeitung (AVV) durch den Dienst ArtisanCMS (Leon Zeidler, Alter Dorfrand 50, 01454 Radeberg) bereitgestellt.
  ArtisanCMS nutzt die folgende technische Infrastruktur, die zur Bereitstellung der Webseite und zur Verarbeitung von Daten notwendig ist:
</p>

<h3>1. Hosting & Web-Analyse durch Vercel</h3>
<p>
  Unser Hoster ist Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA.
  Vercel erhebt beim Besuch der Webseite technische Daten (Server-Log-Dateien), die für den stabilen Betrieb notwendig sind (IP-Adresse, Browsertyp, Betriebssystem, Referrer URL, Uhrzeit).
  Wir nutzen zudem Vercel Analytics, einen datenschutzfreundlichen Analysedienst, um die Nutzung unserer Webseite zu verstehen und zu verbessern.
  Vercel Analytics erfasst keine personenbezogenen Daten (wie IP-Adressen) und verwendet keine Cookies.
  Es werden anonymisierte Daten wie besuchte Seiten und Herkunftsland erfasst.
  Grundlage für die Datenverarbeitung ist Art. 6 Abs. 1 lit. f DSGVO (unser berechtigtes Interesse an einer fehlerfreien und optimierten Darstellung unserer Webseite).
  Wir haben mit Vercel einen Auftragsverarbeitungsvertrag (AVV / DPA) abgeschlossen.
</p>

<h3>2. Datenbank & Speicherung durch Supabase</h3>
<p>
  Die Inhalte dieser Webseite (z.B. Projektbilder, Texte) werden in einer Datenbank bei Supabase Inc., 970 Toa Payoh North #07-04, Singapur 318992, gespeichert.
  Dies ist für die Anzeige der Inhalte technisch notwendig. Wir haben mit Supabase einen AVV/DPA abgeschlossen.
</p>

<h3>3. Kontaktformular</h3>
<p>
  Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten (Name, E-Mail, Nachricht) zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert und verarbeitet.
  Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist.
  In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO).
  Ihre Daten werden zur Speicherung an unsere Datenbank (Supabase, siehe oben) und zur Benachrichtigung an unseren E-Mail-Dienstleister weitergeleitet.
</p>

<h3>4. E-Mail-Versand (Kontaktformular) durch Resend</h3>
<p>
  Zum Versand der Benachrichtigung über Ihre Kontaktanfrage nutzen wir den Dienst Resend Inc., 548 Market St, PMB 98417, San Francisco, CA 94104-5401, USA.
  Resend verarbeitet Ihre E-Mail-Adresse und Ihren Namen, um diese Benachrichtigung an uns zuzustellen. Wir haben mit Resend einen AVV/DPA abgeschlossen.
</p>

<h2>Cookies & LocalStorage</h2>
<p>
  Unsere Webseite verwendet ein Cookie-Banner, um Ihre Zustimmung zur Datennutzung zu verwalten.
  Ihre Entscheidung (Akzeptieren oder Ablehnen) wird in Ihrem Browser im "LocalStorage" (in einem Eintrag namens <code>cookie_consent</code>) gespeichert.
  Dies ist technisch notwendig, um Ihre Auswahl bei zukünftigen Besuchen zu respektieren.
</p>

<h2>Ihre Rechte als Betroffener</h2>
<p>
  Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft über Ihre bei uns gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf.
  ein Recht auf Berichtigung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit unter der oben angegebenen Adresse an uns wenden.
</p>
  `.trim();
};