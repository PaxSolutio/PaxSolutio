import Image from "next/image";
import Link from "next/link";

const vehicles = [
    {
        brand: "BYD",
        name: "Seal U",
        type: "SUV",
        energy: "Hybride rechargeable",
        details: ["DM-i (PHEV)", "5 places", "Export sur étude"],
        image: "/automotive/vehicles/byd-seal-u.jpg",
    },
    {
        brand: "BYD",
        name: "Seal 5",
        type: "Berline",
        energy: "Hybride rechargeable",
        details: ["DM-i (PHEV)", "5 places", "Export sur étude"],
        image: "/automotive/vehicles/byd-seal-5.jpg",
    },
    {
        brand: "GEELY",
        name: "Okavango",
        type: "SUV familial",
        energy: "Essence",
        details: ["7 places", "SUV familial", "Export sur étude"],
        image: "/automotive/vehicles/geely-okavango.webp",
    },
    {
        brand: "JETOUR",
        name: "T2",
        type: "SUV",
        energy: "Essence",
        details: ["SUV tout-terrain", "5 places", "Export sur étude"],
        image: "/automotive/vehicles/jetour-t2.jpg",
    },
    {
        brand: "TOYOTA",
        name: "86",
        type: "Coupé sportif",
        energy: "Essence",
        details: ["2.0 L", "4 places", "Export sur étude"],
        image: "/automotive/vehicles/toyota-86.webp",
    },
];

export default function VehicleShowcase() {
    return (
        <section className="bg-[#F6F8FB] py-24 lg:py-32">
            <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
                <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                    <div className="max-w-[760px]">
                        <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
                            Exemples de véhicules sourçables
                        </div>

                        <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
                            Des modèles recherchés directement
                            <span className="text-[#176BFF]">
                                {" "}
                                sur le marché chinois.
                            </span>
                        </h2>

                        <p className="mt-6 max-w-[680px] text-lg leading-8 text-[#657386]">
                            SUV, berlines ou modèles spécifiques : nous recherchons le véhicule
                            correspondant à vos critères, vérifions l'offre et pouvons coordonner
                            son export selon votre destination.
                        </p>
                    </div>

                    <div className="text-sm font-bold text-[#657386]">
                        Faites défiler →
                    </div>
                </div>

                <div className="mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
                    {vehicles.map((vehicle) => (
                        <article
                            key={vehicle.name}
                            className="group min-w-[86%] snap-start overflow-hidden rounded-[28px] border border-[#E2E8F0] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(7,27,51,0.08)] sm:min-w-[48%] lg:min-w-[31%]"
                        >
                            <div className="relative h-[240px] overflow-hidden bg-[#EAF2FF]">
                                <Image
                                    src={vehicle.image}
                                    alt={vehicle.name}
                                    fill
                                    sizes="(max-width: 640px) 86vw, (max-width: 1024px) 48vw, 31vw"
                                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                            </div>

                            <div className="p-7">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#176BFF]">
                                            {vehicle.brand}
                                        </div>

                                        <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.035em] text-[#071B33]">
                                            {vehicle.name}
                                        </h3>

                                        <div className="mt-1 text-sm font-bold text-[#657386]">
                                            {vehicle.type} · {vehicle.energy}
                                        </div>
                                    </div>

                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2F6FB] text-[#176BFF] transition group-hover:bg-[#176BFF] group-hover:text-white">
                                        →
                                    </span>
                                </div>

                                <div className="mt-6 space-y-3">
                                    {vehicle.details.map((detail) => (
                                        <div
                                            key={detail}
                                            className="flex items-center gap-3 text-sm font-medium text-[#52647B]"
                                        >
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF5FF] text-[10px] font-black text-[#176BFF]">
                                                ✓
                                            </span>

                                            <span>{detail}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 border-t border-[#E8EDF3] pt-5">
                                    <p className="text-xs leading-5 text-[#7C8999]">
                                        Prix, version et disponibilité confirmés après étude de votre demande.
                                    </p>

                                    <Link
                                        href="#vehicle-request"
                                        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#176BFF] px-5 py-3.5 text-sm font-extrabold !text-white transition hover:bg-[#0F5BE0]"
                                    >
                                        Demander ce modèle
                                        <span className="ml-3">→</span>
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}