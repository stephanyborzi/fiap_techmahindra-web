'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  { title: "Cadastre-se", description: "Crie sua conta e deposite fundos com segurança." },
  { title: "Faça Suas Apostas", description: "Escolha entre várias opções de apostas durante a corrida." },
  { title: "Ganhe & Receba", description: "Assista à corrida, aposte e concorra a recompensas" },
];

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-800 dark:text-gray-200"
          {...fadeInUp}
        >
          Como Funciona o Fórmula E - Aposta ao Vivo
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
            >
              <Card className="text-center bg-white dark:bg-gray-700 border-none">
                <CardContent className="pt-6">
                  <motion.div
                    className="w-16 h-16 bg-primary dark:bg-primary-light text-white dark:text-gray-900 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {index + 1}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}