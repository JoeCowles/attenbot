"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FeaturesComparison from "@/components/ui/FeaturesComparison";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const waitlistRef = useRef<HTMLElement>(null);
  const router = useRouter();
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const fadeInUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const fadeInLeft: Variants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
  };

  const fadeInRight: Variants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
  };

  const scrollToWaitlist = () => {
    waitlistRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      } w-full`}

    >
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <a href="#" className="flex items-center">
              <Image
                src="/icon/android-chrome-192x192.png"
                alt="Attenbot Icon"
                width={50}
                height={40}
                className="mr-2"
              />
            </a>
          </div>
          <div className="hidden md:flex space-x-6 items-center">
            <a href="#features" className="hover:text-[#0c8cfc] transition-colors">Features</a>
            <a href="#how-we-do-this" className="hover:text-[#0c8cfc] transition-colors">How It Works</a>
            <a href="#contact" className="hover:text-[#0c8cfc] transition-colors">Contact</a>
            <Button 
              size="sm" 
              className="bg-[#0c8cfc] hover:bg-[#0c8cfc] text-white text-sm" 
              onClick={() => {router.push("/sign-in")}}
            >
              Login
            </Button>
          </div>
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="mt-4 flex flex-col space-y-4 md:hidden">
            <a href="#features" className="hover:text-[#0c8cfc] transition-colors">Features</a>
            <a href="#how-we-do-this" className="hover:text-[#0c8cfc] transition-colors">How It Works</a>
            <a href="#contact" className="hover:text-[#0c8cfc] transition-colors">Contact</a>
            <Button variant="outline" size="sm" onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full w-full">
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Button 
              size="sm" 
              className="bg-[#0c8cfc] hover:bg-[#0c8cfc] text-white w-full"
              onClick={scrollToWaitlist}
            >
              Join Waitlist
            </Button>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col-reverse md:flex-row items-center">
              <motion.div
                className="w-full md:w-1/2 pr-0 md:pr-8 mt-8 md:mt-0"
                variants={fadeInLeft}
                initial="initial"
                animate="animate"
              >
                <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-600 dark:text-gray-400">
                  {" "}
                  <span className="line-through">Parental Controls</span>
                </h1>
                <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                  Your child's digital focus coach
                </h1>
                <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
                  Keep your kids focused without having to constantly look over
                  their shoulder.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button 
                    size="lg" 
                    className="bg-[#0c8cfc] hover:bg-[#0c8cfc] text-white w-full sm:w-auto rounded-full"
                    onClick={scrollToWaitlist}
                  >
                    Join Waitlist
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Contact Us
                  </Button>
                </div>
              </motion.div>
              <motion.div
                className="w-full md:w-1/2 mb-8 md:mb-0"
                variants={fadeInRight}
                initial="initial"
                animate="animate"
              >
                <div className="rounded-lg shadow-2xl overflow-hidden">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto"
                  >
                    <source src="/herovid.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Spacer */}
        <div className="py-20"></div>

        {/* FeaturesComparison Section */}
        <div className="w-full bg-gradient-to-b from-blue-100 to-white dark:from-gray-900 dark:to-gray-800">
          <FeaturesComparison />
        </div>

        {/* How We Do This Section */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 mt-12 md:mt-0">
          <section id="how-we-do-this" className="py-20 md:py-32">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-12 text-center">
                How Attenbot Works
              </h2>

              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center mb-20">
                <motion.div
                  className="w-full md:w-1/2 pr-0 md:pr-8 mb-8 md:mb-0"
                  variants={fadeInLeft}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-semibold mb-4">
                    1. Set the Task
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    You or your child inputs the task they're working on, such
                    as "Completing a science worksheet".
                  </p>
                </motion.div>
                <motion.div
                  className="w-full md:w-1/2"
                  variants={fadeInRight}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  <div className="rounded-lg shadow-2xl overflow-hidden">
                    <Image
                      src="/step1.png"
                      alt="Set the Task"
                      width={600}
                      height={400}
                      layout="responsive"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Step 2 (Improved styling) */}
              <motion.div
                className="mb-20"
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-center">
                      2. Smart Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center max-w-2xl mx-auto">
                      Attenbot understands what's happening on the screen and
                      gently guides your child in the right direction.
                    </p>
                    <div className="flex flex-col md:flex-row gap-8">
                      <Card className="flex-1 border-red-200 dark:border-red-800">
                        <CardHeader className="bg-red-50 dark:bg-red-900">
                          <CardTitle className="text-xl font-semibold text-red-700 dark:text-red-300">
                            Without Attenbot
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="rounded-lg shadow-md overflow-hidden">
                            <Image
                              src="/how-we-do-this-2.jpg"
                              alt="Without Attenbot"
                              width={400}
                              height={300}
                              layout="responsive"
                            />
                          </div>
                          <p className="mt-4 text-red-700 dark:text-red-300">
                            Distracting websites and unfocused browsing
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="flex-1 border-green-200 dark:border-green-800">
                        <CardHeader className="bg-green-50 dark:bg-green-900">
                          <CardTitle className="text-xl font-semibold text-green-700 dark:text-green-300">
                            With Attenbot
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="rounded-lg shadow-md overflow-hidden">
                            <Image
                              src="/how-we-do-this-2-alt.jpg"
                              alt="With Attenbot"
                              width={400}
                              height={300}
                              layout="responsive"
                            />
                          </div>
                          <p className="mt-4 text-green-700 dark:text-green-300">
                            Focused learning and productive browsing
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Step 3 (Updated with GLB) */}
              <div className="flex flex-col md:flex-row items-center mb-20">
                <motion.div
                  className="w-full md:w-1/2 pr-0 md:pr-8 mb-8 md:mb-0"
                  variants={fadeInLeft}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-semibold mb-4">
                    3. Minimal Intervention
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    You only get involved if your child needs additional
                    support, promoting independence.
                  </p>
                </motion.div>
                <motion.div
                  className="w-full md:w-1/2 md:pl-0"
                  variants={fadeInRight}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  <div style={{ height: "400px" }}>
                    <Suspense
                      fallback={
                        <div className="w-full h-full flex items-center justify-center">
                          Loading 3D model...
                        </div>
                      }
                    >
                    </Suspense>
                  </div>
                </motion.div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col-reverse md:flex-row items-center">
                <motion.div
                  className="w-full md:w-1/2"
                  variants={fadeInLeft}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  <div className="rounded-lg shadow-2xl overflow-hidden">
                    <Image
                      src="/how-we-do-this-4.jpg"
                      alt="Progress Updates"
                      width={600}
                      height={400}
                      layout="responsive"
                    />
                  </div>
                </motion.div>
                <motion.div
                  className="w-full md:w-1/2 pl-0 md:pl-8 mb-8 md:mb-0"
                  variants={fadeInRight}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-semibold mb-4">
                    4. Progress Updates
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Receive detailed updates after each session to track your
                    child's progress.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>
        </div>

        {/* Waitlist Section */}
        <section id="waitlist" ref={waitlistRef} className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-2xl mx-auto text-center"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">Join Our Waitlist</h2>
              <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
                Be the first to know when Attenbot launches and give your child
                the gift of focus.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0c8cfc]"
                />
                <Button type="submit" size="lg" className="bg-[#0c8cfc] hover:bg-[#0c8cfc] text-white">Join Waitlist</Button>
              </form>
            </motion.div>
          </div>
        </section>
      </main>

      <footer id="contact" className="bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <a href="#" className="text-2xl font-bold text-[#0c8cfc]">Attenbot</a>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} Attenbot. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <a href="#contact" className="text-gray-600 dark:text-gray-400 hover:text-[#0c8cfc]">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
