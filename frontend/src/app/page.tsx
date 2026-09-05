import { ApiStatus } from '@/components/api-status';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="shell">
      <header className="header">
        <Link href="/" className="brand" aria-label="Consulta Riesgo Financiero, inicio"><span className="brand-icon" aria-hidden="true">CR</span><span>Consulta Riesgo<br /><strong>Financiero</strong></span></Link>
        <span className="version">Versión inicial</span>
      </header>
      <main>
        <section className="hero">
          <span className="eyebrow">CONSULTA RIESGO FINANCIERO</span>
          <h1>Un punto de partida para<br /><span>decisiones informadas.</span></h1>
          <p className="intro">Bienvenido a tu plataforma de consulta de riesgo financiero. Estamos preparando un espacio para reunir la información que necesitas.</p>
        </section>
        <ApiStatus />
        <section className="overview" aria-labelledby="overview-title">
          <div><span className="eyebrow">EL PROYECTO</span><h2 id="overview-title">La base está lista.</h2></div>
          <p>Esta primera versión establece la conexión entre la plataforma y su servicio. Las consultas estarán disponibles cuando se integren las fuentes de información.</p>
        </section>
        <div className="cards">
          <article className="card"><span className="card-number">01</span><h3>Consultas centralizadas</h3><p>Un espacio pensado para acceder a información financiera desde un solo lugar.</p><span className="badge">Próximamente</span></article>
          <article className="card"><span className="card-number">02</span><h3>Información de riesgo</h3><p>Integración de fuentes y criterios de evaluación por definir para el proyecto.</p><span className="badge">Próximamente</span></article>
          <article className="card"><span className="card-number">03</span><h3>Seguimiento de consultas</h3><p>Una futura vista para organizar y revisar el historial de tus consultas.</p><span className="badge">Próximamente</span></article>
        </div>
      </main>
      <footer>Consulta Riesgo Financiero <span>Plataforma en desarrollo</span></footer>
    </div>
  );
}
