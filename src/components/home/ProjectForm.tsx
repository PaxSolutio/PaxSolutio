"use client";

import { FormEvent, useState } from "react";
import { submitLead } from "@/lib/leads/submitLead";

const projectTypes = [
  {
    value: "supplier",
    label: "Trouver un fournisseur",
  },
  {
    value: "product",
    label: "Importer un produit",
  },
  {
    value: "vehicle",
    label: "Importer un véhicule",
  },
  {
    value: "logistics",
    label: "Transporter une marchandise",
  },
  {
    value: "quality",
    label: "Contrôler une usine / commande",
  },
  {
    value: "dropshipping",
    label: "Créer une solution dropshipping",
  },
];

const inputClass =
  "w-full rounded-xl border border-[#DDE5EE] bg-white px-4 py-4 text-sm text-[#071B33] outline-none transition placeholder:text-[#9BA8B8] focus:border-[#176BFF]";

export default function ProjectForm() {
  const [projectType, setProjectType] = useState("supplier");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      let payload: Record<string, unknown> = {};

      if (projectType === "vehicle") {
        payload = {
          brand: form.get("brand")?.toString(),
          model: form.get("model")?.toString(),
          year: form.get("year")?.toString(),
          budget: form.get("budget")?.toString(),
        };
      } else if (projectType === "logistics") {
        payload = {
          origin: form.get("origin")?.toString(),
          destination: form.get("destination")?.toString(),
          weightVolume: form.get("weightVolume")?.toString(),
          goodsType: form.get("goodsType")?.toString(),
        };
      } else {
        payload = {
          product: form.get("product")?.toString(),
          quantity: form.get("quantity")?.toString(),
          budget: form.get("budget")?.toString(),
          destination: form.get("destination")?.toString(),
        };
      }

      const leadType =
        projectType === "vehicle"
          ? "automotive"
          : projectType === "logistics"
            ? "logistics"
            : projectType === "quality"
              ? "quality"
              : projectType === "dropshipping"
                ? "dropshipping"
                : projectType === "supplier"
                  ? "supplier"
                  : "sourcing";

      await submitLead({
        type: leadType,

        name: form.get("name")?.toString(),

        email:
          form.get("email")?.toString() || "",

        message:
          form.get("message")?.toString(),

        sourcePage: "/",

        website:
          form.get("website")?.toString(),

        payload: {
          projectType,
          ...payload,
        },
      });

      formElement.reset();

      setProjectType("supplier");
      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="project"
      className="bg-[#F6F8FB] py-16 lg:py-20 xl:py-32"
    >
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="overflow-hidden rounded-[36px] border border-[#E1E8F0] bg-white shadow-[0_25px_80px_rgba(7,27,51,0.06)]">
          <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
            <div className="bg-[#071B33] p-8 text-white sm:p-10 lg:p-12">
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#75A8FF]">
                Étudions votre projet
              </div>

              <h2 className="mt-5 text-[34px] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-[42px]">
                Parlez-nous de votre besoin.
              </h2>

              <p className="mt-5 max-w-[430px] text-sm leading-7 text-white/60">
                Quelques informations suffisent pour identifier les premières étapes,
                les fournisseurs, les contraintes et la logistique à prévoir.
              </p>

              <div className="mt-10 space-y-5">
                {[
                  "Analyse du besoin",
                  "Orientation du projet",
                  "Recherche ou logistique selon votre demande",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm font-bold text-white/85"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#176BFF]/20 text-[11px] text-[#75A8FF]">
                      ✓
                    </span>
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-12 border-t border-white/10 pt-7">

                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#75A8FF]">
                  Un projet à étudier ?
                </div>

                <div className="mt-5 space-y-4">

                  <div className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#176BFF] text-[11px] font-black text-white">
                      ✓
                    </span>

                    <div>
                      <div className="text-sm font-extrabold text-white">
                        Étude sans engagement
                      </div>
                      <p className="mt-1 text-xs leading-5 text-white/55">
                        Nous analysons d’abord votre besoin et sa faisabilité.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#176BFF] text-[11px] font-black text-white">
                      ✓
                    </span>

                    <div>
                      <div className="text-sm font-extrabold text-white">
                        Réponse sous 24–48 h ouvrées
                      </div>
                      <p className="mt-1 text-xs leading-5 text-white/55">
                        Un premier retour après analyse de votre demande.
                      </p>
                    </div>
                  </div>

                </div>

                <div className="mt-7 rounded-[18px] border border-white/10 bg-white/[0.06] p-5">

                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#75A8FF]">
                    Contact direct
                  </div>

                  <div className="mt-2 text-sm font-extrabold text-white">
                    WhatsApp professionnel
                  </div>

                  <div className="mt-1 text-xs text-white/55">
                    +33 7 43 57 42 34
                  </div>

                  <a
                    href="https://wa.me/33743574234"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#176BFF] px-4 text-xs font-extrabold !text-white transition hover:-translate-y-0.5 hover:bg-[#2B78FF]"
                  >
                    Échanger sur WhatsApp
                    <span className="ml-2">→</span>
                  </a>

                </div>

                <div className="mt-6 text-[11px] font-bold text-white/35">
                  PaxSolutio · France + Chine
                </div>

              </div>
            </div>

            <div className="p-7 sm:p-10 lg:p-12">
              <form
                onSubmit={handleSubmit}
                className="relative"
              >

                {/* HONEYPOT ANTI-SPAM */}
                <div
                  aria-hidden="true"
                  className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
                >
                  <label htmlFor="project-website">
                    Website
                  </label>

                  <input
                    id="project-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="text-sm font-extrabold text-[#071B33]">
                    Quel est votre besoin ?
                  </label>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projectTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setProjectType(type.value);
                          setSuccess(false);
                          setError("");
                        }}
                        className={`min-h-[82px] rounded-2xl border px-5 py-5 text-left text-sm font-bold leading-5 transition ${projectType === type.value
                          ? "border-[#176BFF] bg-[#F2F7FF] text-[#176BFF]"
                          : "border-[#E2E8F0] bg-white text-[#52647B] hover:border-[#BECBDD]"
                          }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  <input
                    name="name"
                    type="text"
                    placeholder="Nom / Société"
                    className={inputClass}
                  />

                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Adresse e-mail"
                    className={inputClass}
                  />

                  {projectType === "vehicle" && (
                    <>
                      <input
                        name="brand"
                        type="text"
                        placeholder="Marque du véhicule"
                        className={inputClass}
                      />

                      <input
                        name="model"
                        type="text"
                        placeholder="Modèle recherché"
                        className={inputClass}
                      />

                      <input
                        name="year"
                        type="text"
                        placeholder="Année souhaitée"
                        className={inputClass}
                      />

                      <input
                        name="budget"
                        type="text"
                        placeholder="Budget approximatif"
                        className={inputClass}
                      />
                    </>
                  )}

                  {projectType === "logistics" && (
                    <>
                      <input
                        name="origin"
                        type="text"
                        placeholder="Pays / ville de départ"
                        className={inputClass}
                      />

                      <input
                        name="destination"
                        type="text"
                        placeholder="Pays / ville de destination"
                        className={inputClass}
                      />

                      <input
                        name="weightVolume"
                        type="text"
                        placeholder="Poids / volume / CBM"
                        className={inputClass}
                      />

                      <input
                        name="goodsType"
                        type="text"
                        placeholder="Type de marchandise"
                        className={inputClass}
                      />
                    </>
                  )}

                  {!["vehicle", "logistics"].includes(projectType) && (
                    <>
                      <input
                        name="product"
                        type="text"
                        placeholder="Produit / service recherché"
                        className={inputClass}
                      />

                      <input
                        name="quantity"
                        type="text"
                        placeholder="Quantité approximative"
                        className={inputClass}
                      />

                      <input
                        name="budget"
                        type="text"
                        placeholder="Budget approximatif"
                        className={inputClass}
                      />

                      <input
                        name="destination"
                        type="text"
                        placeholder="Pays de destination"
                        className={inputClass}
                      />
                    </>
                  )}
                </div>

                <textarea
                  name="message"
                  rows={5}
                  placeholder="Décrivez votre projet, vos contraintes ou les informations dont vous disposez déjà."
                  className={`${inputClass} mt-4 resize-none`}
                />

                <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <p className="max-w-[500px] text-xs leading-6 text-[#657386]">
                    Votre demande sera transmise à PaxSolutio afin d&apos;être
                    étudiée.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-8 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0F5BE0] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Envoi..."
                      : "Envoyer ma demande"}

                    {!loading && (
                      <span className="ml-3">
                        →
                      </span>
                    )}
                  </button>
                </div>

                {/* INFORMATION RGPD */}

                <p className="mt-5 max-w-[650px] text-xs leading-6 text-[#7B8798]">
                  En envoyant ce formulaire, vous acceptez que PaxSolutio utilise
                  les informations transmises afin de traiter votre demande et de
                  vous recontacter. Pour en savoir plus sur l&apos;utilisation de
                  vos données et vos droits, consultez notre{" "}
                  <a
                    href="/confidentialite"
                    className="font-bold !text-[#176BFF] hover:underline"
                  >
                    politique de confidentialité
                  </a>
                  .
                </p>

                {success && (
                  <div className="mt-6 rounded-xl bg-[#EAF8EF] px-5 py-4 text-sm font-bold text-[#237447]">
                    Votre demande a bien été envoyée.
                  </div>
                )}

                {error && (
                  <div className="mt-6 rounded-xl bg-[#FFF0F0] px-5 py-4 text-sm font-bold text-[#A84242]">
                    {error}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}