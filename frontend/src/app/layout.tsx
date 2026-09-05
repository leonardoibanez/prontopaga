import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Consulta Riesgo Financiero',
  description: 'Plataforma de consulta de riesgo financiero.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
