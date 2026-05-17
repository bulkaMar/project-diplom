import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';
import MainLayoutWrapper from '@/components/Layout/MainLayoutWrapper';

export const metadata = {
  title: 'C++ Educational Platform',
  description: 'Master C++ programming with interactive lessons.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <style>{`
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
        `}</style>
      </head>
      <body>
        <ThemeRegistry>
          <AuthProvider>
            <MainLayoutWrapper>
              {children}
            </MainLayoutWrapper>
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
