export default function Home() {
  return (
    <main className="min-h-screen bg-[#FBF5EE] text-[#1D1108]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16 sm:px-10">
        <div className="max-w-3xl">
          <p className="mb-4 font-[family-name:var(--font-display)] text-3xl italic text-[#D4562B]">
            revela
          </p>
          <h1 className="text-4xl font-bold leading-tight text-[#1D1108] sm:text-6xl">
            Mural de fotos ao vivo para eventos privados.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#8A6B55]">
            Convidados enviam fotos por QR Code, moderadores aprovam o conteudo
            e o telão exibe um feed em tempo real somente com fotos aprovadas.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            ["Convidados", "Upload mobile sem login, com nome e mensagem por foto."],
            ["Moderadores", "Links secretos individuais para aprovar ou rejeitar fotos."],
            ["Telão", "Feed ao vivo com identidade visual do evento e QR Code."],
          ].map(([title, description]) => (
            <article
              className="rounded-xl border border-[#E8DDD1] bg-white p-5 shadow-sm"
              key={title}
            >
              <h2 className="text-base font-bold text-[#1D1108]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#8A6B55]">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
