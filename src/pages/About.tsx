import { motion } from "framer-motion";
import restaurantInterior from "@/assets/restaurant-interior.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const About = () => {
  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">
          About <span className="text-gradient-fire">Jushhpk</span>
        </h1>
        <p className="text-muted-foreground font-body">Our story, our passion</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="rounded-2xl overflow-hidden shadow-card relative"
        >
          <img
            src={restaurantInterior}
            alt="Jushhpk Restaurant interior with warm ambient lighting"
            className="w-full h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-4"
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-2xl font-display font-bold text-foreground">
            A Legacy of Flavor
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground font-body leading-relaxed">
            Born in the heart of Lahore, Jushhpk brings together the rich culinary traditions of Pakistan with a modern dining experience. Every dish tells a story — of spices ground fresh, of recipes passed down through generations, of flavors that bring people together.
          </motion.p>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground font-body leading-relaxed">
            Our chefs use only the finest ingredients, sourced locally and prepared with meticulous attention to detail. From our signature Shawarma to our aromatic platters, every bite is crafted to deliver an unforgettable experience.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: "Years", value: "10+" },
              { label: "Dishes", value: "50+" },
              { label: "Happy Customers", value: "1M+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center glass-card rounded-xl p-3">
                <div className="text-2xl font-display font-bold text-gradient-fire">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground font-body mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
