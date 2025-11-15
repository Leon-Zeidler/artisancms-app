// src/app/onboarding/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import Select from "react-select";
import {
  INDUSTRY_OPTIONS,
  INDUSTRY_TEMPLATES,
  Industry,
  formatDefaultServices,
} from "@/lib/industry-templates";
import {
  IMPRESSUM_TEMPLATE,
  DATENSCHUTZ_TEMPLATE,
} from "@/lib/legalTemplates";
import toast from "react-hot-toast";
import LogoUploader from "@/components/LogoUploader"; // <-- NEU

// --- Icons ---
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-4 animate-spin"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
    />
  </svg>
);
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-5 text-orange-400"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z"
    />
  </svg>
);
// --- Ende Icons ---

export default function OnboardingPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- Logik für 6-stufiges Onboarding ---
  const [step, setStep] = useState(1);

  // --- State für alle Schritte ---
  // Step 1
  const [businessName, setBusinessName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  // Step 2
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [keywords, setKeywords] = useState("");
  const [servicesDescription, setServicesDescription] = useState("");
  const [elektroServices, setElektroServices] = useState({
    smartHome: true,
    photovoltaik: false,
    wallbox: true,
  });
  // Step 3
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  // Step 4
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [aboutText, setAboutText] = useState("");
  // Step 5
  const [impressumText, setImpressumText] = useState("");
  const [datenschutzText, setDatenschutzText] = useState("");
  // ---

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_complete")
          .eq("id", user.id)
          .single();
        if (profile?.onboarding_complete) {
          router.push("/dashboard");
        }
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleIndustryChange = (selectedOption: any) => {
    const newIndustry = selectedOption ? (selectedOption.value as Industry) : null;
    setIndustry(newIndustry);

    if (newIndustry && newIndustry !== "elektriker") {
      setServicesDescription(formatDefaultServices(newIndustry));
    } else {
      setServicesDescription("");
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setElektroServices((prev) => ({ ...prev, [name]: checked }));
  };

  // --- Haupt-Handler für alle Schritte ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return toast.error("Nicht angemeldet.");
    
    setLoading(true);

    // --- LOGIK FÜR SCHRITT 1 -> 2 ---
    if (step === 1) {
      if (!businessName) {
        toast.error("Bitte geben Sie einen Betriebsnamen an.");
        setLoading(false);
        return;
      }
      setStep(2);
      setLoading(false);
    }
    
    // --- LOGIK FÜR SCHRITT 2 -> 3 ---
    else if (step === 2) {
      if (!industry) {
        toast.error("Bitte wählen Sie eine Branche aus.");
        setLoading(false);
        return;
      }
      
      // Services für Elektriker konsolidieren
      if (industry === "elektriker") {
        const selectedServices: string[] = [];
        if (elektroServices.smartHome) selectedServices.push("Smart Home & Intelligente Gebäudesteuerung (KNX)");
        if (elektroServices.photovoltaik) selectedServices.push("Photovoltaik-Anlagen und Energiespeicher");
        if (elektroServices.wallbox) selectedServices.push("Installation von E-Ladestationen (Wallboxen)");

        const defaultServices = (INDUSTRY_TEMPLATES.elektriker?.defaultServices || []).filter(
          (s) => !s.toLowerCase().includes("smart home") && !s.toLowerCase().includes("photovoltaik") && !s.toLowerCase().includes("wallboxen")
        );
        const combinedServices = [...selectedServices, ...defaultServices].join("\n");
        setServicesDescription(combinedServices); // WICHTIG: Im State speichern
      }
      
      setStep(3);
      setLoading(false);
    }
    
    // --- LOGIK FÜR SCHRITT 3 -> 4 ---
    else if (step === 3) {
      if (!address || !phone) {
        toast.error("Bitte füllen Sie Adresse und Telefon aus.");
        setLoading(false);
        return;
      }
      
      // Rufe API auf, um Texte für Schritt 4 vorab zu füllen
      try {
        const response = await fetch("/api/generate-onboarding-texts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessName,
            industry,
            keywords,
            servicesDescription,
            address, // <-- NEU
            phone, // <-- NEU
          }),
        });
        if (!response.ok) throw new Error("Fehler beim Generieren der Texte.");
        
        const data = await response.json();
        setHeroTitle(data.heroTitle || "");
        setHeroSubtitle(data.heroSubtitle || "");
        setAboutText(data.aboutText || "");

        setStep(4);
      } catch (error: any) {
        toast.error(`Fehler: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
    
    // --- LOGIK FÜR SCHRITT 4 -> 5 ---
    else if (step === 4) {
      // Generiere Rechtstexte für Schritt 5
      setImpressumText(
        IMPRESSUM_TEMPLATE(businessName, address, phone, user.email || null)
      );
      setDatenschutzText(
        DATENSCHUTZ_TEMPLATE(businessName, address, phone, user.email || null)
      );
      setStep(5);
      setLoading(false);
    }
    
    // --- LOGIK FÜR SCHRITT 5 -> 6 ---
    else if (step === 5) {
      // Gehe zum finalen Review-Schritt
      setStep(6);
      setLoading(false);
    }

    // --- LOGIK FÜR SCHRITT 6 (FINALER SUBMIT) ---
    else if (step === 6) {
      try {
        // Sende ALLE Daten an die finale API-Route
        const response = await fetch("/api/industry-defaults", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessName,
            logoUrl,
            industry,
            servicesDescription,
            keywords,
            address,
            phone,
            heroTitle,
            heroSubtitle,
            aboutText,
            impressumText,
            datenschutzText,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Ein Fehler ist aufgetreten.");
        }

        toast.success("Willkommen! Ihr Profil wurde eingerichtet.");
        // FIX: Hard-Redirect für sauberen State-Wechsel
        window.location.href = "/dashboard";
      } catch (error: any) {
        console.error("Onboarding-Fehler:", error);
        toast.error(`Fehler: ${error.message}`);
        setLoading(false);
      }
    }
  };

  // --- Styling-Konstanten ---
  const selectStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: "white",
      borderColor: "rgb(203 213 225)",
      borderRadius: "0.5rem",
      padding: "0.25rem",
      boxShadow: "none",
      "&:hover": { borderColor: "rgb(249 115 22)" },
    }),
    option: (provided: any, state: { isSelected: boolean }) => ({
      ...provided,
      backgroundColor: state.isSelected ? "rgb(249 115 22)" : "white",
      color: state.isSelected ? "white" : "black",
      "&:hover": {
        backgroundColor: "rgb(254 243 236)",
        color: "rgb(249 115 22)",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: "0.5rem",
      overflow: "hidden",
    }),
  };
  
  const inputStyle = "mt-1 block w-full rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500";
  const labelStyle = "block text-sm font-semibold text-slate-700";
  const subLabelStyle = "mb-2 text-xs text-slate-500";
  const backButtonStyle = "w-full text-center text-xs font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50";
  const submitButtonStyle = "flex w-full justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-orange-300";

  // --- Render-Funktion ---
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <svg
          className="mx-auto h-12 w-auto text-orange-600"
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.94 37.5C16.32 37.5 15.69 37.24 15.22 36.78C14.76 36.32 14.5 35.69 14.5 35.06V26.25H5.69C5.06 26.25 4.44 25.99 3.97 25.53C3.51 25.07 3.25 24.44 3.25 23.81V16.19C3.25 15.56 3.51 14.94 3.97 14.48C4.44 14.01 5.06 13.75 5.69 13.75H14.5V4.94C14.5 4.31 14.76 3.69 15.22 3.23C15.69 2.76 16.32 2.5 16.94 2.5C17.47 2.5 17.97 2.69 18.38 3.05C18.78 3.41 19.06 3.9 19.19 4.45L21.41 12.91C21.5 13.24 21.66 13.54 21.88 13.79C22.1 14.04 22.38 14.24 22.69 14.38L31.15 18.1C31.69 18.35 32.14 18.77 32.41 19.3C32.68 19.83 32.75 20.43 32.59 21.01L30.31 29.74C30.16 30.28 29.86 30.76 29.44 31.12C29.03 31.48 28.53 31.68 28 31.68H25.5V35.06C25.5 35.69 25.24 36.32 24.78 36.78C24.31 37.24 23.69 37.5 23.06 37.5H16.94ZM34.31 13.75H25.5V23.81C25.5 24.44 25.24 25.07 24.78 25.53C24.31 25.99 23.69 26.25 23.06 26.25H20.69V35.06C20.69 35.27 20.77 35.47 20.92 35.62C21.07 35.77 21.27 35.85 21.48 35.85H23.06C23.27 35.85 23.47 35.77 23.62 35.62C23.77 35.47 23.85 35.27 23.85 35.06V27.91C23.85 27.28 24.11 26.65 24.57 26.19C25.03 25.73 25.66 25.47 26.29 25.47H28C28.21 25.47 28.41 25.39 28.56 25.24C28.71 25.09 28.79 24.89 28.81 24.68L31.09 15.95C31.13 15.74 31.09 15.53 31 15.35C30.9 15.17 30.74 15.03 30.54 14.96L22.08 11.23C21.88 11.14 21.69 11.01 21.53 10.84C21.37 10.67 21.24 10.48 21.16 10.27L18.94 1.8C18.88 1.59 18.76 1.41 18.59 1.28C18.42 1.15 18.21 1.08 18 1.08C17.79 1.08 17.59 1.16 17.44 1.31C17.29 1.46 17.21 1.66 17.21 1.88V12.09C17.21 12.72 16.95 13.35 16.49 13.81C16.03 14.27 15.4 14.53 14.77 14.53H5.96C5.75 14.53 5.55 14.61 5.4 14.76C5.25 14.91 5.17 15.11 5.17 15.32V23.03C5.17 23.24 5.25 23.44 5.4 23.59C5.55 23.74 5.75 23.82 5.96 23.82H14.77C15.4 23.82 16.03 24.08 16.49 24.54C16.95 25 17.21 25.63 17.21 26.26V35.06C17.21 35.27 17.29 35.47 17.44 35.62C17.59 35.77 17.79 35.85 18 35.85H19.58C19.79 35.85 19.99 35.77 20.14 35.62C20.29 35.47 20.37 35.27 20.37 35.06V26.25H34.31C34.94 26.25 35.56 25.99 36.03 25.53C36.49 25.07 36.75 24.44 36.75 23.81V16.19C36.75 15.56 36.49 14.94 36.03 14.48C35.56 14.01 34.94 13.75 34.31 13.75Z"
            fill="#F97316"
          />
        </svg>

        <h2 className="text-center text-2xl font-bold text-slate-900">
          Willkommen bei ArtisanCMS
        </h2>
        <p className="text-center text-sm font-semibold text-slate-500">
          Schritt {step} von 6
        </p>
        
        {/* --- SCHRITT 1: Identität (Name & Logo) --- */}
        {step === 1 && (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl bg-white p-8 shadow-xl shadow-orange-100/50"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900">Ihre Identität</h3>
              <p className="mt-1 text-sm text-slate-600">
                Starten wir mit dem Namen Ihres Betriebs und Ihrem Logo.
              </p>
            </div>
            
            <LogoUploader 
              user={user} 
              onUploadSuccess={setLogoUrl} 
              initialLogoUrl={logoUrl} 
            />

            <div>
              <label htmlFor="businessName" className={labelStyle}>
                Name Ihres Betriebs
              </label>
              <input
                type="text"
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className={inputStyle}
                placeholder="z.B. Mustermann GmbH"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !businessName}
              className={submitButtonStyle}
            >
              {loading ? <ArrowPathIcon className="size-5" /> : "Weiter"}
            </button>
          </form>
        )}

        {/* --- SCHRITT 2: Branche & Nische --- */}
        {step === 2 && (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl bg-white p-8 shadow-xl shadow-orange-100/50"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900">Branche & Nische</h3>
              <p className="mt-1 text-sm text-slate-600">
                Wählen Sie Ihre Branche und beschreiben Sie Ihre Spezialisierung.
              </p>
            </div>
          
            <div>
              <label htmlFor="industry" className={labelStyle}>
                Ihre Branche
              </label>
              <Select
                id="industry"
                options={INDUSTRY_OPTIONS}
                onChange={handleIndustryChange}
                styles={selectStyles}
                placeholder="Branche auswählen..."
                isClearable
                required
                value={INDUSTRY_OPTIONS.find(opt => opt.value === industry)}
              />
            </div>
            
            {/* --- Logik für Elektriker --- */}
            {industry === "elektriker" && (
              <div className="space-y-3 pt-2">
                 <p className={labelStyle}>Spezialgebiete (Elektriker)</p>
                 <label className="flex cursor-pointer items-center gap-4 rounded-lg border border-slate-300 p-4 transition-all has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                   <input type="checkbox" name="smartHome" checked={elektroServices.smartHome} onChange={handleServiceChange} className="size-4 rounded text-orange-600 focus:ring-orange-500" />
                   <span className="text-sm font-medium text-slate-700">Smart Home & KNX</span>
                 </label>
                 <label className="flex cursor-pointer items-center gap-4 rounded-lg border border-slate-300 p-4 transition-all has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                   <input type="checkbox" name="photovoltaik" checked={elektroServices.photovoltaik} onChange={handleServiceChange} className="size-4 rounded text-orange-600 focus:ring-orange-500" />
                   <span className="text-sm font-medium text-slate-700">Photovoltaik & Speicher</span>
                 </label>
                 <label className="flex cursor-pointer items-center gap-4 rounded-lg border border-slate-300 p-4 transition-all has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                   <input type="checkbox" name="wallbox" checked={elektroServices.wallbox} onChange={handleServiceChange} className="size-4 rounded text-orange-600 focus:ring-orange-500" />
                   <span className="text-sm font-medium text-slate-700">E-Mobilität (Wallboxen)</span>
                 </label>
              </div>
            )}
            
            {/* --- Logik für alle anderen --- */}
            {industry && industry !== "elektriker" && (
              <>
                <div>
                  <label htmlFor="servicesDescription" className={labelStyle}>Ihre Kernleistungen</label>
                  <p className={subLabelStyle}>Passen Sie die Vorlage an. Eine Leistung pro Zeile.</p>
                  <textarea id="servicesDescription" name="servicesDescription" rows={5} value={servicesDescription} onChange={(e) => setServicesDescription(e.target.value)} className={inputStyle} />
                </div>
                <div>
                  <label htmlFor="keywords" className={labelStyle}>Ihre Nische / Keywords</label>
                  <p className={subLabelStyle}>Materialien, Marken, Region, etc.</p>
                  <textarea id="keywords" name="keywords" rows={3} value={keywords} onChange={(e) => setKeywords(e.target.value)} className={inputStyle} placeholder="z.B. Lehmputz, ökologische Farben, Altbausanierung..." />
                </div>
              </>
            )}

            <button type="submit" disabled={loading || !industry} className={submitButtonStyle}>
              {loading ? <ArrowPathIcon className="size-5" /> : "Weiter"}
            </button>
            <button type="button" onClick={() => setStep(1)} disabled={loading} className={backButtonStyle}>
              Zurück
            </button>
          </form>
        )}
        
        {/* --- SCHRITT 3: Kontakt --- */}
        {step === 3 && (
           <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl bg-white p-8 shadow-xl shadow-orange-100/50"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900">Kontaktinformationen</h3>
              <p className="mt-1 text-sm text-slate-600">
                Diese Daten werden für Ihr Impressum und die Fußzeile benötigt.
              </p>
            </div>
            
            <div>
              <label htmlFor="address" className={labelStyle}>
                Vollständige Adresse
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputStyle}
                placeholder="Musterstraße 1, 12345 Musterstadt"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className={labelStyle}>
                Telefonnummer
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputStyle}
                placeholder="+49 123 456789"
                required
              />
            </div>
            
            <button type="submit" disabled={loading} className={submitButtonStyle}>
              {loading ? <ArrowPathIcon className="size-5" /> : "Weiter (KI-Texte generieren)"}
            </button>
            <button type="button" onClick={() => setStep(2)} disabled={loading} className={backButtonStyle}>
              Zurück
            </button>
          </form>
        )}
        
        {/* --- SCHRITT 4: AI-Texte --- */}
        {step === 4 && (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl bg-white p-8 shadow-xl shadow-orange-100/50"
          >
            <div className="text-center">
              <SparklesIcon className="mx-auto size-8 text-orange-500" />
              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                Startseite-Texte (Vorschlag)
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Passen Sie die KI-Vorschläge an oder übernehmen Sie sie direkt.
              </p>
            </div>
            
            <div>
              <label htmlFor="heroTitle" className={labelStyle}>Hero-Überschrift</label>
              <input type="text" id="heroTitle" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className={inputStyle} />
            </div>
            <div>
              <label htmlFor="heroSubtitle" className={labelStyle}>Hero-Untertitel</label>
              <textarea id="heroSubtitle" name="heroSubtitle" rows={3} value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className={inputStyle} />
            </div>
            <div>
              <label htmlFor="aboutText" className={labelStyle}>"Über Uns" Text (Kurzversion)</label>
              <textarea id="aboutText" name="aboutText" rows={5} value={aboutText} onChange={(e) => setAboutText(e.target.value)} className={inputStyle} />
            </div>

            <button type="submit" disabled={loading} className={submitButtonStyle}>
              {loading ? <ArrowPathIcon className="size-5" /> : "Weiter"}
            </button>
            <button type="button" onClick={() => setStep(3)} disabled={loading} className={backButtonStyle}>
              Zurück
            </button>
          </form>
        )}
        
        {/* --- SCHRITT 5: Rechtliches --- */}
        {step === 5 && (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl bg-white p-8 shadow-xl shadow-orange-100/50"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900">Rechtstexte (Vorschlag)</h3>
              <p className="mt-1 text-sm text-slate-600">
                Diese Texte wurden mit Ihren Kontaktdaten vorbefüllt. 
                <span className="font-semibold">Bitte prüfen Sie sie sorgfältig.</span>
              </p>
            </div>
            
             <div>
              <label htmlFor="impressumText" className={labelStyle}>Impressum</label>
              <p className={subLabelStyle}>Sie können dies später im Dashboard genauer anpassen.</p>
              <textarea id="impressumText" name="impressumText" rows={8} value={impressumText} onChange={(e) => setImpressumText(e.target.value)} className={inputStyle + " text-xs"} />
            </div>
            
            <div>
              <label htmlFor="datenschutzText" className={labelStyle}>Datenschutzerklärung</label>
              <p className={subLabelStyle}>Basiert auf der ArtisanCMS-Standardvorlage.</p>
              <textarea id="datenschutzText" name="datenschutzText" rows={8} value={datenschutzText} onChange={(e) => setDatenschutzText(e.target.value)} className={inputStyle + " text-xs"} />
            </div>
            
            <button type="submit" disabled={loading} className={submitButtonStyle}>
              {loading ? <ArrowPathIcon className="size-5" /> : "Weiter zur Prüfung"}
            </button>
            <button type="button" onClick={() => setStep(4)} disabled={loading} className={backButtonStyle}>
              Zurück
            </button>
          </form>
        )}
        
        {/* --- SCHRITT 6: Review & Go Live --- */}
        {step === 6 && (
           <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl bg-white p-8 shadow-xl shadow-orange-100/50"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900">Letzte Überprüfung</h3>
              <p className="mt-1 text-sm text-slate-600">
                Passt alles? Mit Klick auf "Abschließen" wird Ihr Profil gespeichert und Ihre Webseite ist startklar.
              </p>
            </div>
            
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
              <h4 className="font-semibold text-slate-800">Checkliste:</h4>
              <p><strong>Name:</strong> {businessName}</p>
              <p><strong>Logo:</strong> {logoUrl ? "Hochgeladen ✔" : "Kein Logo"}</p>
              <p><strong>Branche:</strong> {INDUSTRY_TEMPLATES[industry as Industry]?.label || "N/A"}</p>
              <p><strong>Kontakt:</strong> {address}, {phone}</p>
              <p><strong>Hero-Titel:</strong> {heroTitle.substring(0, 40)}...</p>
              <p><strong>Über Uns:</strong> {aboutText.substring(0, 40)}...</p>
            </div>
            
            <button type="submit" disabled={loading} className={submitButtonStyle + " bg-green-600 hover:bg-green-500 shadow-green-200"}>
              {loading ? <ArrowPathIcon className="size-5" /> : "Onboarding abschließen & Starten"}
            </button>
            <button type="button" onClick={() => setStep(5)} disabled={loading} className={backButtonStyle}>
              Zurück
            </button>
          </form>
        )}

      </div>
    </div>
  );
}