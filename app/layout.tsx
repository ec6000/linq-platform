import Navbar from "@/components/layout/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <Navbar userRole="provider" userName="E" />
        {children}
      </body>
    </html>
  );
}