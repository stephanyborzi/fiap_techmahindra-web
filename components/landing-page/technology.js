'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import CarroImg from '../../public/images/carro.jpeg'
import { Card, CardContent } from "@/components/ui/card";

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

export default function TechnologySection() {
  return (
    <section id="technology" className="py-20 bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-800 dark:text-gray-200"
          {...fadeInUp}
        >
          Potencializado por Tecnologia de Veículos Conectados de Ponta
        </motion.h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-6"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
          >
            {[
              "Dados de telemetria em tempo real dos carros da Fórmula E",
              "Análises preditivas com IA para resultados de corridas",
              "Transações de apostas seguras em blockchain",
              "Transmissão de dados de baixa latência habilitada por 5G",
              "Sensores IoT para informações abrangentes de pista e clima",
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-3"
                variants={fadeInUp}
              >
                <ChevronRight className="text-primary dark:text-primary-light" />
                <p className="text-gray-700 dark:text-gray-300">{item}</p>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="relative h-80 rounded-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Image
              src={CarroImg}
              alt="Tecnologia de Veículos Conectados"
              layout="fill"
              objectFit="cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}