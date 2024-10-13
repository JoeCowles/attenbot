"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { ArrowRight } from "lucide-react";

export default function FeaturesComparison() {
  const [sliderPosition, setSliderPosition] = useState(50);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="relative">
      {/* Top wavy line divider */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-[50px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-gray-50"
          ></path>
        </svg>
      </div>

      <section className="relative">
        <div className="container mx-auto px-4 py-20">
          <motion.h2
            className="text-4xl font-bold mb-12 text-center text-blue-600 dark:text-blue-400"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            Revolutionizing Child Focus
          </motion.h2>

          <motion.div
            className="mb-12"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <ReactCompareSlider
              itemOne={
                <ReactCompareSliderImage
                  src="/dontblockedu.png"
                  alt="Video of a child being blocked from watching MrBeast"
                />
              }
              itemTwo={
                <ReactCompareSliderImage
                  src="/blockbeast.png"
                  alt="Video of a child watching an educational video without being blocked"
                />
              }
              position={sliderPosition}
              onPositionChange={setSliderPosition}
              style={{
                height: "400px",
                width: "80%",
                maxWidth: "800px",
                margin: "0 auto",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            />
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Drag the slider to compare Attenbot's response to educational
              content vs. entertainment content
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold mb-4 text-red-600 dark:text-red-400">
                Traditional Parental Controls
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✖</span>
                  <span>
                    You still have to constantly keep your child on task
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✖</span>
                  <span>
                    Brute force blocks all content even content your child needs
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✖</span>
                  <span>Frustrates children and hinders learning</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold mb-4 text-green-600 dark:text-green-400">
                Attenbot's Intelligent Approach
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✔</span>
                  <span>
                    Promotes healthy focus habits and only involves you when
                    needed
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✔</span>
                  <span>
                    Dynamically checks content relevance instead of blocking
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✔</span>
                  <span>
                    Allows educational content, even from entertainment sources
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom wavy line divider */}
      <div className="absolute -bottom-[149px] left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-[calc(100%+1.3px)] h-[150px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-white"
          ></path>
        </svg>
      </div>
    </div>
  );
}
