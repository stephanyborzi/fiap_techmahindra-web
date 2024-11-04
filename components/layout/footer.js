import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Sobre Nós</h3>
            <p className="text-gray-600 dark:text-gray-400">Fórmula E - Aposta ao Vivo é a plataforma líder em apostas para corridas de Fórmula E, oferecendo uma experiência emocionante e segura.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Links Rápidos</h3>
            <ul className="space-y-2">
              {['Início', 'Recursos', 'Tecnologia', 'Como Funciona', 'Estatísticas'].map((item) => (
                <li key={item}>
                  <Link href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors duration-300">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Contate-nos</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Tem alguma dúvida? Entre em contato conosco!</p>
            <Button variant="outline">Fale Conosco</Button>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400">&copy; 2024 Fórmula E - Aposta ao Vivo. Todos os direitos reservados.</p>
          <div className="mt-4 space-x-4">
            <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors duration-300">
              Termos de Serviço
            </Link>
            <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors duration-300">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}