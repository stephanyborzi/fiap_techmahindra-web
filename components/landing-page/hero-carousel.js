'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import MonacoE from '@/public/images/monaco-e-prix.webp';
import TradePoints from '@/public/images/trade-points.jpeg';
import PastEvents from '@/public/images/past-events.jpeg';

const carouselItems = [
  {
    title: "Ao Vivo: E-Prix de Mônaco",
    description: "Faça suas apostas na emocionante corrida de rua!",
    cta: "Aposte Agora",
    image: MonacoE,
  },
  {
    title: "Troque Seus Pontos",
    description: "Troque seus ganhos por mercadorias e experiências exclusivas da Fórmula E!",
    cta: "Trocar Agora",
    image: TradePoints,
  },
  {
    title: "Analise Eventos Passados",
    description: "Mergulhe em dados históricos e melhore sua estratégia de apostas!",
    cta: "Ver Resultados",
    image: PastEvents,
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % carouselItems.length);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="home"
      className="relative h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ scale: [1, 1.1] }}
            transition={{ duration: 20, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
          >
            <Image
              src={carouselItems[currentSlide].image}
              alt={carouselItems[currentSlide].title}
              layout="fill"
              objectFit="cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-black opacity-40"></div>
        </motion.div>
      </AnimatePresence>
      <div className="container mx-auto px-4 text-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
            >
              {carouselItems[currentSlide].title}
            </motion.h1>
            <motion.p
              className="text-xl mb-8 text-white drop-shadow-md"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity, delay: 0.2 }}
            >
              {carouselItems[currentSlide].description}
            </motion.p>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity, delay: 0.4 }}
            >
              <Link href="/live">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {carouselItems[currentSlide].cta} <ChevronRight className="ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-2 z-10">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? 'bg-primary' : 'bg-gray-400'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
      <Button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10"
        onClick={() =>
          setCurrentSlide(
            (prev) => (prev - 1 + carouselItems.length) % carouselItems.length
          )
        }
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      <Button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10"
        onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselItems.length)}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>
    </section>
  );
}