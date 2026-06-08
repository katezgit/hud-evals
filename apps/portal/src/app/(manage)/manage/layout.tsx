interface ManageSectionLayoutProps {
  children: React.ReactNode;
}

// Section layout shared across every /manage/* page. Holds the page header
// container so individual section pages just supply their own h1 + content.
export default function ManageSectionLayout({ children }: ManageSectionLayoutProps) {
  return <div className="mx-auto max-w-3xl">{children}</div>;
}
