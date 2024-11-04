'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { number: "50.000+", label: "Usuários Ativos" },
  { number: "5.000+", label: "Prêmios Ganhos" },
  { number: "99,9%", label: "Disponibilidade" },
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

export default function StatsSection() {
  return (
    <section id="stats" className="py-20 bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-800 dark:text-gray-200"
          {...fadeInUp}
        >
          Junte-se a Milhares de Apostadores Satisfeitos
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
            >
              <Card className="text-center bg-white dark:bg-gray-700 border-none">
                <CardContent className="pt-6">
                  <motion.p
                    className="text-4xl font-bold text-primary dark:text-primary-light mb-2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {stat.number}
                  </motion.p>
                  <p className="text-xl text-gray-600 dark:text-gray-300">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}