interface FooterProps {
  currentPage?: string;
  onNavigate?: (tab: string) => void;
}

const Footer = ({ currentPage, onNavigate }: FooterProps) => {
  const links = [
    { id: 'about', label: 'About', href: '/' },
    { id: 'privacy', label: 'Privacy', href: '/privacy' },
    { id: 'mail', label: 'Mail', href: 'mailto:pathurisai31@gmail.com' },
    { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/charannsai' }
  ];

  const filteredLinks = currentPage === 'about' 
    ? links.filter(link => link.id !== 'about')
    : currentPage === 'privacy'
    ? links.filter(link => link.id !== 'privacy')
    : links;

  return (
    <footer className="mt-16">
      <div className="flex justify-center gap-8 border-t border-border/30 pt-8">
        {filteredLinks.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target={link.id === 'linkedin' ? '_blank' : undefined}
            rel={link.id === 'linkedin' ? 'noopener noreferrer' : undefined}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;