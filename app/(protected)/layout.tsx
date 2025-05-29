// Example: app/(protect)/layout.tsx
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Maybe a common sidebar or header for protected routes */}
      {children} {/* This is ESSENTIAL for your pages to render */}
      {/* Maybe a common footer */}
    </div>
  );
}