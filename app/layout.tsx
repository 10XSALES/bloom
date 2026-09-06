import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Bloom · Money & possibility',description:'Connect your goals with your wallet, recurring income and expenses, and payday cash forecasts.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
