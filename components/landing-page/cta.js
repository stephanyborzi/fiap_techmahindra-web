'use client';

import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function CTASection() {
  return (
    <section className="bg-primary dark:bg-primary-light py-20">
      <div className="container mx-auto px-4 text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-6 text-white dark:text-gray-900"
          {...fadeInUp}
        >
          Pronto para Revolucionar Sua Experiência na Fórmula E?
        </motion.h2>
        <motion.p
          className="text-xl mb-8 text-white dark:text-gray-800"
          {...fadeInUp}
        >
          Cadastre-se agora e ganhe 100% de bônus em sua primeira Aposta!
        </motion.p>
        <motion.div {...fadeInUp}>
          <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100 dark:bg-gray-900 dark:text-primary-light dark:hover:bg-gray-800">
            Junte-se ao Fórmula E - Aposta ao Vivo Agora
          </Button>
        </motion.div>
      </div>
    </section>
  );
}