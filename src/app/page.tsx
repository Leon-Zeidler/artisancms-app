// This is your main public homepage - src/app/page.tsx
import Link from 'next/link'; // Import Link for navigation buttons

// Placeholder data for featured projects - eventually this might be fetched
const featuredProjects = [
  { id: 1, title: "Badezimmer-Sanierung Müller", imageUrl: "https://placehold.co/600x400/A3A3A3/FFF?text=Bad+1", href:"#" },
  { id: 2, title: "Küche Modernisierung Schmidt", imageUrl: "https://placehold.co/600x400/A3A3A3/FFF?text=Küche+1", href:"#" },
  { id: 3, title: "Terrassenbau Becker", imageUrl: "https://placehold.co/600x400/A3A3A3/FFF?text=Terrasse+1", href:"#" },
];

// Placeholder data for services
const services = [
  { name: "Sanitärinstallation", description: "Komplette Badinstallationen und Reparaturen.", icon: 'M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 10.5V6.75a4.5 4.5 0 10-9 0v3.75M3.75 12.75h16.5m-16.5 3h16.5' }, // Wrench Icon Path
  { name: "Heizungstechnik", description: "Installation und Wartung moderner Heizsysteme.", icon: 'M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6' }, // Home Icon Path (Simplified)
  { name: "Fliesenarbeiten", description: "Professionelle Verlegung von Fliesen aller Art.", icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.125c0 .621.504 1.125 1.125 1.125z' }, // Trowel Icon Path (Simplified)
];

// Placeholder for Testimonials
const testimonials = [
  { body: 'Hervorragende Arbeit! Pünktlich, sauber und sehr professionell. Absolut zu empfehlen.', author: { name: 'Maria S.', handle: 'Privatkundin' } },
  { body: 'Schnelle Terminfindung und top Ausführung. Das neue Bad ist ein Traum geworden.', author: { name: 'Thomas L.', handle: 'Hausbesitzer' } },
  { body: 'Sehr zuverlässiger Partner für unsere Bauprojekte. Immer wieder gerne.', author: { name: 'Firma Bau GmbH', handle: 'Geschäftskunde' } },
];

// Simple SVG Icon component
const Icon = ({ path, className }: { path: string, className?: string }) => (
    <svg className={className || "h-6 w-6 text-white"} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);


export default function PublicHomepage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ========== NAVBAR ========== */}
      <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl font-bold text-gray-900">ArtisanCMS</Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden space-x-8 md:flex">
              <Link href="#leistungen" className="font-medium text-gray-600 hover:text-orange-600">Leistungen</Link>
              <Link href="#projekte" className="font-medium text-gray-600 hover:text-orange-600">Projekte</Link>
              <Link href="#kontakt" className="font-medium text-gray-600 hover:text-orange-600">Kontakt</Link>
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Link
                href="/login" // Links to your login page
                className="rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
              >
                Kunden-Login
              </Link>
            </div>
             {/* Add Mobile Menu button logic here later */}
             <div className="md:hidden">
                {/* Placeholder for mobile menu button */}
                <button type="button" className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500" aria-controls="mobile-menu" aria-expanded="false">
                    <span className="sr-only">Open main menu</span>
                    {/* Icon when menu is closed. */}
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                    {/* Icon when menu is open. */}
                    {/* <svg className="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> */}
                </button>
            </div>
          </div>
        </div>
        {/* Mobile menu, show/hide based on menu state - Add later */}
        {/* <div className="md:hidden" id="mobile-menu"></div> */}
      </nav>

      {/* ========== HERO SECTION ========== */}
      <main className="isolate">
        <div className="relative px-6 lg:px-8">
            <div className="mx-auto max-w-3xl pt-20 pb-32 sm:pt-48 sm:pb-40">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                        Ihr Meisterbetrieb für exzellentes Handwerk
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Präzision, Qualität und Zuverlässigkeit für Ihr nächstes Projekt in Radeberg und Umgebung.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link href="#kontakt" className="rounded-md bg-orange-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
                            Angebot anfordern
                        </Link>
                        <Link href="#projekte" className="text-base font-semibold leading-6 text-gray-900">
                            Unsere Projekte ansehen <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>


        {/* ========== SERVICES SECTION ========== */}
        <div id="leistungen" className="py-24 sm:py-32 bg-gray-50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-orange-600">Leistungen</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Alles, was Sie für Ihr Zuhause brauchen
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Von der Planung bis zur Fertigstellung – wir bieten umfassende Handwerksleistungen aus einer Hand.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        {services.map((service) => (
                        <div key={service.name} className="flex flex-col">
                           <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600">
                                   <Icon path={service.icon} />
                                </div>
                            {service.name}
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                            <p className="flex-auto">{service.description}</p>
                            </dd>
                        </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>


        {/* ========== FEATURED WORK SECTION ========== */}
        <div id="projekte" className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-orange-600">Referenzen</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Ein Einblick in unsere Arbeit
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Sehen Sie sich einige unserer kürzlich abgeschlossenen Projekte an und überzeugen Sie sich von unserer Qualität.
                    </p>
                </div>
                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {featuredProjects.map((project) => (
                        <article key={project.id} className="flex flex-col items-start justify-between group">
                            <Link href={project.href} className="block w-full">
                                <div className="relative w-full">
                                    <img
                                    src={project.imageUrl}
                                    alt={project.title}
                                    className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2] border border-gray-200 group-hover:opacity-90 transition-opacity"
                                    />
                                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                                </div>
                                <div className="max-w-xl">
                                    <div className="relative">
                                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-orange-600">
                                        {project.title}
                                    </h3>
                                    {/* Optional: Add a short description snippet here if needed */}
                                    {/* <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">...</p> */}
                                    </div>
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>
                 <div className="mt-16 text-center">
                    <Link href="/portfolio" // Link to the full portfolio page (we'll create this later)
                       className="rounded-md bg-orange-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
                       Alle Projekte ansehen
                    </Link>
                </div>
            </div>
        </div>

         {/* ========== TESTIMONIALS SECTION ========== */}
        <section id="testimonials" className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:px-8">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20" />
            <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
            <div className="mx-auto max-w-2xl lg:max-w-4xl">
                {/* <img className="mx-auto h-12" src="https://tailwindui.com/img/logos/workcation-logo-indigo-600.svg" alt="" /> */}
                 <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-12">Was unsere Kunden sagen</h2>
                <figure className="mt-10">
                    {/* For simplicity, just showing the first testimonial. */}
                    {/* Later, this could be a slider or randomly chosen */}
                    <blockquote className="text-center text-xl font-semibold leading-8 text-gray-900 sm:text-2xl sm:leading-9">
                        <p>“{testimonials[0].body}”</p>
                    </blockquote>
                    <figcaption className="mt-10">
                        {/* Placeholder image */}
                        <img className="mx-auto h-10 w-10 rounded-full" src="https://placehold.co/40x40/E2E8F0/475569?text=MS" alt="" />
                        <div className="mt-4 flex items-center justify-center space-x-3 text-base">
                        <div className="font-semibold text-gray-900">{testimonials[0].author.name}</div>
                        <svg viewBox="0 0 2 2" width={3} height={3} aria-hidden="true" className="fill-gray-900"><circle cx={1} cy={1} r={1} /></svg>
                        <div className="text-gray-600">{testimonials[0].author.handle}</div>
                        </div>
                    </figcaption>
                </figure>
            </div>
        </section>

         {/* ========== CONTACT SECTION ========== */}
         <div id="kontakt" className="bg-gray-50 py-24 sm:py-32">
             <div className="mx-auto max-w-7xl px-6 lg:px-8">
                 <div className="mx-auto max-w-2xl space-y-16 divide-y divide-gray-100 lg:mx-0 lg:max-w-none">
                     <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                         <div>
                             <h2 className="text-3xl font-bold tracking-tight text-gray-900">Kontakt aufnehmen</h2>
                             <p className="mt-4 leading-7 text-gray-600">Wir freuen uns auf Ihre Anfrage und beraten Sie gerne unverbindlich zu Ihrem Vorhaben.</p>
                         </div>
                         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2 lg:gap-8">
                             {/* Contact Details */}
                             <div className="rounded-2xl bg-white p-10 border border-gray-200">
                                 <h3 className="text-base font-semibold leading-7 text-gray-900">Adresse</h3>
                                 <address className="mt-3 space-y-1 text-sm not-italic leading-6 text-gray-600">
                                     <p>Musterstraße 1</p>
                                     <p>01454 Radeberg</p>
                                 </address>
                             </div>
                              <div className="rounded-2xl bg-white p-10 border border-gray-200">
                                 <h3 className="text-base font-semibold leading-7 text-gray-900">Telefon & Email</h3>
                                 <dl className="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                                    <div><dt className="sr-only">Phone</dt><dd><a className="hover:text-gray-900" href="tel:+49123456789">+49 (0) 123 456789</a></dd></div>
                                    <div><dt className="sr-only">Email</dt><dd><a className="hover:text-gray-900" href="mailto:info@artisancms.de">info@beispiel-handwerk.de</a></dd></div>
                                 </dl>
                             </div>
                         </div>
                     </div>
                      {/* Optional Contact Form */}
                     {/* <div className="pt-16 lg:grid lg:grid-cols-3 lg:gap-8">
                        <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">Oder schreiben Sie uns direkt:</h2>
                        <div className="mt-6 lg:col-span-2 lg:mt-0">
                           Form goes here
                        </div>
                    </div> */}
                 </div>
             </div>
         </div>

      </main>

      {/* ========== FOOTER ========== */}
       <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
            <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
                {/* Footer Links */}
                <div className="pb-6">
                    <Link href="#leistungen" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Leistungen</Link>
                </div>
                <div className="pb-6">
                    <Link href="#projekte" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Projekte</Link>
                </div>
                <div className="pb-6">
                    <Link href="/impressum" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Impressum</Link>
                </div>
                 <div className="pb-6">
                    <Link href="/datenschutz" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Datenschutz</Link>
                </div>
            </nav>
            {/* Optional Social Links */}
            {/* <div className="mt-10 flex justify-center space-x-10"> ... </div> */}
            <p className="mt-10 text-center text-xs leading-5 text-gray-500">
                &copy; {new Date().getFullYear()} Ihr Firmenname. Alle Rechte vorbehalten.
            </p>
            <p className="mt-2 text-center text-xs leading-5 text-gray-500">
                Powered by ArtisanCMS
            </p>
        </div>
    </footer>

    </div>
  );
}

