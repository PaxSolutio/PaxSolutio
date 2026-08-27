type LegalPageProps = {
  title: string;
  children: React.ReactNode;
};

export default function LegalPage({
  title,
  children,
}: LegalPageProps) {
  return (
    <section className="bg-white pb-24 pt-40 lg:pb-32 lg:pt-48">
      <div className="mx-auto max-w-[900px] px-6">
        <h1 className="text-[42px] font-extrabold tracking-[-0.05em] text-[#071B33] sm:text-[54px]">
          {title}
        </h1>

        <div className="mt-12 space-y-10 text-base leading-8 text-[#657386]">
          {children}
        </div>
      </div>
    </section>
  );
}