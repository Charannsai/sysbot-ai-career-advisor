interface FooterProps {
  currentPage?: string;
}

const Footer = ({ currentPage }: FooterProps) => {
  return (
    <footer className="mt-16 pt-8 border-t border-border">
      <div className="text-center text-sm text-muted-foreground">
        <p>&copy; 2024 SysBot AI Career Studio. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;