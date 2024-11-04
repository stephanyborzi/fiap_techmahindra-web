'use client';

import { motion } from 'framer-motion';
import { Zap, Trophy, Users, Car, MessageSquare } from 'lucide-react';

const features = [
  { icon: Zap, title: "Apostas em Tempo Real", description: "Faça apostas enquanto a corrida acontece com nossa plataforma ultrarrápida." },
  { icon: Trophy, title: "Recompensas Exclusivas", description: "Ganhe mercadorias, ingressos e experiências únicas da Fórmula E." },
  { icon: Users, title: "Interação Comunitária", description: "Engaje com outros fãs em nosso chat ao vivo durante as corridas." },
  { icon: Car, title: "Estatísticas Detalhadas", description: "Acesse dados profundos sobre o desempenho e estratégia de cada carro." },
  { icon: MessageSquare, title: "Análises de Especialistas", description: "Obtenha insights de profissionais de corrida para informar suas apostas." },
  { icon: Zap, title: "Pagamentos Instantâneos", description: "Receba seus ganhos imediatamente após o término da corrida." },
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

export default function Features() {
  return (
    <section id="features" className="bg-gray-100 dark:bg-gray-800 py-20">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-12 text-center text-primary dark:text-primary-light"
          {...fadeInUp}
        >
          Por que Escolher Fórmula E - Aposta ao Vivo?
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300"
              variants={fadeInUp}
            >
              <feature.icon className="w-12 h-12 mb-4 text-primary dark:text-primary-light" />
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}