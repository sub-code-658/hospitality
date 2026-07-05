const Footer = () => {
  const { t } = useTranslation();
import { useTranslation } from 'react-i18next';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass border-t border-white/10 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-white/50">© {currentYear} EventStaff Nepal. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-white/50 hover:text-white transition-colors text-sm">{t('common.privacy_policy', 'Privacy Policy')}</a>
            <a href="#" className="text-white/50 hover:text-white transition-colors text-sm">{t('common.terms_of_service', 'Terms of Service')}</a>
            <a href="#" className="text-white/50 hover:text-white transition-colors text-sm">{t('common.contact', 'Contact')}</a>
          </div>
        </div>
        <p className="text-white/30 text-sm mt-4">{t('common.made_with_in_nepal', 'Made with ❤️ in Nepal')}</p>
      </div>
    </footer>
  );
};

export default Footer;